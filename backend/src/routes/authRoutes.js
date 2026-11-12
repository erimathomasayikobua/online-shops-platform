'use strict';

const express = require('express');
const users = require('../repositories/userRepository');
const credentials = require('../repositories/credentialRepository');
const audit = require('../repositories/auditRepository');
const asyncHandler = require('../utils/asyncHandler');
const { getAuthUser, issueToken } = require('../utils/auth');
const { hashPassword, verifyPassword } = require('../utils/passwords');
const {
  generateOtp,
  otpExpiry,
  deliverCredentials,
} = require('../utils/credentials');
const { createId } = require('../utils/ids');

const router = express.Router();

const sanitizeUser = ({ passwordHash, ...user }) => user;

const resolveUser = async ({ userId, email }) => {
  if (userId) {
    return users.findById(userId);
  }

  return email ? users.findByEmail(email) : null;
};

const deliveryChannel = (body) => (body.deliveryChannel === 'whatsapp' ? 'whatsapp' : 'email');

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const email = String(req.body.email || '').toLowerCase();
    const account = await users.findAuthByEmail(email);

    const passwordMatches = await verifyPassword(req.body.password, account?.passwordHash);
    if (!account || !passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = sanitizeUser(account);

    if (user.status === 'pending_verification' || user.verificationStatus === 'otp_sent') {
      return res.status(403).json({
        message: 'Account OTP verification is required before accessing ERIM.',
        user,
        otpRequired: true,
      });
    }

    return res.json({
      user,
      token: issueToken(user.id),
      requiresPasswordChange: Boolean(user.mustChangePassword),
      personalEmailRequired: Boolean(user.personalEmailRequired),
    });
  })
);

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const name = req.body.name;
    const email = String(req.body.email || '').toLowerCase();
    const password = req.body.password;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (await users.emailExists(email)) {
      return res.status(409).json({ message: 'An Erim account already exists for this email' });
    }

    const channel = deliveryChannel(req.body);
    const destination = channel === 'whatsapp' ? req.body.whatsapp : email;

    if (channel === 'whatsapp' && !destination) {
      return res.status(400).json({
        message: 'WhatsApp number is required to receive OTP by WhatsApp',
      });
    }

    const user = await users.createUser({
      id: createId('user'),
      name,
      email,
      passwordHash: await hashPassword(password),
      role: req.body.role || 'customer',
      status: 'pending_verification',
      verificationStatus: 'otp_sent',
      phone: req.body.phone || null,
      whatsapp: req.body.whatsapp || null,
    });

    const otp = generateOtp();
    await credentials.createOtp({
      id: createId('otp'),
      userId: user.id,
      otp,
      channel,
      destination,
      expiresAt: otpExpiry(),
    });

    const delivery = await deliverCredentials({ user, channel, destination, type: 'otp', secret: otp });
    await audit.record({
      actor: 'System',
      action: 'Created OTP for account registration',
      target: user.email,
      ip: req.ip,
    });

    return res.status(201).json({ user, otpRequired: true, delivery });
  })
);

router.post(
  '/verify-otp',
  asyncHandler(async (req, res) => {
    const user = await resolveUser({
      userId: req.body.userId,
      email: String(req.body.email || '').toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const record = await credentials.findUnconsumedOtp(user.id, req.body.otp);
    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (new Date(record.expiresAt).getTime() < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    await credentials.consumeOtp(record.id);
    const verified = await users.updateUser(user.id, {
      status: 'active',
      verificationStatus: 'verified',
    });

    await audit.record({
      actor: 'System',
      action: 'Verified account OTP',
      target: user.email,
      ip: req.ip,
    });

    return res.json({
      user: verified,
      token: issueToken(verified.id),
      message: 'Account verified successfully.',
    });
  })
);

router.post(
  '/resend-otp',
  asyncHandler(async (req, res) => {
    const user = await resolveUser({
      userId: req.body.userId,
      email: String(req.body.email || '').toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (user.verificationStatus === 'verified') {
      return res.status(409).json({ message: 'Account is already verified' });
    }

    const latest = await credentials.findLatestUnconsumedOtp(user.id);
    if (latest && new Date(latest.expiresAt).getTime() > Date.now()) {
      return res.status(429).json({
        message: 'Current OTP is still active. Request a new OTP after it expires.',
        expiresAt: latest.expiresAt,
      });
    }

    const channel = deliveryChannel(req.body);
    const destination = channel === 'whatsapp' ? req.body.whatsapp || user.whatsapp : user.email;

    if (channel === 'whatsapp' && !destination) {
      return res.status(400).json({
        message: 'WhatsApp number is required to receive OTP by WhatsApp',
      });
    }

    const otp = generateOtp();
    await credentials.createOtp({
      id: createId('otp'),
      userId: user.id,
      otp,
      channel,
      destination,
      expiresAt: otpExpiry(),
    });

    const updated = await users.updateUser(user.id, {
      verificationStatus: 'otp_sent',
      status: 'pending_verification',
    });

    const delivery = await deliverCredentials({ user, channel, destination, type: 'otp', secret: otp });
    await audit.record({
      actor: 'System',
      action: 'Regenerated OTP for account registration',
      target: user.email,
      ip: req.ip,
    });

    return res.status(201).json({ user: updated, otpRequired: true, delivery });
  })
);

router.post(
  '/change-password',
  asyncHandler(async (req, res) => {
    const user = await resolveUser({
      userId: req.body.userId,
      email: String(req.body.email || '').toLowerCase(),
    });

    const account = user ? await users.findAuthByEmail(user.email) : null;
    const currentMatches = await verifyPassword(req.body.currentPassword, account?.passwordHash);

    if (!user || !currentMatches) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    if (!req.body.newPassword || String(req.body.newPassword).length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const updated = await users.updateUser(user.id, {
      passwordHash: await hashPassword(req.body.newPassword),
      mustChangePassword: false,
      personalEmailRequired: false,
      personalEmail: req.body.personalEmail || user.personalEmail || user.email,
      verificationStatus: user.verificationStatus || 'verified',
      status: user.status === 'pending_verification' ? 'active' : user.status,
    });

    await audit.record({
      actor: updated.name,
      action: 'Changed temporary password',
      target: updated.email,
      ip: req.ip,
    });

    return res.json({
      user: updated,
      token: issueToken(updated.id),
      message: 'Password changed successfully.',
    });
  })
);

router.get(
  '/me',
  asyncHandler(async (req, res) => {
    const user = await getAuthUser(req);

    if (!user) {
      return res.status(401).json({ message: 'Not signed in' });
    }

    return res.json(user);
  })
);

module.exports = router;

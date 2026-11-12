'use strict';

const express = require('express');
const kyc = require('../repositories/kycRepository');
const asyncHandler = require('../utils/asyncHandler');
const { getAuthUser } = require('../utils/auth');
const { createId } = require('../utils/ids');

const router = express.Router();

router.get(
  '/status',
  asyncHandler(async (req, res) => {
    const user = await getAuthUser(req);

    if (!user) {
      return res.status(401).json({ message: 'Sign in before starting KYC' });
    }

    const submission = await kyc.findByUserId(user.id);

    return res.json({
      status: submission?.status || 'not_started',
      submission: submission || null,
    });
  })
);

router.post(
  '/submit',
  asyncHandler(async (req, res) => {
    const user = await getAuthUser(req);

    if (!user) {
      return res.status(401).json({ message: 'Sign in before submitting KYC' });
    }

    const required = ['legalName', 'country', 'documentType', 'documentNumber'];
    const missing = required.filter((field) => !req.body[field]);

    if (missing.length) {
      return res.status(400).json({ message: `Missing KYC fields: ${missing.join(', ')}` });
    }

    const existing = await kyc.findByUserId(user.id);
    const submission = await kyc.upsertSubmission({
      id: existing?.id || createId('kyc'),
      userId: user.id,
      accountType: req.body.accountType || user.role,
      legalName: req.body.legalName,
      country: req.body.country,
      documentType: req.body.documentType,
      documentNumber: req.body.documentNumber,
      businessName: req.body.businessName || '',
      taxId: req.body.taxId || '',
      documentFrontName: req.body.documentFrontName || '',
      documentBackName: req.body.documentBackName || '',
      status: 'under_review',
    });

    return res.status(201).json({ status: submission.status, submission });
  })
);

module.exports = router;

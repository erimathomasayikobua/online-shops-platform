'use strict';

const { query, queryOne } = require('../config/database');
const { toIso } = require('../utils/values');

const mapSubmission = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    accountType: row.account_type,
    legalName: row.legal_name,
    country: row.country,
    documentType: row.document_type,
    documentNumber: row.document_number,
    businessName: row.business_name || '',
    taxId: row.tax_id || '',
    documentFrontName: row.document_front_name || '',
    documentBackName: row.document_back_name || '',
    status: row.status,
    submittedAt: toIso(row.submitted_at),
  };
};

const findByUserId = async (userId) =>
  mapSubmission(await queryOne('SELECT * FROM kyc_submissions WHERE user_id = ?', [userId]));

const findById = async (id) =>
  mapSubmission(await queryOne('SELECT * FROM kyc_submissions WHERE id = ?', [id]));

const upsertSubmission = async (submission) => {
  await queryOne(
    `INSERT INTO kyc_submissions
      (id, user_id, account_type, legal_name, country, document_type, document_number,
       business_name, tax_id, document_front_name, document_back_name, status, submitted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3))
     ON DUPLICATE KEY UPDATE
       account_type = VALUES(account_type),
       legal_name = VALUES(legal_name),
       country = VALUES(country),
       document_type = VALUES(document_type),
       document_number = VALUES(document_number),
       business_name = VALUES(business_name),
       tax_id = VALUES(tax_id),
       document_front_name = VALUES(document_front_name),
       document_back_name = VALUES(document_back_name),
       status = VALUES(status),
       submitted_at = NOW(3)`,
    [
      submission.id,
      submission.userId,
      submission.accountType,
      submission.legalName,
      submission.country,
      submission.documentType,
      submission.documentNumber,
      submission.businessName || '',
      submission.taxId || '',
      submission.documentFrontName || '',
      submission.documentBackName || '',
      submission.status || 'under_review',
    ]
  );

  return findByUserId(submission.userId);
};

/** Admin KYC review updates the status of an existing submission. */
const updateStatus = async (id, status) => {
  await queryOne('UPDATE kyc_submissions SET status = ? WHERE id = ?', [status, id]);
  return findById(id);
};

const listSubmissions = async () => {
  const rows = await query('SELECT * FROM kyc_submissions ORDER BY submitted_at DESC, id DESC');
  return rows.map(mapSubmission);
};

module.exports = {
  mapSubmission,
  findByUserId,
  findById,
  upsertSubmission,
  updateStatus,
  listSubmissions,
};

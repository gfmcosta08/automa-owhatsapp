'use strict';

const { query } = require('./connection');
const { encrypt, decrypt, maskSecret } = require('../utils/settingsCrypto');

const EMPRESA_ID = 1;

async function getRow(empresaId = EMPRESA_ID) {
  const r = await query(
    `SELECT empresa_id, access_token_enc, phone_number_id, verify_token, app_secret_enc, updated_at
     FROM whatsapp_integracao WHERE empresa_id = $1`,
    [empresaId]
  );
  return r.rows[0] || null;
}

async function getDecrypted(empresaId = EMPRESA_ID) {
  const row = await getRow(empresaId);
  if (!row) return null;
  let access_token = null;
  let app_secret = null;
  try {
    if (row.access_token_enc) access_token = decrypt(row.access_token_enc);
  } catch {
    access_token = null;
  }
  try {
    if (row.app_secret_enc) app_secret = decrypt(row.app_secret_enc);
  } catch {
    app_secret = null;
  }
  return {
    access_token,
    phone_number_id: row.phone_number_id || null,
    verify_token: row.verify_token || null,
    app_secret,
  };
}

async function getMaskedForAdmin(empresaId = EMPRESA_ID) {
  const row = await getRow(empresaId);
  if (!row) {
    return {
      phone_number_id: '',
      verify_token_masked: '',
      access_token_set: false,
      app_secret_set: false,
      using_database: false,
    };
  }
  let accessPreview = '';
  try {
    if (row.access_token_enc) {
      const t = decrypt(row.access_token_enc);
      accessPreview = maskSecret(t, 6);
    }
  } catch {
    accessPreview = '****';
  }
  let appSecretSet = false;
  try {
    appSecretSet = !!(row.app_secret_enc && decrypt(row.app_secret_enc));
  } catch {
    appSecretSet = !!row.app_secret_enc;
  }
  return {
    phone_number_id: row.phone_number_id || '',
    verify_token_masked: row.verify_token ? maskSecret(row.verify_token, 4) : '',
    access_token_set: !!row.access_token_enc,
    access_token_masked: accessPreview,
    app_secret_set: appSecretSet,
    using_database: !!(row.access_token_enc || row.phone_number_id || row.verify_token || row.app_secret_enc),
  };
}

async function upsert(empresaId, fields) {
  const existing = await getRow(empresaId);
  const access_token_enc =
    fields.access_token_enc !== undefined
      ? fields.access_token_enc
      : existing
        ? existing.access_token_enc
        : null;
  const phone_number_id =
    fields.phone_number_id !== undefined ? fields.phone_number_id : existing ? existing.phone_number_id : null;
  const verify_token =
    fields.verify_token !== undefined ? fields.verify_token : existing ? existing.verify_token : null;
  const app_secret_enc =
    fields.app_secret_enc !== undefined
      ? fields.app_secret_enc
      : existing
        ? existing.app_secret_enc
        : null;

  await query(
    `INSERT INTO whatsapp_integracao (empresa_id, access_token_enc, phone_number_id, verify_token, app_secret_enc, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (empresa_id) DO UPDATE SET
       access_token_enc = EXCLUDED.access_token_enc,
       phone_number_id = EXCLUDED.phone_number_id,
       verify_token = EXCLUDED.verify_token,
       app_secret_enc = EXCLUDED.app_secret_enc,
       updated_at = NOW()`,
    [empresaId, access_token_enc, phone_number_id, verify_token, app_secret_enc]
  );
}

/**
 * Atualização parcial: só campos presentes em `patch` (valor null apaga coluna).
 * Para access_token / app_secret: string não vazia cifra; omitir chave = manter; null = apagar.
 */
async function updatePartial(empresaId, patch) {
  const row = await getRow(empresaId);
  let access_token_enc = row ? row.access_token_enc : null;
  let phone_number_id = row ? row.phone_number_id : null;
  let verify_token = row ? row.verify_token : null;
  let app_secret_enc = row ? row.app_secret_enc : null;

  if (Object.prototype.hasOwnProperty.call(patch, 'phone_number_id')) {
    phone_number_id = patch.phone_number_id == null || patch.phone_number_id === '' ? null : String(patch.phone_number_id).trim();
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'verify_token')) {
    verify_token = patch.verify_token == null || patch.verify_token === '' ? null : String(patch.verify_token);
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'access_token')) {
    if (patch.access_token == null || patch.access_token === '') {
      access_token_enc = null;
    } else {
      access_token_enc = encrypt(String(patch.access_token));
    }
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'app_secret')) {
    if (patch.app_secret == null || patch.app_secret === '') {
      app_secret_enc = null;
    } else {
      app_secret_enc = encrypt(String(patch.app_secret));
    }
  }

  await upsert(empresaId, { access_token_enc, phone_number_id, verify_token, app_secret_enc });
}

module.exports = {
  getRow,
  getDecrypted,
  getMaskedForAdmin,
  upsert,
  updatePartial,
  encrypt,
  EMPRESA_ID,
};

'use strict';

const config = require('./index');
const reposWhatsapp = require('../database/reposWhatsappSettings');

const TTL_MS = 30 * 1000;
let cache = { at: 0, data: null };

function invalidateCache() {
  cache = { at: 0, data: null };
}

async function loadMerged() {
  const now = Date.now();
  if (cache.data && now - cache.at < TTL_MS) {
    return cache.data;
  }
  let db = null;
  try {
    db = await reposWhatsapp.getDecrypted(reposWhatsapp.EMPRESA_ID);
  } catch {
    /* tabela pode não existir antes de migrate; fallback para env */
  }
  const w = config.whatsapp || {};
  // (db pode ser null por DB offline ou tabela ausente — env é o fallback)
  const merged = {
    token: (db && db.access_token) || w.token || null,
    phoneNumberId: (db && db.phone_number_id) || w.phoneNumberId || null,
    verifyToken: (db && db.verify_token) || w.verifyToken || null,
    appSecret: (db && db.app_secret) || w.appSecret || null,
    _fromDb: {
      token: !!(db && db.access_token),
      phoneNumberId: !!(db && db.phone_number_id),
      verifyToken: !!(db && db.verify_token),
      appSecret: !!(db && db.app_secret),
    },
  };
  cache = { at: now, data: merged };
  return merged;
}

async function getSendCredentials() {
  const m = await loadMerged();
  return { token: m.token, phoneNumberId: m.phoneNumberId };
}

async function getVerifyToken() {
  const m = await loadMerged();
  return m.verifyToken || null;
}

async function getAppSecret() {
  const m = await loadMerged();
  return m.appSecret || null;
}

module.exports = {
  loadMerged,
  getSendCredentials,
  getVerifyToken,
  getAppSecret,
  invalidateCache,
};

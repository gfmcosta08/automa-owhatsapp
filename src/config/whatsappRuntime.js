'use strict';

const config = require('./index');
const reposWhatsapp = require('../database/reposWhatsappSettings');

const TTL_MS = 30 * 1000;
let cache = { at: 0, data: null };

function invalidateCache() {
  cache = { at: 0, data: null };
}

function hasUazapiCredentials(m) {
  return !!(m.uazapiInstanceToken || (config.uazapi && config.uazapi.instanceToken));
}

function hasMetaCredentials(m) {
  return !!(m.token && m.phoneNumberId);
}

/**
 * auto: uazapi se houver token de instância (DB ou env); senão meta se token+phone id.
 */
function resolveProvider(m) {
  const p = (config.whatsapp.provider || 'auto').toLowerCase();
  if (p === 'uazapi') return 'uazapi';
  if (p === 'meta') return 'meta';
  if (hasUazapiCredentials(m)) return 'uazapi';
  if (hasMetaCredentials(m)) return 'meta';
  return 'uazapi';
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
  const u = config.uazapi || {};
  const merged = {
    token: (db && db.access_token) || w.token || null,
    phoneNumberId: (db && db.phone_number_id) || w.phoneNumberId || null,
    verifyToken: (db && db.verify_token) || w.verifyToken || null,
    appSecret: (db && db.app_secret) || w.appSecret || null,
    uazapiBaseUrl: (db && db.uazapi_base_url) || u.baseUrl || 'https://focus.uazapi.com',
    uazapiInstanceToken: (db && db.uazapi_instance_token) || u.instanceToken || null,
    uazapiAdminToken: (db && db.uazapi_admin_token) || u.adminToken || null,
    uazapiInstancePhone: (db && db.uazapi_instance_phone) || u.instancePhone || null,
    _fromDb: {
      token: !!(db && db.access_token),
      phoneNumberId: !!(db && db.phone_number_id),
      verifyToken: !!(db && db.verify_token),
      appSecret: !!(db && db.app_secret),
      uazapiInstanceToken: !!(db && db.uazapi_instance_token),
      uazapiAdminToken: !!(db && db.uazapi_admin_token),
      uazapiBaseUrl: !!(db && db.uazapi_base_url),
      uazapiInstancePhone: !!(db && db.uazapi_instance_phone),
    },
  };
  merged.provider = resolveProvider({
    token: merged.token,
    phoneNumberId: merged.phoneNumberId,
    uazapiInstanceToken: merged.uazapiInstanceToken,
  });
  cache = { at: now, data: merged };
  return merged;
}

async function getProvider() {
  const m = await loadMerged();
  return m.provider;
}

async function getSendCredentials() {
  const m = await loadMerged();
  return { token: m.token, phoneNumberId: m.phoneNumberId };
}

async function getUazapiSendCredentials() {
  const m = await loadMerged();
  return {
    baseUrl: (m.uazapiBaseUrl || 'https://focus.uazapi.com').replace(/\/$/, ''),
    instanceToken: m.uazapiInstanceToken || '',
    adminToken: m.uazapiAdminToken || '',
    instancePhone: m.uazapiInstancePhone || '',
  };
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
  getProvider,
  getSendCredentials,
  getUazapiSendCredentials,
  getVerifyToken,
  getAppSecret,
  invalidateCache,
};

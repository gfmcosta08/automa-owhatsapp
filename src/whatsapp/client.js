'use strict';

const config = require('../config');

function buildUrl() {
  const id = config.whatsapp.phoneNumberId;
  if (!id) throw new Error('WHATSAPP_PHONE_NUMBER_ID não configurado');
  return `https://graph.facebook.com/v21.0/${id}/messages`;
}

async function sendText(to, text) {
  const token = config.whatsapp.token;
  if (!token) {
    console.warn('[whatsapp] WHATSAPP_TOKEN ausente — mensagem não enviada (dev)');
    return { ok: false, skipped: true };
  }
  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text },
  };
  const res = await fetch(buildUrl(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('[whatsapp] erro envio', res.status, json);
    return { ok: false, error: json };
  }
  return { ok: true, data: json };
}

module.exports = { sendText };

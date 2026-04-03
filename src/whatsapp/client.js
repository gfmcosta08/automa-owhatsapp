'use strict';

const whatsappRuntime = require('../config/whatsappRuntime');

async function buildUrl() {
  const { phoneNumberId } = await whatsappRuntime.getSendCredentials();
  if (!phoneNumberId) throw new Error('Phone Number ID não configurado (admin ou WHATSAPP_PHONE_NUMBER_ID)');
  return `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
}

async function sendText(to, text) {
  const { token } = await whatsappRuntime.getSendCredentials();
  if (!token) {
    console.warn('[whatsapp] Token ausente — mensagem não enviada (configure no admin ou WHATSAPP_TOKEN)');
    return { ok: false, skipped: true };
  }
  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text },
  };
  const res = await fetch(await buildUrl(), {
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

module.exports = { sendText, buildUrl };

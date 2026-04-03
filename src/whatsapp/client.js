'use strict';

const whatsappRuntime = require('../config/whatsappRuntime');

async function buildMetaUrl() {
  const { phoneNumberId } = await whatsappRuntime.getSendCredentials();
  if (!phoneNumberId) throw new Error('Phone Number ID não configurado (admin ou WHATSAPP_PHONE_NUMBER_ID)');
  return `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
}

function normalizeNumber(to) {
  return String(to || '').replace(/\D/g, '');
}

async function sendTextMeta(to, text) {
  const { token } = await whatsappRuntime.getSendCredentials();
  if (!token) {
    console.warn('[whatsapp] Token Meta ausente — mensagem não enviada');
    return { ok: false, skipped: true };
  }
  const body = {
    messaging_product: 'whatsapp',
    to: normalizeNumber(to),
    type: 'text',
    text: { body: text },
  };
  const res = await fetch(await buildMetaUrl(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('[whatsapp] erro envio Meta', res.status, json);
    return { ok: false, error: json };
  }
  return { ok: true, data: json };
}

/**
 * UazAPI: POST {base}/send/text?token=...&admintoken=...
 * @see https://docs.uazapi.com — alinhado ao node n8n-nodes-uazapi (body: number, text)
 */
async function sendTextUazapi(to, text) {
  const { baseUrl, instanceToken, adminToken } = await whatsappRuntime.getUazapiSendCredentials();
  if (!instanceToken) {
    console.warn('[whatsapp] UAZAPI_INSTANCE_TOKEN ausente — mensagem não enviada');
    return { ok: false, skipped: true };
  }
  const url = new URL(`${baseUrl}/send/text`);
  url.searchParams.set('token', instanceToken);
  if (adminToken) url.searchParams.set('admintoken', adminToken);
  const num = normalizeNumber(to);
  if (!num) {
    console.warn('[whatsapp] Destino vazio — não enviado');
    return { ok: false, skipped: true };
  }
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ number: num, text }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('[whatsapp] erro envio UazAPI', res.status, json);
    return { ok: false, error: json };
  }
  return { ok: true, data: json };
}

async function sendText(to, text) {
  const provider = await whatsappRuntime.getProvider();
  if (provider === 'meta') {
    return sendTextMeta(to, text);
  }
  return sendTextUazapi(to, text);
}

module.exports = { sendText, buildMetaUrl, sendTextMeta, sendTextUazapi };

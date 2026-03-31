'use strict';

function parseWhatsAppTs(ts) {
  if (!ts) return null;
  const n = typeof ts === 'string' ? parseInt(ts, 10) : ts;
  if (Number.isNaN(n)) return null;
  return new Date(n * 1000);
}

module.exports = { parseWhatsAppTs };

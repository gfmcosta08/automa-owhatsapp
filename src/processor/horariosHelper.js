'use strict';

/**
 * Formato em agendamento_config.horarios_disponiveis (JSONB):
 * - Array de objetos: { "label": "Segunda 08:00", "daysFromNow": 7, "hour": 8, "minute": 0 }
 * - Ou array de strings (labels): usa progressão de dias igual ao padrão legado (7,8,9,10,11)
 * - Vazio / inválido: cai no padrão de 5 slots (comportamento anterior fixo no código)
 */
const DEFAULT_SLOTS = [
  { n: 1, label: 'Segunda 08:00', daysFromNow: 7, hour: 8, minute: 0 },
  { n: 2, label: 'Segunda 14:00', daysFromNow: 8, hour: 14, minute: 0 },
  { n: 3, label: 'Terça 09:00', daysFromNow: 9, hour: 9, minute: 0 },
  { n: 4, label: 'Quarta 10:00', daysFromNow: 10, hour: 10, minute: 0 },
  { n: 5, label: 'Quinta 11:00', daysFromNow: 11, hour: 11, minute: 0 },
];

function parseHorariosConfig(raw) {
  if (!raw) return DEFAULT_SLOTS;
  let arr = raw;
  if (typeof raw === 'string') {
    try {
      arr = JSON.parse(raw);
    } catch {
      return DEFAULT_SLOTS;
    }
  }
  if (!Array.isArray(arr) || arr.length === 0) return DEFAULT_SLOTS;

  if (typeof arr[0] === 'string') {
    return arr.map((label, i) => ({
      n: i + 1,
      label: String(label),
      daysFromNow: 7 + i,
      hour: DEFAULT_SLOTS[i] ? DEFAULT_SLOTS[i].hour : 9,
      minute: DEFAULT_SLOTS[i] ? DEFAULT_SLOTS[i].minute : 0,
    }));
  }

  const out = [];
  for (let i = 0; i < arr.length; i++) {
    const o = arr[i];
    if (!o || typeof o !== 'object') continue;
    const label = o.label != null ? String(o.label) : `Opção ${i + 1}`;
    const daysFromNow = Number.isFinite(Number(o.daysFromNow)) ? Number(o.daysFromNow) : 7 + i;
    const hour = Number.isFinite(Number(o.hour)) ? Number(o.hour) : 9;
    const minute = Number.isFinite(Number(o.minute)) ? Number(o.minute) : 0;
    out.push({ n: i + 1, label, daysFromNow, hour, minute });
  }
  return out.length ? out : DEFAULT_SLOTS;
}

function slotFromChoice(opcao, slots) {
  const n = parseInt(String(opcao).trim(), 10);
  const list = slots && slots.length ? slots : DEFAULT_SLOTS;
  const s = list.find((x) => x.n === n) || list[0];
  const dt = new Date();
  dt.setDate(dt.getDate() + s.daysFromNow);
  dt.setHours(s.hour, s.minute || 0, 0, 0);
  return { horario: dt, label: s.label };
}

function slotsHorarioText(slots) {
  const list = slots && slots.length ? slots : DEFAULT_SLOTS;
  return `Escolha o horário (número):\n\n${list.map((s) => `${s.n}) ${s.label}`).join('\n')}`;
}

module.exports = {
  parseHorariosConfig,
  slotFromChoice,
  slotsHorarioText,
  DEFAULT_SLOTS,
};

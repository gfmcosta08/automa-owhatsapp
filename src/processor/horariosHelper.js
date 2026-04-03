'use strict';

/**
 * Formato em agendamento_config.horarios_disponiveis (JSONB):
 * - Grade semanal (app Next): { "dia": "seg"|"ter"|...|"dom", "hora": "08:00" }
 * - Legado: { "label", "daysFromNow", "hour", "minute" }
 * - Ou array de strings (labels): usa progressão de dias igual ao padrão legado (7,8,9,10,11)
 * - Vazio / inválido: cai no padrão de 5 slots
 */
const DEFAULT_SLOTS = [
  { n: 1, label: 'Segunda 08:00', daysFromNow: 7, hour: 8, minute: 0 },
  { n: 2, label: 'Segunda 14:00', daysFromNow: 8, hour: 14, minute: 0 },
  { n: 3, label: 'Terça 09:00', daysFromNow: 9, hour: 9, minute: 0 },
  { n: 4, label: 'Quarta 10:00', daysFromNow: 10, hour: 10, minute: 0 },
  { n: 5, label: 'Quinta 11:00', daysFromNow: 11, hour: 11, minute: 0 },
];

const DIA_TO_DOW = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6 };
const DIA_LABEL = {
  dom: 'Dom',
  seg: 'Seg',
  ter: 'Ter',
  qua: 'Qua',
  qui: 'Qui',
  sex: 'Sex',
  sab: 'Sáb',
};

function parseHoraStr(horaStr) {
  const m = String(horaStr || '').trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const hour = parseInt(m[1], 10);
  const minute = parseInt(m[2], 10);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

/** Próxima ocorrência do weekday + hora; retorna dias a somar a partir de hoje (0 = hoje). */
function daysFromNowForWeekdayHour(targetDow, hour, minute) {
  const now = new Date();
  for (let d = 0; d < 28; d++) {
    const t = new Date(now);
    t.setDate(t.getDate() + d);
    t.setHours(hour, minute, 0, 0);
    if (t.getDay() !== targetDow) continue;
    if (t.getTime() > now.getTime()) return d;
  }
  return 7;
}

function isDiaHoraGrid(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  return arr.some((o) => o && typeof o === 'object' && o.dia != null && o.hora != null);
}

function slotsFromDiaHoraGrid(arr) {
  const items = [];
  for (const o of arr) {
    if (!o || typeof o !== 'object' || o.dia == null || o.hora == null) continue;
    const diaKey = String(o.dia).toLowerCase().trim();
    const targetDow = DIA_TO_DOW[diaKey];
    if (targetDow === undefined) continue;
    const hm = parseHoraStr(o.hora);
    if (!hm) continue;
    const daysFromNow = daysFromNowForWeekdayHour(targetDow, hm.hour, hm.minute);
    const label = `${DIA_LABEL[diaKey] || diaKey} ${String(hm.hour).padStart(2, '0')}:${String(hm.minute).padStart(2, '0')}`;
    items.push({
      daysFromNow,
      hour: hm.hour,
      minute: hm.minute,
      label,
      _sort: daysFromNow * 1440 + hm.hour * 60 + hm.minute,
    });
  }
  items.sort((a, b) => a._sort - b._sort);
  return items.map((it, i) => ({
    n: i + 1,
    label: it.label,
    daysFromNow: it.daysFromNow,
    hour: it.hour,
    minute: it.minute,
  }));
}

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

  if (isDiaHoraGrid(arr)) {
    const grid = slotsFromDiaHoraGrid(arr);
    return grid.length ? grid : DEFAULT_SLOTS;
  }

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

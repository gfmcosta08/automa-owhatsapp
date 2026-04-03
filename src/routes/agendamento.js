'use strict';

const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const repos = require('../database/reposAgendamento');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = express.Router();

function accessFlags() {
  const enable = String(process.env.ENABLE_AGENDAMENTO || 'true').toLowerCase() === 'true';
  const superadmin = String(process.env.SUPERADMIN || 'false').toLowerCase() === 'true';
  return { enable_agendamento: enable, is_superadmin: superadmin };
}

router.get('/access', (req, res) => {
  res.json(accessFlags());
});

router.get('/config', async (req, res) => {
  try {
    const row = await repos.getConfig();
    if (!row) return res.json(null);
    res.json({
      id: row.id,
      empresa_id: row.empresa_id,
      phone_number_id: row.phone_number_id,
      phone_number_numero: row.phone_number_numero,
      jid_operador: row.jid_operador,
      horarios_disponiveis: row.horarios_disponiveis || [],
      mensagem_boas_vindas: row.mensagem_boas_vindas || '',
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/config', async (req, res) => {
  try {
    const body = req.body || {};
    const existing = await repos.getConfig();
    const jid_operador =
      body.jid_operador !== undefined ? body.jid_operador : existing ? existing.jid_operador : null;
    const horarios_disponiveis = Array.isArray(body.horarios_disponiveis)
      ? body.horarios_disponiveis
      : existing && existing.horarios_disponiveis
        ? existing.horarios_disponiveis
        : [];
    const mensagem_boas_vindas =
      body.mensagem_boas_vindas !== undefined
        ? body.mensagem_boas_vindas || ''
        : existing
          ? existing.mensagem_boas_vindas || ''
          : '';
    let phone_number_id;
    if (body.phone_number_id !== undefined) {
      phone_number_id =
        body.phone_number_id === null || body.phone_number_id === ''
          ? null
          : String(body.phone_number_id).trim();
    } else {
      phone_number_id = existing ? existing.phone_number_id : null;
    }
    let phone_number_numero;
    if (body.phone_number_numero !== undefined) {
      phone_number_numero =
        body.phone_number_numero === null || body.phone_number_numero === ''
          ? null
          : String(body.phone_number_numero).trim() || null;
    } else {
      phone_number_numero = existing ? existing.phone_number_numero : null;
    }
    const saved = await repos.upsertConfig({
      jid_operador,
      horarios_disponiveis,
      mensagem_boas_vindas,
      phone_number_id,
      phone_number_numero,
    });
    res.json({
      id: saved.id,
      empresa_id: saved.empresa_id,
      jid_operador: saved.jid_operador,
      horarios_disponiveis: saved.horarios_disponiveis,
      mensagem_boas_vindas: saved.mensagem_boas_vindas,
      phone_number_id: saved.phone_number_id,
      phone_number_numero: saved.phone_number_numero,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/pendentes', async (req, res) => {
  try {
    const rows = await repos.listPendentes();
    res.json(
      rows.map((r) => ({
        id: r.id,
        cliente_nome: r.cliente_nome,
        cliente_jid: r.cliente_jid,
        horario_escolhido: r.horario_escolhido,
        descricao: r.descricao || '',
        data_criacao: r.data_criacao,
      }))
    );
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/agendamentos', async (req, res) => {
  try {
    const status = (req.query.status || 'todos').toString().toLowerCase();
    const map = {
      todos: 'todos',
      pendentes: 'pendente',
      confirmados: 'confirmado',
      concluidos: 'concluido',
      cancelados: 'cancelado',
    };
    const filt = map[status] || 'todos';
    const rows = await repos.listAgendamentos(filt);
    res.json(
      rows.map((r) => ({
        id: r.id,
        cliente_nome: r.cliente_nome,
        data_hora: r.data_hora,
        duracao: r.duracao || '1h',
        status: r.status,
        descricao_problema: r.descricao_problema || '',
      }))
    );
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/agendamentos/:id', async (req, res) => {
  try {
    const ok = await repos.deleteAgendamento(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Não encontrado' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/servicos', async (req, res) => {
  try {
    const rows = await repos.listServicos();
    res.json(
      rows.map((r) => ({
        id: r.id,
        nome: r.nome,
        categoria: r.categoria,
        preco: r.preco,
        descricao: r.descricao || '',
      }))
    );
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/servicos', async (req, res) => {
  try {
    const { nome, categoria, preco, descricao } = req.body || {};
    const precoNum = typeof preco === 'number' ? preco : parseInt(String(preco), 10);
    if (!nome || !categoria || !precoNum || precoNum <= 0) {
      return res.status(400).json({ error: 'nome, categoria e preço (>0 centavos) obrigatórios' });
    }
    const row = await repos.insertServico({
      nome: String(nome).trim(),
      categoria: String(categoria).trim(),
      preco_centavos: precoNum,
      descricao: descricao ? String(descricao) : '',
    });
    res.json({
      id: row.id,
      nome: row.nome,
      categoria: row.categoria,
      preco: row.preco,
      descricao: row.descricao || '',
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

function sheetToRows(sheet) {
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  const out = [];
  for (const raw of rows) {
    const keys = Object.keys(raw);
    const lower = {};
    for (const k of keys) {
      lower[String(k).toLowerCase().trim()] = raw[k];
    }
    const nome = lower.nome || lower.name || lower.servico;
    const categoria = lower.categoria || lower.category;
    let precoRaw = lower.preco || lower.price || lower.valor;
    let preco_centavos = 0;
    if (typeof precoRaw === 'number' && Number.isFinite(precoRaw)) {
      preco_centavos = precoRaw < 1000 ? Math.round(precoRaw * 100) : Math.round(precoRaw);
    } else {
      const s = String(precoRaw || '')
        .replace(/R\$\s*/gi, '')
        .replace(/\./g, '')
        .replace(',', '.')
        .trim();
      const n = parseFloat(s);
      if (!Number.isNaN(n)) preco_centavos = Math.round(n * 100);
    }
    out.push({
      nome: nome ? String(nome).trim() : '',
      categoria: categoria ? String(categoria).trim() : '',
      preco_centavos,
      descricao: String(lower.descricao || lower.description || '').trim(),
    });
  }
  return out;
}

function parseDelimitedText(buf, sep) {
  const text = buf.toString('utf8');
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const header = lines[0].split(sep).map((h) => h.trim().toLowerCase());
  const idx = (name) => {
    const aliases = {
      nome: ['nome', 'name', 'servico'],
      categoria: ['categoria', 'category'],
      preco: ['preco', 'price', 'valor'],
      descricao: ['descricao', 'description', 'desc'],
    };
    for (const a of aliases[name] || [name]) {
      const i = header.indexOf(a);
      if (i >= 0) return i;
    }
    return -1;
  };
  const iNome = idx('nome');
  const iCat = idx('categoria');
  const iPreco = idx('preco');
  const iDesc = idx('descricao');
  const out = [];
  for (let li = 1; li < lines.length; li++) {
    const parts = lines[li].split(sep);
    const row = {
      nome: iNome >= 0 ? String(parts[iNome] || '').trim() : '',
      categoria: iCat >= 0 ? String(parts[iCat] || '').trim() : '',
      preco_centavos: 0,
      descricao: iDesc >= 0 ? String(parts[iDesc] || '').trim() : '',
    };
    if (iPreco >= 0) {
      const s = String(parts[iPreco] || '')
        .replace(/R\$\s*/gi, '')
        .replace(/\./g, '')
        .replace(',', '.')
        .trim();
      const n = parseFloat(s);
      if (!Number.isNaN(n)) row.preco_centavos = Math.round(n * 100);
    }
    out.push(row);
  }
  return out;
}

router.post('/servicos/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ criados: 0, erros: ['Arquivo ausente'] });
    }
    const name = (req.file.originalname || '').toLowerCase();
    let rows = [];
    if (name.endsWith('.csv')) {
      rows = parseDelimitedText(req.file.buffer, ',');
    } else if (name.endsWith('.tsv')) {
      rows = parseDelimitedText(req.file.buffer, '\t');
    } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      rows = sheetToRows(sheet);
    } else if (name.endsWith('.ods')) {
      return res.status(400).json({ criados: 0, erros: ['Formato .ods: exporte para CSV ou XLSX e envie novamente.'] });
    } else {
      return res.status(400).json({ criados: 0, erros: ['Extensão não suportada'] });
    }
    const result = await repos.insertServicosBulk(rows);
    res.json(result);
  } catch (e) {
    res.status(500).json({ criados: 0, erros: [e.message] });
  }
});

router.delete('/servicos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'id inválido' });
    const ok = await repos.deleteServico(id);
    if (!ok) return res.status(404).json({ error: 'Não encontrado' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

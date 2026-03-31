'use strict';

const express = require('express');
const path = require('path');
const repos = require('../../database/repos');

const router = express.Router();

router.get('/api/clientes', async (req, res) => {
  try {
    const rows = await repos.adminListClientes();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/api/agendamentos-hoje', async (req, res) => {
  try {
    const rows = await repos.adminAgendamentosDoDia();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/api/mensagens/:clienteId', async (req, res) => {
  try {
    const rows = await repos.adminMensagensCliente(req.params.clienteId);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/api/estatisticas', async (req, res) => {
  try {
    const row = await repos.adminEstatisticas();
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.use(express.static(path.join(__dirname, '..', 'public')));

module.exports = router;

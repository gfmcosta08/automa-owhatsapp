'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const config = require('./config');
const { router: webhookRouter } = require('./webhook/receiver');
const adminRouter = require('./admin/routes/dashboard');
const internalRouter = require('./internal/notify');
const agendamentoRouter = require('./routes/agendamento');
const empresaRouter = require('./routes/empresa');
const { iniciar } = require('./scheduler');

const app = express();

app.use('/webhook', webhookRouter);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : false,
    credentials: true,
  })
);
app.use(express.json());
app.use('/agendamento', agendamentoRouter);
app.use('/empresa', empresaRouter);
app.use('/admin', adminRouter);
app.use('/internal', internalRouter);

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'oficina-whatsapp' });
});

const host = '0.0.0.0';
app.listen(config.port, host, () => {
  console.log(`HTTP em http://${host}:${config.port}`);
  iniciar();
});

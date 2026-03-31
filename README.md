# Oficina do TETEU — WhatsApp Bot

Backend Node.js (Express) com PostgreSQL, Redis, webhook WhatsApp Cloud API, lembretes por cron e painel em `/admin`.

## Deploy no Render

1. Envie este repositório para o GitHub: [farollapi-cloud/automa-owhatsapp](https://github.com/farollapi-cloud/automa-owhatsapp).
2. No [Render Dashboard](https://dashboard.render.com): **New** → **Blueprint** → conecte o repositório e aplique o [`render.yaml`](render.yaml).
3. No serviço web, em **Environment**, preencha manualmente (marcados como *sync: false* no blueprint):
   - `WHATSAPP_TOKEN` — token de acesso da API do WhatsApp
   - `WHATSAPP_PHONE_NUMBER_ID` — ID do número
   - `WHATSAPP_VERIFY_TOKEN` — token de verificação do webhook
   - `WHATSAPP_APP_SECRET` — opcional, para validar `X-Hub-Signature-256`
4. URL do webhook no Meta: `https://<seu-serviço>.onrender.com/webhook/whatsapp`
5. Painel admin: `https://<seu-serviço>.onrender.com/admin/`

O serviço escuta em `0.0.0.0:$PORT` conforme [Port binding](https://render.com/docs/web-services#port-binding).

## Local

Copie `.env.example` para `.env`, suba PostgreSQL e Redis, depois:

```bash
npm install
npm run migrate
npm start
```

## Scripts

- `npm start` — servidor HTTP + crons (lembretes a cada minuto, retry a cada 5 minutos)
- `npm run migrate` — aplica `src/database/migrations/001_initial.sql`

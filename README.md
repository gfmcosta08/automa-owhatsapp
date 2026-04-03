# WhatsApp Bot — oficina (single-tenant)

Backend Node.js (Express) com PostgreSQL, Redis, webhook WhatsApp Cloud API, lembretes por cron e **painel de configuração** em `/admin` (empresa, credenciais Meta, URLs de webhook, horários e mensagens do bot).

## Modelo de deploy (single-tenant)

Cada **deploy** deste repositório atende **um único cliente** (ex.: uma oficina). Não há multi-tenant no mesmo banco: o módulo de agendamento usa `empresa_id = 1` fixo ([`src/database/reposAgendamento.js`](src/database/reposAgendamento.js)). Outro negócio (ex.: imobiliária) deve ser outro projeto ou fork personalizado.

- Webhook Meta: `/webhook/whatsapp`
- Webhook oazap (por token na URL): `/webhook/entrada/:token` — URL completa exibida no admin após `WEBHOOK_BASE_URL` configurado
- UI Next.js em `web/` (agendamento, etc.)

## Painel admin (`/admin`)

- **Geral:** nome da empresa (menus e lembretes), e-mail, CNPJ.
- **WhatsApp Meta:** Phone Number ID, Verify Token, Access Token e App Secret — persistidos no banco (token/secret cifrados com `SETTINGS_ENCRYPTION_KEY` em produção). Se o banco estiver vazio, usam-se as variáveis `WHATSAPP_*`.
- **Webhooks:** copiar URL do Meta (`/webhook/whatsapp`) e do oazap (`/webhook/entrada/...`) — requer `WEBHOOK_BASE_URL`.
- **Atendimento:** mensagem de boas-vindas, JSON de horários disponíveis, JID operador, número de contato.
- **`ADMIN_PASSWORD`:** se definido, o painel exige login.

## Deploy no Render

Passo a passo detalhado: [`deploy.md`](deploy.md).

Repositório: [gfmcosta08/automa-owhatsapp](https://github.com/gfmcosta08/automa-owhatsapp).

## Local

Copie `.env.example` para `.env`, suba PostgreSQL e Redis, depois:

```bash
npm install
npm run migrate
npm start
```

## Scripts

- `npm start` — servidor HTTP + crons (lembretes a cada minuto, retry a cada 5 minutos)
- `npm run migrate` — aplica todos os `.sql` em `src/database/migrations/` em ordem

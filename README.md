# WhatsApp Bot — oficina (single-tenant)

Backend Node.js (Express) com PostgreSQL, Redis, webhook **UazAPI** (recomendado), lembretes por cron, fluxo do **gerente** no WhatsApp (1/2/3 em pendentes) e **painel superadmin** em `/admin`.

## Modelo de deploy (single-tenant)

Cada **deploy** deste repositório atende **um único cliente** (ex.: uma oficina). O módulo de agendamento usa `empresa_id = 1` fixo ([`src/database/reposAgendamento.js`](src/database/reposAgendamento.js)).

- Webhook **UazAPI** (por token na URL): `POST /webhook/entrada/:token` — URL completa no admin após `WEBHOOK_BASE_URL`
- Webhook **Meta** (legado): `GET/POST /webhook/whatsapp` — só se usar `WHATSAPP_PROVIDER=meta`
- App **usuário** (Next.js) em `web/` — `/agendamento` (horários, serviços, sem tokens de API)

## Integração UazAPI

- Credenciais: **Base URL** (ex. `https://focus.uazapi.com`), **instance token** (e opcionalmente admin token). Envio: `POST {base}/send/text?token=...&admintoken=...` com corpo `{ "number", "text" }`. Documentação: [docs.uazapi.com](https://docs.uazapi.com).
- **Telefone da instância** (E.164, só dígitos): usado para reconhecer o **mesmo número do bot** ao usar atalhos 1/2/3 como gerente.
- **JID do gerente** em `agendamento_config`: número pessoal que também pode confirmar/cancelar/reagendar pendentes.

## Painel superadmin (`/admin`)

- **UazAPI:** base URL, tokens, telefone da instância.
- **Webhook:** copiar URL `.../webhook/entrada/{token}` para o painel UazAPI.
- **Meta:** seção colapsável (legado).
- **Atendimento:** boas-vindas e JID do gerente; **horários** editados no app `/agendamento`.
- **`ADMIN_PASSWORD`:** se definido, o painel exige login.

## Espelhamento GitHub (farollapi-cloud → gfmcosta08)

Instruções e workflow para colar na interface do GitHub: [`docs/ESPELHAMENTO.md`](docs/ESPELHAMENTO.md).

## Deploy no Render

Passo a passo: [`deploy.md`](deploy.md).

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

# Deploy no Render

Repositório no GitHub: **[gfmcosta08/automa-owhatsapp](https://github.com/gfmcosta08/automa-owhatsapp)**

1. No [Render Dashboard](https://dashboard.render.com): **New** → **Blueprint** → conecte o repositório acima e aplique o [`render.yaml`](render.yaml).
2. No serviço web, em **Environment**, configure no mínimo:
   - `WEBHOOK_BASE_URL` — URL pública do serviço (ex.: `https://<seu-serviço>.onrender.com`) para o admin exibir os links de webhook.
   - `SETTINGS_ENCRYPTION_KEY` — 64 caracteres hex (32 bytes) ou base64 de 32 bytes, para cifrar token/app secret salvos pelo painel.
   - `ADMIN_PASSWORD` — senha do painel `/admin` (recomendado em produção).
   - `INTERNAL_NOTIFY_SECRET` — já gerado no blueprint; serve também como `ADMIN_SESSION_SECRET` se não definido.
3. **WhatsApp:** pode usar só o painel admin após o primeiro deploy **ou** preencher no Render (útil no primeiro boot):
   - `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET` (opcional)
4. URL do webhook no Meta: `https://<seu-serviço>.onrender.com/webhook/whatsapp`
5. Painel admin: `https://<seu-serviço>.onrender.com/admin/`

O serviço escuta em `0.0.0.0:$PORT` conforme [Port binding](https://render.com/docs/web-services#port-binding). Rode `npm run migrate` no build para aplicar a migração `004_whatsapp_integracao.sql` (já incluída no `npm run build` do projeto).

Para modelo single-tenant e variáveis extras (`WEBHOOK_BASE_URL`, `CORS_ORIGIN`, etc.), veja o [README](README.md).

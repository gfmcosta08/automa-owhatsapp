# Espelhamento farollapi-cloud → gfmcosta08

O `git push` pela linha de comando **falha** se o token não tiver o escopo **`workflow`** (GitHub bloqueia alterar `.github/workflows/` sem isso). Por isso o workflow fica em `docs/github-workflows/` para você publicar **pela web** ou usar o script abaixo.

## Opção A — GitHub Actions (automático a cada push)

1. Abra o repositório **farollapi-cloud/automa-owhatsapp** no GitHub.
2. **Settings → Secrets and variables → Actions → New repository secret**
   - Nome: `GFMCOSTA_TOKEN`
   - Valor: um Personal Access Token da conta **gfmcosta08** com escopos **`repo`** (e **`workflow`** se for criar workflows por API depois).
3. **Add file → Create new file**
   - Caminho: `.github/workflows/mirror-to-gfmcosta.yml`
   - Cole o conteúdo de [`docs/github-workflows/mirror-to-gfmcosta.yml`](github-workflows/mirror-to-gfmcosta.yml)
   - Commit na `main`.

A partir daí, cada push em **farollapi-cloud** espelha em **gfmcosta08** (mesmo nome de repositório).

## Opção B — Script local (sem Actions)

No diretório do projeto, com PowerShell (Windows):

```powershell
$env:GFMCOSTA_TOKEN = "ghp_SEU_TOKEN_COM_REPO"
git remote add mirror https://x-access-token:$env:GFMCOSTA_TOKEN@github.com/gfmcosta08/automa-owhatsapp.git 2>$null
git push mirror --mirror --force
```

Ou use `bash scripts/mirror-to-gfmcosta.sh` no Git Bash / WSL após `export GFMCOSTA_TOKEN=...`.

## Token com escopo workflow (push do workflow pelo Git)

Se quiser voltar a commitar `.github/workflows/` pelo Cursor/Git:

1. [github.com/settings/tokens](https://github.com/settings/tokens) → Generate new token (classic)
2. Marque **`repo`** e **`workflow`**
3. Atualize a URL do remote com o novo token ou use o Git Credential Manager.

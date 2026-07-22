# otm-order-forms

App **público** de ofertas de operação (links de reserva em massa). Repo separado do
CRM por isolamento de segurança/deploy — consome o **mesmo Supabase** do CRM (projeto
`CRM` / `jstpwopotsnmbesvmakg`) usando **apenas a anon key**.

Faz parte da feature descrita em
`otm-plataform-front/docs/operations-reservations-plan.md`. O CRM cria as ofertas;
este app só **lê a oferta** (`get_public_offer`) e **cria a reserva**
(`create_reservation`) — RLS bloqueia acesso direto às tabelas, e o corpo do e-mail +
o `ref_code` vêm da RPC (fonte única), nunca montados aqui.

## Rotas

- `GET /op/[slug]` — página pública da oferta + formulário de reserva.
- `POST /api/reserve` — chama `create_reservation` e devolve o payload do e-mail.

## Fluxo

1. Cliente preenche quantidade + CPF + e-mail.
2. `create_reservation` grava a reserva (`awaiting_respaldo`) e devolve assunto/corpo.
3. O cliente envia o e-mail (respaldo de compliance) via `mailto:` ou copiando o texto.

## Dev

```bash
bun install
cp .env.example .env.local   # preencha a anon key
bun run dev                  # http://localhost:3100
bun run test                 # vitest (lógica pura: cpf, pernas)
```

## Deploy (Coolify + Docker)

Container próprio via `Dockerfile` (build pack "Dockerfile" no Coolify), domínio
`ordens.otminvest.com.br`. Build multi-stage: Bun instala/builda → runtime Node com
o output `standalone`. O app escuta em `$PORT` (default `3100`, `HOSTNAME=0.0.0.0`).

Configurar no Coolify:

- **Ports Exposes:** `3100`.
- **Environment variables** (runtime): `NEXT_PUBLIC_SUPABASE_URL` e
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`. São lidas server-side (`process.env`); como o
  código não as referencia no client, não precisam existir em build time.
- **Healthcheck:** já embutido no `Dockerfile` (`GET /`).

Build local da imagem (quando houver Docker):

```bash
docker build -t otm-order-forms .
docker run --rm -p 3100:3100 \
  -e NEXT_PUBLIC_SUPABASE_URL=... -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  otm-order-forms
```

## Segurança

- **Só anon key** — nunca a service-role. Envs entram no runtime do Coolify, não no
  bundle nem na imagem (o `.dockerignore` bloqueia `.env*`).
- Escrita e leitura por RPC `SECURITY DEFINER`; a tabela `clients` nunca é exposta.
- Rate limit + honeypot ficam na borda (proxy do Coolify / Traefik) — a adicionar no deploy.

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

## Deploy (Cloudflare Pages)

Projeto Pages separado do CRM, domínio `ordens.otminvest.com.br`. Variáveis de
ambiente: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Para Next no
Pages, usar `@cloudflare/next-on-pages` no build (a adicionar quando formos publicar).

## Segurança

- **Só anon key** — nunca a service-role.
- Escrita e leitura por RPC `SECURITY DEFINER`; a tabela `clients` nunca é exposta.
- Rate limit + honeypot ficam na borda (Cloudflare WAF) — a adicionar no deploy.

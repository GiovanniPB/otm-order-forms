# syntax=docker/dockerfile:1
# Build com Bun (fonte única do lockfile), runtime Node enxuto (Next standalone).
# Deploy: Coolify (build pack = Dockerfile). App escuta em $PORT (default 3100).

# ---- deps: instala dependências com lockfile congelado --------------------
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ---- builder: gera o output standalone ------------------------------------
FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# ---- runner: só o necessário p/ rodar -------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3100 \
    HOSTNAME=0.0.0.0
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# public/ + o server standalone + os assets estáticos
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3100

# As NEXT_PUBLIC_SUPABASE_* são injetadas pelo Coolify em runtime (lidas
# server-side em process.env; não vão para o bundle do cliente).
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD wget -qO- "http://127.0.0.1:${PORT}/" >/dev/null 2>&1 || exit 1

CMD ["node", "server.js"]

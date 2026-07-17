# syntax=docker/dockerfile:1.7
# Multi-Stage Build für Next.js 16 mit output: 'standalone'.

# ---------- Stage 1: deps ----------
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Bevorzugt npm ci (reproduzierbar), fällt zurück auf npm install
# falls package-lock.json aus irgendeinem Grund fehlt.
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# ---------- Stage 2: builder ----------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js Telemetrie ausschalten (im Build-Container)
ENV NEXT_TELEMETRY_DISABLED=1
# Erzwingt release/standalone-Build auch bei lokalen NODE_ENV=development
ENV NODE_ENV=production

RUN npm run build

# ---------- Stage 3: runner ----------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root User aus Security-Gründen
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Standalone-Build kopiert nur das Nötigste.
# public/ und .next/static/ müssen wir manuell mitnehmen,
# weil Next.js die im Standalone-Output nicht inkludiert.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]

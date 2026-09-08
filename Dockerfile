# syntax=docker/dockerfile:1
ARG NODE_VERSION=22.12.0

FROM node:${NODE_VERSION}-bookworm-slim AS base
WORKDIR /app
# Prisma needs the OpenSSL CLI to detect the libssl version (bookworm = 3.x).
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@9

# ---- dependencies (cached unless manifests change) ----
FROM base AS deps
COPY package.json pnpm-lock.yaml prisma.config.ts ./
COPY prisma ./prisma
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ---- build: compile check + placeholder static export (NO db access) ----
# NOTE: no DB is reachable at build time (BuildKit can't join the `coolify`
# network), so queries fall back to empty data here. The real export with live
# data is rebuilt at container start by entrypoint.sh.
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_APP_URL is baked into the static html (domain map + redirects).
ARG DATABASE_URL
ARG DIRECT_URL
ARG NEXT_PUBLIC_APP_URL
ENV DATABASE_URL=${DATABASE_URL} \
    DIRECT_URL=${DIRECT_URL} \
    NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
RUN pnpm run build

# ---- runtime: migrate + static export + Hono api-server (all at start) ----
FROM node:${NODE_VERSION}-bookworm-slim AS runtime
ENV NODE_ENV=production \
    PORT=3001
WORKDIR /app
# Prisma engines need OpenSSL at runtime too (separate FROM, doesn't inherit base).
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
# Full source: entrypoint.sh rebuilds the static export at start (needs DB data).
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/out ./out
COPY . .
RUN chmod +x ./entrypoint.sh
EXPOSE 3001
ENTRYPOINT ["./entrypoint.sh"]

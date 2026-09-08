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

# ---- build: migrate (at BUILD time, never at container start) + static export ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# DB reachable at build time (prisma migrate + static prerender read the DB).
# NEXT_PUBLIC_APP_URL is baked into the static html (domain map + redirects).
ARG DATABASE_URL
ARG DIRECT_URL
ARG NEXT_PUBLIC_APP_URL
ENV DATABASE_URL=${DATABASE_URL} \
    DIRECT_URL=${DIRECT_URL} \
    NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
RUN pnpm run build

# ---- runtime: Hono api-server (API + serves ./out static), plain tsx, no migrate ----
FROM node:${NODE_VERSION}-bookworm-slim AS runtime
ENV NODE_ENV=production \
    PORT=3001
WORKDIR /app
# Prisma engines need OpenSSL at runtime too (separate FROM, doesn't inherit base).
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/out ./out
COPY api-server ./api-server
COPY lib ./lib
EXPOSE 3001
CMD ["./node_modules/.bin/tsx", "api-server/index.ts"]

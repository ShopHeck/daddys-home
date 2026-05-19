FROM node:20-slim AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.8.1 --activate

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:20-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@10.8.1 --activate

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

ARG DATABASE_URL
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
# Use dummy values if not provided as build args (Railway sets them as runtime env vars)
ENV DATABASE_URL=${DATABASE_URL:-postgresql://dummy:dummy@localhost:5432/dummy}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-build-time-placeholder-not-used-at-runtime}
ENV NEXTAUTH_URL=${NEXTAUTH_URL:-http://localhost:3000}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm prisma:generate

ENV NEXT_TELEMETRY_DISABLED=1
RUN mkdir -p public
RUN pnpm build

# Consolidate Prisma artifacts from pnpm virtual store (dereference symlinks)
# pnpm only symlinks direct deps at node_modules/@prisma/; transitive @prisma/* sub-packages
# (debug, get-platform, fetch-engine, engines, etc.) live only in .pnpm/ virtual store.
# We must copy ALL of them so require('@prisma/debug') etc. resolve in the runner stage.
RUN mkdir -p /app/_prisma/at-prisma /app/_prisma/prisma /app/_prisma/dot-prisma && \
    cp -rL node_modules/@prisma/. /app/_prisma/at-prisma/ && \
    for pkg_dir in node_modules/.pnpm/@prisma+*/node_modules/@prisma/*; do \
      if [ -d "$pkg_dir" ]; then \
        pkg_name=$(basename "$pkg_dir"); \
        rm -rf /app/_prisma/at-prisma/"$pkg_name"; \
        cp -rL "$pkg_dir" /app/_prisma/at-prisma/"$pkg_name"; \
      fi; \
    done && \
    cp -rL node_modules/prisma/. /app/_prisma/prisma/ && \
    if [ -d "node_modules/.prisma" ]; then \
      cp -rL node_modules/.prisma/. /app/_prisma/dot-prisma/; \
    fi && \
    for pkg_dir in node_modules/.pnpm/@prisma+client*/node_modules/.prisma/*; do \
      if [ -d "$pkg_dir" ]; then \
        pkg_name=$(basename "$pkg_dir"); \
        mkdir -p /app/_prisma/dot-prisma/"$pkg_name"; \
        cp -rL "$pkg_dir"/. /app/_prisma/dot-prisma/"$pkg_name"/; \
      fi; \
    done

FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
RUN rm -rf node_modules/@prisma node_modules/prisma node_modules/.prisma
COPY --from=builder /app/_prisma/at-prisma ./node_modules/@prisma
COPY --from=builder /app/_prisma/prisma ./node_modules/prisma
COPY --from=builder /app/_prisma/dot-prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node server.js"]

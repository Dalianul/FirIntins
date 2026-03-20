# syntax=docker/dockerfile:1

# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace manifests first for layer caching
COPY package.json pnpm-lock.yaml* ./
COPY apps/backend/package.json ./apps/backend/

# Install all deps (needed for medusa build)
RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/backend/ ./apps/backend/

# Build the Medusa app (outputs to apps/backend/.medusa/server)
WORKDIR /app/apps/backend
RUN pnpm build


# ── Production stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy built artifact
COPY --from=builder /app/apps/backend/.medusa/server ./

# Install only production dependencies from the built artifact
RUN pnpm install --prod --frozen-lockfile

ENV NODE_ENV=production
ENV PORT=9000

EXPOSE 9000

CMD ["node", "./index.js"]

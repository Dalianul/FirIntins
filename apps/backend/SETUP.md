# Backend Setup

## Prerequisites

- Node.js >= 20
- pnpm >= 9
- PostgreSQL 17+ running on port 5432
- Redis 7+ running on port 6379

## Local Development

### 1. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in real values for:
- `DATABASE_URL` — postgres connection string
- `STRIPE_API_KEY` / `STRIPE_WEBHOOK_SECRET` — from Stripe Dashboard
- `SENDGRID_API_KEY` / `SENDGRID_FROM` — from SendGrid

### 2. Install dependencies

From the monorepo root:

```bash
pnpm install
```

### 3. Create the database

```bash
createdb firintins
```

Or via psql:

```sql
CREATE USER firintins WITH PASSWORD 'firintins';
CREATE DATABASE firintins OWNER firintins;
```

### 4. Run migrations

```bash
pnpm backend:migrate
# or from apps/backend:
npx medusa db:migrate
```

### 5. Create admin user

```bash
npx medusa user -e admin@firintins.ro -p <password>
```

### 6. Seed data

```bash
pnpm backend:seed
# or from apps/backend:
npx medusa exec ./src/scripts/seed.ts
```

Seeds: Romania region (RON), Magazin Online sales channel, 6 fishing categories, 2 products with variants and RON prices.

### 7. Start dev server

```bash
pnpm backend:dev
# or from apps/backend:
npx medusa develop
```

Server starts at http://localhost:9000.
Admin panel at http://localhost:9000/app.

## Verify setup

```bash
# Health check
curl http://localhost:9000/health

# Run E2E tests (server must be running)
cd apps/backend
npx jest src/scripts/__tests__/ --forceExit
```

## Production

Build and run with Docker Compose from the monorepo root:

```bash
# Copy and fill env vars
cp .env.example .env.prod

# Build and start
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Run migrations inside the container
docker compose -f docker-compose.prod.yml exec backend node -e \
  "require('@medusajs/medusa/dist/commands/db/migrate').default()"

# Seed (optional, for fresh deployments)
docker compose -f docker-compose.prod.yml exec backend node -e \
  "require('@medusajs/medusa/dist/commands/exec').default({ file: './src/scripts/seed' })"
```

### Required production env vars

| Variable | Description |
|---|---|
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `JWT_SECRET` | Random 32+ char string |
| `COOKIE_SECRET` | Random 32+ char string |
| `STORE_CORS` | Storefront URL (e.g. `https://firintins.ro`) |
| `ADMIN_CORS` | Admin URL (e.g. `https://admin.firintins.ro`) |
| `AUTH_CORS` | Auth-allowed origins (comma-separated) |
| `BACKEND_URL` | Public backend URL |
| `STRIPE_API_KEY` | Stripe live secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `SENDGRID_API_KEY` | SendGrid API key |
| `SENDGRID_FROM` | Verified sender email |

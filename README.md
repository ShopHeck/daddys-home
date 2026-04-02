# DocForge

DocForge is a premium document generation API SaaS for teams that need to turn stored HTML or Handlebars templates into PDFs on demand. It includes authenticated dashboard access, API key-based template management, PDF rendering, and monthly usage enforcement by subscription tier.

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Copy environment variables and update values:
   ```bash
   cp .env.example .env
   ```
3. Start PostgreSQL and point `DATABASE_URL` at the database.
4. Generate the Prisma client and apply the development migration:
   ```bash
   pnpm prisma:generate
   pnpm prisma:migrate:dev
   ```
5. Run the app:
   ```bash
   pnpm dev
   ```

## Deployment

### Docker

Build and run locally:
```bash
docker build -t docforge .
docker run -p 3000:3000 --env-file .env docforge
```

### Railway

1. Connect your GitHub repository to [Railway](https://railway.app)
2. Add a PostgreSQL service (or use [Neon](https://neon.tech) for managed Postgres)
3. Set environment variables in the Railway dashboard:
   - `DATABASE_URL` — PostgreSQL connection string
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` — your Railway app URL (e.g., `https://docforge-production.up.railway.app`)
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`, `STRIPE_BUSINESS_PRICE_ID`
   - `RESEND_API_KEY`, `EMAIL_FROM`
4. Railway auto-deploys on push. Run migrations manually or add to the Dockerfile CMD:
   ```
   CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
   ```

### Health check
`GET /api/health` — returns `{ "status": "healthy" }` with 200, or `{ "status": "unhealthy" }` with 503.

## Environment variables

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth signing secret and internal middleware validation secret
- `NEXTAUTH_URL` - public app URL
- `GITHUB_ID` / `GITHUB_SECRET` - optional GitHub OAuth provider credentials

## API reference

- `POST /api/v1/templates` - create a template
- `GET /api/v1/templates` - list templates for the authenticated API key owner
- `GET /api/v1/templates/:id` - fetch one template with content
- `DELETE /api/v1/templates/:id` - delete one template
- `POST /api/v1/render` - render a stored template to PDF
- `GET /api/v1/usage` - fetch current monthly usage and plan limits
- `GET|POST /api/auth/[...nextauth]` - dashboard authentication entrypoint

All `/api/v1/*` routes require an `X-API-Key` header with a valid DocForge key.

## Example render request

```bash
curl -X POST http://localhost:3000/api/v1/render \
  -H "Content-Type: application/json" \
  -H "X-API-Key: df_live_your_generated_key_here" \
  -d '{
    "templateId": "tmpl_123",
    "data": {
      "companyName": "Acme Inc.",
      "invoiceNumber": "INV-2026-001",
      "date": "2026-04-02",
      "lineItems": [
        { "description": "Design Retainer", "quantity": 1, "price": "$1,200.00" },
        { "description": "API Integration", "quantity": 3, "price": "$450.00" }
      ],
      "total": "$2,550.00"
    },
    "options": {
      "format": "A4",
      "landscape": false,
      "margin": {
        "top": "24px",
        "bottom": "24px",
        "left": "24px",
        "right": "24px"
      }
    }
  }' \
  --output document.pdf
```

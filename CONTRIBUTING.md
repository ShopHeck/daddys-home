# Contributing to DocForge

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm 10.8+
- PostgreSQL 15+
- Redis (optional — Upstash recommended for production)

### Getting Started

```bash
# Clone the repository
git clone https://github.com/ShopHeck/daddys-home.git
cd daddys-home

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your local database credentials

# Generate Prisma client
pnpm prisma:generate

# Run database migrations
pnpm prisma:migrate:dev

# Start development server
pnpm dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build |
| `pnpm test` | Run tests (single run) |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Auto-fix lint issues |
| `pnpm format` | Format code with Prettier |
| `pnpm check-types` | TypeScript type checking |

## Architecture Overview

```
src/
├── app/                    # Next.js App Router
│   ├── api/
│   │   ├── v1/            # Public API (requires API key via middleware)
│   │   ├── dashboard/     # Dashboard API (requires session auth)
│   │   ├── internal/      # Internal service endpoints
│   │   ├── stripe/        # Stripe webhook & checkout
│   │   └── auth/          # NextAuth endpoints
│   ├── dashboard/         # Dashboard UI pages
│   └── (marketing)/       # Landing page & public pages
├── components/            # React components
├── lib/                   # Core business logic
│   ├── schemas/           # Zod validation schemas
│   ├── __tests__/         # Unit tests
│   ├── renderer.ts        # Puppeteer PDF rendering
│   ├── templates.ts       # Sandboxed Handlebars
│   ├── usage.ts           # Usage tracking & limits
│   ├── webhooks.ts        # Webhook dispatch & retry
│   ├── analytics.ts       # Usage analytics
│   └── ...
└── types/                 # TypeScript type definitions
```

### Key Design Decisions

- **API key validation** happens in middleware (`src/middleware.ts`) for all `/api/v1/*` routes
- **Rate limiting** uses Upstash Redis with in-memory fallback
- **PDF rendering** uses a sandboxed Puppeteer browser with concurrency limits
- **Template compilation** uses an isolated Handlebars instance with helper whitelisting
- **Usage tracking** uses atomic Redis counters (with DB seeding on cold start)

## Pull Request Process

1. Create a feature branch from `main`: `git checkout -b feat/your-feature`
2. Make your changes with tests
3. Ensure all checks pass: `pnpm check-types && pnpm lint && pnpm test`
4. Commit with a descriptive message following [Conventional Commits](https://www.conventionalcommits.org/)
5. Push and open a PR against `main`

### Commit Message Format

```
type(scope): description

feat(render): add watermark support for PDF output
fix(usage): handle Redis cold-start race condition
docs(api): update render endpoint documentation
test(templates): add sandbox escape test cases
```

### Code Quality Requirements

- Zero TypeScript errors (`pnpm check-types`)
- All tests passing (`pnpm test`)
- ESLint passes with no errors (`pnpm lint`)
- New features include tests
- API changes update Zod schemas in `src/lib/schemas/`

## Reporting Issues

- Use GitHub Issues for bug reports and feature requests
- Include reproduction steps for bugs
- Label appropriately: `bug`, `enhancement`, `documentation`

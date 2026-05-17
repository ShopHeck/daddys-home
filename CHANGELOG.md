# Changelog

All notable changes to DocForge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Testing**: Vitest test suite with 40+ tests covering templates, API keys, usage, body limits
- **CI/CD**: GitHub Actions pipeline (lint, type-check, test, build, Docker)
- **Linting**: ESLint + Prettier with pre-commit hooks via Husky
- **Logging**: Structured JSON logging with pino (redacts sensitive fields)
- **Validation**: Zod schemas for all API request bodies
- **Renderer**: Concurrency limiter, page timeouts, request interception, browser auto-restart
- **Graceful Shutdown**: Instrumentation hook for clean SIGTERM handling
- **Batch Rendering**: Async job queue for bulk PDF generation (`POST /api/v1/render/batch`)
- **Render Cache**: Content-addressable caching with S3/Redis (X-Cache HIT/MISS headers)
- **Analytics API**: `GET /api/v1/analytics` with latency percentiles, error rates, projections
- **Template Marketplace**: Browse, publish, fork templates (`/api/v1/marketplace`)
- **Webhook Retry Queue**: Redis-backed persistent retries with atomic zpopmin
- **Dependabot**: Automated dependency updates (weekly, grouped)

### Security
- Sandboxed Handlebars with explicit `unregisterHelper` for dangerous built-ins
- Prototype access disabled (`allowProtoPropertiesByDefault: false`)
- Request body size limits (1MB template, 5MB render, 10MB batch)
- Dedicated `INTERNAL_API_SECRET` separated from `NEXTAUTH_SECRET`
- External network requests blocked in Puppeteer (SSRF prevention)
- Atomic Redis usage counters prevent concurrent over-limit renders
- Paginated template listing (max 100 per page)
- Debounced `lastUsedAt` updates (reduces DB write load by ~98%)

### Fixed
- Usage limit race condition under concurrent requests
- Webhook retries lost in serverless environments (setTimeout → Redis queue)
- `FOR UPDATE` on aggregate query (replaced with advisory locks)
- Template listing DoS via unbounded `findMany`
- NaN pagination producing 500 errors
- Double usage records in batch queue error path

## [0.1.0] - 2026-04-01

### Added
- Initial release
- PDF rendering from HTML/Handlebars templates
- API key authentication with team management
- Stripe subscription billing (Free/Pro/Business tiers)
- Usage tracking and monthly limits
- Webhook notifications for render events
- Template versioning
- S3/R2 PDF storage with presigned download URLs
- Dashboard with CodeMirror template editor
- GitHub OAuth login
- Email notifications (Resend)
- Railway deployment configuration

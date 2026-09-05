# Limex Website

A clean-architecture starter with a Next.js frontend, a dedicated Fastify backend, Prisma, MySQL, and a Railway-ready single-container runtime.

## Architecture

~~~text
src/                         Next.js App Router and UI components
  app/                       Pages, layout, and global styles
  components/                Presentation components
    limex/                   Reusable Figma-derived home-page sections
  lib/                       Frontend API client and shared UI helpers

server/
  modules/<feature>/
    domain/                  Entities and repository contracts
    application/             Use cases and business orchestration
    infrastructure/          Prisma-backed adapters
    interface/http/          Fastify routes and request validation
  shared/                    Cross-cutting infrastructure such as Prisma
  app.ts                     Dependency composition and HTTP middleware
  index.ts                   API process entry point

prisma/                      Schema, migrations, and seed data
scripts/
  gateway.mjs                Routes /api to the backend and everything else to Next.js
  start-production.mjs       Runs gateway, frontend, and backend in one container
~~~

## Runtime topology

~~~text
Browser
   |
   | Railway $PORT / local :8080
   v
Gateway
  |-- /api/*  ------> Fastify API :4000
  |-- everything ---> Next.js    :3000
~~~

In local development, Next.js also rewrites /api/* to port 4000, so the UI remains available at http://localhost:3000. In Railway, the gateway listens on Railway's injected $PORT; the frontend and backend remain separate internal processes in the same service/container.

## Local setup

Requirements: Node.js 20+, npm, and Docker for the local MySQL service.

~~~bash
cp .env.example .env
npm install
docker compose up -d db
npm run prisma:deploy
npm run db:seed
npm run dev
~~~

Open:

- Frontend: http://localhost:3000
- Admin login: http://localhost:3000/admin/login
- Enquiries & bookings: http://localhost:3000/admin/inquiries
- Backend health: http://localhost:4000/api/health
- Readiness check: http://localhost:4000/api/health/ready
- Users endpoint (admin session required): http://localhost:4000/api/users

Useful commands:

~~~bash
npm run typecheck
npm run prisma:studio
npm run prisma:migrate -- --name add_feature
~~~

The admin workspace is at `/admin` after signing in. The Enquiries & bookings module collects website contact requests and tool support requests, including appointment intent, preferred Dhaka schedule, contact details, consent, source filters, search and status updates. The Services & menu module manages the four primary mega-menu areas, categories, service URLs, optional sub-links, visibility, and service icons. Menu records live in Prisma; run `npm run prisma:deploy` and `npm run db:seed` after applying the menu migration in a database environment.

Public API mutations have endpoint-specific and process-wide rate limits, bounded body sizes, strict plain-text validation, honeypot checks and idempotent submission keys. The in-memory limiter is appropriate for the current single-container runtime; move its buckets to a shared store before scaling the API horizontally.

Set `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and a long random `ADMIN_SESSION_SECRET` in deployment environments. The admin session is an HTTP-only, signed cookie and is shared by the frontend and API through the same gateway origin.

## Railway deployment

1. Create a Railway project and add a MySQL database.
2. Deploy this repository as a service. railway.toml selects the included Dockerfile.
3. Set DATABASE_URL to the MySQL service connection string, using the format `mysql://USER:PASSWORD@HOST:3306/DATABASE`.
4. Optionally set CORS_ORIGIN to the public frontend origin. Leave PORT and GATEWAY_PORT unset; Railway supplies PORT automatically.
5. Deploy. The image runs prisma migrate deploy and then starts all three processes in one container.

Railway only needs to expose the dynamic PORT. The gateway owns that port and proxies to the internal frontend/backend ports. You do not need two Railway services or two containers for this layout.

## Production commands

~~~bash
npm run build
npm run start
~~~

The production runner uses these defaults, all configurable through environment variables:

| Process | Variable | Default |
| --- | --- | ---: |
| Next.js frontend | FRONTEND_PORT | 3000 |
| Fastify backend | BACKEND_PORT | 4000 |
| Public gateway | Railway PORT, then GATEWAY_PORT | 8080 |

Keep business rules in server/modules/*/application and domain; put database-specific code in infrastructure so features remain straightforward to test and extend.

## Limex home page

The homepage in `src/components/limex/` follows the Limex Figma support file section by section. The navigation dropdowns, mobile drawer/submenus, service filters, reel controls, FAQ accordion, and contact form are implemented as reusable client components. Figma-exported visual assets are stored in `public/figma/` so the page does not depend on expiring design-tool URLs.

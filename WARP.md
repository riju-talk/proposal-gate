# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Full‑stack TypeScript/JavaScript app with a React client (Vite) and an Express API.
- Database via Drizzle ORM (postgres-js). Shared DB schema/types live under shared/ and are imported by the server.
- In development you can run the client and server separately, or run an “integrated” mode that mounts Vite as Express middleware.

Environments and ports
- Default API port: 3000 (configurable via API_PORT)
- Default client dev port: 5000
- In integrated dev (INTEGRATED_DEV=true), the Express server also serves the client via Vite middleware on the API port.

Prerequisites
- Node 18+
- PostgreSQL; set DATABASE_URL in your environment (dotenv is used at runtime)

Common commands
- Install dependencies
  - npm install

- Development (separate processes)
  - Backend only: npm run server:dev
  - Client only: npm run client:dev
  - Both (concurrently): npm run dev

- Development (integrated, single HTTP server with Vite middleware)
  - npm run dev:integrated
  - Notes: Uses INTEGRATED_DEV=true and expects a Vite config and index.html at the paths referenced by server/vite.ts.

- Type checking
  - Full type check (per tsconfig): npm run type-check or npm run check
  - Note: tsconfig.json includes client/ and shared/ and excludes server/**. The server build (esbuild/tsx) does not perform type-checking.

- Build and run
  - Production build (client + server): npm run build
  - Start production server: npm start
  - Preview (build then start): npm run preview

- Database (Drizzle)
  - Push schema to DB: npm run db:push
  - Generate SQL migrations: npm run db:generate
  - Apply migrations: npm run db:migrate
  - Visual studio: npm run db:studio
  - Requires DATABASE_URL. SMTP is optional; missing SMTP falls back to console logging for emails.

- Quick health check (after server is running)
  - curl http://localhost:3000/api/health

Testing
- No test framework or scripts are defined in package.json. If a test runner is added later, update this file with commands (including how to run a single test).

High‑level architecture
- Client (client/src)
  - React app with modular UI components (components/ui) and feature components (e.g., EventsView, EventApprovalTracker).
  - API layer at client/src/lib/api.js uses axios with baseURL /api and withCredentials for HTTP‑only cookie auth. Endpoints include /auth/send-otp, /auth/verify-otp, /auth/me, /events/:id, and approvals routes.
  - Routing/pages live under client/src/pages. Hooks under client/src/hooks encapsulate auth and data fetching.
  - Path aliases: @/* → client/src/*, @shared/* → shared/* (see tsconfig.json).

- Server (server/*)
  - server/index.ts bootstraps Express, parses JSON/cookies, registers routes, and logs /api requests with timing. In production it serves the built client (dist/public) with SPA fallback. In integrated dev it creates a single HTTP server and mounts Vite middleware (setupVite) for HMR and HTML transformation.
  - server/vite.ts handles the Vite middleware setup (development) and static serving (production). SPA fallback returns index.html.
  - server/routes.ts wires major API groups:
    - Auth: /api/auth/send-otp, /api/auth/verify-otp, /api/auth/logout, /api/auth/me
    - Event proposals: /api/event-proposals (CRUD-like and listing), single event details at /api/events/:id with approval details
    - Club proposals: /api/club-proposals (create/list)
    - Approvals: create/update approvals and inspection endpoints, with admin‑only guards
  - server/auth.ts implements OTP flow, admin lookup, and derives the authenticated user. server/jwt.ts sets/verifies HTTP‑only cookies. server/middleware.ts adds security, rate limiting, and auth guards.
  - server/db.ts initializes drizzle-orm/postgres-js using DATABASE_URL; if missing, the server still starts but DB-backed routes will fail at runtime (warning is logged).
  - server/email.ts sends OTPs via SMTP if SMTP_USER/SMTP_PASSWORD are present, otherwise logs simulated emails to the console.

- Shared models (shared/schema.ts)
  - Drizzle schema for otp_verifications, event_proposals, club_proposals, authorized_admins, approvals, student_representatives.
  - Types exported for strong typing across app layers.

Development topologies
- Split dev (default):
  - Run API at http://localhost:3000 and client at http://localhost:5000; client uses /api base path to reach the API.
- Integrated dev:
  - A single Express server mounts Vite middleware; HMR and client routing are handled by server/vite.ts. Use npm run dev:integrated.

Environment variables
- DATABASE_URL: postgres connection string (required for DB operations)
- API_PORT: API port (default 3000)
- NODE_ENV: development or production
- INTEGRATED_DEV: true to run Vite in Express middleware mode
- JWT_SECRET: JWT signing secret (optional in dev; recommended to set in production)
- SMTP_USER, SMTP_PASSWORD: for SMTP-based OTP emails (optional; if absent, emails are simulated to console)

Caveats and notes for agents
- Type safety: npm run type-check does not include server/** due to tsconfig excludes; the server build pipeline (esbuild/tsx) transpiles without type checks.
- Static assets: Production assets are emitted to dist/public by Vite; server is bundled to dist/index.js by esbuild. npm start runs dist/index.js.
- Client base URL: The client API layer assumes /api and sends HTTP‑only cookies (withCredentials). Avoid changing cookie behavior unless you update both server and client.

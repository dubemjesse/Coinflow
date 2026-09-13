# CoinFlow — Personal Expense & Reports Tracker

Modern, responsive web application to track expenses, visualize trends, and
monitor budgets. Originally created by Jesse Odoh; now a full-stack app with a
client, an API server, and a PostgreSQL database.

**[▶ Live demo](https://dubemjesse.github.io/Coinflow/)** — a static preview
seeded with sample data, no install or login required. It's a look-alike of
the real dashboard/transactions/reports/reminders pages for anyone who just
wants to see the app before cloning the repo.

## Overview

CoinFlow has four pages, served by the Vite client and backed by the API:

- **Dashboard** (`index.html`) — add expenses, summary cards, spending-overview
  doughnut, recent transactions, budget progress.
- **Transactions** (`transactions.html`) — full list with search / category /
  date filters, inline edit and delete.
- **Reports** (`reports.html`) — totals, category breakdown, and a spending
  trend chart with daily / weekly / monthly aggregation.
- **Reminders** (`reminders.html`) — simple financial reminders.

Every page except Reminders sits behind a login overlay and reads/writes the
API. On first sign-in the app offers to import any transactions left in the
browser's `localStorage` from the old client.

## Architecture

npm-workspaces monorepo:

```
coinflow/
├── package.json            # workspaces + dev scripts
├── docker-compose.yml      # PostgreSQL 16
├── .env.example
│
├── shared/                 # @coinflow/shared
│   └── src/index.ts        # DTOs + CATEGORIES, shared by client and server
│
├── client/                 # @coinflow/client — Vite multi-page app
│   ├── vite.config.js      # one entry per page; proxies /api → server in dev
│   ├── index.html transactions.html reports.html reminders.html
│   ├── css/styles.css
│   └── js/
│       ├── api.js          # fetch wrapper + minor-unit / date helpers
│       ├── session.js      # auth-gate overlay + one-time localStorage import
│       ├── app.js          # Dashboard
│       ├── transactions.js # Transactions page
│       ├── reports.js      # Reports page
│       └── reminders.js    # Reminders (still localStorage — Phase 4)
│
└── server/                 # @coinflow/server — Express + Prisma API
    ├── prisma/
    │   ├── schema.prisma   # users, transactions, budgets, reminders
    │   ├── migrations/
    │   └── seed.ts         # demo user + demo transactions + budgets
    └── src/
        ├── index.ts app.ts env.ts db.ts
        ├── lib/            # auth (bcrypt + JWT), DTO serializers
        ├── middleware/     # error handler
        └── routes/         # health, auth, transactions
```

### Technologies

| Layer | Stack |
|---|---|
| Client | Vite 6, vanilla ES modules, Chart.js (dashboard doughnut), Canvas (reports trend), Font Awesome |
| Server | Node 20+, Express 4, Prisma 6, zod, bcryptjs, jsonwebtoken |
| Database | PostgreSQL 16 (Docker) |
| Shared | TypeScript DTOs |

## Running locally

**Prerequisites:** Node 20+, Docker.

```bash
cp .env.example .env               # adjust ports / passwords if needed
npm install                        # installs every workspace
npm run db:up                      # start PostgreSQL (docker compose)
npm run db:migrate                 # apply Prisma migrations
npm run seed --workspace server    # optional: demo data
npm run dev                        # client + API together
```

| URL | What |
|---|---|
| http://localhost:5180 | Client (Vite dev server) |
| http://localhost:4000 | API |
| http://localhost:4000/api/health | Liveness + DB check |

Demo login (after seeding): **`demo@coinflow.app` / `password123`**, or create
an account from the overlay.

### Scripts

| Command | Effect |
|---|---|
| `npm run dev` | client + server in parallel |
| `npm run dev:client` / `npm run dev:server` | one side only |
| `npm run build` | build shared → client → server |
| `npm run db:up` / `npm run db:down` | start / stop PostgreSQL |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:studio` | Prisma Studio |
| `npm run seed --workspace server` | load demo data |
| `cd server && npx prisma migrate reset` | wipe + re-migrate + re-seed the dev DB |

### Configuration (`.env`)

| Var | Purpose |
|---|---|
| `POSTGRES_USER/PASSWORD/DB/PORT` | docker-compose database (host port defaults to `5434`) |
| `DATABASE_URL` | Prisma connection string (must match the above) |
| `PORT` | API port (default `4000`) |
| `JWT_SECRET` | signs the `coinflow_token` cookie — **change for any real deployment** |
| `CLIENT_ORIGIN` | CORS allow-list (default `http://localhost:5180`) |
| `VITE_API_BASE_URL` | leave blank in dev (Vite proxies `/api`); set to the API origin for production builds |

## API

Base path `/api`. Auth is a JWT in an httpOnly `coinflow_token` cookie; all
`/transactions` routes require it and are scoped to the signed-in user.
**Money is integer minor units (kobo) everywhere.**

| Method | Path | Body / query |
|---|---|---|
| `POST` | `/auth/register` | `{ email, password, name, monthlyIncomeMinor? }` |
| `POST` | `/auth/login` | `{ email, password }` |
| `POST` | `/auth/logout` | — |
| `GET` | `/auth/me` | — |
| `GET` | `/transactions` | `?from&to&category&type&search&limit&offset` |
| `POST` | `/transactions` | `{ title, amountMinor, category, occurredAt, type? }` |
| `GET` | `/transactions/:id` | — |
| `PATCH` | `/transactions/:id` | partial of the create body |
| `DELETE` | `/transactions/:id` | — |
| `POST` | `/transactions/import` | `{ transactions: [ ...create bodies ] }` (one-time migration) |

Validation failures return `422` with a zod field-error map.

## Data model

- **users** — `email`, `passwordHash`, `name`, `monthlyIncomeMinor`, `currency`
- **transactions** — `title`, `amountMinor`, `type` (`expense`\|`income`),
  `category`, `occurredAt`, owner
- **budgets** — `category`, `amountMinor`, `period` (per user; not yet exposed
  via the API)
- **reminders** — `title`, `description`, `category`, `dueAt`, `repeat`,
  `completed` (schema only; page still uses `localStorage`)

## Status & roadmap

- **Phase 1** ✅ — monorepo, Dockerised Postgres, Prisma schema, API skeleton.
- **Phase 2** ✅ — email/password auth, full `/api/transactions` CRUD +
  `/import`; Dashboard, Transactions and Reports wired to the API.
- **Phase 3** — `/api/budgets`, `/api/reminders`, server-side report
  aggregation (`/api/reports`, `/api/dashboard`); convert the client to React.
- **Phase 4** — tests, CSV export via API, deployment (client → static host,
  server → Render/Railway, DB → Neon/Supabase).

### Known limitations

- Budgets are still hard-coded defaults in `client/js/app.js` (`loadBudgets()`).
- Reminders remain browser-local until Phase 3.
- Report aggregation still runs in the browser.
- Reports trend chart is custom Canvas — no tooltips or zoom.

## Author

Created by Jesse Odoh. CoinFlow — Track. Analyze. Save.

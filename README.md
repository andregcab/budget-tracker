# Budget Tracker

A multi-user, self-hosted budget tracking web app. Import bank CSVs, categorize transactions, and track spending with a simple dashboard.

## Features

- **Multi-user** – Register and sign in; each user has their own accounts and data
- **CSV import** – Bank-agnostic import (Date, Description, Amount). Duplicates are skipped
- **Accounts** – Multiple bank accounts with transaction history
- **Categories** – Custom categories with auto-matching rules for imports
- **Transactions** – View, edit, and delete by month
- **Dashboard** – Monthly income, spending by category, and budget overview
- **Self-hosted** – Your data stays on your server (PostgreSQL)

## Stack

- **Backend:** NestJS, TypeScript, Prisma, PostgreSQL, JWT auth
- **Frontend:** Vite, React, TypeScript, Tailwind CSS, shadcn/ui, React Query, React Router

## Prerequisites

- Node.js 18+
- PostgreSQL (or use the connection string in `.env` for your setup)

## Setup

### 1. Install dependencies

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Database

Create a PostgreSQL database and set the URL in `backend/.env`:

```bash
cp backend/.env.example backend/.env
# Edit backend/.env and set DATABASE_URL, e.g.:
# DATABASE_URL="postgresql://user:password@localhost:5432/budget_tracker"
```

Run migrations (from repo root):

```bash
npm run db:migrate
```

Seed default categories (optional, after first migration):

```bash
cd backend && npm run db:seed
```

### 3. Environment

- **Backend** (`backend/.env`): `DATABASE_URL` (required), `JWT_SECRET` (required in production), optional `PORT` (default 3000), optional `CORS_ORIGIN`. See `backend/.env.example`.
- **Frontend**: Uses `/api` proxy to the backend when running with `npm run dev:frontend`; ensure the backend is running on the configured port.

### 4. Run

**Development**

- Terminal 1 – API: `npm run dev:backend` (or `cd backend && npm run start:dev`)
- Terminal 2 – Frontend: `npm run dev:frontend` (or `cd frontend && npm run dev`)

Open the frontend (e.g. http://localhost:5173). Register a user, add an account, and import a bank CSV from the Import page.

**Production build**

```bash
npm run build
```

Serve `frontend/dist` with a static server and run the backend with `cd backend && npm run start:prod`. See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for full home-server deployment (env vars, reverse proxy, systemd).

## Scripts (from repo root)

| Script | Description |
|--------|-------------|
| `npm run dev:backend` | Start backend in watch mode |
| `npm run dev:frontend` | Start frontend dev server |
| `npm run build` | Build backend and frontend |
| `npm run test` | Run backend and frontend tests |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run Prisma migrations (requires DB) |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed default categories (run from `backend/`) |

## CSV import format

Expected columns (case-insensitive, common bank export aliases supported):

- **Required:** Date (or Post Date), Description (or Details), Amount
- **Optional:** Type, Balance, Category

Duplicate rows (same account, date, description, amount) are skipped.

## License

Private / unlicensed.

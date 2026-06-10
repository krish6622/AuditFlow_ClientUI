# AuditFlow — UI

React frontend for **AuditFlow** (formerly Elangovan Associates): a multi-tenant
SaaS for small field-service businesses to manage **employees, work orders, and
invoices**.

> **Status — Phase 1 complete:** React auth frontend (login, forgot/reset/change
> password, protected dashboard shell). Later phases add organization, employee,
> customer, work-order, invoice, and dashboard features.

The FastAPI backend lives in the sibling **`AuditFlow_Backend`** project.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React · TypeScript · Vite · Tailwind · shadcn/ui |
| Deploy | Frontend → Vercel |

## Quick start

```powershell
Copy-Item .env.example .env        # VITE_API_URL=http://localhost:8000/api/v1
npm install
npm run dev                        # → http://localhost:5173
npm run build                      # type-check + production build (verified)
```

Routes: `/login`, `/forgot-password`, `/reset-password`, `/` (protected
dashboard), `/change-password`. The typed API client (`src/lib/api.ts`)
transparently refreshes the access token on `401` and retries once;
`AuthContext` mirrors the RBAC matrix to gate UI affordances (`can(...)`).

## Configuration

Configuration is environment-based (`.env`, see `.env.example`). The only
required variable is `VITE_API_URL` — the base URL of the `AuditFlow_Backend`
API, with no trailing slash.

## Deployment notes

- **Frontend → Vercel:** set `VITE_API_URL` to the deployed backend (Railway)
  API URL; `vercel.json` already rewrites all routes to `index.html` for SPA
  deep-linking.

# SmartSwap — Intelligent Shift Swapping

SmartSwap is a full-stack shift-swapping platform for shift-based workplaces (contact centres, retail, hospitality, healthcare). Employees request to swap shifts, and the system finds the best swap partners automatically — including **multi-hop swap chains** (A → B → C → A) when no direct swap exists. Managers get oversight, analytics, and approval controls.

**🔗 Live demo:** https://smartswap-web.vercel.app

**Demo accounts** (password for both: `password123`)

| Role | Email |
|------|-------|
| Employee | `employee@smartswap.app` |
| Manager | `manager@smartswap.app` |

---

## Features

### For employees
- **Personal dashboard** — active swap requests, successful matches, and AI match-confidence at a glance.
- **My Schedule** — the employee's real weekly schedule (shifts, marketplace, skills, days off) pulled live from the database.
- **Smart Matches** — AI-assisted matching ranks the best swap partners for a shift by skills, availability, marketplace, and preferences.
- **Multi-hop Swaps** — when there's no direct 1:1 swap, the engine detects circular swap chains that satisfy everyone.
- **Swap Chains** — track and approve your participation in a chain.

### For managers
Everything employees have, plus:
- **Analytics** — swap trends, skill distribution, marketplace breakdown, and system performance insights.
- **Oversight of active chains** across the team.

Navigation is **role-aware**: employees only see the features relevant to them; manager-only areas are hidden unless you have the role.

---

## Tech stack

**Frontend**
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui (Radix primitives)
- TanStack Query (server state) + React Router
- JWT auth with a typed API client

**Backend** ([`aalzriqat/backend`](https://github.com/aalzriqat/backend))
- Node.js + Express + TypeScript
- MongoDB (Mongoose) on MongoDB Atlas
- JWT authentication, Joi validation, Helmet, Winston

**Infrastructure**
- Frontend and API both deployed as Vercel projects (the API runs as a serverless function).

---

## Architecture

```
React SPA  ──HTTPS / JWT──►  Express REST API  ──►  MongoDB Atlas
 (Vercel)                     (Vercel serverless)
```

The frontend talks to a single REST API via a typed client (`src/services/api.ts`). Auth issues a JWT that is stored client-side and sent as a `Bearer` token on every request. All matching logic (smart matches, multi-hop chain detection, execution) lives in the backend.

---

## Getting started (local)

Prerequisites: Node.js 18+, and a running MongoDB (local or Atlas) for the API.

```bash
# 1. Backend (see aalzriqat/backend)
#    configure .env with MONGODB_URI + JWT_SECRET, then:
npm install
npm run seed:real-schedules   # seed employee schedules
npm run create:demo-users     # create the demo logins
npm run dev                   # http://localhost:3001

# 2. Frontend (this repo)
npm install
npm run dev                   # http://localhost:8080
```

### Environment

The frontend reads the API base URL from `VITE_API_BASE_URL`:

```
# .env.development
VITE_API_BASE_URL=http://localhost:3001/api

# .env.production
VITE_API_BASE_URL=https://smartswap-api.vercel.app/api
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint the project |

---

## License

MIT

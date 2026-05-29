# Admin Dashboard

> A production-ready admin dashboard scaffolding built with **TanStack Start**, **Ory Kratos** (authentication), **Ory Oathkeeper** (API access proxy), and **PostgREST** (PostgreSQL REST API).

Based on the [Tailwind Admin](https://github.com/Tailwind-Admin/free-tailwind-admin-dashboard-template) design system with shadcn/ui New York styling.

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Browser    │────▶│  Nginx (:8080)   │────▶│  Oathkeeper     │
│  (React 19   │     │  Reverse Proxy   │     │  (:4455)        │
│   frontend)  │     │                  │     │  Auth Decision  │
└──────────────┘     └──────────────────┘     └────────┬────────┘
       ▲                                                │
       │                                                ▼
       │                                        ┌─────────────────┐
       │                                        │  Ory Kratos     │
       │                                        │  (:4433)        │
       │                                        │  User Mgmt      │
       │                                        └────────┬────────┘
       │                                                 │
       │                                                 ▼
       │                                        ┌─────────────────┐
       └────────────────────────────────────────│  PostgREST      │
                                                │  (:3001)        │
                                                │  REST API       │
                                                └────────┬────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │  PostgreSQL     │
                                                │  (:5432)        │
                                                └─────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TanStack Start, TanStack Router, TanStack Table |
| **Styling** | Tailwind CSS v4, shadcn/ui (New York), Radix UI primitives |
| **Auth** | Ory Kratos (self-service login/registration, OIDC/SSO, session management) |
| **API Gateway** | Ory Oathkeeper (cookie session auth, JWT validation, access rules) |
| **API Backend** | PostgREST (auto-generates REST API from PostgreSQL schema) |
| **Database** | PostgreSQL 16 with Row-Level Security |
| **Proxy** | Nginx (rate limiting, CORS, routing) |
| **Dev Email** | MailHog (catch all SMTP traffic in dev) |

## Project Structure

```
admin-dashboard/
├── frontend/                   # TanStack Start admin dashboard
│   ├── src/
│   │   ├── routes/             # File-based routing (TanStack Router)
│   │   │   ├── __root.tsx      # Root layout + sidebar shell
│   │   │   ├── index.tsx       # Dashboard home
│   │   │   ├── users/
│   │   │   │   └── index.tsx   # Users list table
│   │   │   └── settings.tsx    # Settings page
│   │   ├── components/
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   ├── Sidebar.tsx     # Responsive sidebar nav
│   │   │   ├── Navbar.tsx      # Top navigation bar
│   │   │   └── PageHeader.tsx  # Reusable header
│   │   ├── context/
│   │   │   └── auth-context.tsx # Auth provider (Ory Kratos integration point)
│   │   ├── hooks/
│   │   │   └── use-auth.ts     # useAuth() hook
│   │   ├── api/
│   │   │   └── client.ts       # API client (routes through Oathkeeper)
│   │   ├── lib/
│   │   │   └── utils.ts        # cn() utility
│   │   ├── client.tsx          # Client entry
│   │   ├── ssr.tsx             # SSR handler
│   │   └── router.tsx          # TanStack Router instance
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── auth/
│   ├── kratos/
│   │   ├── kratos.yml                      # Kratos configuration
│   │   ├── kratos-email-courier.yml        # Email templates
│   │   └── identities/
│   │       └── user.schema.json            # Identity schema (role, name, etc.)
│   ├── oathkeeper/
│   │   ├── oathkeeper.yml                  # Oathkeeper configuration
│   │   └── rules/
│   │       └── postgrest-access-rules.json # Access rules for PostgREST
│   └── Dockerfile                          # Multi-stage auth services
├── backend/
│   ├── db/
│   │   └── migrations/
│   │       ├── 001_initial_schema.sql      # Users, profiles, audit_logs, api_keys
│   │       └── 002_seed_data.sql           # Sample data for dev
│   ├── postgrest.conf                      # PostgREST configuration
│   ├── nginx/
│   │   └── nginx.conf                      # Reverse proxy with rate limiting
│   └── Dockerfile                          # PostgREST container
├── scripts/
│   └── start-dev.sh                        # One-command dev startup
├── docker-compose.yml                      # All services orchestrated
├── .env.example                            # Environment variables template
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 22+
- Docker + Docker Compose
- npm

### 1. Setup

```bash
# Clone or navigate to the project
cd admin-dashboard

# Copy environment config
cp .env.example .env
# ⚠ Edit .env and replace all placeholder secrets!
#    Generate strong values with: openssl rand -base64 32

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Start Everything

```bash
# One-command start (infra + frontend):
./scripts/start-dev.sh
```

Or start manually:

```bash
# Start backend services
docker compose up -d --build

# Start frontend dev server
cd frontend && npm run dev
```

### 3. Access

| Service | URL |
|---------|-----|
| Admin Dashboard | http://localhost:5173 |
| API Gateway (via Nginx) | http://localhost:8080/api |
| PostgREST (direct) | http://localhost:3001 |
| Kratos Registration | http://localhost:4433/self-service/registration |
| Kratos Login | http://localhost:4433/self-service/login |
| MailHog (email debug) | http://localhost:8025 |

## API Endpoints

All API requests go through the Nginx/Oathkeeper gateway at `http://localhost:8080/api/`.

| Endpoint | Auth Required | Description |
|----------|--------------|-------------|
| `GET /api/public/status` | No | Health check |
| `GET /api/users` | Yes | List users (paginated) |
| `GET /api/users?id=eq.{id}` | Yes | Get user by ID |
| `POST /api/users` | Yes (admin) | Create user |
| `PATCH /api/users?id=eq.{id}` | Yes | Update user |
| `GET /api/profiles` | Yes | List profiles |
| `GET /api/audit_logs` | Yes (admin) | View audit logs |
| `GET /api/api_keys` | Yes | List API keys |

**PostgREST query syntax** (works on all endpoints):
- `?column=eq.value` — equals filter
- `?column=gte.100` — greater than or equal
- `?order=column.desc` — sorting
- `?limit=20&offset=0` — pagination
- `?select=column1,column2` — column selection

## Auth Architecture

### Ory Kratos

Handles all user identity management:

- **Self-service registration** with email + password
- **Self-service login** with session cookie
- **Profile management** (name, avatar, settings)
- **Role management** via identity traits (`admin`, `user`, `viewer`)
- **Recovery** and **Verification** flows via email
- **OIDC/SSO** ready for Google and GitHub (configure client IDs in `.env`)
- **Session** stored in secure HTTP-only cookies

### Ory Oathkeeper

Acts as the API gateway authorization layer:

- **cookie_session authenticator** — validates Kratos sessions for browser requests
- **bearer_token / jwt authenticator** — for API key / machine-to-machine access
- **header mutator** — injects `X-User-ID`, `X-User-Role`, `X-User-Email` headers to PostgREST
- **Access rules** defined per endpoint pattern (`/api/public/*`, `/api/users/*`, `/api/admin/*`)

### PostgREST Row-Level Security

RLS policies use the JWT claims injected by Oathkeeper:

```sql
CREATE POLICY user_select_own ON api.users FOR SELECT
  USING (id::text = current_setting('request.jwt.claim.sub', true));
```

This ensures users can only access their own data even at the database level.

## PostgREST API Reference

The API auto-generates from the PostgreSQL schema. Full OpenAPI spec at:

```
http://localhost:3001/
```

### Tables exposed via `api` schema

| Table | RLS | Description |
|-------|-----|-------------|
| `api.users` | Yes | User accounts (synced with Kratos) |
| `api.profiles` | Yes | Extended user profiles |
| `api.audit_logs` | Yes | Security audit trail |
| `api.api_keys` | Yes | API key management |

### RLS Policy Summary

| Table | Anonymous | Authenticated | Admin |
|-------|-----------|---------------|-------|
| `users` | No access | Own record only | All records |
| `profiles` | No access | Own profile | All profiles |
| `audit_logs` | No access | Own entries | All entries |
| `api_keys` | No access | Own keys only | All keys |

## Adding a New Page

1. Create a file in `frontend/src/routes/` (TanStack Router file-based routing):
   ```tsx
   // frontend/src/routes/reports.tsx
   import { createFileRoute } from '@tanstack/react-router'

   export const Route = createFileRoute('/reports')({
     component: ReportsPage,
   })

   function ReportsPage() {
     return <div>Reports</div>
   }
   ```
2. Add nav item in `Sidebar.tsx`
3. Done — TanStack Router auto-registers the route

## Adding a New API Table

1. Add migration in `backend/db/migrations/003_new_table.sql`
2. Apply: `docker compose exec postgres psql -U admin_dashboard -d admin_dashboard -f /docker-entrypoint-initdb.d/003_new_table.sql`
3. PostgREST will expose it automatically from the `api` schema
4. Add access rules in `auth/oathkeeper/rules/postgrest-access-rules.json`

## Production Considerations

Before deploying:

1. **Generate strong secrets**: `openssl rand -base64 32` for all placeholder values
2. **Configure real SMTP**: Replace MailHog with SendGrid, AWS SES, etc.
3. **Set up HTTPS**: Add TLS termination at Nginx or use a reverse proxy like Caddy
4. **Configure OIDC providers**: Fill in Google/GitHub OAuth credentials
5. **Set up database backups**: Add periodic `pg_dump` to cron
6. **Rate limiting**: Adjust Nginx `limit_req` rates for your traffic
7. **Kratos production mode**: Remove `--dev` flag, disable `--watch-courier`
8. **Use secrets management**: Consider Docker secrets or HashiCorp Vault

## Development Commands

```bash
# Start frontend only (if infra is already running)
cd frontend && npm run dev

# Rebuild and restart all services
docker compose up -d --build

# View service logs
docker compose logs -f kratos
docker compose logs -f oathkeeper
docker compose logs -f postgrest
docker compose logs -f nginx

# Run database migrations manually
docker compose exec postgres psql -U admin_dashboard -d admin_dashboard -f /migrations/001_initial_schema.sql

# Seed data
docker compose exec postgres psql -U admin_dashboard -d admin_dashboard -f /migrations/002_seed_data.sql

# Stop everything
docker compose down

# Full cleanup (removes volumes)
docker compose down -v
```

## License

MIT

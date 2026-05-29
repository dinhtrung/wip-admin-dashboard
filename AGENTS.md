# Admin Dashboard - Agent Configuration

This document describes how AI agents should work with the admin dashboard project.

## Project Overview

A production-ready admin dashboard scaffolding built with **TanStack Start**, **Ory Kratos** (authentication), **Ory Oathkeeper** (API access proxy), and **PostgREST** (PostgreSQL REST API).

### Architecture
- Frontend: React 19, TanStack Start, TanStack Router, TanStack Table
- Styling: Tailwind CSS v4, shadcn/ui (New York), Radix UI primitives  
- Auth: Ory Kratos (self-service login/registration, OIDC/SSO, session management)
- API Gateway: Ory Oathkeeper (cookie session auth, JWT validation, access rules)
- API Backend: PostgREST (auto-generates REST API from PostgreSQL schema)
- Database: PostgreSQL 16 with Row-Level Security
- Proxy: Nginx (rate limiting, CORS, routing)

### Directory Structure
```
admin-dashboard/
├── frontend/           # React 19 + TanStack Start frontend
│   ├── src/
│   │   ├── api/        # API client and configuration
│   │   ├── components/ # UI components (shadcn/ui + custom)
│   │   ├── routes/     # TanStack router configuration
│   │   ├── hooks/      # React hooks (including auth hooks)
│   │   └── context/    # React context providers
│   ├── package.json
│   └── vite.config.ts
├── backend/            # Docker configuration for backend services
│   ├── nginx/          # Nginx reverse proxy configuration
│   ├── db/             # PostgreSQL migrations
│   └── postgrest.conf  # PostgREST configuration
├── auth/               # Ory Kratos and Oathkeeper configuration
│   ├── kratos/         # Kratos identity and courier configuration
│   └── oathkeeper/     # Oathkeeper rules and configuration
├── docker-compose.yml  # Main orchestration
├── scripts/            # Development and deployment scripts
└── README.md
```

## Agent Guidelines

### Primary Tasks
- **Frontend Development**: Implement new dashboard features using TanStack Start/Routes
- **API Integration**: Connect frontend components to PostgREST backend
- **Auth Integration**: Ensure proper session handling with Ory Kratos/Oathkeeper
- **Component Creation**: Build new UI components following shadcn/ui patterns
- **Database Schema**: Extend PostgreSQL schema with appropriate RLS policies
- **Testing**: Add unit and integration tests for new functionality

### Development Workflow
1. Use `docker-compose up` to start the full stack
2. Frontend runs on http://localhost:8080
3. Make changes in the appropriate service directory
4. Test auth flows through the complete stack (frontend → nginx → oathkeeper → kratos)
5. Commit changes with conventional commits

### Important Notes
- All database access goes through PostgREST (no direct DB connections)
- Authentication state is managed by Ory Kratos
- API requests must go through Ory Oathkeeper for auth validation
- Frontend uses TanStack Router for navigation
- Follow existing code patterns and component structures
- Respect the existing TypeScript types and interfaces

### Common Commands
- `docker-compose up` - Start the full stack
- `docker-compose down` - Stop the stack
- Frontend development: Navigate to frontend/ and use `npm run dev`
- Check docker logs: `docker-compose logs -f`

# =============================================================================
# Ory Authentication Stack — Docker Image Definitions
# =============================================================================
# This Dockerfile provides multi-stage builds and/or image references for
# both Ory Kratos (v1.x) and Ory Oathkeeper (v0.40.x).
#
# Usage:
#   docker build --target kratos -t ory-kratos:latest .
#   docker build --target oathkeeper -t ory-oathkeeper:latest .
#
# In docker-compose.yml you can also reference the official images directly:
#   oryd/kratos:v1.1.0
#   oryd/oathkeeper:v0.40.7
# =============================================================================

# =============================================================================
# Stage 1: Kratos — Identity & User Management
# =============================================================================
FROM oryd/kratos:v1.1.0 AS kratos

LABEL org.opencontainers.image.title="Ory Kratos — Identity & User Management"
LABEL org.opencontainers.image.description="Self-hosted identity server for Admin Dashboard"
LABEL org.opencontainers.image.version="v1.1.0"
LABEL org.opencontainers.image.source="https://github.com/ory/kratos"
LABEL org.opencontainers.image.licenses="Apache-2.0"

# Kratos is statically compiled — no additional system packages needed.
# Configuration is mounted as a volume at /etc/config/kratos/
# The entrypoint and default command are inherited from the official image.

EXPOSE 4433 4434

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4434/health/ready || exit 1

# =============================================================================
# Stage 2: Oathkeeper — API Access Proxy & Policy Engine
# =============================================================================
FROM oryd/oathkeeper:v0.40.7 AS oathkeeper

LABEL org.opencontainers.image.title="Ory Oathkeeper — API Access Proxy & Policy Engine"
LABEL org.opencontainers.image.description="Self-hosted identity-aware proxy for Admin Dashboard"
LABEL org.opencontainers.image.version="v0.40.7"
LABEL org.opencontainers.image.source="https://github.com/ory/oathkeeper"
LABEL org.opencontainers.image.licenses="Apache-2.0"

# Oathkeeper is statically compiled — no additional system packages needed.
# Configuration is mounted as a volume at /etc/config/oathkeeper/
# Access rules are mounted at /etc/config/oathkeeper/rules/

EXPOSE 4455 4456

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4456/health/ready || exit 1

# =============================================================================
# Stage 3: Combined — both services in a single "distroless" image
#          (not recommended for production; use separate containers)
# =============================================================================
FROM alpine:3.20 AS combined

LABEL org.opencontainers.image.title="Ory Auth Stack (Combined)"
LABEL org.opencontainers.image.description="Combined Ory Kratos + Oathkeeper (development only)"
LABEL org.opencontainers.image.version="v1.1.0-v0.40.7"
LABEL org.opencontainers.image.vendor="Admin Dashboard"

RUN apk add --no-cache ca-certificates tzdata curl

COPY --from=kratos /usr/bin/kratos /usr/local/bin/kratos
COPY --from=oathkeeper /usr/bin/oathkeeper /usr/local/bin/oathkeeper

EXPOSE 4433 4434 4455 4456

HEALTHCHECK NONE

CMD ["/bin/sh", "-c", "echo 'Combined image: run kratos or oathkeeper explicitly'; exit 1"]

# =============================================================================
# Stage 4: Kratos Migrate — runs database migrations on startup
# =============================================================================
FROM oryd/kratos:v1.1.0 AS kratos-migrate

LABEL org.opencontainers.image.title="Ory Kratos — Migration Runner"
LABEL org.opencontainers.image.description="Runs Kratos SQL migrations against PostgreSQL"
LABEL org.opencontainers.image.version="v1.1.0"

# This stage should be run as an init container that exits after migration.
# Example docker-compose entry:
#   command: migrate sql -e --yes
#
# The DSN environment variable must point to the PostgreSQL instance.

HEALTHCHECK NONE

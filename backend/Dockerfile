# ==============================================================================
# Dockerfile — PostgREST v12 API Backend
# ==============================================================================
# Multi-stage build:
#   1. builder  — downloads the official PostgREST binary using Alpine
#   2. runtime  — minimal distroless image with just the binary + config
# ==============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Builder
# ---------------------------------------------------------------------------
FROM alpine:3.20 AS builder

ARG POSTGREST_VERSION=12.0.2

# Install dependencies for downloading and verifying the binary
RUN apk add --no-cache curl ca-certificates

WORKDIR /tmp

# Download the official PostgREST release binary
RUN echo "Downloading PostgREST v${POSTGREST_VERSION}..." && \
    curl -fsSL \
        "https://github.com/PostgREST/postgrest/releases/download/v${POSTGREST_VERSION}/postgrest-v${POSTGREST_VERSION}-linux-x64.tar.gz" \
        -o postgrest.tar.gz && \
    tar -xzf postgrest.tar.gz && \
    mv postgrest /usr/local/bin/postgrest && \
    chmod +x /usr/local/bin/postgrest && \
    rm -f postgrest.tar.gz

# Verify the binary works
RUN postgrest --version

# ---------------------------------------------------------------------------
# Stage 2: Runtime
# ---------------------------------------------------------------------------
FROM alpine:3.20

# Install runtime dependencies
RUN apk add --no-cache \
        ca-certificates \
        libpq \
        curl

# Create a non-root user for security
RUN addgroup -S postgrest && \
    adduser -S -G postgrest postgrest

# Copy the PostgREST binary from the builder stage
COPY --from=builder /usr/local/bin/postgrest /usr/local/bin/postgrest

# Create config directory and copy configuration
RUN mkdir -p /etc/postgrest
COPY postgrest.conf /etc/postgrest/postgrest.conf

# Health check script
COPY <<'HEALTHCHECK_SCRIPT' /usr/local/bin/healthcheck.sh
#!/bin/sh
set -e
curl -sf http://localhost:3000/ || exit 1
HEALTHCHECK_SCRIPT
RUN chmod +x /usr/local/bin/healthcheck.sh

# Set ownership
RUN chown -R postgrest:postgrest /etc/postgrest

USER postgrest

# Health check (checks the PostgREST root endpoint every 30s)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD /usr/local/bin/healthcheck.sh

# Expose the PostgREST port
EXPOSE 3000

# Default command: launch PostgREST with our config file
ENTRYPOINT ["postgrest"]
CMD ["/etc/postgrest/postgrest.conf"]

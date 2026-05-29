#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "═══ Admin Dashboard — Setup & Dev Start ═══"
echo ""

# ── Prerequisites check ──
echo "→ Checking prerequisites..."
command -v node &>/dev/null || { echo "✗ Node.js not found. Install it first."; exit 1; }
command -v docker &>/dev/null || { echo "✗ Docker not found. Install it first."; exit 1; }
command -v npm &>/dev/null || { echo "✗ npm not found."; exit 1; }
echo "✓ All prerequisites found."
echo ""

# ── .env setup ──
if [ ! -f .env ]; then
  echo "→ Creating .env from .env.example..."
  cp .env.example .env
  echo "⚠  Please edit .env and replace placeholder secrets!"
  echo "   Generate secrets with: openssl rand -base64 32"
  echo ""
fi

# ── Frontend dependencies ──
echo "→ Installing frontend dependencies..."
cd frontend
npm install --silent 2>/dev/null || npm install
cd ..

# ── Start infrastructure ──
echo "→ Starting backend services (PostgreSQL, Kratos, Oathkeeper, PostgREST, Nginx)..."
docker compose up -d --build
echo "✓ Backend services starting..."
echo ""

# ── Wait for health ──
echo "→ Waiting for services to become healthy..."
sleep 5

check_health() {
  local name=$1 url=$2 max=$3
  for i in $(seq 1 $max); do
    if curl -sf "$url" >/dev/null 2>&1; then
      echo "  ✓ $name is ready"
      return 0
    fi
    sleep 2
  done
  echo "  ⚠  $name health check timed out"
  return 1
}

check_health "PostgreSQL" "http://localhost:8080/health" 15
check_health "Ory Kratos" "http://localhost:4434/health/ready" 10
check_health "Oathkeeper" "http://localhost:4456/health/ready" 10
check_health "PostgREST" "http://localhost:3001/" 10

echo ""
echo "═══ Services Running ═══"
echo ""
echo "  Frontend Dev Server : http://localhost:5173"
echo "  Nginx (API Gateway) : http://localhost:8080"
echo "  PostgREST (direct)  : http://localhost:3001"
echo "  Kratos Public API   : http://localhost:4433"
echo "  Kratos Admin API    : http://localhost:4434"
echo "  Oathkeeper Proxy    : http://localhost:4455"
echo "  MailHog Web UI      : http://localhost:8025"
echo ""

echo "→ Starting frontend dev server..."
echo "  (press Ctrl+C to stop all services)"
echo ""
cd frontend && npm run dev

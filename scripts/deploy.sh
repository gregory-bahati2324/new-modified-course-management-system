#!/usr/bin/env bash
# =============================================================================
#  Deploy or update the LMS on this machine.
#
#    ./scripts/deploy.sh
#
#  Safe to re-run: it never overwrites an existing .env, and `docker compose up -d --build`
#  only rebuilds what changed. Run this from the project root (where docker-compose.yml is).
# =============================================================================
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

if ! command -v docker &>/dev/null; then
  echo "Docker is not installed. On Ubuntu:"
  echo "  curl -fsSL https://get.docker.com | sh && sudo usermod -aG docker \$USER"
  echo "then log out and back in, and re-run this script."
  exit 1
fi
COMPOSE="docker compose"
$COMPOSE version &>/dev/null || COMPOSE="docker-compose"

if [ ! -f .env ]; then
  echo "No .env found - creating one from .env.example."
  cp .env.example .env
  # Fill in random secrets so the stack can start immediately; SERVER_NAME/domain is left for you.
  JWT_SECRET_KEY="$(openssl rand -hex 32)"
  NOTIF_KEY="$(openssl rand -hex 32)"
  PG_PASS="$(openssl rand -hex 16)"
  sed -i "s#^JWT_SECRET_KEY=.*#JWT_SECRET_KEY=${JWT_SECRET_KEY}#" .env
  sed -i "s#^NOTIFICATION_INTERNAL_API_KEY=.*#NOTIFICATION_INTERNAL_API_KEY=${NOTIF_KEY}#" .env
  sed -i "s#^POSTGRES_PASSWORD=.*#POSTGRES_PASSWORD=${PG_PASS}#" .env
  echo "Generated .env with fresh secrets. Edit SERVER_NAME in .env if you have a domain, then re-run this script."
  echo "(If this is a REDEPLOY onto an existing database volume, restore the original POSTGRES_PASSWORD in .env instead of the generated one.)"
  exit 0
fi

echo "Building and starting the stack..."
$COMPOSE up -d --build

echo
echo "Waiting for services to become healthy..."
sleep 10
$COMPOSE ps

echo
echo "Running smoke tests..."
SERVER_NAME="$(grep -E '^SERVER_NAME=' .env | cut -d= -f2)"
if [ -n "$SERVER_NAME" ] && [ "$SERVER_NAME" != "_" ] && [ -r "/etc/letsencrypt/live/${SERVER_NAME}/fullchain.pem" ]; then
  URL="https://${SERVER_NAME}"
else
  URL="http://localhost"
fi
./scripts/smoke-test.sh "$URL" || echo "Some checks failed - see above. The stack is still running; check 'docker compose logs -f <service>'."

echo
echo "Done. Site: $URL"
[ "$URL" = "http://localhost" ] && [ -n "$SERVER_NAME" ] && [ "$SERVER_NAME" != "_" ] && \
  echo "HTTPS is not active yet for ${SERVER_NAME} - see 'Enable HTTPS' in DEPLOYMENT.md."

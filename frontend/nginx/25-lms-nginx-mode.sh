#!/bin/sh
# Runs automatically before nginx starts (nginx image executes /docker-entrypoint.d/*.sh).
# Picks HTTPS when a Let's Encrypt certificate for $SERVER_NAME is present, HTTP otherwise,
# and renders the matching template into /etc/nginx/conf.d/.
set -eu

SERVER_NAME="${SERVER_NAME:-_}"
CLIENT_MAX_BODY_SIZE="${CLIENT_MAX_BODY_SIZE:-200m}"
export SERVER_NAME CLIENT_MAX_BODY_SIZE

CERT_DIR="/etc/letsencrypt/live/${SERVER_NAME}"
if [ "${SERVER_NAME}" != "_" ] && [ -r "${CERT_DIR}/fullchain.pem" ] && [ -r "${CERT_DIR}/privkey.pem" ]; then
    MODE="https"
else
    MODE="http"
fi

mkdir -p /var/www/certbot
cp /etc/nginx/lms/http-context.conf /etc/nginx/conf.d/00-lms-http-context.conf

# Only substitute OUR two variables so nginx's own $variables are left untouched.
envsubst '${SERVER_NAME} ${CLIENT_MAX_BODY_SIZE}' \
    < "/etc/nginx/lms/server-${MODE}.conf.template" \
    > /etc/nginx/conf.d/default.conf

echo "[lms-nginx] mode=${MODE} server_name=${SERVER_NAME} client_max_body_size=${CLIENT_MAX_BODY_SIZE}"
if [ "${MODE}" = "http" ] && [ "${SERVER_NAME}" != "_" ]; then
    echo "[lms-nginx] no certificate found in ${CERT_DIR} -> serving plain HTTP (see DEPLOYMENT.md, step 'Enable HTTPS')"
fi

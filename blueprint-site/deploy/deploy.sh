#!/usr/bin/env bash
# Builds the preview and publishes it to https://preview.chakravue.ai on the E2E trials server.
# Run from Git Bash on the office PC:  ./deploy/deploy.sh
#
# Needs, once (see deploy/README.md):
#   - Cloudflare DNS: preview.chakravue.ai -> A 151.185.43.178, DNS only (grey cloud)
#   - the team password file on the server: /etc/nginx/chakravue-preview.htpasswd
#
# Safe to re-run: it only touches the preview's own folder, nginx site and certificate,
# and checks the nginx configuration before every reload (the trials sites share this nginx).
set -euo pipefail

HOST="${PREVIEW_HOST:-chakravue-trials}"   # ~/.ssh/config entry for the E2E server
DOMAIN="preview.chakravue.ai"
WEBROOT="/var/www/chakravue-preview"
HTPASSWD="/etc/nginx/chakravue-preview.htpasswd"
EMAIL="${ACME_EMAIL:?set ACME_EMAIL to the address for certificate notices}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"

say() { printf '\n== %s\n' "$*"; }

say "build"
( cd "$HERE" && node build.mjs )

say "check DNS points at the server"
IP="$(ssh -G "$HOST" | awk '/^hostname / {print $2}')"
DNS="$(nslookup "$DOMAIN" 8.8.8.8 2>/dev/null | awk '/^Address/ {a=$2} END {print a}')"
if [ "$DNS" != "$IP" ]; then
  echo "$DOMAIN resolves to '${DNS:-nothing}', the server is $IP."
  echo "Add the Cloudflare record (A, DNS only) and run this again."; exit 1
fi

say "check the team password file exists"
ssh "$HOST" "test -s $HTPASSWD" || {
  echo "Missing $HTPASSWD on the server. Create it first (deploy/README.md, step 2)."; exit 1; }

say "upload the site"
tar -C "$HERE/dist" -czf - . | ssh "$HOST" "set -e
  rm -rf $WEBROOT.new && mkdir -p $WEBROOT.new && tar -xzf - -C $WEBROOT.new
  chmod -R a+rX $WEBROOT.new
  rm -rf $WEBROOT.old; [ -d $WEBROOT ] && mv $WEBROOT $WEBROOT.old; mv $WEBROOT.new $WEBROOT"

say "certificate and nginx"
scp -q "$HERE/deploy/nginx-preview.conf" "$HERE/deploy/nginx-preview-acme.conf" "$HOST:/tmp/"
ssh "$HOST" "set -e
  chmod 640 $HTPASSWD; chgrp www-data $HTPASSWD
  mkdir -p /var/www/letsencrypt
  if [ ! -s /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
    cp /tmp/nginx-preview-acme.conf /etc/nginx/sites-available/chakravue-preview
    ln -sf /etc/nginx/sites-available/chakravue-preview /etc/nginx/sites-enabled/chakravue-preview
    nginx -t && systemctl reload nginx
    certbot certonly --webroot -w /var/www/letsencrypt -d $DOMAIN --non-interactive --agree-tos -m $EMAIL
  fi
  cp /tmp/nginx-preview.conf /etc/nginx/sites-available/chakravue-preview
  ln -sf /etc/nginx/sites-available/chakravue-preview /etc/nginx/sites-enabled/chakravue-preview
  nginx -t && systemctl reload nginx"

say "done: https://$DOMAIN (asks for the team password)"
code="$(curl -s -o /dev/null -w '%{http_code}' "https://$DOMAIN/")"
echo "without a password the site answers HTTP $code (401 = protected, as intended)"

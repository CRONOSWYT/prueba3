#!/usr/bin/env bash
# Startup script that makes Apache listen on the PORT set by Render.com
set -e

PORT="${PORT:-80}"

# Replace Apache's listening port to match Render's PORT
sed -i "s/^Listen 80$/Listen ${PORT}/" /etc/apache2/ports.conf
sed -i "s|<VirtualHost \*:80>|<VirtualHost *:${PORT}>|" /etc/apache2/sites-enabled/000-default.conf

exec apache2-foreground

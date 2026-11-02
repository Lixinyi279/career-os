#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 20 or newer is required: https://nodejs.org/en/download" >&2
  exit 1
fi
PORT="${PORT:-4173}"
URL="http://127.0.0.1:${PORT}"
echo "Starting Career OS at ${URL}"
( sleep 1; if command -v xdg-open >/dev/null 2>&1; then xdg-open "${URL}" >/dev/null 2>&1 || true; elif command -v open >/dev/null 2>&1; then open "${URL}" >/dev/null 2>&1 || true; fi ) &
exec node server.js

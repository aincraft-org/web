#!/usr/bin/env bash
set -euo pipefail
base=${BASE_URL:-http://127.0.0.1:8787}
for route in / /news /store /forum; do
  body=$(curl -fsS "$base$route")
  test -n "$body"
  printf '%s %s bytes\n' "$route" "${#body}"
done
curl -fsS "$base/healthz" | grep -F '"status":"ok"' >/dev/null
curl -fsS "$base/api/v1/items" | grep -F '"items"' >/dev/null
curl -fsS "$base/news/2026-08-10-season-zero-launches" | grep -F '<h2>Expedition notes</h2>' >/dev/null
curl -sS -o /dev/null -w '%{http_code}\n' "$base/news/missing" | grep -Fx 404 >/dev/null

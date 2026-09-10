#!/bin/sh
# Runtime entrypoint: the external (Coolify-managed) postgres IS reachable here
# (container joins the `coolify` network). Applies migrations, then starts the
# dynamic Next.js server (pages + /api/*, no rebuilds on content change).
set -e

echo ">> waiting for database + running prisma migrate deploy"
tries=0
until ./node_modules/.bin/prisma migrate deploy; do
  tries=$((tries + 1))
  if [ "$tries" -ge 30 ]; then
    echo "!! migrate deploy failed 30 times, giving up"
    exit 1
  fi
  echo ".. migrate failed (attempt $tries/30), retrying in 5s"
  sleep 5
done

echo ">> starting next.js server"
exec ./node_modules/.bin/next start -p "${PORT:-3001}"

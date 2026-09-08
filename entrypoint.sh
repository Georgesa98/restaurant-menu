#!/bin/sh
# Runtime entrypoint: the external (Coolify-managed) postgres IS reachable here
# (container joins the `coolify` network), so migrate + static export happen at
# container start — never at `docker build` time (BuildKit cannot join the
# `coolify` network and nothing else runs during build).
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

echo ">> next build (static export with live DB data)"
./node_modules/.bin/next build

echo ">> starting api server"
exec ./node_modules/.bin/tsx api-server/index.ts

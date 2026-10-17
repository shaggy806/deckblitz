#!/usr/bin/env bash
# Pulls the latest main, rebuilds everything with the room server stopped, and starts it again.
# Run this on the production box (the Lightsail instance, see DEPLOYMENT.md) after pushing changes.
set -euo pipefail

cd "$(dirname "$0")"

VITE_SERVER_URL="${VITE_SERVER_URL:-wss://ws.deckblitz.net}"

git pull --ff-only
# `npm ci`, not `npm install`: exactly what the lockfile says, and the
# lockfile left alone. Node 22's npm 10 rewrote it on every install (dropping
# the `libc` fields npm 11 records), and a dirty lockfile would make the
# next `git pull --ff-only` refuse once it changed upstream.
npm ci
# Cap the build's V8 heap: left to itself the engine's `tsc` grows to ~3.5 GB of
# address space on this 2 GB box, filling RAM and swap until the kernel kills it
# (2026-10-15, at 13,614 cards), though it needs ~1.45 GB live. Capped, it
# collects sooner and fits.
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1600}"
# Stop the room server for the build: even capped, the engine's `tsc` needs
# ~1.6 GB resident, and with the server and its room shard (~400 MB) beside it
# the kernel killed it (2026-10-17, at 13,789 cards). A restart ends every game
# anyway; this makes the game socket's downtime the build's length, not a few
# seconds. Whatever happens to the build, the server comes back up: on the new
# build, or on whatever is on disk if the build failed partway (see
# DEPLOYMENT.md, "Updating the deployed code", for rolling back).
sudo systemctl stop mtg-server
trap 'sudo systemctl start mtg-server' EXIT
VITE_SERVER_URL="$VITE_SERVER_URL" npm run build
sudo systemctl daemon-reload
sudo systemctl restart mtg-server

echo "Deployed. Server status:"
sudo systemctl status mtg-server --no-pager

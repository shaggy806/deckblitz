#!/usr/bin/env bash
# Pulls the latest main, installs the build CI made of it, and restarts the room server.
# Run this on the production box (the Lightsail instance, see DEPLOYMENT.md) after pushing
# changes and once CI has passed on them.
#
# Nothing is compiled here. The engine's type-check needs ~1.5 GB and grows with the card
# pool, more than this 2 GB box can spare (it was killed for memory twice, 2026-10-15 and
# 2026-10-17), so CI builds main and publishes the result: `deploy-<sha>.tar.gz` on the
# repo's rolling `deploy` pre-release, with its checksum (.github/workflows/ci.yml). This
# fetches the one for the commit it pulled, checks it, and swaps the four dist folders in.
#
#   ./deploy.sh             the latest main
#   ./deploy.sh --rollback  back to the dist folders the last deploy replaced
set -euo pipefail

# All of it inside a function, run on the last line: bash then reads the whole script before any of
# it runs, so the `git pull` below can rewrite this file without the rest of the run going astray.
main() {
cd "$(dirname "$0")"

REPO="${DEPLOY_REPO:-shaggy806/deckblitz}"
DISTS=(engine/dist protocol/dist server/dist client/dist)
PREV=.deploy-prev

restart() {
  sudo systemctl daemon-reload
  sudo systemctl restart mtg-server
  echo "Deployed. Server status:"
  sudo systemctl status mtg-server --no-pager
}

if [ "${1:-}" = "--rollback" ]; then
  for d in "${DISTS[@]}"; do
    test -d "$PREV/$d" || { echo "Nothing to roll back to: no $PREV/$d." >&2; exit 1; }
  done
  for d in "${DISTS[@]}"; do
    rm -rf "$d.rollback" && mv "$d" "$d.rollback" && mv "$PREV/$d" "$d" && mv "$d.rollback" "$PREV/$d"
  done
  # Which commit each side is, swapped with them.
  local was now
  was="$(cat "$PREV/commit" 2>/dev/null || echo unknown)"
  now="$(cat .deploy-commit 2>/dev/null || echo unknown)"
  echo "$was" > .deploy-commit
  echo "$now" > "$PREV/commit"
  echo "Rolled back to $was (the build of $now is kept in $PREV; --rollback again returns to it)."
  restart
  return 0
fi

git pull --ff-only
sha="$(git rev-parse HEAD)"
name="deploy-$sha.tar.gz"
url="https://github.com/$REPO/releases/download/deploy/$name"

# Under this checkout, not /tmp: the swap below is a rename, which only holds on one filesystem.
work="$(mktemp -d "$PWD/.deploy-XXXXXX")"
trap 'rm -rf "$work"' EXIT

echo "Fetching CI's build of ${sha:0:8}..."
if ! curl -fsSL -o "$work/$name" "$url" || ! curl -fsSL -o "$work/$name.sha256" "$url.sha256"; then
  echo "No build of ${sha:0:8} on the deploy release: CI hasn't finished with it, or failed" >&2
  echo "(https://github.com/$REPO/actions). Nothing was changed." >&2
  exit 1
fi
(cd "$work" && sha256sum -c "$name.sha256")
mkdir "$work/new"
tar -xzf "$work/$name" -C "$work/new"
for d in "${DISTS[@]}"; do
  test -d "$work/new/$d" || { echo "The bundle has no $d. Nothing was changed." >&2; exit 1; }
done

# `npm ci`, not `npm install`: exactly what the lockfile says, and the
# lockfile left alone. Node 22's npm 10 rewrote it on every install (dropping
# the `libc` fields npm 11 records), and a dirty lockfile would make the
# next `git pull --ff-only` refuse once it changed upstream. The server runs
# on these packages; nothing builds with them here.
npm ci

# Each dist swapped in by rename, the one it replaces kept for --rollback. The
# server keeps running the old code until the restart: seconds of downtime.
rm -rf "$PREV"
mkdir -p "$PREV"/{engine,protocol,server,client}
for d in "${DISTS[@]}"; do
  if [ -d "$d" ]; then mv "$d" "$PREV/$d"; fi
  mv "$work/new/$d" "$d"
done
# Which commit is installed (.deploy-commit), and which the kept one was.
if [ -f .deploy-commit ]; then mv .deploy-commit "$PREV/commit"; fi
echo "$sha" > .deploy-commit

restart
}

main "$@"

---
name: dev-up
description: Start the room server and the web client locally so the user can play and test — builds, starts dev-rooms (the room server with the preloaded test rooms and bot-decision capture on) or the plain server if asked, starts Vite, and opens the game. Use when the user asks to start, run or launch the game, the server, the client or the dev servers, wants to play or test something in the browser, or asks for dev-rooms or a test board.
---

# Start the game locally

Leaves a room server on `ws://localhost:4000` and the client on
`http://localhost:5173`, both as background tasks of this session, and opens
the game in the browser. `dev-down` stops them.

## 1. Which server

- **dev-rooms** (default): `node scripts/dev-rooms.mjs` — the same server the
  site runs, plus one preloaded room per scenario in
  `server/scripts/dev-scenarios.mjs`, which the landing page's dev menu lists,
  and a command port on `127.0.0.1:4099` (`server/CLAUDE.md`; room codes and ops
  in `docs/architecture/server.md`). Capture is always on, so the game's
  **Capture** button can save a bot's blunder as a training scenario
  (`server/src/capture.ts`), and so is the scenario builder (the landing page's
  dev-only "Scenario builder").
- **The plain server**, only when the user asks for it: `node dist/index.js
  --capture --builder` — the same, with no test rooms and no command port.

Both use port 4000, so only one runs at a time.

## 2. Free the ports

```bash
powershell -NoProfile -Command "Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { @(4000,4010,4099,5173) -contains \$_.LocalPort } | Select-Object LocalPort, OwningProcess"
```

Anything listed is a previous run or a leftover: run the `dev-down` skill's
stop script first (see that skill), then carry on. Only ask the user if
something that isn't this project's is holding a port.

## 3. Build

The server and Vite both read `engine/dist` and `protocol/dist`, and the
server runs from `server/dist`. Always build, in dependency order: the builds
are incremental (about 11 s together when nothing changed, a few minutes
cold). Don't check first whether a workspace is stale: a `find` over the
engine's card files took minutes (2026-11-08). One call, with `timeout:
400000`:

```bash
cd "$(git rev-parse --show-toplevel)" || exit 1
for w in engine protocol server; do
  npm run build -w "$w" > "$TEMP/mtg-build-$w.log" 2>&1 || { echo "BUILD FAILED: $w"; tail -20 "$TEMP/mtg-build-$w.log"; exit 1; }
done
echo built
```

A failed build stops here: report the error, don't start anything.

## 4. Start both, in the background

Each as its own Bash call with `run_in_background: true` **and `timeout:
7200000`** (two hours, the most a background task may run; without it the
default 30 minutes stops the server mid-game). Logs go to `$TEMP` so they can
be read later. When the limit does stop one, its shell goes but the `node`
underneath can stay, holding the port — `dev-down`'s port sweep clears it.

```bash
cd "$(git rev-parse --show-toplevel)/server" && node scripts/dev-rooms.mjs > "$TEMP/mtg-server.log" 2>&1
```
(or, for the plain server: `... && node dist/index.js --capture --builder > "$TEMP/mtg-server.log" 2>&1`)

```bash
cd "$(git rev-parse --show-toplevel)/client" && npx vite --port 5173 --strictPort > "$TEMP/mtg-vite.log" 2>&1
```

## 5. Wait until both answer, then open the game

```bash
for i in $(seq 1 60); do
  s=$(powershell -NoProfile -Command "(Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { @(4000,5173) -contains \$_.LocalPort } | Select-Object -ExpandProperty LocalPort -Unique | Measure-Object).Count")
  [ "$s" = "2" ] && break; sleep 1
done
echo "listening: $s of 2"; tail -n 5 "$TEMP/mtg-server.log"; tail -n 3 "$TEMP/mtg-vite.log"
```

If either never comes up, show its log and stop there. Otherwise open the page
(for dev-rooms, the room the user named — `http://localhost:5173/?room=CODE`):

```bash
cmd //c start "" "http://localhost:5173/"
```

## 6. Report

Two or three lines: which server and the URL; for dev-rooms, the room codes
from the top of `$TEMP/mtg-server.log` (or the one opened); that Capture is on;
that both stop on their own after two hours (the background limit); and that
`dev-down` stops everything.

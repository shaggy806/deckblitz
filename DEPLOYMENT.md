# Deployment

MTG Deck Blitz runs in production on an AWS Lightsail instance, reachable at **deckblitz.net**,
with no ports open to the web — a Cloudflare Tunnel carries all traffic in over an outbound-only
connection instead. This file is the from-scratch runbook: what was set up, why, and what to do
if the instance needs rebuilding. `docs/plans/lightsail-migration.md` records the move here from
the home box that served `mtg.tobyens.com` until 2026-10. That hostname now redirects here: a
Cloudflare redirect rule in the tobyens.com zone (`mtg.tobyens.com/*` → `https://deckblitz.net/$1`,
301, query kept) over a proxied `AAAA 100::` placeholder record, and another sends
`www.deckblitz.net` to the bare domain.

## Topology

```
Browser --HTTPS--> Cloudflare edge --tunnel--> cloudflared (on the Lightsail instance)
                                                    |
                                    +---------------+---------------+
                                    |                               |
                              deckblitz.net                  ws.deckblitz.net
                              -> Caddy :8080                 -> Node :4000
                              (static client/dist)           (server, WS + /import-deck)
```

Two hostnames, not one, because the `ws` library's WebSocket server doesn't route on URL path —
it treats every path the same. Splitting by *hostname* instead lets `ws.deckblitz.net` forward
straight to the Node process with zero proxy logic, while the bare domain serves the built static
client. This matches the client's own dev-time convention: `VITE_SERVER_URL` is "one origin,
everything for the game goes there" (`client/src/net/useNetworkGame.ts`, `client/src/App.tsx`),
and the client builds the `/import-deck` URL from it too
(`client/src/deck-builder/importDeck.ts`), so the one build-time env var
`wss://ws.deckblitz.net` is the whole client-side configuration.

Cloudflare terminates TLS at its edge; the hop from Cloudflare to the instance travels through
the tunnel (already encrypted), so nothing on the instance needs its own certificate — Caddy
runs plain HTTP internally on `:8080`.

## Why the tunnel, with a static IP

The tunnel was first chosen because the home box's IP was dynamic. The instance has a static IP,
but the tunnel stays, because **the rate limiter depends on it**: `clientIp()` in
`server/src/transport.ts` trusts Cloudflare's `CF-Connecting-IP` header without checking where
the request came from. Behind the tunnel only Cloudflare can reach :4000, so that's safe. With
:4000 or :443 open to the internet, anyone could fake the header and get around the per-IP
limit. Dropping the tunnel would need a code change (trust the header only from a known proxy)
plus a reverse-proxy and certificate setup.

## The instance

- AWS Lightsail, **2 GB memory / 2 vCPUs** (about $12/month), Ubuntu 24.04 LTS, x86_64,
  dual-stack networking (an IPv6-only plan can't reach GitHub, which has no IPv6).
- **Static IP `52.25.80.98`**, attached to the instance (free while attached). The `deckblitz`
  host in the dev PC's `~/.ssh/config` points at it.
- **Firewall** (Lightsail's, on the instance's Networking tab, IPv4 and IPv6 alike): SSH (22)
  only. Nothing for HTTP or HTTPS — the tunnel needs no inbound ports.
- **2 GB of swap** at `/swapfile` (in `/etc/fstab`). The full build (card codegen, a large
  `tsc`, the Vite bundle) peaks above 1 GB, which is why the plan isn't the 1 GB one.
  `deploy.sh` caps the build's V8 heap at 1.6 GB (`NODE_OPTIONS=--max-old-space-size=1600`):
  uncapped, the engine's `tsc` grew past RAM and swap together and was OOM-killed
  (2026-10-15, 13,614 cards), though it needs ~1.45 GB live. If it ever fails on the heap
  limit instead ("JavaScript heap out of memory"), the pool has outgrown the box.
- **CPU is burstable.** Lightsail instances run at full speed until a credit balance runs out,
  then get throttled. Each bot decision has a fixed thinking budget (`BOT_DECISION_BUDGET_MS`,
  300 ms, `server/src/room.ts`), so on a throttled CPU the bots play worse, not just slower.
  Watch the instance's "CPU burst capacity" graph; move up a plan if it keeps hitting zero.
- Login user: Lightsail's default `ubuntu`, which has passwordless sudo. The Node server runs as
  this user (not a dedicated service account) — a simplification acceptable for a single-purpose
  hobby box. Password login is off; SSH takes keys only.
- Node.js 22 (matching CI) via the NodeSource setup script (`setup_22.x`), not Ubuntu's own
  repo (which lags far behind).
- Repo cloned to `/opt/mtg-engine` from the public GitHub repo
  (`https://github.com/shaggy806/deckblitz.git`), owned by `ubuntu`.
- **AWS chores**: automatic daily snapshots (the instance's Snapshots tab), a manual snapshot
  before a risky deploy, and a monthly cost budget with an email alert (AWS Billing → Budgets).

## The game server (systemd)

`/etc/systemd/system/mtg-server.service`:

```ini
[Unit]
Description=MTG Engine room server
After=network.target

[Service]
WorkingDirectory=/opt/mtg-engine/server
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=2
Environment=PORT=4000
Environment=CLIENT_ORIGIN=https://deckblitz.net
# Rooms on worker threads (below): one shard on the 2-vCPU box, main on the other core.
Environment=SHARDS=1
# "The server is full" past 8 weighted rooms on the shard (below; the box's knee, 2026-10-13).
Environment=MAX_ROOMS_PER_SHARD=8
User=ubuntu

[Install]
WantedBy=multi-user.target
```

`CLIENT_ORIGIN` locks down `/import-deck`'s CORS header to the real client origin instead of the
`server/src/index.ts` default of `*`. `enabled` so it starts on boot; `Restart=on-failure` so a
crash comes back on its own. Server-side hardening for being open to the internet (rate-limiting
connections per IP, reaping idle rooms) is in the code itself, not config — see
`server/src/transport.ts` and `server/src/room-manager.ts`.

### Rooms on worker threads (`SHARDS`)

`SHARDS=N` (or `--shards N`) runs the rooms on N worker threads ("shards",
`docs/plans/room-shards.md`): the main thread keeps the sockets, routing and HTTP and loads no
engine, so a busy game no longer holds up every other room's frames. The code's default is 0
(every room on the main thread, as before), so a box without the line behaves as it always did
— the unit sets it explicitly. **Removing the line is the rollback.** After editing the unit:
`sudo systemctl daemon-reload && sudo systemctl restart mtg-server`, then check `/status` shows
the shard `up`.

- **How many**: one per core, less one for main — `max(1, cores − 1)`. On the 2-vCPU box that's
  `SHARDS=1`; a 4-vCPU box would take 3. More shards than cores just time-slice the bots'
  300 ms decision budget.
- **Memory**: each shard holds its own copy of the engine — about 160 MB rss idle (measured on the
  dev PC: `--shards 0` 194 MB, `--shards 1` 213 MB, `--shards 2` 370 MB; main alone ~56 MB) —
  plus its rooms, ~15 MB a busy four-player game. Each shard's heap is capped at
  `SHARD_HEAP_MB` (`--shard-heap-mb`, default 512): uncapped, V8 let a shard grow to ~600 MB with
  four rooms before collecting, and the cap makes it collect sooner at no measured cost (two
  shards with eight rooms: 1.5 GB rss uncapped, 0.9 GB at 512). So budget ~160 MB + the cap per
  shard at worst, plus main. One shard fits the 2 GB box with room to spare; size a bigger box at
  ~300-700 MB a core.
- **Startup**: a shard takes ~4-5 s to load the engine (longer on the box), before the port
  opens. The journal logs `N room shard(s) ready in X s`.
- **A shard that crashes** (out of memory past its cap, or a bug outside a room's own catch)
  loses only its own rooms: their players are disconnected and find the room gone on reconnect.
  It's restarted after 1, 2, 4 … 30 s; one that crashes more than five times in five minutes
  is left down and shows as `crash-looped` on `/status` — restart the service to bring it back.
- **`UV_THREADPOOL_SIZE`**: compressing frames (permessage-deflate) runs on libuv's threadpool,
  four threads by default, shared by the whole process. Leave it on the 2-vCPU box; on a box
  with more cores set it to the core count (`Environment=UV_THREADPOOL_SIZE=8`).
- **Caps on opening rooms** (both modes): `MAX_ROOMS_PER_IP` (`--max-rooms-per-ip`, default 6)
  refuses one address its seventh open room; `MAX_ROOMS_PER_SHARD` (`--max-rooms-per-shard`,
  unset = unlimited) refuses a create once every shard holds that many weighted rooms (a game or
  lobby 1, a tutorial 0.5, a finished game 0.1). Set the latter from the load test's knee on the
  box (`npm run load-test -w server`, with `--status http://127.0.0.1:4010/status.json`, run
  on the box with nobody playing): the stage where the frame-gap median passes +20% over one
  room. **Set to 8 on the 2-vCPU box** (2026-10-13): its one shard passed that between 6 and 8
  all-bot rooms (`docs/plans/room-shards.md`, "Live on the 2-vCPU box"), and a real blitz room,
  three bots and a person thinking, is lighter. The load test needs the per-address cap lifted
  for its run (every room comes from one address): a drop-in
  `/etc/systemd/system/mtg-server.service.d/loadtest.conf` with `Environment=MAX_ROOMS_PER_IP=Infinity`,
  removed (and the service restarted) afterwards.
- `/status` gains a shard table: each shard's state and restarts, its rooms, how busy it is, its
  event-loop delay, heap and bots' decision p99.

## The static client (Caddy)

Caddy installed from its own apt repo (Cloudsmith's `caddy/stable`). `/etc/caddy/Caddyfile`:

```
:8080 {
    root * /opt/mtg-engine/client/dist

    @assets path /assets/*
    header @assets Cache-Control "public, max-age=31536000, immutable"
    @other not path /assets/*
    header @other Cache-Control "no-cache"

    try_files {path} /index.html
    file_server
}
```

The `Cache-Control` headers are what make a deploy show up on the next load. Without one, a
browser guesses how long `index.html` stays fresh (about a tenth of the time since it last
changed), so after a quiet day it can keep serving the old page — and through it the old hashed
scripts — for hours after a deploy. `no-cache` makes it ask every load (a cheap 304 when nothing
changed); everything under `/assets/` is content-hashed, a new name on every build, so it can be
cached forever. The matchers are on the *request* path, not `/index.html`, because Caddy applies
`header` before `try_files` rewrites a route to `index.html`. After editing the Caddyfile,
`sudo systemctl reload caddy`; check with `curl -sI https://deckblitz.net/ | grep -i cache-control`.

No TLS block — Cloudflare already terminated HTTPS before this ever sees the request. The client
build that populates `client/dist/` must be built with `VITE_SERVER_URL=wss://ws.deckblitz.net`
(`deploy.sh`'s default) — a build without that env var falls back to a LAN-only
`ws://<hostname>:4000` default meant for local dev.

## Cloudflare Tunnel

- Domain `deckblitz.net` (registered through Squarespace) with its nameservers pointed at
  Cloudflare. The Squarespace parking-page A records Cloudflare imported for the bare domain
  were deleted; the email TXT records (SPF `-all`, DMARC `reject`, an empty DKIM key — "this
  domain sends no mail") stay.
- `cloudflared` installed from the `.deb` on GitHub releases —
  `https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb`.
- Authenticated once via `cloudflared tunnel login` (prints a URL, approved in a browser already
  logged into the Cloudflare account, authorizing `deckblitz.net`). Writes
  `~/.cloudflared/cert.pem`. That cert is for the deckblitz.net zone, so
  `cloudflared tunnel route dns` can only create records there; a record in another zone is
  pointed at the tunnel by hand in that zone's DNS tab (a proxied CNAME to
  `<tunnel id>.cfargotunnel.com`).
- One tunnel, named `mtg-aws`, id `6a1d6a90-4c5a-42c4-8eae-05ed19da172a`, created with
  `cloudflared tunnel create mtg-aws`. Its credentials file lives at
  `/home/ubuntu/.cloudflared/6a1d6a90-4c5a-42c4-8eae-05ed19da172a.json` — **not** checked into
  git, and required for the tunnel to run (see recovery notes below).
- Config at `/etc/cloudflared/config.yml`:

  ```yaml
  tunnel: 6a1d6a90-4c5a-42c4-8eae-05ed19da172a
  credentials-file: /home/ubuntu/.cloudflared/6a1d6a90-4c5a-42c4-8eae-05ed19da172a.json

  ingress:
    - hostname: deckblitz.net
      service: http://localhost:8080
    - hostname: ws.deckblitz.net
      service: http://localhost:4000
    - service: http_status:404
  ```

- DNS records created via `cloudflared tunnel route dns mtg-aws deckblitz.net` and
  `cloudflared tunnel route dns mtg-aws ws.deckblitz.net` (they show as type "Tunnel" in the
  DNS tab, managed by Cloudflare).
- Running as a systemd service via `sudo cloudflared service install` (reads the config above by
  default). `enabled`, so it starts on boot alongside `mtg-server` and Caddy. After editing the
  config, `sudo systemctl restart cloudflared`.

## Updating the deployed code

```
cd /opt/mtg-engine
./deploy.sh
```

From the dev PC, Claude Code's `deploy` skill (`.claude/skills/deploy/`) does this over SSH
(`ssh deckblitz`): it checks nobody is mid-game first, runs `deploy.sh`, then checks the site
from outside (`check-live.mjs`: the page, and the game socket opening through the tunnel with
compression). The `ubuntu` user's passwordless sudo is what lets `deploy.sh`'s `systemctl`
commands run unattended.

`deploy.sh` (repo root): `git pull --ff-only` → `npm ci` (the lockfile as committed, never rewritten — the box's npm 10 used to drop npm 11's `libc` fields on every `npm install`, leaving the checkout dirty) → rebuild engine/server/client with
`VITE_SERVER_URL=wss://ws.deckblitz.net` baked into the client → `sudo systemctl daemon-reload` →
`sudo systemctl restart mtg-server`. The `daemon-reload` is there so a hand-edited unit file is
never silently stale after a deploy — cheap and harmless even when the unit file didn't change.
Caddy and cloudflared don't need restarting for an ordinary code change — only `mtg-server`
actually changes. **A `sudo reboot` does *not* deploy new code** — it just restarts whatever's
already built on disk; always run `./deploy.sh` instead. To roll back, check out an older commit
and rebuild, or restore a snapshot.

The client build is several files, not one: the game's own script, the library and the deck
builder as lazy chunks, and the card pool in 32 shards (see `docs/architecture/client.md`, "`cards/cardData.ts`").
Each deploy replaces them under new hashed names. A tab left open across a deploy that then asks
for a file it hadn't loaded yet gets `index.html` from Caddy's `try_files` fallback instead, which
fails to load as a script. In a game that costs only extras (a history tooltip shows just the
card's name, and a double-faced card in a zone viewer can't be turned over), and a library or deck
builder caught mid-load offers a reload. Reloading the tab fixes either.

## Checking on it (SSH)

The server carries an operator endpoint on **127.0.0.1:4010** (`STATUS_PORT` to move it). It is
plain text, meant to be read with `curl` once you are on the box:

```
curl localhost:4010/status        # the table below
curl localhost:4010/status.json   # the same, for scripting
curl localhost:4010/healthz       # just a 200, for a monitor
```

```
MTG Deck Blitz server
  uptime   3h 12m    pid 8123    node v22.23.3
  memory   rss 210 MB, heap 88 MB
  rooms    3 live — 1 waiting, 2 playing, 0 finished   (47 created since start)
  seats    2 human online, 4 bot

  ROOM   STAGE     SEATS                     TURN   STEP              IDLE
  K4M2P  playing   Toby,bot,bot,bot          T14    precombat-main    8s
  QX7BD  playing   Toby,Sam*                 T6     declare-attackers 3m
  AYJBW  waiting   open,open                 —      —                 12m
```

A `*` after a name is a seat that is claimed but currently disconnected — the usual sign
somebody closed a tab mid-game. `created since start` distinguishes a genuinely quiet server
from one that restarted five minutes ago, which is the first thing worth knowing after an
incident.

### Why it is a second listener, and not a route on :4000

**A room code is a join credential** — anyone who knows one can walk into that game. Port 4000 is
published to the open internet by the tunnel (`ws.deckblitz.net`), so a status page there would
hand every room code to anyone who asked.

Checking the caller's address on :4000 would not help either: `cloudflared` connects to
`http://localhost:4000`, so **every public request already arrives from 127.0.0.1** and a loopback
check would pass for the whole internet. Binding a separate listener to loopback on a port the
tunnel's ingress list does not mention is what actually makes it private. Do not add it to that
ingress list.

Other things worth knowing while logged in:

```
sudo systemctl status mtg-server      # up? how long? last exit?
sudo journalctl -u mtg-server -n 100  # recent logs, including reaped-room lines
sudo journalctl -u mtg-server -f      # follow
```

If SSH itself doesn't answer, the Lightsail console shows the instance's state and can reboot
it, and its browser SSH works without this PC's key. A 530 from Cloudflare means the tunnel is
down (cloudflared stopped, or the instance is).

## Operational odds and ends

- **Uptime monitoring**: a free UptimeRobot HTTP(S) monitor (5-minute interval, email/push
  alerts) — set up outside the repo, at uptimerobot.com. It should point at
  `https://ws.deckblitz.net`.
- **Idle-room reaping**: rooms with no connected seats are deleted after 30 minutes
  (`IDLE_ROOM_MS` in `server/src/index.ts`), swept every 15 minutes — no manual cleanup needed.
- **Rate limiting**: per-IP (via Cloudflare's `CF-Connecting-IP` header, since the tunnel means
  the socket's own remote address is always local, not the real visitor), 40 messages per
  5-second window — see `server/src/transport.ts`.
- **Players' saved data** (decks, pass and motion settings) lives in their browsers, tied to the
  site's address; the server keeps nothing. Moving the site to a new domain starts every player
  empty.

## Local development is unaffected

None of the above changes the local dev workflow. `npm run dev -w server` still binds to plain
`ws://localhost:4000`; `npm run dev -w client` still defaults to `ws://<hostname>:4000` unless
`VITE_SERVER_URL` is set; `CLIENT_ORIGIN` defaults to `*` when unset; the rate limiter's
threshold is generous enough that normal testing (including `npm run play:random`, the fuzzer)
never trips it. The production-specific values are only ever applied via the systemd unit on
the instance and the `VITE_SERVER_URL` in `deploy.sh`'s build step.

## Rebuilding from scratch (disaster recovery)

First choice: restore the latest automatic snapshot to a new instance and move the static IP
to it. Nothing on the box is data that matters — the server keeps no state — so any snapshot
that boots will do.

Without a snapshot, everything in this file except one thing can be reconstructed by following
it top to bottom on a fresh instance: **the Cloudflare Tunnel credentials**
(`~/.cloudflared/cert.pem` and the tunnel's `.json` credentials file) live only on the box, are
not in git, and can't be recovered — re-run `cloudflared tunnel login` and
`cloudflared tunnel create` to mint a new tunnel, then `cloudflared tunnel route dns -f` again for
both hostnames (`-f` replaces the old records) and delete the old tunnel
(`cloudflared tunnel delete mtg-aws`) once the new one is confirmed working.

Everything else — the systemd unit, the Caddyfile, the cloudflared `config.yml`, the code
itself — is either in this document or in the git history.

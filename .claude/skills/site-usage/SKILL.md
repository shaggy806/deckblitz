---
name: site-usage
description: Fetch the live site's usage numbers (deckblitz.net) and report them here — visitors by day and country, where they came from, games begun and finished, how many different players (browsers) played them, commanders imported, cards people import that the engine lacks, failed imports and page errors. Takes an optional number of days (`/site-usage 30`; 14 by default). Use when the user asks who is using the site, for the usage / traffic / metrics / analytics / stats, how many visitors or games there were, what decks or commanders people are testing, which missing cards are asked for most, or what errors visitors are hitting. Also says how much room the kept games (the played-game records) take on the box, how much disk is left, and whether it is time to fetch them to this PC: use it too when the user asks about storage, disk space, how many games are saved, or whether to transfer or pull the saved games.
---

# Site usage

Reads the usage report the live server keeps (`server/src/usage.ts`; `DEPLOYMENT.md`,
"Checking on it") and tells the user what it says, and with it how the kept games stand
(`server/src/game-store.ts`; `DEPLOYMENT.md`, "Played games"). Read-only: two `curl`s on the
box over SSH, against the server's loopback status port. Nothing on the box changes.

## Fetch it

The argument, if there is one, is the number of days (a whole number, 1 to 366); otherwise 14.
One Bash call, with `<N>` filled in:

```bash
ssh -o ConnectTimeout=15 deckblitz "curl -s -m 20 'localhost:4010/usage?days=<N>'"
```

For anything the text report doesn't break down the way the user asked (a per-day series of
one figure, a ratio), fetch `localhost:4010/usage.json?days=<N>` the same way instead and work
it out from that. The raw events are one JSON-lines file a UTC day in `/opt/mtg-engine/usage/`
(`<YYYY-MM-DD>.jsonl`) if a question needs them, e.g. the times of day people play; read them
with `ssh deckblitz "cat /opt/mtg-engine/usage/<day>.jsonl"`, capped (`| tail -200`), and never
copy them into the repo.

If it fails:

- **`not found` or a 404**: the installed build is older than the usage log (it shipped
  2026-11-21, `d2bb10758`). Say it needs a deploy; don't deploy unasked.
- **`usage isn't being kept`**: the unit sets `USAGE=0`. Say so.
- **No answer from `curl`**: the server is down or restarting. `ssh deckblitz "systemctl
  is-active mtg-server"` says which; report it, and leave fixing it to the user's word.
- **SSH itself fails**: say that the box couldn't be reached and show the error.

## The kept games' storage

Every run, beside the usage report (and alone, when storage is all that was asked):

```bash
ssh -o ConnectTimeout=15 deckblitz "curl -s -m 20 localhost:4010/games"
```

It prints how many games are kept and their size, the days they span, how full the folder is of
what it may hold (20 GB, or less where the disk would be left under 5 GB free), how fast it is
filling, the disk's free space, and a `transfer` line. `localhost:4010/games.json` has the same
as numbers.

Report it in two or three lines under the usage summary, and **say plainly whether to transfer
the games**, from the `transfer` line:

- **`not needed for room`**: no. Say so, with the figures (games, size, percent full, disk free).
  Fetching is still how a reported play gets looked at: `npm run games:pull`, then
  `npm run game:replay -- games/<day>/<file>`.
- **`soon`** (over half full): yes, at the next convenient moment.
- **`NOW`** (over four fifths): yes, now. At full the oldest games are deleted to make room.

Offer the pull, don't run it unasked: `npm run games:pull` copies the files into `games/` here
and **deletes them on the box**. A game still being played is sent again whole by its browser
afterwards, so nothing is lost by pulling mid-game.

If it fails: **`not found`** means the installed build is older than this report (2026-11-22):
say it needs a deploy. **`games aren't being kept`** means the unit sets `GAMES=0`.

## How many different players

The same `localhost:4010/games` report ends with a **Players** section: how many different
browsers posted a game today, in 7, 14, 30 and 90 days (`unique`), then a line a day with that
day's players and the games they began. `games.json` has it as `players.within` (keyed by the
number of days) and `players.byDay`.

**Report it every run**, in the summary's first lines beside visitors and games: unique players
over the span asked for (the default 14 days is one of the windows), and how many games that
was. For a span that isn't 1, 7, 14, 30 or 90 days, work it out from the day files, which are
tiny and hold only tags (`{ "<tag>": <games> }` a UTC day):

```bash
ssh -o ConnectTimeout=15 deckblitz "cd /opt/mtg-engine/games/players 2>/dev/null && tail -n +1 *.json"
```

and count the different tags in the days wanted.

What the number is, said once where it matters:

- **A player here is a browser**, counted by the tag its games carry (`client/src/playerTag.ts`,
  `server/src/game-store.ts`): a short code the page works out one way from a random number it
  keeps to itself. The same person on a phone and a PC, or after clearing site data, is two. A
  tag says two games came from one browser and nothing of whose: never try to match one to a
  visit, a country or a person, and don't print the tags themselves unless asked.
- **Only a browser's own games are in it** (a game against bots, which is nearly all of them):
  a game several people played at a table, or one the server ran, carries no tag. Nor does a
  game from a browser that keeps no storage, or an automated one.
- **It starts the day tags were deployed** (2026-11-22); earlier games have none. A report with no
  Players section is a build from before it: say it needs a deploy.
- **It differs from "visitors"**, which is visitor-days from the usage log and counts people who
  never started a game. Players a day over visitors a day is the share who played.
- The tally stays on the box when the games are fetched away (`games:pull`), so it covers games
  no longer there. For the games already fetched, `npm run games:players` counts the same thing
  from `games/` here.

## Report it

Lead with the answer to what was asked. With no particular question, a short summary first:
visitors, unique players (above) and games over the span and how that compares with the days
before it in the same report, then anything that stands out. Then the report's sections as short tables or lists,
leaving out the empty ones:

- **By day**: visitors, new, views, games begun and finished, imports, errors. Drop leading
  days that are all zero (the log starts the day it was deployed).
- **Where from**: referring sites, and countries.
- **Games**: by kind and table size, how they ended, the median length.
- **Decks**: commanders imported, and the cards imported that the engine lacks.
- **Trouble**: failed imports and page errors, most frequent first.

Say these when they bear on what the user is reading, once, not as a list of caveats:

- **Days are UTC.** A day's line runs from late afternoon to late afternoon, Pacific.
- **A visitor is counted once a day**, so the total is visitor-days: one person on three days
  is three. Nobody is followed from day to day; "new" is the browser's own first-visit flag.
- **Games begun minus finished is games left unfinished**, not lost data. A table of several
  people is reported by each of them and counted once.
- **Commanders come from imports only**: a game from a saved deck or a precon names none.
- **The numbers can be padded**: the page reports them, and anyone can post to that endpoint.
  A sudden spike from one country with no games is more likely that than a crowd.
- **Automated browsers report nothing**, so the E2E suites and most crawlers aren't in it.

## What to do with it

Offer, don't do, unless asked:

- **A card many lists are missing** is a card worth building: `test -f` it in the pool first
  (it may have landed since), then it can be flagged in `engine/data/build-asap.json` for the
  `author-flagged` skill.
- **A page error seen more than a handful of times** is a bug report: the `bug-report` skill
  takes it, with the message and the file and line the report gives.
- **A failed import's message** usually names the cause; a repeated one is worth a look at
  `server/src/import-deck.ts`.

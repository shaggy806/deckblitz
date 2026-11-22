---
name: site-usage
description: Fetch the live site's usage numbers (deckblitz.net) and report them here — visitors by day and country, where they came from, games begun and finished, commanders imported, cards people import that the engine lacks, failed imports and page errors. Takes an optional number of days (`/site-usage 30`; 14 by default). Use when the user asks who is using the site, for the usage / traffic / metrics / analytics / stats, how many visitors or games there were, what decks or commanders people are testing, which missing cards are asked for most, or what errors visitors are hitting.
---

# Site usage

Reads the usage report the live server keeps (`server/src/usage.ts`; `DEPLOYMENT.md`,
"Checking on it") and tells the user what it says. Read-only: one `curl` on the box over SSH,
against the server's loopback status port. Nothing on the box changes.

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

## Report it

Lead with the answer to what was asked. With no particular question, a short summary first:
visitors and games over the span and how that compares with the days before it in the same
report, then anything that stands out. Then the report's sections as short tables or lists,
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

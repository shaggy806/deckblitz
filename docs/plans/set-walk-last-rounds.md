# The set walk's last three rounds

**Status:** planned (2026-10-27): round eighteen started (B219–B223, five cloud sessions); nineteen and twenty not started. Each round
is one run of the `author-walks-parallel` skill from a fresh session. Its step 1, choosing the
walks and their ranges, is already decided below. The coordinator reads its round off this file,
records the batch numbers in `BACKLOG.md`'s `author-by-set` line (step 2) and starts the
sessions. Mark each round **landed** here when its last batch is on `main`, and delete this file
(and its line in `README.md`) after round twenty.

## Where the walk stands

After round seventeen (B214–B218, 2026-10-27), `npm run -s cards:sets -w engine -- --sets 400`
counted **1,652 cards left in 14 sets**. Every other set is walked whole. Five cloud sessions a
round took ~540 cards (~345 authored, ~190 blocked), so three rounds of ~550 finish it.

Round sixteen's three local sessions (B209 the rest of Time Spiral, B210 Ravnica: City of Guilds'
~100 most-played, B211 the rest of Urza's Destiny and Mercadian Masques' ~80 most-played) had not
landed on 2026-10-27. Their sets are held back to rounds nineteen and twenty, so round eighteen
can start without knowing what became of them.

## The walks' ranges, from round eighteen

Ranges never overlap. Each middle walk goes newest set first (`cards:sets -- --set <code>`). The
oldest-first walk goes forward (`author-by-set-oldest`).

| Walk | Range | Left |
|---|---|---|
| Fourth middle | Mirrodin's rest, then Legions back to Onslaught (MRD, LGN, ONS). It takes over Mirrodin's last 21 from the third middle walk, which ends with B215. | 315 |
| Fifth middle | Torment back to Odyssey (TOR, ODY) | 326 |
| Sixth middle | Planeshift back to Invasion (PLS, INV) | 309 |
| Seventh middle (new) | Prophecy back to Nemesis (PCY, NEM), taken off the oldest-first walk's end | 217 |
| Oldest-first | Urza's Destiny forward to Mercadian Masques (UDS, S99 Starter 1999, MMQ) | 243 |
| Middle | the rest of Time Spiral (TSP), which ends its range | 89 |
| Second middle | Ravnica: City of Guilds (RAV), which ends its range | 153 |

## The rounds

"Left" is the count on 2026-10-27. A batch takes its set's most-played cards first. Re-run
`cards:sets -- --sets 400` at each round's start: the counts can only fall.

**Round eighteen: five sessions, ~556 cards. Batch numbers B219–B223.**

| Batch | Walk | Batch's sets | Cards |
|---|---|---|---|
| B219 | Fourth middle | the rest of Mirrodin (21) and Legions whole (95) | 116 |
| B220 | Fifth middle | Torment whole | 115 |
| B221 | Sixth middle | Planeshift whole | 108 |
| B222 | Seventh middle | Prophecy whole | 113 |
| B223 | Seventh middle | Nemesis whole. The same walk takes two batches on disjoint sets, as the third middle walk did with Darksteel and Mirrodin in round seventeen. | 104 |

**Round nineteen: six sessions, ~585 cards.** The batch numbers are the highest `B<N>` on
`origin/main` plus one, in this order.

| Walk | Batch's sets | Cards |
|---|---|---|
| Fourth middle | Onslaught's ~105 most-played | 105 |
| Fifth middle | Odyssey's ~105 most-played | 105 |
| Sixth middle | Invasion's ~100 most-played | 100 |
| Oldest-first | the rest of Urza's Destiny (18), Starter 1999 (7) and Mercadian Masques' ~95 most-played | 120 |
| Middle | the rest of Time Spiral | 89 |
| Second middle | Ravnica: City of Guilds' ~76 most-played | 76 |

**Round twenty: five sessions, ~511 cards.** This round finishes the walk.

| Walk | Batch's sets | Cards |
|---|---|---|
| Fourth middle | the rest of Onslaught | ~94 |
| Fifth middle | the rest of Odyssey | ~106 |
| Sixth middle | the rest of Invasion | ~101 |
| Oldest-first | the rest of Mercadian Masques | ~123 |
| Second middle | the rest of Ravnica: City of Guilds | ~77 |

## Before round nineteen: the PC sessions' sets

Round nineteen is the first round to touch Time Spiral, Ravnica, Urza's Destiny or Mercadian
Masques. Before starting it, check `origin/main` for `engine/data/sweep-3/B209.json`, `B210.json`
and `B211.json`:

- **Landed:** those sets are smaller. Take what `cards:sets` says is left. Fold a walk whose set
  is now whole into nothing, or move a remainder under ~40 cards into the round-twenty batch of
  the same walk.
- **Not landed, and the user says they're abandoned:** run the plan as written.
- **Not landed and not known:** ask the user before starting those walks. The other walks in the
  round can start meanwhile.

## Why these splits

- **Batch size:** ~80–120 cards, one batch per session, as `author-walks-parallel` sets it. Two
  are at its top: round nineteen's oldest-first batch (120) and round twenty's rest of Mercadian
  Masques (~123). Mercadian Masques is 218 cards in a walk that can't run it in parallel.
- **Prophecy and Nemesis made their own walk.** Without that, the oldest-first walk would hold
  460 cards in five sets, too many for its two batches in rounds nineteen and twenty. As a middle
  walk they fill round eighteen, while the oldest-first walk waits on the PC sessions' Urza's
  Destiny and Mercadian Masques.
- **Mirrodin's last 21 went to the fourth middle walk,** the walk next to it, rather than a
  session of their own.
- **Round nineteen has six sessions.** The landing lock queues the sixth for a few minutes. That
  costs less than a fourth round for ~75 cards.

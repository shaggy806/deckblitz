# Fixed positions for timing the bots

Big boards from four-player games between the bench decks (`BENCH_DECKS`), each a bare game
snapshot with its event log emptied. Every speed step of `docs/plans/bot-audit-fixes.md` is
measured on these, before and after, with

    npm run bot:anatomy -w engine -- --from data/bot-positions/<file>

alone on a quiet machine. `bot:replay -- --from` reads them too. At count budgets the decisions,
simulations and ticks repeat exactly; the milliseconds are the measurement.

| File | Board | From | What it is |
| --- | --- | --- | --- |
| `seed-50-t40-b73.json` | 73 | `bot:replay --seed 50 --snapshot-at 40`, 2026-09-27 | The audit's `seed-50-t40`: a turn that makes ~300 tokens. The costliest simulation here. |
| `seed-10-t40-b94.json` | 94 | `bot:timings --snaps`, seed 10, 2026-11-10 | The widest bench board found; the game ends within a few decisions. |
| `seed-5-t34-b87.json` | 87 | `bot:timings --snaps`, seed 5, 2026-11-10 | A wide board in the game with the run's slowest decisions. |
| `seed-5-t28-b50.json` | 50 | `bot:timings --snaps`, seed 5, 2026-11-10 | An ordinary mid-game board, for comparison. |

As measured when they were checked in (2026-11-10, the development PC, six decisions each):

| File | ms a simulation | ticks | ms a tick | clone ms | evaluate ms |
| --- | --- | --- | --- | --- | --- |
| `seed-50-t40-b73` | 995 | 4,569 | 5.83 | 0.74 | 2.05 |
| `seed-10-t40-b94` (3 decisions) | 287 | 476 | 15.19 | 1.26 | 2.02 |
| `seed-5-t34-b87` | 228 | 1,257 | 6.75 | 1.28 | 1.36 |
| `seed-5-t28-b50` | 144 | 2,282 | 1.54 | 0.88 | 1.71 |

A snapshot is a whole `GameState`: when a change to the state's shape stops one loading, take it
again (`bot:replay --seed N --snapshot-at T`, or `bot:timings --snaps`) and note the new figures
here, rather than patching the file.

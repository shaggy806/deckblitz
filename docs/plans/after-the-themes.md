# After the need-key themes

Status: **proposed order of work** (2026-11-09), steps 1-2 done (theme 15, B292; its freed cards, B293; the re-attempt, B294); step 3 next. Step 5 waits on a decision from the
user. It takes over from `need-key-themes` when theme 15 lands, and changes what `build-family` is
pointed at after that.

## Why the order changes

The themes worked because many keys sat on one missing mechanism. That is nearly over. Measured
2026-11-09 (`cards:needs -- --by-rank --top 4000`, leaving out the 11 flagged cards):

| Blocked cards by EDHREC rank | Cards |
|---|---|
| Top 5,000 | 230 |
| 5,000–10,000 | 400 |
| 10,000–20,000 | 596 |
| Past 20,000 | 610 |

- 1,836 cards wait on 1,577 distinct need keys. 96% of the cards have a single need.
- 1,315 keys serve exactly one card, 212 serve two, and only 50 serve three or more.

So working down the keys by rank is now close to one engine feature per card, and most of those
cards are rarely played. Coverage of what people play is already high: 482 of the top 500
commanders and 4,765 of the top 5,000 cards.

Many of those records are also out of date. Most narrow keys were written against the engine as it
stood before the themes, and `--stale` only finds a card when its key is *marked* built, so a key
that a theme made unnecessary stays open. B291, the last of the stale queue, authored 109 of 145;
B274 found about a third of its flagged cards needed no engine code.

## The steps

1. **Theme 15, then `author-freed`.** The last theme (delayed triggers; `next-theme`), which ends
   the 10-member `DelayedTriggerTiming`. Then the cards it frees, with the 18 cards already fully
   freed on 2026-11-09.
2. **Re-attempt before building.** **Done 2026-11-09 (B294):** 245 cards (231 + 18, 4 on both), 120 authored, 125 blocked on 124 narrow keys, so about half the records were out of date. Both records below corrected.
   Take the 230 blocked cards in the top 5,000 and the 18 missing
   commanders, and try to write each against today's vocabulary before building anything for it
   (the `author-recheck` lists are the tool). Give whatever is still blocked a key that's true now.
   In the same pass, correct two records:
   - `BACKLOG.md`'s commander section says 429 of 500 and "ready to author: none", and has Lynde
     waiting on a feature though Lynde is in the pool.
   - `cmdrs:gaps` says 9 commanders need no engine work, but its JSON lags `sweep-3`: Omnath,
     Indominus Rex, Noctis and Coram each have a newer narrow blocker there.
3. **Check for regressions, then deploy.** The themes migrated core types many times over, and
   the checks catch hangs but don't measure speed or strength. Run one `bot:ab` against a commit
   from 2026-11-04, compare turn times on a big board, and play a few real games. This is the
   occasional bench `feedback_bench_sparingly` allows. The commit now live wasn't confirmed when
   this was written.
   **Run 2026-11-09:** `bot:ab` can't compare across these migrations: it plays every game on the working engine, so the old bot reads and simulates a state of the new shape. Instead each build played v2 against v1 in its own engine, 40 games, 18 workers: today 67.6% [51.5, 80.4], 2026-11-04 (`a6a3485d6`) 66.7% [50.3, 79.8]; median game 111 s against 110 s, mean decision 219 ms against 197 ms. Level at this size (it would miss a drop under about 15 points). The games that timed out at 300 s (3 today, 4 then) hit the old build too.
4. **Cut down the manual checks.** `docs/manual-checks.md` holds 1,817 tests, more than will ever
   be played by hand. Choose about 20 covering the player decisions added since 2026-11-04 (616.1's
   replacement orders first), and cover "this prompt appears" tests by script where one can. New
   tests only for new prompts or careful rules calls.
5. **Set a stopping rank (the user's decision).** Measure how many real decklists import with no
   substitution (`scripts/stand-ins.mjs` is the nearest existing tool), and use that to decide how
   far down the ranks `build-family` goes. Past about rank 10,000 it would be building one feature
   for each rarely played card.
6. **Pause the engine-gap rounds.** What is left in `docs/engine-gaps.md` mostly needs a design call
   or serves one card. Three calls wait on the user: whether "dies" reaches noncreature permanents,
   the shuffled face-down pile's object ids, and turn-order mulligans (103.5).
7. **Later, split `game.ts`** (61,159 lines on 2026-11-09) along the seams the themes' modules
   made, before the long tail adds to it. Only if the first slice shows it pays for itself.

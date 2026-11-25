# A cloud session's brief: play one slice of the manual checks

Status: **written 2026-11-25, not yet tried in the cloud.** The trial slice is the first thing to
run; the numbered slices wait on what it finds.

A cloud session (Claude Code on the web) is started with one line, "Follow
`docs/plans/manual-checks-cloud.md` for slice `trial`" (or a number from 0 to 20), and does what
is below. Background: `docs/plans/manual-checks-by-agents.md`. A cloud session can't message the
session that started it, so everything it finds reaches `main` as files under
`docs/manual-check-runs/`.

**Never edit** `docs/manual-checks.md`, `client/src/builder/manualChecks.ts`,
`docs/manual-checks-verdicts.md` or any source file. This is a run, not a fix.

## The slices

| slice | tests | staged with |
|---|---|---|
| `trial` | about 20 | `--every 105 --offset 10 --agents 2` |
| `0` to `20`, except `3` | 99 each | `--every 21 --offset <slice> --agents 10` |

Slice 3 was played on 2026-11-25. Twenty slices are the rest of the list. A slice is played once
`docs/manual-check-runs/slice-<n>-A.jsonl` exists on `main`: check before starting one. The
user's own PC plays them from 20 downward, so a cloud session takes the **lowest** number not
yet played. (Slice 20 was stopped part-way on 2026-11-25, with about a third of it judged: play it
again whole when the others are done.)

## 1. A browser

The SessionStart hook installs dependencies and builds `engine`, `protocol` and `server`; if it
didn't, `npm ci` and build them. The runner (`client/e2e/run-checks.mjs`, through Playwright)
needs Chromium: `npx playwright install chromium` from `client/` (`--with-deps` if system
libraries are missing and it's allowed).

Smoke check: write a plan file
`[{"title":"Tangleweave Armor: counts a commander in the command zone","steps":["cast:Tangleweave Armor"]}]`
and run

    node client/e2e/run-checks.mjs <plan> --out .scratch/manual-checks/smoke --parallel 1 --ports 0

It should print a board line with `Phyrexian Germ Token 4/4`. If a browser can't be installed or
the run can't work here, stop: write what failed, with the exact error, to
`docs/manual-check-runs/slice-<slice>.md`, land it on `main` (step 5) and finish.

## 2. Stage the slice

    node scripts/manual-check-brief.mjs <the slice's flags> --out .scratch/manual-checks/slice-<slice>

One `brief-<letter>.md` of about ten tests per agent.

## 3. Play it with Sonnet subagents

One subagent a brief (the Agent tool, `model: "sonnet"`, general-purpose), **two at a time** on
a 4-core box, the next started as one finishes. Ports: 0 for the first of a pair, 10 for the
second. Each gets exactly this, with `<L>` and `<P>` filled in:

> You are playing hand tests of a Magic: The Gathering web client through a text runner and
> reporting a verdict for each. Run commands from the repo root. Read exactly these two files
> first and nothing else in the repo: `.claude/manual-checks/agent-guide.md` (follow it to the
> letter, including "Keep it cheap") and `.scratch/manual-checks/slice-<slice>/brief-<L>.md`.
> `<out>` is `.scratch/manual-checks/slice-<slice>/<L>` and `<ports>` is `<P>`. A run is
> `node client/e2e/run-checks.mjs <out>/plan-1.json --out <out>/run-1 --parallel 1 --ports <P>`
> with a 600000 ms timeout. Write plan files with the Write tool. Put all your tests in the first
> plan, then only the tests that need different steps in the next. Write one JSON line a test to
> `<out>/results.jsonl` in the guide's format, `n` being the test's number in the brief. Edit
> nothing outside `<out>`. Final message: five lines at most, with the counts of passed, failed
> and cannot-judge and the number of runner commands.

## 4. Collect

- `node scripts/manual-check-usage.mjs --slice slice-<slice> --land` copies each `results.jsonl`
  to `docs/manual-check-runs/slice-<slice>-<L>.jsonl` (`.scratch/` is ignored by git) and prints
  each brief's verdict counts beside its agent's minutes and tokens; `--list failed` (or
  `cannot-judge`, `passed`) prints those tests with what the agent wrote.
- Replay every test an agent marked **failed** yourself with the runner before believing it,
  and say whether it is the test (its board can't show what it expects), the runner, or the
  game. Every failure so far has been the test.
- If that script finds no transcript for a brief (it looks under `~/.claude/projects/*/*/subagents`),
  pass `--transcripts <dir>`, or total the subagent's tokens by hand, **once per message id**.
- Write `docs/manual-check-runs/slice-<slice>.md`, a page at most: the verdict counts, each
  failure with its cause, seconds and tokens a test, anything an agent flagged about a pass
  (a wrong log line, an odd prompt), and anything a cloud run needed that this brief doesn't say.
  The trial also says what it took to get a browser and how many tests at once the box handled.

## 5. Land it

Commit only the files under `docs/manual-check-runs/`, then `git fetch origin main`,
`git merge origin/main`, `git push origin HEAD:main` (again if another slice landed first).
Stop every server and browser you started.

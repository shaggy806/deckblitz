# Playing manual checks: the agent's guide

You are given a **brief**: a file of hand tests from `docs/manual-checks.md`, each with its
**Do**, its **Expect** and the board it is played on. Play each one through the text runner and
say whether what a player would see matches **Expect**. You change nothing in the repo.

## Keep it cheap

Everything you need is in the brief and this guide. **Do not open** `docs/manual-checks.md`,
`client/src/builder/manualChecks.ts`, the client's or the engine's source, or a browser. Do not
read the transcripts the runner saves: what it prints is the same, shorter. Plan a whole batch,
run it with **one** command, judge from what it printed. Keep your own notes to a line a test.

## How a test is played

Write a plan: a JSON array, one entry a test, up to ten tests a plan.

    [{ "title": "<the test's title, exactly>", "steps": ["cast:Giant Growth", "card:Grizzly Bears", "wait"] }]

Run it (from the repo root; `<out>` and `<ports>` are in your task):

    node client/e2e/run-checks.mjs <out>/plan-1.json --out <out>/run-1 --parallel 2 --ports <ports>

About 25 seconds a test, two at a time. It prints, for each test and after each step, the screen
as text:

- the turn, whose it is, the step and the seat you are playing now
  (`turn 1, alice's, declare-attackers — you are alice`). Where an opponent is a seat of yours,
  the run moves you to whichever seat must act: read `you are` before every step, since a
  `pass` or a click is that seat's.
- `banner`: the prompt in the bottom-right corner, with its buttons' words. This is where a
  test's quoted prompt text appears.
- `popup`: a zone viewer or a choice of cards, by its title, with its cards (`[picked]` on one
  you have chosen, `[can't pick]` on one you can't, its number in a chosen order) and then
  `buttons:` its own buttons, `(off)` on one that can't be pressed yet. Picking a card in a
  popup only marks it: the choice is made by the popup's button (`click:Confirm`).
- `menu`: an open menu's items (a permanent's abilities, a choice of mana), `(off)` on one that
  can't be picked.
- `badges`: marks drawn on tiles (an attacker's `⚔ Bob`, a chosen word).
- each player's life, zone counts and counters (`, 3 poison`), and `board <player>:` their permanents, each as
  `Name 2/2 (tapped, sick, 2 +1/+1, flying, on <what it's attached to>)`; `hand:` your hand;
  `mana:` your unspent mana; each graveyard and exile with anything in it. A line is printed
  only where it has changed since the step before.
- `lit zone buttons`: the graveyard and exile buttons glowing because you can cast or activate
  something from there now (`alice's graveyard`), or `none`.
- `stack`, and `stack drawn (top first)` with each entry's controller and targets.
- `log (+N)`: every line the game log gained in that step.

You are alice, at your own precombat main, unless the test says otherwise. Where a test has you
play another seat, the run follows whichever of your seats must act.

### Steps

- `cast:<card in hand>` (or `hand:`): click a hand card.
- `card:<name>`: click a card in a popup, on the board, in hand, in the command zone or shown on
  top of a library. Targets and choices are picked this way.
- `stack:<entry>`: click an entry on the stack.
- `click:<text>`: a button, menu item or labelled box by its words. A leading `=` matches the
  whole text (`click:=Search your hand`); otherwise a piece of it, case aside.
- `player:<name>`: pick a player. `x:<n>`: the choose-X box, before its `click:Confirm`.
- `pass`: pass priority once. `wait`: wait for the bots, up to 30 s, until a decision is yours
  or the stack has emptied.
- `look:<card>`: read a card without clicking it, wherever it is: the step prints its type
  line, power and toughness, keywords and rules text as they are now (`look Sakashima the
  Impostor (alice's, hand): legendary creature — Human Rogue, 3/1 — …`). For a test about what
  a permanent has become: its types, a lost or gained ability.
- `hover:<card>`: leave the pointer on a card for that step's screenshot.
- `unfollow`: stay in this seat while another of yours must act.
- A `#2` at the end picks the second thing the words match (`#3` the third): the second of two
  permanents with one name (`card:Grizzly Bears#2`), the second of two buttons with one text
  (`click:+#2` in a divided amount, `click:Add one mana of any color#5` for the fifth entry of a
  menu whose items differ only by mana symbols).
- `stack:<entry>` also picks a spell or ability on the stack where a prompt asks for one (a
  source of damage, a spell to counter).

After every step the run passes priority for you while your own spell or ability is on top of
the stack, so what a test is about comes up as it resolves. A plan entry with `"hold": true`
never passes for you (each pass is then a `pass` step): use it only where the test is about the
order things resolve in or about responding.

### How the game moves

- With the stack empty, each `pass` on your turn moves one step on: precombat main, beginning of
  combat, declare attackers, (end of combat,) postcombat main, end step. "Pass to your end step"
  is that many `pass` steps; look at each step's turn line rather than counting.
- At declare attackers the banner reads `Declare attackers — 0 attacking …`: `card:<creature>`
  picks an attacker, then `click:Attack with` (or `click:No attacks`). Blocks work the same way.
- Clicking a permanent with an ability to activate opens its `menu`: the next step is
  `click:<some words of the item>`. A hand card with more than one way to play it opens one too.
  Mana symbols in an item can't be matched by `click:`: use the item's words, with `#n` where
  several items share them.
- A decision that comes as something resolves is asked only once it resolves. With `"hold":
  true` that means a `pass` first; the banner then shows the question.
- Targets are picked with `card:` or `player:` once the banner asks (`choose creature (1/1)`).
- The run passes for you only while **your own** spell or ability is on top. An opponent's
  trigger on the stack waits for your `pass`. `wait` is for a bot's turn or thinking, not for
  the stack.
- A bot opponent plays its own turn: cards it draws and plays show in the log and are not part
  of the test.
- Mana you add and don't spend is gone by the next step, and with nothing left to do the page
  passes for you. To read `mana:` after tapping for it, play the test with `"hold": true`.
- A click that is refused prints nothing new. For a test whose Expect is that something can't
  be done, that silence is the evidence: quote the unchanged banner, stack and log, and say so.

A run marked `[a step found nothing to act on …]` stopped at that step: the banner printed there
says what the game was asking instead. Fix the steps and run **only the tests that need it**
again, in a new plan. At most **five runs a test**; after that it is `cannot-judge`. A long
test (a second seat, an extra combat, an end step) is best built up: run it as far as you are
sure of, read where it stopped, and add the next steps to the same list.

## The verdict

- **passed**: every sentence of **Expect** is matched by text the runner printed. Quote that
  text for each sentence. No quote, no pass: a wrong "passed" is the costly mistake here, since
  a passed test gets deleted.
- **failed**: the runner printed something that contradicts **Expect**. Quote it. First make
  sure the steps did what **Do** says (the log shows what happened); a test you played wrongly
  is not a failure.
- **cannot-judge**: **Expect** is about how something looks or moves (a glow, a colour, an
  animation, where something sits, an arrow), or about something the runner's text does not
  show, or five runs did not get there. Say which in a few words, and in `evidence` quote what
  you did confirm, so the part that is left is clear. For something that looks a
  certain way while standing still, you may open **one** screenshot of that test
  (`<out>/run-N/<nn>/<step>.png`, with the Read tool) and judge from it; never for motion.

**Not a bug** lines in a test say what is correct though it may look wrong: don't fail a test
for them.

## What you hand back

Append one line a test to `<out>/results.jsonl` as you go:

    {"n": 3, "title": "…", "verdict": "passed", "steps": ["…"], "runs": 1, "evidence": ["Expect sentence → \"text printed\""], "note": ""}

Your final message is five lines at most: how many passed, failed and could not be judged, and
the results file's path. Nothing else: no table, no retelling of the tests.

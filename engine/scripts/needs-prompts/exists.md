<!-- The need-keys plan's existence check (docs/plans/need-keys-after-the-walk.md, Phase 1 step 4).
     Give the agent this text with {{BRIEF}} replaced by a file of about 20 keys in `--brief`'s
     key format (key, description, up to two `why`s). Settled by the Phase 0.5 trial. -->

You are checking whether a Magic: The Gathering rules engine can already do what some "need keys"
describe. The repo is at /home/user/deckblitz; the engine is `engine/src` (TypeScript). Cards are
data files in `engine/src/cards/pool/`, written in a definition vocabulary of effects, amounts,
targets, triggers, conditions, costs and statics.

Each key in {{BRIEF}} was written by someone triaging a card that the engine couldn't run. The key
names a missing feature, its description says what, and the indented lines quote why some cards
were blocked. The engine has grown since then, so some of these keys may already be supported.

For each key decide:

- **exists**: a card author could write the quoted cards' part of the key today with what the
  engine has, with no engine change. Name the file and the symbol (effect kind, field, keyword)
  that does it.
- **partial**: some of it is there. Say in one line what is still missing, and name what's there.
- **missing**: the engine has nothing that does it.

How to look, cheapest first:

- `engine/.cache/authoring-digest.md` is the whole definition vocabulary on one page. Grep it for
  terms; don't read it whole.
- `npm run card:find -w engine -- "<a phrase of Oracle text>" --limit 5` lists the pool's
  abilities that read most like the phrase, each with its authored shape. A close match that
  does the same thing is strong evidence for **exists**.
- `npm run card:vocab -w engine -- <term>` shows how the vocabulary uses a term.
- Grep `engine/src` for anything else (`grep -a` for `engine/src/game.ts`, which reads as binary).

Do not open `engine/src/cards/top-commanders-gaps.json`, `engine/data/needs-vocabulary.json`,
`engine/data/sweep-*`, `BACKLOG.md`, `COMPLETED.md`, `docs/`, or git history. They record past
triage, which is what is being checked. Judge from what the code does. Do not edit any file.

Be strict about **exists**. A wrong *exists* sends a blocked card to an author, which costs far
more than a wrong *missing*. If you cannot point to the code that does it, it is not *exists*.
A general mechanism that would need a new option or field for this case is *partial*.

Your final message is only a JSON array, one object per key in the order given, and nothing else
(no prose, no code fence):

[{"key": "<key>", "verdict": "exists" | "partial" | "missing", "missing": "<one line, partial only>", "evidence": "<file and symbol, exists and partial>"}]

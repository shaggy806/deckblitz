# Authoring cards

How to turn a Magic card into a TypeScript file the engine can run, and where
the engine's coverage currently stops.

Audience: someone adding files by hand under `engine/src/cards/pool/`. Every
card is one file, one `defineCard({...})` call, one `export default`.

- [0. Rule zero: faithful, or not at all](#0-rule-zero-faithful-or-not-at-all)
- [1. Quick start](#1-quick-start)
- [2. The `art` field](#2-the-art-field)
- [3. Card anatomy — every field](#3-card-anatomy--every-field)
- [4. Mana cost strings](#4-mana-cost-strings)
- [5. Keywords](#5-keywords)
- [6. Effects (`effect`)](#6-effects-effect)
- [7. Targets (`targets`)](#7-targets-targets)
- [8. Activated abilities](#8-activated-abilities)
- [9. Triggered abilities](#9-triggered-abilities)
- [10. Static abilities](#10-static-abilities)
- [11. The `resolve` escape hatch](#11-the-resolve-escape-hatch)
- [12. Multi-face, transform, adventure, Saga, commander](#12-multi-face-transform-adventure-saga-commander)
- [13. Worked examples](#13-worked-examples)
- [14. Preview your card](#14-preview-your-card)
- [15. Current engine limitations](#15-current-engine-limitations)
- [16. Testing a new card](#16-testing-a-new-card)

---

## 0. Rule zero: faithful, or not at all

**Never add a card the engine cannot run faithfully.** If any part of the
printed card can't be expressed — an ability that would have to be dropped, a
mode that would have to be cut, a number that would have to be hardcoded, a
choice that would have to be made *for* the player in a way that can change
the outcome — then **don't author the card at all**.

A missing card costs nothing. The deck importer offers a stand-in for it, the
report names it, and the player knows exactly what they did and didn't get. A
card that is *present but weaker than its printing* is a lie the game tells at
the table, and nothing downstream catches it: `card:verify` checks the stat
block and not the text, the fuzzer checks for crashes and not for fidelity,
and `card:text` (§16) only catches a whole clause going missing — never a
clause that's present but wrong. The player finds out when the card doesn't do
what it says, and by then they don't know which of the other 700 to trust.

There is no "close enough" tier and no scale of importance. A dropped
graveyard half on a tutor and a dropped keyword on a vanilla creature are the
same defect.

When the card you want is blocked, the options are, in order:

1. **Author a different card.** The backlog is over 1,500 deep; something else
   `asEnters` is something done as it's about to enter (rule 614.1c), on any is unblocked right now.
2. **Build the missing primitive, then the card.** This is how most of the
   pool got here. `neededCards-features.md` ranks features by how many real
   cards each unblocks — add yours to that ranking rather than working around
   it.
3. **Leave it out**, and note what blocked it. Not shipping a card costs
   nothing but the card.

Three things are **not** fidelity violations, and the rest of this guide leans
on the distinction:

- **Paraphrasing the `text` field** while the behaviour is exact. `text` is
  what the client prints; what the engine runs is the structured fields. Keep
  `text` close to Oracle anyway — `card:text` reads it, so a paraphrase costs
  you that check.
- **Reminder text**, and a keyword line the client already renders from
  `keywords`.
- **A choice the card itself cannot distinguish** — picking between two
  candidates that are identical in every respect the card cares about. The
  moment they differ in a way a player could reasonably have a view on, it is
  a violation, whatever the field is called. (This is a much narrower licence
  than it sounds: see `proliferate` in §15, which hid a real one for a long
  time behind exactly this wording.)

If you are unsure whether something counts, it counts. §15 is the list of what
the engine can't yet express; §16 is the checks, none of which is a substitute
for reading the Oracle text next to your card file.

---

## 1. Quick start

**Look the card up on Scryfall first.** Don't author from memory — mana
costs, P/T, and especially Oracle text wording are easy to misremember and
the engine's behaviour is only as correct as the printed card. Run:

```
npm run card:lookup -w engine -- "Card Name"
```

(`engine/scripts/scryfall-lookup.mjs`). It prints the authoritative mana
cost, type line, P/T or loyalty, colors, keywords, and full Oracle text —
every face separately for a DFC/split/adventure card — plus the tokens it
makes. Add `--rulings` for the official rulings (useful when a card's exact
interaction is unclear — how an intervening-if or a replacement effect is
worded), or `--json` for the raw entry. It takes several names at once.

It reads the **Oracle snapshot** first: `engine/data/oracle/cards.jsonl`,
checked in, one line per Commander-legal card and per token, with its
rulings and the tokens it makes folded in (`grep '^{"name":"Card Name"'`
finds one). So it works with no network — a cloud session can't reach
Scryfall — and only asks Scryfall for a card the snapshot lacks (`--online`
always does). `npm run gen:oracle -w engine` rebuilds the snapshot from
Scryfall's [bulk data](https://scryfall.com/docs/api/bulk-data), cached in
the git-ignored `engine/.cache/scryfall/`; rerun it when a set comes out.

**Then read its brief — before searching the engine by hand.** `npm run
card:brief -w engine -- "Card Name"` (several names at once) prints, in one
go: the Oracle text and rulings; whether it's in the pool, a sample deck's
stand-in, and its place in the backlog lists; every triage record that looked
at it, each need flagged when it has been **built since** that record was
written (a stale "blocked"); and, for each Oracle line, the three abilities
already in the pool that read most like it, with the file and how each is
authored. Most of a card is something another card already does in other
words: "When ~ dies or is put into exile from the battlefield, you may put
her into her owner's library third from the top" finds God-Eternal Oketra's
trigger, word for word. A high score is a lead — open the analog's file
before copying its shape. The analogs come from the pool index
(`engine/.cache/pool-index.jsonl`, every ability of every card, written by
`gen:cards` and rebuilt by the tools themselves when a card file is newer),
so there's nothing to build first.

**To find examples of one ability,** `npm run card:find -w engine -- "<phrase>"`
searches that index in well under a second: the abilities whose printed text
reads most like the phrase (ranked the way the brief's analogs are, one per
card), each with its card, file, text and authored shape. Write the phrase
the way Oracle text does — `"{T}: Add {C}{C}."`, `"whenever another creature
you control dies"` — since symbols and numbers are matched as such. `--kind
triggered` (or activated, static, spell, keyword, modes …) keeps one kind;
`--json create-token` keeps abilities whose shape contains a substring, and
alone lists them smallest shape first (`--json on:dies --kind triggered`:
the simplest dies-triggers to copy); `--limit N` prints more than ten.

**To ask whether the vocabulary can say something,** `npm run card:vocab -w
engine -- emblem` searches every term the pool uses (`kind=create-emblem`,
`on=step-begins.step=begin-combat`, `card.static[].restrictions`) with
how many cards use it and the smallest three, every declaration in the
engine sources with its doc comment (and whether any card uses it yet), and
this guide's matching lines. `--unused` lists the declared kinds no card
uses. One search usually answers what a dozen greps would.

**When a card is blocked**, `npm run cards:needs -w engine -- --feature
<key>` lists everything waiting on the same need, `-- --rank` the needs by
cards waiting, and `-- --stale` the cards whose recorded blockers have all
been built since (`scripts/needs-vocabulary.mjs`). A new triage record's
`needs` use the feature keys in `top-commanders-gaps.json` or
`data/needs-vocabulary.json`; `test/needs-vocabulary.test.ts` fails on one
it doesn't know. When a feature lands, add its key to the gaps file's
`built` array.

**Or start from a scaffold.** `npm run card:scaffold -w engine -- "Card
Name"` (or `--next 10` for the next unimplemented top-500 commanders,
`--next 10 --cards` for the top-5000 backlog) writes the card's file from
the snapshot into `engine/src/cards/scaffold/`: name, cost, colours, types,
P/T, loyalty, faces and their layout flags, `text`, the keywords the engine
models, a partner ability's `pairing`, the rulings in the header, and each
token it makes matched to an existing `tokens/` file or given a skeleton of
its own. `scripts/oracle-parse.mjs` then reads the rules text, line by line,
in two tiers:

- **Structure.** A line shaped like an ability becomes one: `cost: effect`
  an activated ability (mana, `{T}`, sacrifice, tap-N-untapped, life,
  counters, a loyalty cost, "Activate only as a sorcery"/"once each turn"),
  `When/Whenever/At …` a triggered ability with its `trigger` (entering,
  dying, attacking, casting, landfall, step starts, …), "enters tapped" a
  replacement, Enchant an Aura's target. The effect it can't read stays
  `effect: null` with its sentence as a TODO beside it.
- **Effects.** A sentence that matches a whole-sentence template — draw,
  damage, destroy, exile, bounce, life, counters, pump, keyword grants,
  tokens, mana, scry/surveil/mill, tutors, "you may …" — becomes its
  `EffectSpec`, with its `targets`. A template matches a *whole* sentence or
  nothing: "where X is …", "for each …" and any clause it doesn't know leave
  the sentence to you rather than half-read.

Every Oracle line left to author is a `// TODO(scaffold):` comment where its
ability goes. `scaffold/` isn't registered, so a half-authored card can't
reach a game; when every TODO is gone, move the file into `pool/` (a token
into `tokens/`) and run `gen:cards`. `cards/pool.test.ts` fails on a
`TODO(scaffold)` left in either. **Read what was filled in, not just the
TODOs**: the parser is checked against the pool, but a new card can use a
familiar sentence in an unfamiliar way.

A card whose every line was read is finished by the scaffold
("auto-finished") but still isn't registered: it's written to
`engine/src/cards/review/`. `--auto-scan` finds every such card in both
backlog lists, `--auto-scan --all` in the whole snapshot. Check it (`npm run
card:verify -w engine -- --dir review`, and `card:text` the same way)
against its Oracle text and rulings, then move it into `pool/`.

`npm run card:scaffold -w engine -- --report` writes nothing: it says how much
of the backlog the parser reads, lists the unparsed lines that recur most, and
— the better guide — the lines that are a face's **only** unread line (`--sole
N` for more): a template for one of those finishes that many cards outright.
`npm run card:parse-check -w engine` is the parser's ground truth: everything
it claims to have read on every pool card — each ability, a spell's effect
and modes, each static, and the card fields a keyword line sets (convoke,
morph, cycling, …) — compared with the hand-authored card, two spellings of
the same thing (`whose: "any"` or none, a scope or its filter, a nested
`sequence`, …) counted as one; `test/oracle-parse.test.ts` fails on any
disagreement. When you add a template, run both — and when a template can only
be checked on cards not in the pool yet, pin it in `oracle-parse.test.ts`.

A keyword the engine runs through a helper (`crew`, `undying`, `unearth`, …)
is read as that helper's own output, imported from `dist/` — what a
hand-authored card gets — so `oracle-parse.mjs` needs a build to run. "It" is
read only in an effect's first sentence: the source in a trigger about the
source, the trigger's object in one about another object, nothing otherwise.

Or create `engine/src/cards/pool/grizzly-bears.ts` by hand:

```ts
import { defineCard } from "../define.js";

export default defineCard({
  name: "Grizzly Bears",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Bear"],
  power: 2,
  toughness: 2,
});
```

Then wire it into the generated barrel:

```
npm run gen:cards -w engine
```

Rules:

- **`name`** is the registry key — it must match the card's real name exactly
  (that's how `/import-deck` and decklists resolve it). The **filename** only
  has to be unique; kebab-case of the name is the convention.
- The import is `../define.js` even though the file is `define.ts` — the engine
  is ESM + NodeNext, so relative imports carry the `.js` extension.
- `npm run gen:cards -w engine` regenerates `cards/generated.ts` (the barrel
  that collects every `pool/` and `tokens/` file into `BUILTIN_CARDS`). It also
  runs automatically as a `prebuild` / `pretypecheck` step, so `npm run build
  -w engine` or `npm run typecheck -w engine` picks a new file up too. If you
  forget, `cards/pool.test.ts` fails with a pointer to run it.
- The same run writes the card shards the web client loads cards from
  (`cards/shards/`, and `cards/generated-index.ts` beside them), which place
  each card by its name. It reads that name, and any `art`, from the file's
  source, so a card file has one of two shapes:
  `export default defineCard({ name: "…", … })`, or
  `export default helper("Name", …)` for a helper that takes the name first
  (`painLand`, `shockLand`, …). Commit all of those files with the card.
- **A token** is just a card with no `manaCost` (see `tokens/soldier-token.ts`).
  Put it in `tokens/` instead of `pool/`. It's minted by a `create-token`
  effect, never cast.

Config knobs that never appear on a card file — `startingLife`,
`openingHandSize`, `maxHandSize`, `maxLandsPerTurn`, `skipFirstDraw` — live in
`GameRules` (`state.ts`) and are set per-game, not per-card.

---

## 2. The `art` field

By default the client fetches art from Scryfall **by card name**. That fails
for made-up cards and is unreliable for tokens. Override it with a Scryfall
link:

```ts
export default defineCard({
  name: "Knight Token",
  art: "https://scryfall.com/card/tdom/1/knight",
  // ...
});
```

Any of these forms work (`client/src/ui/art.ts` resolves them, no lookup
needed):

| form | example |
| --- | --- |
| card page URL | `https://scryfall.com/card/dmu/120/sheoldred-the-apocalypse` |
| API URL | `https://api.scryfall.com/cards/dmu/120` |
| direct image URL | `https://cards.scryfall.io/art_crop/front/1/4/….jpg` |
| bare card UUID | `145dcac4-2c53-4ae9-9ede-24dc07474b01` |

The lab's **Tile** tab has a "full card image" toggle that pulls the whole card
from the same link.

---

## 3. Card anatomy — every field

`defineCard` takes a partial draft and fills defaults. Fields:

### Identity & characteristics

| field | type | notes |
| --- | --- | --- |
| `name` | `string` | **required**, the registry key |
| `art` | `string` | Scryfall link — see §2 |
| `manaCost` | `string` | `"{1}{G}"`, `"{X}{R}"`, … — see §4. Omit for a land / token. |
| `colors` | `Color[]` | `"W" \| "U" \| "B" \| "R" \| "G"`. Set it explicitly; the engine does **not** infer colour from the cost here (it *does* for colour identity — see `identity.ts`). |
| `supertypes` | `("basic" \| "legendary" \| "snow" \| "world")[]` | |
| `types` | `CardType[]` | **required**. `"land" \| "creature" \| "artifact" \| "enchantment" \| "instant" \| "sorcery" \| "planeswalker" \| "battle" \| "kindred"`. **Kindred** (rule 308, "tribal" on old printings) always sits beside another type and goes first, as the type line prints it: Bitterblossom is `["kindred", "enchantment"]` with `subtypes: ["Faerie"]`. It's cast and resolves by its other type (308.1), and it's the only noncreature type that has creature types (205.3m), so they go in `subtypes` and every filter reads them — a kindred Elf enchantment is an "Elf you control", a kindred Eldrazi instant an "Eldrazi spell" — and changeling reaches it (Crib Swap, Firdoch Core). It counts as a card type of its own for delirium and other type counts (the rulings). `kindred.test.ts`. |
| `subtypes` | `string[]` | creature types, land types, `"Aura"`, `"Equipment"`, … free-form strings |
| `power` / `toughness` | `number` | creatures only; omit for everything else |
| `keywords` | `Keyword[]` | see §5 |
| `text` | `string` | Oracle text. Purely cosmetic (rendered in the UI, scanned for colour identity) — **behaviour comes from the structured fields**, not this. Keep it in sync anyway. |

### Behaviour

| field | shape | section |
| --- | --- | --- |
| `targets` | `TargetSpec[]` | §7 — a spell's target slots, chosen at cast time |
| `effect` | `EffectSpec` | §6 — what the spell/permanent-spell does on resolution |
| `resolve` | `(ctx) => void` | §11 — imperative fallback, takes precedence over `effect` |
| `activated` | `ActivatedAbility[]` | §8 |
| `triggered` | `TriggeredAbility[]` | §9 |
| `static` | `StaticAbility[]` | §10 |

### Specialised (leave unset unless the card needs it)

| field | shape | what it does |
| --- | --- | --- |
| `loyalty` | `number` | planeswalker starting loyalty — §8, §12 |
| `compleated` | `true` | **Compleated** (rule 702.150a — Nissa, Ascended Animist; Ajani, Sleeper Agent): it enters with two fewer loyalty counters for each Phyrexian mana symbol its caster paid life for (`GameObject.phyrexianPaidWithLife`, carried onto the permanent; the `{ phyrexianPaidWithLife: true }` amount). Put onto the battlefield without being cast, or with every Phyrexian symbol paid in mana, it enters with its printed loyalty. Other loyalty replacements apply as usual (the rulings). The scaffolder reads the keyword. |
| `castModal` | `{ minModes, maxModes, maxModesIf?, repeatModes?, simultaneous?,pawprintBudget?, modes: ModeOption[] }` | a modal **spell** ("Choose one —" and bullets) — its modes are chosen as it's cast (rules 601.2b, 700.2a), whether or not they target (Farewell's have no targets). `pawprintBudget: 5` with each mode's `pawprints` is "Choose up to five {P} worth of modes" (rule 700.2i — Season of the Burrow, Season of Loss), with `minModes: 0`, `maxModes: 5`, and none at all a legal cast. `repeatModes: true` is "You may choose the same mode more than once" (rule 700.2d — Fiery Confluence, Mystic Confluence: `minModes`/`maxModes` 3): a mode chosen n times is done n times in printed order, each copy with its own target slots, which may name the same target or different ones. The `modal` *effect* is for a choice made on resolution instead — §6. `maxModesIf: { condition, maxModes }` raises the most while a condition holds as it's cast: Will of the Sultai's "If you control a commander as you cast this spell, you may choose both instead" is `{ condition: { kind: "controls", filter: { isCommander: true }, atLeast: 1 }, maxModes: 2 }`. `costPerExtraMode: "{G}"` is **escalate** (rule 702.120a — Collective Resistance): that mana once per mode beyond the first, an additional cost paid on top of an alternative cost or a free cast too (118.9d); the offer's `maxModes` is capped at what the caster can pay. An escalate that isn't mana is `alsoPerExtraMode`, a kicker's `also` paid once per mode beyond the first: `{ text: "Tap an untapped creature you control", tapUntapped: { filter: { type: "creature" }, count: 1 } }` (Collective Effort — picked from the offer's `tapCost`, marked `perExtraMode`), `{ text: "Discard a card", discard: 1 }` (Collective Brutality — chosen as it's paid); no sacrifice. **Spree** (rule 702.172a — Three Steps Ahead) is a `spreeCost` on every mode — `{ text: "+ {1}{U} — Counter target spell.", spreeCost: "{1}{U}", targets: ["spell"], effect }` — with `minModes: 1` and `maxModes` all of them: each chosen mode's cost is added to whatever is paid, an alternative cost or a free cast too (118.9d, the rulings), and the mana value stays the mana cost's. What the modes cost depends on which they are, so the offer lists the sets it can pay for, each of its modes with a legal target (`castModal.modeSets`), and a driver picks one (`fitModeSet`). The chosen modes resolve in printed order, and a mode that stops to ask something (a search, a discard, a choice) is answered before the next mode happens, as a `sequence`'s steps are. |
| `castModal.chosenBy` | `"opponent"` | **"An opponent chooses one —"** (rule 700.2e — Library of Lat-Nam, Misfortune): the caster names the opponent (`otherChooser`), who answers `choose-modes` as it's cast; inside the modes that opponent is `"that-player"` (Misfortune's `damage` `who: "that-player"`, `add-counter-all`'s `controlledByPlayer: "that-player"`). Its modes may not take targets (Fatal Lore isn't built). |
| `costPerExtraTarget` | mana string | "This spell costs {1} more to cast for each target beyond the first" (Fireball; Strive — Twinflame's `"{2}{R}"`): a cost increase once per distinct target after the first (rule 601.2f), on top of whatever cost is paid. The offer's `targetCount` lists the counts the caster can afford, and an `{X}` spell's `xCost.maxXByTargetCount` the largest X at each. |
| `casualty` | `number` | **Casualty N** (rule 702.153a — Cut Your Losses' "Casualty 2"): "as an additional cost to cast this spell, you may sacrifice a creature with power N or greater", and when it's paid the spell is copied (its own "when you cast this spell" ability, so the copy resolves first), its controller choosing new targets for the copy if it likes. Not a cast variant: once the spell is on the stack its caster is asked a `choose-permanents` of up to one such creature (min 0) — on a free cast too (cascade), since it's an additional cost — and paying it queues the copy. The creature paid left before the spell became cast (rule 601.2i), so its own "whenever you cast" abilities don't fire. Each instance, printed or granted (`grantsToSpells.casualty` — §10), is asked and copies separately (702.153b). Put "Casualty N" in `text`. |
| `conspire` | `boolean` | **Conspire** (rule 702.78a — Burn Trail, Gleeful Sabotage): "as an additional cost to cast this spell, you may tap two untapped creatures you control that each share a color with it", and when it's paid the spell is copied (its own "when you cast this spell" ability, so the copy resolves first), new targets for the copy if its caster likes. Asked once the spell is on the stack, as casualty is: a `choose-modes` of one mode or none (pay or not — `conspireAsk`), then a `choose-permanents` of exactly two (`conspire`) among the caster's untapped creatures sharing a colour with the spell — summoning-sick ones too, the cost having no {T} (rule 302.6); a hybrid spell shares either colour, a colourless one none. Not asked when two such creatures aren't there. Each instance, printed or granted (`grantsToSpells.conspire` — §10, Wort, the Raidmother), is asked and copies separately (702.78b). Put the "Conspire (…)" line in `text`; the scaffolder reads it. |
| `additionalCost` | `{ sacrifice: CardFilter }` | a **mandatory** extra cost to cast (rule 601.2f — Harrow: "sacrifice a land"). Paid as the spell is cast, so it stands even if the spell is countered, and the spell isn't castable at all without it. The caster picks which permanent. |
| `additionalCost.exileFromHandReduces` | `{ filter, each }` | The March cycle's "you may exile any number of blue cards from your hand. This spell costs {2} less to cast for each card exiled this way": named on the `cast-spell` action's `delve` from its offer (`delve.fromHand`), `each` generic off the total cost, X's included, never the colored part; any number may go, past what lowers it further. Leaves X alone, unlike `sacrificeReduces`. |
| `additionalCost.sacrificeCount` | `number \| "x"` | the `sacrifice` takes several — Eliminate the Competition's "sacrifice **X** creatures" is `{ sacrifice: { type: "creature" }, sacrificeCount: "x" }`: X is announced as it's cast (rule 107.3a), capped by what there is to sacrifice once the mana is paid (`xCost.maxX`), and an "X target …" group (`any-number` with `min`/`max: "x"`) is fixed at it. Which ones is chosen as the cost is paid, with the ordinary `sacrifice` decision once the spell is on the stack — exactly as an ability's sacrifice of several (§8). **`sacrificeReduces: N`** beside it is "you **may** sacrifice **any number** of … This spell costs {N} less to cast for each … sacrificed this way" (Dargo, the Shipwrecker; Awaken the Blood Avatar `{ sacrifice: { type: "creature" }, sacrificeCount: "x", sacrificeReduces: 2 }`): the count is announced as X (rule 601.2b), each taking N off the generic part only (601.2f), and the offer's `xCost` is the fewest to the most that pay, marked `sacrifice` — the client asks "how many to sacrifice", the bots take the fewest. Nothing else should read that X. **`copyForEachSacrificed: true`** beside `sacrificeCount: "x"` is "you may sacrifice one or more creatures. When you do, copy this spell for each creature sacrificed this way" (Plumb the Forbidden `{ sacrifice: { type: "creature" }, sacrificeCount: "x", copyForEachSacrificed: true }`): X is the count (none at all allowed), and one reflexive trigger of the casting (rule 603.12), there only when X is 1 or more, makes X copies with the original's targets (no new ones: rule 707.10c). |
| `additionalCost.discard` | `number \| "x"` | "As an additional cost to cast this spell, **discard a card**" (Thrill of Possibility: `{ discard: 1 }`), at random with `discardAtRandom: true` (Sonic Burst). `"x"` is "discard **X** cards" (Sickening Dreams `{ discard: "x" }`, Devastating Dreams with `discardAtRandom`, Firestorm, Channeled Force): it makes the spell an `{X}` spell without an `{X}` in its mana cost — X announced as it's cast (rule 601.2b), `xCost.maxX` the caster's other cards in hand, an "X target …" group (`any-number`, `min`/`max: "x"`) fixed at it (Restless Dreams) — and that many are discarded as the cost is paid (601.2h), even cast without paying its mana cost (Channeled Force's ruling). A `sacrifice` effect's `count` and a search's `min` take an amount for the X that reads it ("each player sacrifices X lands", "search your library for X cards"). |
| `additionalCost.discardFilter` | `CardFilter` | `discard`'s cards must match it: "discard a land card" (Magmatic Insight), "discard X land cards" (Scorched Earth), X capped by the matching cards. |
| `chooser` (on `choose-permanents`, `unless`, `look-and-choose`, `separate-into-piles`, …) | `ChooserRef` | who makes the choice: a player ref, a target slot, `"an-opponent"`. "Each player chooses … then" is `for-each-player` with `chooser: "that-player"` (`choicesHeld` for APNAP then together, rule 101.4); "repeat until nobody does" is `repeat` with `again: { kind: "this-way", … }`. |
| `activated[].cost.do` / `also.do` | `EffectSpec` | an **action as a cost** (`cost-acts.ts`): any step in `COST_ACTS` — mill, exile the source, put a card on the library, pay energy, forage (`forageCost()`), sacrifice all… Payable only if all of it can be done (118.3). `"x"` announces X, capped by the row. What it took reads back as `{ paid: … }`. New costs go here, not in a new `AbilityCost` field. |
| `additionalCost.also` | `KickerAlsoCost` | any other part of a cost, in the shape every keyword's non-mana cost has, paid as a kicker's is, on a flashback or alternative-cost cast too (rule 118.9d): `tapUntapped { filter, count }`, "tap two untapped artifacts, creatures, and/or lands you control" (Warlord's Elite, Shared Discovery, Gaze of Justice), picked from the variant's `tapCost`, a summoning-sick creature allowed; `tapAnyNumber { filter }`, "tap any number of untapped creatures" (Burn at the Stake), none allowed, with `"x"` reading how many; `returnToHand { filter, count }` (Deprive). An `AdditionalCostOption` takes one too: "tap an untapped artifact you control or pay {1}" (Disruption Protocol). **A `do` act with an `"x"` amount** makes the spell an X spell without an `{X}` in its mana cost — "As an additional cost to cast this spell, **blight X**" (Soul Immolation: `also: { text: "Blight X", do: { kind: "blight", amount: "x" } }`): X is announced as it's cast (rules 107.3a, 601.2b), `xCost.maxX` the least of what the act's `COST_ACTS` row could pay and the card's `maxX`, and the act is paid at it once the spell is on the stack (601.2h); a blight of 0 asks nothing. The scaffolder reads the line. `blight-x-cost.test.ts`. |
| `additionalCost.options` | `AdditionalCostOption[]` | a **choice** of whole costs, exactly one paid (Bitter Triumph: "discard a card or pay 3 life"; Demand Answers: "sacrifice an artifact or discard a card"). Each option takes a `text` label plus any of `discard` / `payLife` / `sacrifice` / `mana` / `blight`, and is enumerated as its own castable variant — so the caster chooses by picking a `cast-spell`, not by answering a decision. A `mana` branch is priced into the spell's total cost, an alternative cost's included (rule 118.9d), so it's offered only when that total can be paid (Eaten Alive's "pay {3}{B}" on top of its {B}). **Not for a cost whose *filter* spans two types**: Deadly Dispute's "sacrifice an artifact or creature" is one cost with `typesAnyOf` and needs none of this. A `blight: N` branch (rule 701.68a — Bogslither's Embrace's "blight 1 or pay {3}": `[{ text: "Blight 1", blight: 1 }, { text: "Pay {3}", mana: "{3}" }]`) is offered only while the caster controls a creature (701.68b); which one is asked once the spell is on the stack (`choose-permanents`, 601.2h). A mandatory "blight N" with no "or" isn't built, nor "blight X" (Soul Immolation). A `behold` branch (rule 701.4a — Lys Alana Dignitary's "behold an Elf or pay {2}": `[{ text: "Behold an Elf", behold: { filter: { subtype: "Elf" }, text: "an Elf" } }, { text: "Pay {2}", mana: "{2}" }]`, a `BeholdSpec`) is offered only while there's one to behold — an Elf card in the caster's hand or an Elf they control, never the spell itself — and which one is asked once the spell is on the stack (see `additionalCost.behold`). |
| `additionalCost.behold` | `BeholdSpec` — `{ filter, text, count?, exile? }` | **Behold** (rule 701.4a): "reveal a [quality] card from your hand or choose a [quality] permanent you control". `filter` is the quality, read on the card in hand or the permanent (`{ subtype: "Dragon" }` — a kindred Dragon or a changeling card counts; Hulk's Thunderclap's "a Gamma creature" is `{ type: "creature", subtype: "Gamma" }`), `text` what's beheld ("an Elf", "three Elementals" — prompts and labels). Mandatory here: castable only with one to behold. Which one is a `choose-from-zone` decision whose candidates are **both zones at once** (its `behold` set), asked once the spell is on the stack (601.2h) and only when there's a choice; a card from the hand is revealed to every player (`cards-revealed`, visible all turn). `count: N` is "behold three Elementals": N different objects, any mix, a token stack's tokens each one. `exile: true` is the Champions' "**behold an Elf and exile it**": what's beheld is exiled too, linked to the permanent the spell becomes (rule 607.2q) — so its "When this creature leaves the battlefield, return the exiled card to its owner's hand" is a `leaves-battlefield` trigger running `return-exiled-by-source { linked: "hand" }` (Champions of the Perfect). Countered, the card stays exiled for good; a token beheld this way ceases to exist (the rulings). |
| `additionalCost.exileFromGraveyard` | `{ count, filter?, optional?, linked? }` | "As an additional cost to cast this spell, **exile two creature cards from your graveyard**" (rule 601.2b — Skaab Goliath: `{ exileFromGraveyard: { count: 2, filter: { type: "creature" } } }`; Abhorrent Oculus's "six cards" has no `filter`). `count: "x"`: "exile X cards", X announced as it's cast and capped at the matching cards there, the same X as a `{X}` in its mana cost (Harvest Pyre, Chill Haunting, Skeletal Scrying — `amount: "x"` reads it). "The exiled card" of the effect is the set `{ paid: "exiled" }`, a copy's too (`{ powerOf: { paid: "exiled" } }` — Corpse Explosion; `{ manaValueOf: … }` — Draconic Intervention). `optional: true`: "you **may** exile", always asked, none an answer; `linked: true`: what's exiled is exiled with the permanent the spell becomes, read by an `exiled-with-source` condition or amount (Redemptor Dreadnought). `graveyard-exile-count-cost.test.ts`. Castable only with `count` matching cards in the caster's graveyard, never the spell itself (Skaab Ruinator cast from there — the ruling); which ones is a `choose-from-zone` over that graveyard (`destination: "exile"`), asked once the spell is on the stack (601.2h) and only when more match than it takes — the payment of an ability's `exileFromGraveyard` (§8). Exiled for good if the spell is countered. Not built as an `options` branch: Soaring Stoneglider's "exile two cards from your graveyard or pay {1}{W}". The scaffolder reads the line. `spell-graveyard-exile-cost.test.ts`. |
| `additionalCost.putFromExile` | `number` | "As an additional cost to cast this spell, **put a card an opponent owns from exile into that player's graveyard**" (Processor Assault: `1`). Castable only with that many such cards in exile; which, chosen once the spell is on the stack (601.2h) — the payment of an ability's `putFromExile` (§8). The scaffolder reads the line. `put-exiled-into-graveyard.test.ts`. |
| `for-each-unless` | `of` (`{ permanents }`, `{ inHandOf, filter }`, `{ libraryTop }`), `asks` (`"controller"`, `"owner"`, `{ target }`, `{ anyOf }`), `options` (`UnlessOption`s, `{it}` the name), `otherwise`, `as?`, `inOrderYouChoose?`, `rest?: "exile"` | "**For each creature**, its controller sacrifices it **unless they pay X life**" (Killing Wave): one question per object, the players in turn order, a payment made as it's answered, and what the declines owe all at once at the end (rule 101.4). `otherwise` has the object in slot `as` (default 0): `sacrifice-target` with `byItsController`, `return-to-hand` with `atRelease` (Cut the Tethers) or `from: "library"` (Sword-Point Diplomacy), `discard-card` (Sirocco), or a `sacrifice` by `"that-player"` (Fade Away). A hidden look isn't this: its questions would name the cards to the table, so one `look-and-choose` with `max: { lifePaymentsOf: 2 }`, a `prompt` stating the price, and a `lose-life` of `{ product: [{ thisWay: "chosen" }, 2] }` (Moonlight Bargain). `for-each-unless.test.ts`. |
| `discard-chosen`'s `picks`, `oneEach` | an amount; `{ filters, text }` | `picks` without `reveals`: "choose **X cards** from it" (Mind Warp, `lookOnly`), "a nonland card from it **for each card discarded this way**" (Last Rites, `{ thisWay: "discarded" }`) — exactly that many, as many as match when fewer (rule 609.3), where `upTo` lets the chooser take fewer. `oneEach`: "a nonland card with mana value 3 or less **and** a card with mana value 4 or greater" (Distended Mindbender): one card per filter, as many as can be matched, discarded together; `text` is what the chooser is told. `discard-chosen-count.test.ts`. |
| `additionalCost.returnToHandX` | `CardFilter` | "As an additional cost to cast this spell, **return X Swamps** you control to their owner's hand" (Infernal Harvest: `{ subtype: "Swamp" }`): an X spell without an `{X}` in its mana cost, X announced as it's cast and capped by what matches (rules 601.2b, 118.3), `"x"` amounts reading it; which ones is chosen as the cost is paid (601.2h), lands tapped for its mana among them. A fixed number is `also.returnToHand`. The scaffolder reads the line. `return-x-cost.test.ts`. |
| `additionalCost.chooseNumber` | `{ min, max }` | "As an additional cost to cast this spell, **choose a number between 0 and 5**" (Liquid Fire): announced like an X as it's cast (rule 601.2b), `"x"` reads it, nothing is paid for it and its mana value doesn't count it. The offer's `xCost` says `chosenNumber`, and the client asks for "a number". The scaffolder reads the line. |
| `additionalCost.payLifePerTarget` | `number` | "This spell costs **3 life more** to cast **for each target**" (Phyrexian Purge — a cost increase, rule 601.2f, over the targets chosen first, 601.2c): this much life per distinct target, paid as the spell is cast; the offer's `targetCount` range is what the caster's life pays (119.4). |
| `additionalCost.waterbend` | `number \| "x"` | "As an additional cost to cast this spell, **waterbend {5}**" (rule 701.67a — Water Whip: `additionalCost: { waterbend: 5 }`): the {5} is added to the total cost, an alternative cost or a free cast included (rule 118.9d — Yue, the Moon Spirit's free cast of it still pays it), and for each of its generic the caster may tap an untapped artifact or creature they control instead — summoning sick or not (the rulings). Only that much of the total cost's generic may be paid by tapping, whatever raises or lowers the total (701.67b). Which ones is the `cast-spell` action's `waterbend`, offered as the variant's `waterbend` (`WaterbendOffer`); omitted, the engine taps the fewest that leave the rest payable with mana, and the variant is offered whenever mana and taps together pay it. One tapped for it can't tap for mana too. `"x"` is "waterbend {X}" (Waterbender's Restoration): an `{X}` spell without an `{X}` in its mana cost, like `payLifeX` — X announced as it's cast, the offer's `xCost.maxX` counting what could tap, `ctx.x` reading it, its mana value not counting it; the offer's `waterbend.byX` has each X's `max` and `proof`. Not built: "unless you waterbend {2}" as an effect (Waterbending Lesson), ward—waterbend (The Unagi of Kyoshi Island), an alternative cost of "waterbending {X}" (Hama, the Bloodbender), "whenever you waterbend" (701.67c). `waterbend.test.ts`. |
| `kicker.waterbend` | `keyword: "waterbend"` | "As an additional cost to cast this spell, **you may waterbend {2}**" (rule 701.67a — Katara, Seeking Revenge): `kicker: { cost: "{2}", keyword: "waterbend" }`. The kicked variant is the one that waterbends (labelled "waterbend {2}"), up to the kicker's generic paid by tapping as for `additionalCost.waterbend`. "If this spell's additional cost was paid" (or "her additional cost was paid") is the spell being kicked: the kicker's `effect` / `targets`, or `self-kicked` on the permanent. |
| `kicker.blight` | `number` | "As an additional cost to cast this spell, **you may blight N**" (rule 701.68a — Burning Curiosity): `kicker: { cost: "", keyword: "blight", blight: N, effect? / targets? }`. The kicked cast is the one that blights — offered only while the caster controls a creature (701.68b), labelled "blight N" — the creature chosen once the spell is on the stack (`choose-permanents`). "If this spell's additional cost was paid" is the spell being kicked: the kicker's `effect` / `targets`, or `self-kicked`. |
| `kicker` | `{ cost, targets?, effect?, keyword?, multi? }` | **kicker** (rule 702.33 — Tear Asunder). `cost` is folded onto the printed cost; `targets` / `effect` replace the unkicked ones when kicked. `legalActions` offers the card twice, kicked and unkicked. `multi: true` is **multikicker** (702.33c — Everflowing Chalice): offered once per number of times the caster can pay it (`kickCount`, with `kickerCost` that many times over), and "for each time it was kicked" is an `enters-battlefield` replacement's `counters: { kind, amount: "times-kicked" }` — or, in any other effect, the amount `{ timesKicked: "source" }` (§6) (0 when it wasn't cast; `"web-slinging-mana-value"` is web-slinging's returned creature — see `webSlinging`). `keyword: "offspring"` is the same optional additional cost under Offspring's name (rule 702.175) — pair it with `offspringTrigger()` (below). `keyword: "squad"` with `multi: true` is **squad** (rule 702.157a — Powder Ganger; a cost that isn't only mana in `also`, paid each time over and bounding the offers — Ruthless Radrat, Thrill-Kill Disciple): pair it with `squadTrigger()`, whose `create-token-copy` has `perTimeKicked: true` (a copy per payment, read as it last existed if it has left). Squad costs that aren't mana aren't built. `keyword: "gift"` is gift (rule 702.174) — see the gift row of the keyword table below. `keyword: "replicate"` with `multi: true` is **replicate** (rule 702.56a — Pyromatics, Gigadrowse): no `targets` / `effect` of its own; casting it paid N times queues one "when you cast this spell" trigger that copies the spell N times (`queueReplicate`), each copy free to choose new targets, made even if the spell was countered in response (the ruling). A replicated spell isn't *kicked* to anything else. Not built: a static giving spells replicate (Djinn Illuminatus — `static:grant-replicate`). `replicate.test.ts`. "**Whenever you cast a kicked spell**" is a `cast-spell` trigger with the filter `kicked: true` (a spell on the stack whose kicker was paid — Roost of Drakes, Verazol); "**a card with a kicker ability**" is `hasKicker: true`, in any zone (Murasa Sproutling, Coralhelm Chronicler). Not built: a cost reduction or a spend restriction that asks whether the spell will be kicked (Vine Gecko, Throne of Makindi) — `kicked` is set only once the cast is paid. |
| `kicker.also` | `KickerAlsoCost` | **A kicker cost that isn't mana** (rule 702.33a — "Kicker [cost]" is any cost): `kicker: { cost: "", also: { text, … } }`, and the same on entwine (702.42a — Betrayal of Flesh's "Entwine—Sacrifice three lands") and buyback (below). `sacrifice: { filter, count }` (Vicious Offering, Goblin Barrage's "an artifact or Goblin" as an `anyOf`), `returnToHand: { filter, count }` (Arctic Merfolk — chosen as the cost is paid, 601.2h, as an alternative cost's `returnToHand`), `tapUntapped: { filter, count }` (Blood Tribute's "tap an untapped Vampire you control" — picked from the kicked variant's `tapCost`, the cast's `tap`, as teamwork's; a summoning-sick one may be tapped), `payLife`, `discard`. The kicked variant is offered only while every part can be paid. |
| `kicker.second` | `string` | **Two kicker costs** (rule 702.33b — "Kicker {1}{U} and/or {B}": the volvers, Illuminate, Archangel of Wrath): `kicker: { cost: "{1}{U}", second: "{B}" }`, each payable once. The kicked variants are the first, the second and both (`kickCount` 1, 2, 3 — *which*, not how many times; `kickerCost` the mana each adds), and a spell kicked with both was kicked twice (`timesKicked` 2, 702.33d). "If it was kicked with its {1}{U} kicker" (702.33f) is `self-kicked` with `with: "first"`, "… its {B} kicker" `with: "second"`, "if it was kicked twice" `with: "both"`, and plain "if it was kicked" either; the stack's `kickedWith` / the permanent's `enteredKickedWith` hold it. No `effect` / `targets` / `multi` / `keyword` with it: a spell's riders are `conditional`s on `self-kicked` (Illuminate), a permanent's an `ifCondition` counter amount, a `condition`ed static ("enters … with flying" — Anavolver, as Pouncing Wurm), activated ability or trigger (Ana Battlemage; Wastescape Battlemage's cast triggers). The scaffolder reads the line and the intervening-ifs. `kicker-two-costs.test.ts`. |
| `kicker.bargain` | `keyword: "bargain"` | **Bargain** (rule 702.166a — "as an additional cost to cast this spell, you may sacrifice an artifact, enchantment, or token"): `kicker: { cost: "", keyword: "bargain", targets? / effect? }`. The kicked cast is the bargained one (702.166b), labelled "bargain" — offered only while the caster has an artifact, enchantment or token (of any type) still there once the mana is paid, so a lone Treasure can't both pay and be sacrificed (601.2g). Which one is the ordinary `sacrifice` decision, asked once the spell is on the stack (601.2h) and only with a choice; a token stack gives up one token. "**If this spell was bargained**" is the spell being kicked: the kicker's `effect` replaces the spell's (Candy Grapple's -5/-5 "instead"; Archon's Glory restates the pump and adds the keywords), and its `targets` are the bargained cast's (Brave the Wilds' land, 702.166d). "When this creature enters, **if it was bargained**" is `self-kicked` (High Fae Negotiator). `reduceGeneric: N` is "**this spell costs {N} less to cast if it's bargained**" (Ice Out, Hamlet Glutton): N generic off the bargained cast's total, after increases (601.2f). Put "Bargain (…)" in `text`; `bargain.test.ts`. |
| `kicker.behold` | `BeholdSpec` | "As an additional cost to cast this spell, **you may behold a Dragon**" (rule 701.4a — Osseous Exhale): `kicker: { cost: "", keyword: "behold", behold: { filter: { subtype: "Dragon" }, text: "a Dragon" }, effect? / targets? }`. The kicked cast is the one that beholds — offered only with one to behold, labelled "behold a Dragon" — the object asked once the spell is on the stack (`additionalCost.behold`). "**If a Dragon was beheld**" (701.4b) and "if this spell's additional cost was paid" are both the spell being kicked: the kicker's `effect` / `targets` (Hulk's Thunderclap's third target). `flash: true` is Molten Exhale's "you may cast this spell as though it had flash if you behold a Dragon as an additional cost": the kicked cast may begin any time (rule 601.3c). Not built: Celestial Reunion's "choose a creature type and behold two creatures of that type" (a type chosen as it's cast). |
| `kicker.keyword: "reveal"`, `kicker.orControls` | `BeholdSpec` with `fromHand`, `CardFilter` | "As an additional cost to cast this spell, **you may reveal a Dragon card from your hand**" (rule 601.2b — Dragons of Tarkir): `kicker: { cost: "", keyword: "reveal", behold: { filter: { subtype: "Dragon" }, text: "a Dragon card", fromHand: true }, orControls: { subtype: "Dragon" }, effect? }`. The kicked cast reveals (the card stays in hand); "**if you revealed a Dragon card or controlled a Dragon as you cast this spell**" is the spell being kicked, which `orControls` also gives a cast whose caster controls a Dragon once its costs are paid — but not a copy of it (`kickedByControl`, the Draconic Roar ruling). The kicker's `effect` (Draconic Roar), `self-kicked` on a permanent (Orator of Ojutai's trigger, Scaleguard Sentinels' counter). A **mandatory** "reveal a Kithkin card from your hand or pay {3}" (Lorwyn) is an `additionalCost.options` branch: `{ text: "Reveal a Kithkin card", behold: { filter: { subtype: "Kithkin" }, text: "a Kithkin card", fromHand: true } }` (Goldmeadow Stalwart). An activated ability's "Reveal X white cards from your hand" is `AbilityCost.reveal` (below). |
| `kicker.teamwork` | `number` | **Teamwork N** (rule 702.194 — HULK SMASH!): `kicker: { cost: "", keyword: "teamwork", teamwork: N }`, an optional additional cost of tapping any number of creatures you control with total power N or more (crew's `totalPower` offer, summoning sick creatures included, picked from the kicked offer's `tapCost`). "Cast using teamwork" is the spell being kicked: the kicker's `effect` (We Say Thee Nay!'s {4}) or `targets` (Too Evil to Stay Dead, rule 702.194c), or `castModal.kickedModes` for "choose one; if teamwork, choose both instead" — exactly that many modes, each needing its targets for the kicked cast to be offered. |
| `kicker.keyword: "entwine"` | — | **Entwine [cost]** (rule 702.42 — Tooth and Nail, Kaya's Guile): `kicker: { cost: "{2}", keyword: "entwine" }` with `castModal.kickedModes` set to the number of modes — the entwined cast chooses every mode and pays the extra cost, resolving them in printed order (702.42b). An entwined spell isn't a *kicked* spell to "whenever you cast a kicked spell" (`CardFilter.kicked` counts plain kickers only, as it does gift, bargain and teamwork). The scaffolder reads the line. Copy `pool/gravedig.ts`. |
| `kicker.offering` | `keyword: "offering"`, `cost: ""`, `flash: true`, `offering: CardFilter` | **[Quality] offering** (rule 702.48 — Patron of the Akki, Blast-Furnace Hellkite): an optional additional cost sacrificing a permanent of the quality, so it goes with an alternative cost. The kicked variant is offered once per such permanent, named as the cast's `sacrifice`, at any time an instant could be cast, with that permanent's mana cost off its total cost (a colour first from that colour, any excess then generic; a hybrid half that matters is its own offer by `costOption`, rule 118.7e). No mana cost, as a token's, reduces nothing. Not a *kicked* spell to anything else. The scaffolder reads the line. Copy `pool/patron-of-the-akki.ts`. |
| `kicker.keyword: "buyback"` | — | **Buyback [cost]** (rule 702.27a — Capsize, Searing Touch): `kicker: { cost: "{3}", keyword: "buyback" }`. The kicked cast pays it, labelled "buyback", and the spell goes to its owner's hand instead of the graveyard **as it resolves** — not when it's countered or every target is gone (it doesn't resolve: Elvish Fury's ruling), and a copy (storm's, Reiterate's) ceases to exist as ever. Cast with flashback too, it's exiled. Not a kicked spell to "whenever you cast a kicked spell". Convoke and additional costs pay beside it (Sprout Swarm, Worthy Cause). A non-mana part goes in `kicker.also` (`cost: ""` when there's no mana): `{ text: "Pay 4 life", payLife: 4 }` (Slaughter), `{ text: "Sacrifice a land", sacrifice: { filter: { type: "land" }, count: 1 } }` (Pegasus Stampede — the land that paid the mana may be the one sacrificed), `{ text: "Pay 3 life, Discard a card at random", payLife: 3, discard: 1, discardAtRandom: true }` (Flowstone Flood); the kicked variant is offered only while every part can be paid, and `text` labels it. Life and a random discard are paid as it's cast, a chosen discard and the sacrifice asked then. `set-exo-batch-1.test.ts`. The scaffolder reads the line. `buyback.test.ts`. |
| `splice` | — | **Splice onto Arcane / onto instant or sorcery [cost]** (rule 702.47 — Desperate Ritual, Everdream, Goryo's Vengeance): `splice: { onto: "arcane" \| "instant-or-sorcery", cost: "{1}{R}" }` beside the card's own `targets` and `effect`, written as for any instant — they are what's spliced. A cost that isn't mana is `cost: ""` and `also`, a `KickerAlsoCost` (`exileFromGraveyard`, `tapUntapped`, `sacrifice`, `returnToHand`, `opponentGainsLife`, with its `text` for the offer — Horobi's Whisper, Hundred-Talon Strike, Torrent of Stone, Veil of Secrecy, Roar of Jukai), each spliced card's paid in turn as the spell is cast. As a spell of that quality is cast, every set of up to four such cards in hand is its own cast variant (the offer's `splice`, the cast's `splice` ids): their costs added, their targets after the spell's own, their effects followed after its own (702.47b), the cards revealed and left in hand; the spell keeps them until it leaves the stack, a copy too. A spell whose every target is gone does nothing, spliced text included. Only onto a spell with one plain `effect` (not modal, fused, divided or `resolve`), and not with overload. A **mana** cost only: a non-mana splice cost (Horobi's Whisper's "exile four cards from your graveyard", Veil of Secrecy's "return a blue creature") is `cost:splice-non-mana`. A card with no mana cost (Evermind) is only ever spliced. The scaffolder reads the line. `keyword-splice.test.ts`. |
| `overload` | `{ cost, effect }` | **Overload** (rule 702.126 — Cyclonic Rift). An alternative cost that *replaces* the mana cost entirely (unlike kicker's additive cost) and takes **no targets** — `effect` is the whole "each ..." version of the card (typically a `-all` `EffectSpec`, e.g. `return-to-hand-all`/`destroy-all`), applied with the printed `targets`/`effect` untouched for the ordinary cast. `legalActions` offers the card twice. |
| `mutate` | `string` (the cost) | **Mutate** (rule 702.140): `mutate: "{3}{G}"` — an alternative cost (offered as the cast's `overload` variant, labelled "mutate") that targets a non-Human creature with the spell's owner (`MUTATE_TARGET`). Resolving with its target legal, the controller chooses on top or underneath (a mode choice) and it **merges** (rule 730, `GameObject.merged`): the same object, not a new entry (no enters triggers, summoning sickness and counters kept), with the topmost card's characteristics (730.2a) and every card's abilities (702.140e — `rulesTextName` names a combined definition `CardRegistry` builds). With its target gone it's an ordinary creature spell (702.140b). "Whenever this creature mutates" is the trigger `{ on: "mutates", who: "self" }` (every component's fires), "whenever a creature you control mutates" `who: "you-control"`; "the number of times this creature has mutated" the amount `{ timesMutated: "source" }`; "if it has mutate" the filter `hasMutate: true`. Leaving the battlefield, it comes apart: every other card goes to the same zone, a token component ceases to exist (730.3). Not built: casting with mutate from a zone other than the hand (Brokkos), the owner ordering the cards (730.3a), a face-down or double-faced component. `mutate.test.ts`. |
| `bestow` | `string` (the cost) | **Bestow** (rule 702.103): `bestow: "{3}{B}"` — an alternative cost (offered as the cast's `overload` variant, labelled "bestow") that makes the spell an Aura with enchant creature (`BESTOW_TARGET`, any creature): no creature on the stack or the battlefield, its only subtype Aura (`GameObject.bestowed`, `bestowedDefinition` — the layer fold's starting point, so a "creature spell" filter or counterspell doesn't see it). It enters attached to its target; with that target illegal as it begins resolving it resolves as the creature instead (702.103e). Once unattached — the creature gone, or no longer one it can enchant — it's a creature again where it is, not put into the graveyard (702.103f). Its "enchanted creature gets …" is an ordinary `affects: { scope: "attached" }` static, which reaches nothing while it's a creature; "this creature can't block" a `"self"` one, which is idle while it's an Aura. Not built: bestow with another cost or from the graveyard (Detective's Phoenix), phasing in unattached (702.103g), and protection from creatures read at the cast (a bestowed spell's target is checked against the creature card until it's on the stack). `bestow.test.ts`. |
| `alternativeCost` | `{ mana, tapCreatures?: { count, filter }, exileFromHand?: { filter, count?, text }, sacrifice?: { filter, count?, text }, returnToHand?: { filter, count?, text }, payLife?, othersGainLife?: { amount, who: "an-opponent" \| "each-other-player" }, condition? }` | an alternative cost that replaces the mana cost (rule 118.9) — Snuff Out's "if you control a Swamp, you may pay 4 life" (`payLife` + `condition`), Invigorate's "you may have an opponent gain 3 life" (`othersGainLife`: a cast variant per opponent; one who can't gain life can't pay it, one whose gain is replaced can), Sephara's "pay {W} and tap four untapped creatures you control with flying rather than pay this spell's mana cost" (`tapCreatures`, rule 601.2b), and the **pitch spells**' "[if it's not your turn,] you may [pay 1 life and] exile a blue card from your hand rather than pay this spell's mana cost": `mana: "{0}"`, `exileFromHand: { filter: { colors: ["U"] }, text: "a blue card" }` (`count: 2` for Fury of the Horde's "two red cards"), `payLife: 1` (Force of Will), `condition: { kind: "not", of: { kind: "your-turn" } }` (the MH1 Forces). Offered as a second `cast-spell` variant (`altCost: true`), the same shape `kicked`/`overload`/`free` use, and only when all of it can be paid — never with no *other* such card in hand; the caster picks what it taps, as for `tapOthers`, and which card it exiles once the spell is on the stack (a plain `choose-from-zone` exile, nothing revealed). Copy `pool/force-of-will.ts`. **Sacrifice or return permanents** rather than pay (Mercadian Masques' free spells, rule 118.9): `sacrifice: { filter, count?, text }` — Crash's "you may sacrifice a Mountain" (`{ filter: { type: "land", subtype: "Mountain" }, text: "a Mountain" }`), chosen as the cost is paid with the `sacrifice` decision, as a cost sacrifice of several is — and `returnToHand: { filter, count?, text }` — Thwart's "return three Islands you control to their owner's hand", the Borderposts' "pay {1} and return a basic land you control" (`mana: "{1}"`), chosen with `choose-permanents` as an activated ability's `returnToHand` cost is. Each is offered only while the caster controls that many; neither goes beside another cost that asks as it's paid. Copy `pool/crash.ts`, `pool/thwart.ts`; the scaffolder reads both for lands of a basic type or basic lands. |
| `asCast` | `({ condition } \| { amount })[]` | **Facts fixed as this spell finishes being cast** (rule 601.2i), read as it resolves by index through the condition `{ kind: "as-cast", fact }` and the amount `{ asCast: fact }`, whatever has changed since: "if you controlled a Mount as you cast this spell" (Steer Clear: `asCast: [{ condition: { kind: "controls", filter: { subtype: "Mount" }, atLeast: 1 } }]`, `amount: { ifCondition: { kind: "as-cast", fact: 0 }, then: 4, else: 2 }`), "for each modified creature you controlled as you cast this spell" (Lethal Exploit: `asCast: [{ amount: { countOf: … } }]`). Read once its mana is paid, on the spell itself (a permanent's "if … as you cast" is `kicker.orControls`); a copy has none, not having been cast (rule 707.10). A cost it pays after the announcement (`additionalCost`'s sacrifice) comes later. |
| `castOnlyIf` | `StaticCondition` | "You can't cast this spell unless …" — checked from whatever zone it's cast, the command zone included (Rakdos, Lord of Riots' "unless an opponent lost life this turn" is `{ kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 }`). An instruction to cast it doesn't get past it. |
| `splitSecond` | `boolean` | Split second (rule 702.61): while this spell is on the stack, nobody can cast other spells or activate abilities that aren't mana abilities. Put "Split second" in `text`; triggered abilities still trigger. |
| `flashIf` | `{ condition?: StaticCondition, targets?: CardFilter }` | A spell's own conditional flash: "You may cast this spell as though it had flash if you control a Human" / "This spell has flash as long as you control a Merfolk" / spell mastery's "If there are two or more instant and/or sorcery cards in your graveyard, …" (`condition`, read from the caster's side as the cast begins — rule 601.3d; Hungering Yeti, Crashing Tide, Swift Reckoning), "…if it targets a permanent you control" / "…if it targets a commander" (`targets`, `you` the caster: one chosen target must match — 601.3b, 601.6; Flash Photography, Timely Ward). Every part given must hold. Only timing changes, and a flashback cast keeps it. A *permanent's* "~ has flash as long as …" (Colossal Rattlewurm) is its keyword on the battlefield too: add a self `grantKeywords: ["flash"]` static with the same condition beside `flashIf`. No X cap yet ("if X is 3 or less" — Silver Scrutiny). The scaffolder reads the three phrasings. `conditional-flash.test.ts`. |
| `freeCastIf` | `{ condition: StaticCondition }` | a conditional free-cast permission printed on the spell itself (the CMM commander-precon cycle — Fierce Guardianship: "If you control a commander, you may cast this spell without paying its mana cost."). Unlike `overload`, targets/effect are completely unchanged — only the cost differs, and it's *in addition to* the normal cast, not instead of it. `legalActions` offers the card twice whenever the condition is currently met. |
| `convoke` | `boolean` | **Convoke** (rule 702.51 — Chord of Calling, Hour of Reckoning). A pure payment-*method* choice made as the spell is cast (`Action.convoke: ConvokePayment[]`, each `{ creature, pays?: "generic" \| Color }` — omit `pays` and the engine puts the creature where it helps most; a token stack is named once per token) — tap untapped creatures instead of mana for part of the cost. A convoking creature can't also tap for mana. Doesn't change the printed cost, targets, or effect; not enumerated as a second `cast-spell` variant — the one `LegalAction` carries `convoke: { candidates, maxGeneric, proof, manaAffordable, maxCreatures, xProof?, copies? }` (every untapped creature the caster controls) instead. Convoke pays for `{X}` too (Chord of Calling): `xCost.maxX` counts the creatures that could convoke, the cast is checked at the X chosen, and `xProof` is a payment proved at that largest X — `convokeProofFor(offer, x)` trims it to any smaller one. |
| `improvise` | `boolean` | **Improvise** (rule 702.126a — Maverick Thopterist, Reverse Engineer): "for each generic mana in this spell's total cost, you may tap an untapped artifact you control rather than pay that mana." Convoke's machinery with artifacts for creatures: the offer's `convoke` carries `improvise: true`, its `candidates` are the caster's untapped artifacts and `maxCreatures` only the generic part; each entry pays `"generic"` (a coloured `pays` is refused, the rulings). Improvised artifacts aren't "convoked by" (Lethal Scheme). Not an additional or alternative cost (702.126b). `improvise.test.ts`. |
| `delve` | `boolean` | **Delve** (rule 702.66 — Treasure Cruise). Like `convoke`, a payment choice made as the spell is cast: `Action.delve` names cards in the caster's graveyard (never the spell itself) to exile, each paying {1} of the *total* cost's generic mana — so kicker and cost increases count, and it combines with flashback (rulings). The one `cast-spell` `LegalAction` carries `delve: { choices, minCards, maxCards }`: every card it could exile, the fewest that leave the rest payable with mana (0 when mana pays it all), and one per generic mana. Delve pays X too: `xCost.maxX` counts what the graveyard can pay, and an `{X}` spell's offer adds `byX` (the same two numbers at each X — `delvePicks(offer, x, …)` reads it). Not combined with convoke: a spell with both reaches the higher X of the two alone. "Spells you cast have delve" is §10's `spellsHaveDelve` (Teval, Arbiter of Virtue). |
| `assist` | `boolean` | **Assist** (rule 702.132a — Charging Binox, Gang Up). Another player may pay any of the generic mana in the spell's *total* cost (cost increases and reductions included, X too — the rulings), never its coloured mana. Nothing else to write: the engine offers each cast again once per other player whose mana could help (the offer's `assist`, `assistMax`), a cast naming one waits on that player's `choose-number`, and the caster pays the rest — or the cast is undone (rule 733.1). The keyword line's reminder text is `text` only; the spell's mana cost and mana value are its own. |
| `opponentChoosesTargets` | `number[]` | **"Target … of an opponent's choice"** (rule 601.2c — Evangelize `[0]`, Volcanic Offering `[1, 3]`): the target slots an opponent chooses. Nothing else to write: each cast is offered once per opponent who could (the offer's `otherChooser`, the caster's own slots only), and the named opponent answers a `choose-targets` mid-cast; the targets stay the caster's, legal as the caster would choose them. "…they control" is the slot's filter `controlledBy: "chooser"` (`{ kind: "permanent", filter: { type: "creature", controlledBy: "chooser" } }`). Also on an `ActivatedAbility` (Magus of the Arena `[1]`). Not on a triggered ability — its `targetsChosenBy` names a player the event fixes. |
| `maxX` | a `selfCostReduction` amount | "X can't be greater than …" on a spell with {X} in its cost, read as X is chosen and not again (rule 601.2b): Open the Way's "the number of players in the game" is `{ playersInGame: true }`. It caps an X an additional cost's act announces too: Soul Immolation's "the greatest toughness among creatures you control" is `{ aggregate: "max", of: "toughness", filter: { type: "creature", controlledBy: "you" } }`. |
| `minX` | `number` | "X can't be 0" on a spell with {X} in its mana cost (Mind Grind: `minX: 1`): the least X on offer (rule 601.2b). A cast that pays no {X} (free, cascade, an alternative cost without X) has X 0 by rule 107.3b, so the card can't be cast that way at all (Mind Grind's ruling). A kicker's is `kicker.minX`, an ability's its own `minX`. |
| `selfCostReduction` | `{ condition: StaticCondition, reduceGeneric }` | a reduction printed on the spell itself, gated on board state (rule 601.2f — Ferocious, Finale of Devastation: "if you control a creature with power 4 or greater, this spell costs {2} less"). Unlike a `StaticAbility.costModification` (a permanent reducing *other* spells) this is evaluated for the card being cast, from whatever zone — no permanent has to be on the battlefield granting it. `reduceGeneric` accepts a live count too (`{ countOf: CardFilter }` — Blasphemous Act: "{1} less for each creature on the battlefield", `{ type: "creature" }` with no `controlledBy` counts every player's) and `{ amongPlayers: "greatest", who: "each-opponent", of: { countOf: <filter with controlledBy "you">, forEachPlayer: true } }` (the most any one opponent controls, not the sum — Cavern-Hoard Dragon's "where X is the greatest number of artifacts an opponent controls") and an aggregate (`{ aggregate: "sum", of: "power", filter: { type: "creature", controlledBy: "you" } }` — Ghalta, Primal Hunger's "{X} less, where X is the total power of creatures you control"; clamped at 0) and `{ playerCounters: "experience" }` (Mizzix of the Izmagnus's "{1} less for each experience counter you have") and `{ turnStat, who }` (a turn stat summed over players — Rakdos, Lord of Riots' "{1} less for each 1 life your opponents have lost this turn" is `{ turnStat: "life-lost", who: "each-opponent" }`; a `costModification`'s `reduceGeneric` takes the same amounts). `condition` is mandatory; a reduction with no real "if" clause uses `{ kind: "controls", filter: {}, atLeast: 0 }` (trivially always true). **Affinity for [something]** (rule 702.41a — "{1} less for each [something] you control") is `affinity(filter)` from `helpers.ts`, which writes exactly that (`selfCostReduction: affinity({ type: "artifact" })`); `{ turnHistory, filter?, times? }` is `times` per entry in one of the caster's this-turn lists — Dargo's "{2} less to cast for each other artifact or creature you've sacrificed this turn" is `{ turnHistory: "sacrificed", filter: { typesAnyOf: ["artifact", "creature"] }, times: 2 }` with an always-true condition (`{ kind: "controls", filter: {}, atLeast: 0 }`); affinity *granted* to other spells ("instant and sorcery spells you cast have affinity for creatures") is the static `grantAffinity(spells, filter, text)`, a `costModification` counting the caster's permanents — two grants both apply, as two instances of affinity do (702.41b). More amounts, here and on a `costModification` or an ability's `costReduction`: `{ countOf, excludeSelf: true }` ("each other artifact" — Tamiyo's Logbook), `{ allCounters: true }` (Lumbering Megasloth), `{ colorsAmong: filter }` (Vivid), `{ countInGraveyard: { ownedBy: "you" }, sameNameAs: "priced" }` (Locket of Yesterdays; a spell cast from that graveyard doesn't count itself), `{ cardTypesSharedWith: "exiled-with-source", of: "priced" }` (Cemetery Prowler: the card types that spell shares with the cards exiled with this permanent, each once), `{ powerOf: "source" | "attached" }` (The Scarlet Witch, Glamdring), `{ commanderManaValue: "battlefield-or-command-zone" }` (the Visions cycle), `{ sum: [...] }` (Gargantuan Leech), `{ scaled, by }` (Draco's {2} a type), `turnHistory`'s `who: "any-player"` (The Balrog; "creature that died this turn" is `{ turnHistory: "died", who: "each-player", filter: { type: "creature" } }`) and `cardTypes: true` (Korvold), and the turn stat `"energy-paid-or-lost"`. "Creature attacking you" is `{ countOf: { type: "creature", attackingYou: true } }`. **A list** is several reductions judged apart (Assassin's Ink). **Coloured**: `reduceColored: "{U}"`, with `reduceGeneric` for "{2}{U} less" (Stormwing Entity) and `reduceColoredTimes` per unit (Khalni Hydra), `coloredOnly?` as a `costModification`'s. `thisWay: "flashback"` is "costs {X} less to cast this way" after a printed flashback cost. needed-cards P10, P19. |
| `targetCostReduction` | `{ filter: CardFilter, reduceGeneric: number }` | "This spell costs {N} less to cast if it targets …" (Price of Fame: `{ supertype: "legendary", type: "creature" }`; Magnificent End's and Fantastic Bounce's `{ type: "creature", tapped: true }`; Thing Swing's "a Hero you control", `controlledBy` read from the caster's side; Lullmage's Domination's "a creature whose controller has eight or more cards in their graveyard", the filter clause `controllerGraveyardAtLeast: 8`). The total cost is fixed once targets are chosen (rules 601.2c, 601.2f): the cast pays less when one of its targets matches. An offer the caster can afford only with the reduction offers, in the one slot that can earn it, only the targets that do. `reduceColored` takes coloured mana too (Brush Off's {1}{U}: `reduceGeneric: 1, reduceColored: "{U}"`). One read off an activated ability's target (Belt of Giant Strength's equip) isn't this. |
| `cantBeCountered` | `boolean` or a `StaticCondition` | A condition is "if …, this spell can't be countered" (Spell mastery — Exquisite Firecraft), read from the spell's side as something would counter it. |
| `targetCostIncrease` | `{ filter: CardFilter, increaseGeneric: number }` | "This spell costs {N} more to cast if it targets …" (Dragon's Prey, Vanish into Eternity). Added before any reduction (rule 601.2f), once however many targets match; a target its caster can't afford this way isn't offered. |
| `flashback` | `{ cost, payLife?, sacrifice? }` | cast from graveyard, then exiled (rule 702.34). `payLife` is part of the cost (Deep Analysis's "Flashback—{1}{U}, Pay 3 life"), so it gates castability and is paid as the spell is cast. `sacrifice: { filter, count }` is a flashback cost that sacrifices permanents — Dread Return's "Flashback—Sacrifice three creatures" is `{ cost: "", sacrifice: { filter: { type: "creature" }, count: 3 } }`, and `count: "x"` Firecat Blitz's "Flashback—{R}{R}, Sacrifice X Mountains", an X announced for that cast which the spell reads — chosen as the cost is paid, after the targets (so none of them can be what it returns). `behold: BeholdSpec` beholds as part of it — Kindle the Inner Flame's "Flashback—{1}{R}, Behold three Elementals" is `{ cost: "{1}{R}", behold: { filter: { subtype: "Elemental" }, text: "three Elementals", count: 3 } }` (`additionalCost.behold`). |
| `rebound` | `boolean` | **Rebound** (rule 702.88 — Ephemerate). An instant or sorcery cast from its owner's hand is exiled as it resolves instead of going to the graveyard, and a delayed trigger at its controller's next upkeep offers to cast it from exile without paying its mana cost (a `cast-now`, timing ignored). Not when it's countered or doesn't resolve, and never for a copy; cast the second time from exile, it goes to the graveyard as usual. "If this spell was cast from your hand" in its text is the `source` condition `{ castFrom: "hand" }` (Transpose). Nothing grants rebound yet (Ojer Pakpatiq). |
| `cipher` | `boolean` | **Cipher** (rule 702.99 — Gatecrash, Dragon's Maze: Shadow Slice, Hidden Strings). As the last step of the spell's resolution — after its other effects and any decision they asked — its controller may exile it encoded on a creature they control (a `choose-permanents` of up to one, not a target; no creature, no question). Then, for as long as the card stays exiled and the creature on the battlefield (702.99c), the creature has "whenever this creature deals combat damage to a player, you may copy the encoded card and you may cast the copy without paying its mana cost" (`GameObject.encodedCards`, read by `effectiveTriggeredEntries`; a `cast-now` with `encoded`), controlled by whoever controls the creature. Encoding on nothing sends it to the graveyard as usual; a copy is never encoded, and a spell that doesn't resolve isn't either. The scaffolder writes it. |
| `sneak` | `{ cost }` | **Sneak** (rule 702.190 — Raphael, the Nightwatcher). An alternative cost: in its caster's declare blockers step, at instant speed (a sorcery too), from the hand or — a commander — the command zone, for `cost` and returning an unblocked creature they control to its owner's hand. Offered once per such creature (`LegalAction.sneakReturn`, the action's `sneakReturn`); a permanent cast this way enters tapped and attacking what that creature was attacking (702.190b — `GameObject.sneakAttacking`), and never "attacks" for an attack trigger (the ruling). |
| `webSlinging` | `{ cost }` | **Web-slinging** (rule 702.188 — Spider-Man, Web-Slinger). An alternative cost: from the hand or — a commander — the command zone, under every normal timing rule (a creature at sorcery speed), for `cost` and returning a tapped creature the caster controls to its owner's hand. Offered once per tapped creature (`LegalAction.webSlingingReturn`, the action's `webSlingingReturn`; one token of a stack is split off); a creature its controller taps for mana first is tapped by then, so it can be the one returned (the ruling). Never with another alternative cost (a free cast, Fist of Suns, evoke, overload); a cost increase is paid on top, and so is commander tax. The spell's `castVia` is `"web-slinging"` (a `source` filter's `castVia` — Spiders-Man, Heroic Horde), and "X is the mana value of the returned creature" is an `enters-battlefield` replacement's `counters: { kind: "+1/+1", amount: "web-slinging-mana-value" }` — that creature as it last existed on the battlefield, 0 when not web-slung (Scarlet Spider, Ben Reilly). |
| `emerge` | `{ cost, from? }` | **Emerge** (rule 702.119 — Elder Deep-Fiend, Wretched Gryff). An alternative cost: from the hand or — a commander — the command zone, under every normal timing rule, "paying `cost` and sacrificing a creature rather than paying its mana cost", the total cost then reduced by generic mana equal to that creature's mana value (after any increase, 601.2f; never the coloured part). `legalActions` offers it once per creature that could be sacrificed and that makes it affordable (`emergeSacrifice`), each echoed back as the cast's `sacrifice`; the creature taps for mana first where it can, then is sacrificed (a `permanent-sacrificed` event — its dies triggers fire). `from` is **emerge from [quality]** (702.119b — Crabomination's `{ type: "artifact" }`). "When you cast this spell" is the `this-cast` trigger. Not built: granting emerge (Herigast), reading whether the emerge cost was paid or the sacrificed creature as the permanent enters (Adipose Offspring), and an emerge card with a sacrifice cost of its own (refused). |
| `mayhem` | `{ cost? }` | **Mayhem** (rule 702.187 — Marvel Super Heroes). While you discarded this card this turn, you may cast it from your graveyard for `cost` instead of its mana cost: an alternative cost, so timing rules still apply (a creature at sorcery speed). Without a `cost` the card is *played* from your graveyard (702.187c): a land with mayhem uses a land play (Oscorp Industries). "Discarded this turn" is `GameObject.discardedOnTurn`, stamped as `cards-discarded` is announced and cleared by any other zone change (400.7). Cast offers carry `via: "mayhem"`. Nothing grants mayhem yet, and cost changes don't yet name a graveyard cast (Norman Osborn waits on both). |
| `mayPlaySelf` | `{ from, if?, …PlayTerms }` | The card's own "you may cast this card from your graveyard [as long as …] [by …]" or "… from exile" (rule 113.6f); see **`mayPlay` / `grant-play` / `impulse-exile`** in §6. |
| `castWhileSearchingLibrary` | `true` | "While you're searching your library, you may cast this card from your library" (Panglacial Wurm; rule 601.3): offered as a `cast-now` as each search of its owner's own library begins, before anything is found, at its normal cost, timing ignored, the library looked at; the search then goes on and the spell waits on the stack. Any number of them. |
| `foretell` | `{ cost }` | pay `{2}` to exile face-down, cast later for `cost` |
| `plot` | `{ cost }` | **Plot** (rule 702.170 — Aloe Alchemist's "Plot {1}{G}"): a special action (116.2k) — any time its owner has priority in their main phase with the stack empty, pay `cost` and exile it from the hand, face up. It's then **plotted** (`GameObject.plottedOnTurn`): on any *later* turn its owner may cast it from exile without paying its mana cost, as a sorcery even if it's an instant (`via: "plot"`; additional costs such as kicker or spree are paid on top, X is 0). Leaving exile ends it. "When this card becomes plotted" is a `this-plotted` trigger (§9); effects that make a card plotted are `become-plotted` and `exile-spell-as-it-resolves`'s `plotted` (§6). A card needn't have plot to be plotted (702.170d). "Plotting cards from your hand costs {2} less" (Doc Aurlock, Grizzled Genius) is a static's `plotCostReduction: 2`: generic mana only (118.7a), for its controller's plotting; the offer's `cost` is the reduced one. |
| `prototype` | `{ cost, power, toughness }` | **Prototype** (rule 718 — Combat Thresher's "Prototype {2}{W} — 1/1"): not an alternative cost, but a variant of every cast (`prototype: true` on the `cast-spell` offer). Cast that way the spell has the prototype mana cost, that cost's colors and that power/toughness — copiable values, so a copy of the spell or the permanent has them too — from the stack onto the battlefield, and is its printed self everywhere else. Its legality and cost are worked out as the prototyped spell (a white {2}{W} spell, mana value 3). |
| `blitz` | `{ cost }` | **Blitz** (rule 702.152a — Star Athlete, Jaxis, the Troublemaker): an alternative cost from the hand — or a commander from the command zone, its tax added — offered as a `cast-spell` with `via: "blitz"`. The permanent it becomes gets haste and "when this creature dies, draw a card" on a modifier (not copiable, so a copy of it gets neither — the rulings), and a delayed trigger sacrificing it at the beginning of the next end step. Not offered from anywhere else a card may be cast from (an impulse permission, a graveyard). |
| `dash` | `{ cost }` | **Dash** (rule 702.109a — Ragavan, Nimble Pilferer, Screamreach Brawler): an alternative cost from the hand — or a commander from the command zone, its tax added — offered as a `cast-spell` with `via: "dash"`. The permanent it becomes has haste on a modifier (not copiable — a copy has neither haste nor the return, the rulings) and a delayed trigger returning it to its owner's hand at the beginning of the next end step, which finds nothing once it has left the battlefield. Not offered from anywhere else a card may be cast from. "Dash costs you pay cost {2} less" (Warbringer) isn't built. |
| `moreThanMeetsTheEye` | `{ cost }` | **More Than Meets the Eye [cost]** (rule 702.162a — Slicer, Hired Muscle): on both faces of a transforming card (`transform: true`, `faces`), read off the front. An alternative cost from the hand, or a commander from the command zone, offered as a `cast-spell` with `via: "more-than-meets-the-eye"` and `face: 1`: the card goes on the stack converted, its back face up (712.11a), its mana value still its front's (712.8c), and enters that way. Convert is `transform` (701.28a). **Living metal** (702.161a) is the back face's static `{ affects: { scope: "self" }, condition: { kind: "your-turn" }, addTypes: ["creature"] }`. |
| `impending` | `{ count, cost }` | **Impending N—[cost]** (rule 702.176a — the Overlords of Duskmourn): an alternative cost from the hand, or a commander from the command zone, offered as a `cast-spell` with `via: "impending"`. Cast that way, the permanent enters with `count` time counters, put on before anything sees it arrive, so "whenever a creature enters" doesn't trigger for it. Its other two abilities are the card's own: spread `impendingAbilities()`'s `static` (not a creature while it has a time counter) and `triggered` (your end step removes one) into the card. Both read the `impending` condition, so a copy, which wasn't cast that way, is a creature (the ruling). |
| `freerunning` | `{ cost }` | **Freerunning [mana cost]** (rule 702.173a — Eagle Vision): an alternative cost from the hand, or a commander from the command zone, offered as a `cast-spell` with `via: "freerunning"` once a player was dealt combat damage this turn by an Assassin creature or a commander you controlled as it dealt it (`TurnHistory.freerunning` — it doesn't matter what happens to that creature after). "If this spell's freerunning cost was paid" is a `source` condition on `{ castVia: "freerunning" }`. Not built: a non-mana freerunning cost (Escape Detection), a static granting freerunning (Ezio). |
| `harmonize` | `{ cost }` | **Harmonize** (rule 702.180a — Zenith Festival, Nature's Rhythm): cast from its owner's graveyard for `cost`, tapping up to one untapped creature they control, whose power comes off the total cost's generic mana (`{X}` included, never coloured mana); exiled instead of going anywhere else from the stack. Each creature it could tap is its own `via: "harmonize"` variant (offer `harmonizeTap: { object, cardName, power }`, echoed as the cast's `tap: [object]`), plus one tapping none (702.180b). |
| `madness` | `{ cost }` | **Madness** (rule 702.35a — Kitchen Imp, Terminal Agony): discarded from its owner's hand by anything (an effect, a cost, cycling, the cleanup step, a held 101.4 discard), it's exiled instead of put into the graveyard (`Game.moveDiscarded`) — still a discard to everything watching for one — and its trigger (`cards/madness.ts`) offers its owner the cast for `cost` as an alternative cost (702.35b, so the only one; kicker on top), ignoring timing, then puts it into the graveyard if it wasn't cast or couldn't be. A mana cost only: Shadowgrange Archfiend's "Madness—{2}{B}, Pay 8 life" isn't expressible. The scaffolder reads the keyword line. `madness.test.ts`. |
| `discardedByOpponentEnters` | `{ withCounters? }` | "If a spell or ability an opponent controls causes you to discard this card, put it onto the battlefield [with two +1/+1 counters on it] instead of putting it into your graveyard" (Obstinate Baloth, Dodecapod's `withCounters: { kind: "+1/+1", amount: 2 }`). Whoever chose the card (the ruling), never your own spell, a cost or cleanup; still a discard to everything watching for one. |
| haunt | helpers | **Haunt** (rule 702.55 — Blind Hunter, Seize the Soul): on a permanent, `haunt()` in `triggered` ("when this creature dies, exile it haunting target creature" — an `exile` of `"trigger-object"` with `haunting: 0`, which records `GameObject.haunting`); on an instant or sorcery, `hauntSpell()` (its trigger `this-resolved-into-graveyard`, queued as the resolved card lands in its owner's graveyard, never when it's countered). "When the creature it haunts dies" is a `{ on: "haunted-dies" }` trigger, which works from exile and only there (702.55c); "when this creature enters or the creature it haunts dies" is an `enters-battlefield` trigger and a `haunted-dies` one with `sameAbilityAs`. From exile, "each other creature" leaves nothing out (`become`'s `exceptSource`). `haunt.test.ts`. |
| `miracle` | `{ cost }` | **Miracle** (rule 702.94a — Thunderous Wrath, Bonfire of the Damned, Temporal Mastery): drawn as its owner's first card this turn (on any turn), the card's owner is asked whether to reveal it (`miracle-reveal`, as its trigger would be placed); revealed, its trigger (`cards/miracle.ts`) offers the cast from hand for `cost`, an alternative cost (kicker or squad on top; X in the cost is chosen as usual, and the mana value is still the mana cost's), ignoring timing. Declined, the card stays in hand. A card that has left the hand by then isn't offered (400.7). Not yet: a static granting miracle (Lorehold, Molecule Man, Aminatou). The scaffolder reads the keyword line. `miracle.test.ts`. |
| `warp` | `{ cost, payLife?, fromGraveyard? }` | **Warp** (rule 702.185 — Starfield Vocalist): an alternative cost from the hand, offered as a `cast-spell` with `via: "warp"`. The permanent it becomes gets a delayed trigger exiling it at the beginning of the next end step (it finds nothing if the permanent left and came back), and its owner may cast the exiled card for its mana cost from the next turn on, for as long as it stays exiled. `payLife` is life in the warp cost ("Warp—{B}, Pay 2 life"), `fromGraveyard: true` "You may cast this card from your graveyard using its warp ability" (Timeline Culler: both) — from its owner's graveyard for the warp cost only, a graveyard cast for what counts those. |
| `evoke` | `{ cost }` | **Evoke** (rule 702.74 — Mulldrifter): an alternative cost, offered as the cast's `evoke` variant (echoed back with its `evokeCost`) wherever the card may be cast for its mana cost — the hand, the command zone, an impulse or graveyard permission — beside kicker or an additional cost's branch, never beside overload, a free cast or another alternative cost (118.9a). Paid, the permanent it becomes gets "when this permanent enters, its controller sacrifices it" as it enters. That trigger goes on the stack before its controller's other triggers of the moment (`TriggeredAbility.stackFirst`), so the creature's own enters abilities resolve first, while it's still there — the order the rulings describe; the engine doesn't yet ask (`decision:trigger-order`), so don't author an evoke card whose enters ability would want the other order. The Incarnations' "Evoke—Exile a white card from your hand" is `{ cost: "", exileFromHand: { filter: { colors: ["W"] }, text: "a white card" } }` (`pool/solitude.ts`): the evoke offered only with another white card in hand, which is chosen and exiled as the cost is paid. Put the printed evoke line in `text`. |
| `flashback.discard`, `flashback.keyword: "jump-start"` | — | **Jump-start** (rule 702.133 — Radical Idea): `flashback: { cost: "<the card's mana cost>", discard: 1, keyword: "jump-start" }` — the graveyard cast pays the card's own mana cost and discards a card (offered only with a card in hand, chosen as the cost is paid), and the spell is exiled as it leaves the stack. It rides the flashback cast (`via: "flashback"`, labelled "jump-start"): nothing in the pool tells a jump-started spell from a flashed-back one. The scaffolder reads the line. |
| `flashback.returnToHand`, `flashback.keyword: "beam-me-up"` | — | **Beam me up** (Star Trek, 2026 — Adversary by Algorithm): `flashback: { cost: "<the beam-me-up cost>", returnToHand: { filter: { type: "creature" }, count: 1 }, keyword: "beam-me-up" }` — cast from the graveyard for that cost while returning a creature you control to its owner's hand (offered only with one to return, chosen as the cost is paid, 601.2h, the way `additionalCost.also.returnToHand` is), then exiled as it leaves the stack. Rides the flashback cast (`via: "flashback"`, labelled "beam me up"). The scaffolder reads the line. |
| `flashback.tapCreatures`, `flashback.discard` | `{ count, filter }`; a number or `"x"` | The rest of a flashback cost (rule 702.34a), beside its `cost`: "Flashback—Tap three untapped white creatures you control" (Battle Screech, `cost: ""`), picked from the cast offer's `tapCost`; "Flashback—{1}{U/R}{U/R}, Discard a card" (Twinned Vision); "Flashback—{R}{R}, Discard X cards" (Conflagrate, `"x"`, an X announced for the cast though the mana has none). |
| `flashback.exileFromGraveyard` | `{ count: number \| "x", filter? }` | "Flashback—{3}{U}{R}, Exile X cards from your graveyard" (Summons of Saruman): cards exiled from the caster's graveyard as part of the flashback cost alone (a cast from hand pays none), never the spell itself, chosen as the cost is paid (601.2h) like `additionalCost.exileFromGraveyard`'s; `"x"` is an X announced for that cast though the flashback's mana has none (rule 107.3a), at most the other matching cards there, which the spell then reads as X. |
| `retrace` | `true` | **Retrace** (rule 702.81a — Raven's Crime, Worm Harvest): cast from its owner's graveyard for its normal costs plus discarding a land card (offered only with a land card in hand, chosen as the cost is paid). Its own cast, `via: "retrace"` (labelled "retrace, discarding a land card"), not flashback's: nothing exiles it, so it goes back to the graveyard to be cast again. A granted retrace (Deeproot Historian, `static:retrace-grant`) isn't built. The scaffolder reads the line. |
| `triggered: [mentor()]` | helper | **Mentor** (rule 702.134 — Legion Warboss): a +1/+1 counter on target attacking creature with lesser power. The scaffolder reads the line. |
| `alternativeCost.discard`, `.exileFromHand.manaValueX`, `.revealHand` | `{ filter, others?, text }`, `true`, `true` | Alternative costs paid from the hand (rule 118.9). **`discard`**: "you may discard a Plains card rather than pay this spell's mana cost" (Abolish: `{ mana: "{0}", discard: { filter: { subtype: "Plains" }, text: "a Plains card" } }`), `others: 1` for Foil's "an Island card and another card" — offered only while the hand holds them besides the spell, chosen as the cost is paid (601.2h), the filtered card first. **`manaValueX`** on `exileFromHand`: the Shoals' "exile a red card **with mana value X** from your hand" — offered once per X a matching card in hand has (`xCost` `minX` = `maxX`), X the value announced (107.3a, 601.2b; the spell's mana value on the stack counts it, 202.3e) and the card exiled of that mana value. **`revealHand`**: Land Grant's "if you have no land cards in hand, you may reveal your hand rather than pay" with `condition: { kind: "hand-size", atMost: 0, filter: { type: "land" } }` (701.20a; `hand-size`'s `filter` counts only matching cards). |
| `alternativeCost.also`, `self-alternative-cost-paid` | `KickerAlsoCost`; condition, `madness?: true` | **`also`**: the non-mana part of an alternative cost in a keyword's shape — "You may pay {1}{W} and exile a creature card from your graveyard rather than pay this spell's mana cost" (Stalwart Valkyrie: `{ mana, also: { text, exileFromGraveyard: { count, filter } } }`); any of `KickerAlsoCost`'s parts, chosen as the cost is paid (601.2h), the cast offered only while all of it can be. **`condition`** takes any `StaticCondition`: "if there are thirteen or more creatures on the battlefield" (Blasphemous Edict), `turn-history` "as long as you've discarded a card this turn" (Asmoranomardicadaistinaculdacar, no `manaCost`, so only that way, rule 118.6a). **`{ kind: "self-alternative-cost-paid" }`**: "if the {2}{R}{R} cost was paid" (Fervent Mastery), the card's own alternative cost and not one another effect offers; `madness: true` is "if this spell's madness cost was paid" (From Under the Floorboards, with X in the madness cost). A `target` condition's filter reads `n: "x"` (Welcome to the Fold). `kicker.keyword: "additional cost"` is "As an additional cost to cast this spell, you may pay {2}{R}" (Undergrowth): `self-kicked` and `kicker.effect` read it, and nothing else sees a kicked spell. |
| A spell gaining an ability | effects with `target: "trigger-object"` or `"source"` | What a cast trigger gives the spell goes on applying to the permanent it becomes (rule 400.7a, a `castRider`). **`grant-keyword`** with `duration: "permanent"`: "it gains riot", and `"rebound"`, a `Keyword` read as the spell resolves (Taigam; Cast Through Time's `grantsToSpells.keywords`). **`grant-triggered`**: it gains "when this creature dies, exile it" (Rivaz, `target: "trigger-object"`), Thief of Existence's own gain (`target: "source"`, the cast trigger's source being the spell). **`enters-with-counters`' `ifAsItEnters`**: "it gains bloodthirst 3" (Bloodlord of Vaasgoth), the condition asked as it enters. `add-mana`'s **`spellGains.lasting`**: "if that mana is spent on a creature spell, it gains riot" (Domri, Chaos Bringer), with no end. |
| `alternativeCost: spectacle(cost)` | helper | **Spectacle [cost]** (rule 702.137 — Skewer the Critics): `alternativeCost: spectacle("{R}")` (`helpers.ts`), an alternative cost offered only once an opponent has lost life this turn, labelled "spectacle {R}". "When this creature enters, **if its spectacle cost was paid**, …" (Rafter Demon) is the `self-spectacle-paid` condition, read like `self-kicked` (the spell's `spectaclePaid`, the permanent's `enteredSpectacle`; a copy keeps it, 707.10). The scaffolder reads both. |
| `alternativeCost: surge(cost)` | helper | **Surge [cost]** (rule 702.117a — Crush of Tentacles, Reckless Bushwhacker): `alternativeCost: surge("{1}{R}")` (`helpers.ts`), an alternative cost offered only once its caster has cast another spell this turn (the condition `{ kind: "cast-this-turn", who: "you", atLeast: 1 }`, read before the spell being cast counts), labelled "surge {1}{R}". No teammates in a free-for-all. "**If its surge cost was paid**, …" / "If this spell's surge cost was paid" is the `self-surge-paid` condition, read like `self-spectacle-paid` (`surgePaid`, `enteredSurge`). The scaffolder reads the keyword line and the trigger condition. |
| `alternativeCost: prowl(cost)` | helper | **Prowl [cost]** (rule 702.76a — Latchkey Faerie, Morsel Theft): `alternativeCost: prowl("{2}{U}")` (`helpers.ts`), offered under the `prowl` condition — a source you controlled dealt combat damage to a player this turn while it had one of this card's creature types (each player's `combatDamageCreatureTypesThisTurn`, recorded as the damage is dealt; a changeling on either side shares every type), labelled "prowl {2}{U}". "If its prowl cost was paid" / "if this spell's prowl cost was paid" is `self-prowl-paid`, read like `self-surge-paid` (`prowlPaid`, `enteredProwl`). The scaffolder reads the keyword line and the trigger condition. |
| `triggered: champion(filter, label, onChampioned?)` | helper | **Champion an [object]** (rule 702.72 — Lorwyn block: Changeling Hero, Mistbind Clique): the two linked triggers, "when this enters, sacrifice it unless you exile another [object] you control" — a `conditional` on `controls … excludeSelf`, a `may`, a `choose-permanents` and a linked `exile`, else `sacrifice-source` — and "when this leaves the battlefield, return the exiled card" (`return-exiled-by-source`). `champion({ subtype: "Faerie" }, "a Faerie")`; spread it (`...champion(…)`) beside a card's other triggers. `onChampioned` is "When a Faerie is championed with this creature, …" (702.72c): a reflexive trigger with its own `targets`, made as the card is exiled. The whole "Champion a …" line, with its reminder, goes in `text`. |
| `triggered: [kinship(effect, text)]` | helper | **Kinship —** (Morningtide's ability word — Waterspout Weavers, Leaf-Crowned Elder): the upkeep "you may look at the top card of your library. If it shares a creature type with this creature, you may reveal it. If you do, [effect]" — a `look-and-choose` of the top card with `filter: { sharesCreatureTypeWith: "source" }`, left on top, `then` the effect (its `target: 0` the revealed card: Leaf-Crowned Elder's `{ kind: "cast-now", target: 0, free: true }`). `text` is the last sentence without its period. The scaffolder reads the line when that sentence has no target. |
| `tribute: N` | card field | **Tribute N** (rule 702.104 — Pharagax Giant, Ornitharch, Nessian Wilds Ravager): `tribute: 2`. As it's about to enter its controller chooses an opponent (asked only among two or more), who chooses whether it enters with N more +1/+1 counters (the `choose-creature-type` decision, `tribute: "opponent"` / `"pay"`). "When this creature enters, **if tribute wasn't paid**, …" is an ETB trigger with the `tribute-not-paid` condition (`tributeUnpaid`, kept in last-known information, so it still resolves once the creature has left). Entering some way that never asked (a token copy) is unpaid. The scaffolder reads the keyword line and the condition. |
| `triggered: [...bushido(n)]` | helper | **Bushido N** (rule 702.45 — Saviors of Kamigawa's Samurai): two triggers, blocks and becomes blocked, sharing one +N/+N until end of turn on the source (Jukai Trainee's shape). The scaffolder reads the line. |
| `static: [sunburst("creature" \| "artifact")]` | helper | **Sunburst** (rule 702.44 — Fifth Dawn: Suntouched Myr, Engineered Explosives, Pentad Prism): a self `enters-battlefield` replacement with `sunburst: true` — a counter per colour of mana spent to cast it, +1/+1 if it's entering as a creature by its copiable types (type-changing effects ignored, 702.44a), charge otherwise; none unless it was cast (702.44b). The argument picks the reminder text's noun. **"Modular—Sunburst"** (Arcbound Wanderer, 702.44c) is always +1/+1 counters: the modular shape with `counters: { kind: "+1/+1", amount: { manaSpentOf: "source", count: "colors" } }`. The scaffolder reads both lines. |
| `triggered: [soulshift(n)]` | helper | **Soulshift N** (rule 702.46 — Kamigawa's Spirits): the dies trigger, "you may return target Spirit card with mana value N or less from your graveyard to your hand" — it may target itself. The scaffolder reads the line. |
| `{ kind: "paradigm" }` | effect | **Paradigm** (rule 702.192a — Germination Practicum, Decorum Dissertation): last in the spell's `sequence`, with `exileOnResolve: true` on the card. The first spell with its name its controller has resolve gives them an emblem: at the beginning of each of their precombat main phases, a copy made in exile that they may cast free. A later one with the name, or the copy itself, only exiles. |
| `{ kind: "epic" }` | effect | **Epic** (rule 702.50 — Enduring Ideal, Endless Swarm): last in the spell's `sequence`. As it resolves its controller can't cast spells for the rest of the game (a `permanent` `prohibit`), and gets an emblem whose upkeep trigger copies the spell as it resolved — targets, {X}, choices — without its epic ability, targets open to change. A Twincast copy keeps epic and sets up its own. `keyword-epic.test.ts`. |
| `triggered: [afterlife(n)]` | helper | **Afterlife N** (rule 702.135 — Ministrant of Obligation): its dies trigger, N `"Spirit Token (White-Black)"`s; each instance triggers on its own. The scaffolder reads the line. |
| `escape` | `{ cost, exileCount, counters?, counterChoice?, exileLinked? }` | cast from graveyard + exile N other graveyard cards. `counters` is "escapes with a +1/+1 counter", `counterChoice: ["+1/+1", "flying"]` "your choice of" one, chosen as it enters (Tizerus Charger; rule 702.138c). "Escapes with [ability]" (rule 702.138d) is a static with `condition: { kind: "source", filter: { castVia: "escape" } }`, and `exileLinked` links the cards this escape exiled to the permanent, for its "cards exiled with this creature" (Skyway Robber). |
| `suspend` | `{ n, cost }` | exile with N time counters; cast free at 0 with haste. `n: "x"` is "Suspend X—{X}{W}{W}. X can't be 0." (Benalish Commander): X announced with the action, at least 1, the cost paid at it, X time counters. A `cast-now` with `suspendCost: true` (its `spell: { hasSuspend: true }`) casts for the suspend cost instead (The Face of Boe), even a card with no mana cost, X announced as it's cast |
| `cycling` | `{ cost, search?, also?, costText? }` | "`cost`, Discard this card: Draw a card" (rule 702.29a) — an activated ability from the hand: the cost paid and the card discarded as it's activated, the draw on the stack, so it can be responded to, countered or copied — and a split-second spell on the stack stops it (rule 702.61a), as it stops any ability that isn't a mana ability. The discard is a real one: every `discards` trigger sees it (Archfiend of Ifnir's "whenever you cycle or discard another card"). With `search` it's **landcycling / typecycling** (702.29f — Migratory Route's "Basic landcycling {2}"): the same ability, a library search into your hand (the card revealed) instead of the draw. "When you cycle this card" is a `this-cycled` trigger (§9 — Dismantling Wave): it goes on the stack above the cycling ability and resolves first (the rulings). A cost that isn't only mana goes in `also`, with `cost: ""` when there's no mana and `costText` for how it reads: Street Wraith's "Cycling—Pay 2 life" is `{ cost: "", also: { payLife: 2 }, costText: "Pay 2 life" }`, Edge of Autumn's `{ cost: "", also: { sacrifice: { filter: { type: "land" } } }, costText: "Sacrifice a land" }`. An `{X}` in `cost` is announced as it's activated (Shark Typhoon's `{ cost: "{X}{1}{U}" }`), and a `this-cycled` trigger reads it as `{ triggerValue: true }`: in `basePt`, `max` of an `any-number` target group (Rampaging War Mammoth), or a filter's `{ amount: { triggerValue: true } }` (Webstrike Elite). Either is offered as an `activate-ability` on the card in hand rather than `cycle`, so the player is asked what it needs; test by `activate(game, card, offer.abilityIndex, { x })`. |
| `moreCycling` | `CyclingAbility[]` | A card's other cycling abilities, each its own, beside `cycling`: "Mountaincycling {2}, forestcycling {2}" (Valley Rannet) is `cycling: { cost: "{2}", search: { subtype: "Mountain" }, name: "Mountaincycling" }` and `moreCycling: [{ … "Forest" … }]`. `name` tells them apart. Each is activated on its own, so the player chooses which as it's activated, and the plain `cycle` action isn't offered. |
| `chapters` | `SagaChapter[]` | a Saga — §12 |
| `readAhead` | `true` | read ahead (rule 702.155 — The Weatherseed Treaty): the Saga's controller chooses a chapter as it enters (the `chooseOnEnter` options "1" to the final chapter, which `defineCard` fills in), it enters with that many lore counters instead of one (714.3b), and the turn it entered only the chapter matching its lore count triggers, so skipped chapters never do (702.155a). "Sagas you control have read ahead" (Barbara Wright) is a static's `grantKeywords: ["read-ahead"]` over `{ subtype: "Saga", controlledBy: "you" }`: a Saga that will have it on the battlefield makes the same choice as it enters, however it gets there (614.12). `read-ahead.test.ts`. |
| `faces` | `string[]` | a multi-face card (front first) — §12 |
| `transform` | `boolean` | a *transforming* DFC (set on both faces) — §12 |
| `flip` | `true` | a flip card (rule 710; set on both halves) — §12 |
| `disturb` | `{ cost }` | cast the back face from the graveyard (front face's def); the back face's "exile it instead" is its own `self` graveyard replacement (§ replacements) |
| `adventure` | `boolean` | an Adventure card (with `faces: [creature, adventure]`); the first face may be a land (Midgar, City of Mako // Reactor Raid), played from exile afterwards rather than cast |
| `asTransformsInto` | `EffectSpec` | "As this permanent transforms into [this face], …", on the face named (rule 712.20): applied while it's transforming, with nothing on the stack, and not when it enters already showing the face. It can't target or ask anything (Sephiroth, One-Winged Angel's emblem). |
| `choosePlayerOnTransform` | `"opponent" \| "player"` | "As this creature transforms into [this face], **choose an opponent**" (rule 712.20 — Shinryu, Transcendent Rival): asked of its controller as the `transform` effect resolves, only among two or more, and kept as its `chosenPlayer`. Not when it enters showing the face. |
| `copyOnEnter` | `CopyOnEnter` — `{ filter, except?, tapped?, counters?, untilEndOfTurn? }` | "You may have this enter as a copy of …" (rule 707.9), asked before it moves however it enters (§15). `filter` is a `CardFilter` over permanents already on the battlefield, from the side of the player it enters under: Clone's "any creature" `{ type: "creature" }`, Sakashima's "another creature you control" `{ type: "creature", controlledBy: "you" }`, Phyrexian Metamorph's `{ typesAnyOf: ["artifact", "creature"] }`, Vesuva's `{ type: "land" }`, Deceptive Frostkite's `power: { op: "gte", n: 4 }`; an `{ amount }` operand reads the entering permanent (Mockingbird: `manaValue: { op: "lte", n: { amount: { manaSpentOf: "source" } } }`). Never itself. `except` is a `CopyExceptions` (the `create-token-copy` row, §6): copiable values, so a copy of the copy has them (Phantasmal Image's `triggered`, Spark Double's `notLegendary`, Sakashima's `legendRuleOff`). A creature subtype added in addition doesn't stick to a copy that isn't a creature (rule 205.3d — Glasspool Mimic's ruling). `tapped` is Vesuva's "enter **tapped** as a copy"; `counters: [{ kind, amount: number \| "x", ifType? }]` is "it enters with an additional counter if it's a creature" (Spark Double) or "X additional counters" (Altered Ego) — both happen only when it copies something, judged by what it became (rules 707.9e–f), and aren't copied by a later copy; a counter's `ifYouControlCopied` is Undercover Operative's "if you control that creature". `untilEndOfTurn` is Cursed Mirror's "become a copy … until end of turn": it's itself again in the cleanup step, and a copy of it made meanwhile keeps being the creature. `from: "graveyards" \| "exile"` copies a card there instead of a permanent — Body Double's "any creature card in a graveyard", Echoing Deeps, Activated Sleeper (`filter`'s `putIntoGraveyardThisTurn`), The Master, Formed Anew (`from: "exile"`, a `counters` filter; a face-down card isn't offered) — asked as a `choose-from-zone`, choosing none being "copy nothing". `condition` is a `StaticCondition` read from the side of the player it's entering under (Protean Raider's raid); unmet, it enters as itself unasked. `whenYouDo: { effect, text }` is the "When you do, …" in the same paragraph (rules 603.11, 707.9g — Superior Spider-Man, Wall of Stolen Identity): no targets, with `"trigger-object"` the copied permanent or card, the same object still. `ownPt` makes the exception's base P/T the entering permanent's own, printed or prototype (Hulking Metamorph). Not yet: The Mimeoplasm's two cards exiled together, and a token copy being asked (Vizier of Many Faces, §15). |
| `becomesOnEnter` | `BecomesOnEnter` — `{ forms: [{ label, as: CopyExceptions }], flip? }` | "As this enters, it becomes your choice of a 3/3 creature with flying, …" (rule 614.1c; Corrupted Shapeshifter, Primal Clay, Primal Plasma), a menu of `label`s asked before it moves; `flip` is Molten Sentry's coin, `forms` heads first. The card's own P/T is its `*`s, 0/0 off the battlefield. The form is a copiable value (rule 707.2): a Clone of one copies it and then chooses over it (the rulings' "1/6 with flying and defender"). Not yet "or is turned face up" (Aquamorph Entity). |
| `omen` | `boolean` | an omen card (rule 720 — Stormshriek Feral // Flush Out): `faces: [creature, Omen]` on both faces, the Omen face a `sorcery`/`instant` with subtype `Omen`. Cast as either; the Omen resolving is shuffled into its owner's library (720.3d) — a copy of one ceases to exist, its owner still shuffling — and countered or fizzled it goes to the graveyard. Scryfall files these under the adventure layout; the scaffold writes `omen`. |
| `controlEnchanted` | `boolean` | an Aura whose controller controls the enchanted permanent (Mind Control) |
| `cantBeCountered` | `boolean` | "This spell can't be countered." |
| `colorsOutsideIdentity` | `true` | "~ is all colors. This ability doesn't affect its color identity." (Fallaji Wayfarer): `colors` lists what the characteristic-defining ability gives it (rule 604.3, in every zone, as Transguild Courier's plain "is all colors" does), and this keeps them out of the colour identity (rule 903.4), which is then the card's mana symbols alone. |
| `cantBeCopied` | `true` | "This spell can't be copied." (See Double): a copy effect aimed at it (rule 707.10 — Twincast, storm, a copy of its own) makes nothing; it's still a legal target. An activated ability's "This ability can't be copied" is the ability's own `cantBeCopied: true` (Gogo, Master of Mimicry). |
| `flashThenSacrifice` | `true` | The Mirage block's "You may cast this spell as though it had flash. If you cast it any time a sorcery couldn't have been cast, the controller of the permanent it becomes sacrifices it at the beginning of the next cleanup step" (Spider Climb, Parapet, Armor of Thorns). It may be cast any time; a cast that only this permission allowed — not at sorcery timing, not by an effect's "cast it now", nor under another effect's "as though it had flash" (Vedalken Orrery: the ruling) — marks the spell (`GameObject.flashSacrificeOwed`), and the permanent it becomes gets a `"next-cleanup"` delayed sacrifice, which finds nothing once it has left (rule 400.7). A copy wasn't cast, so it owes nothing. The scaffolder reads the sentence. `flash-then-sacrifice.test.ts`. |
| `split` | `boolean` | A split card (rule 709) — on all three definitions; see §12 ("Split card"). |
| `aftermath` | `boolean` | **Aftermath** (rule 702.127a), on the split half that has it — cast only from a graveyard, then exiled; see §12 ("Split card"). |
| `divided` | `{ total, slot }` | "`total` damage divided as you choose among" the `any-number` group at target slot `slot` (Magma Opus): the cast carries the split, the `damage-divided` effect deals it. `total` is any `EffectAmount`, read as the division is announced (rule 601.2d) and fixed from then on — Volcanic Wind's "where X is the number of creatures on the battlefield as you cast this spell" (`{ countOf: { type: "creature" } }`), Monstrous Onslaught's greatest power (an `aggregate`); give such a group no `max`, the total caps it (at least 1 each). The same on an activated ability (Lukka, Bound to Ruin — as it's activated) and a triggered one (Ureni's lands, Orca, Siege Demon's `{ powerOf: "source" }`, last-known once it's died — as it's put on the stack). A spell's plain X is `x: true`; an amount reading X beyond that is read at the X cast, and the offer carries it at every X (`divide.totalByX`) and the number of targets each X allows: Meteor Shower's "X plus 1" (`{ sum: ["x", 1] }`, the group uncapped), Shatterskull Smashing's "twice X if X is 6 or more" (`{ ifCondition: { kind: "x", compare: { op: "gte", n: 6 } }, then: { product: ["x", 2] }, else: "x" }`, the group `max: 2`). |
| `commanderTaxAsLife` | `boolean` | the commander tax is paid in life instead of mana (Liesa, Shroud of Dusk: "Rather than pay {2} for each previous time you've cast this spell from the command zone this game, pay 2 life that many times"). A cast from the command zone costs the printed cost plus 2 life per previous cast; a cast from anywhere else owes no tax at all. The life is part of the cost, so it gates castability (rule 119.4 — payable down to exactly 0, never from below) and leaves that much less life for a painland or Phyrexian pip in the same payment. The client's "+N" tax badge still reads it as mana. |
| `exileOnResolve` | `boolean` | "Exile ~" printed on a non-permanent spell's own resolution text (Genesis Ultimatum) — goes to exile instead of the graveyard after resolving, unconditionally (however it was cast). Distinct from flashback/disturb/adventure, which only redirect a spell cast *that way*. needed-cards P19. |
| `shuffleIntoLibraryOnResolve` | `boolean` | "Shuffle ~ into its owner's library" as the last part of resolving (White Sun's Zenith). Only on resolving: a *countered* one goes to the graveyard, because the shuffle is an instruction the spell never got to carry out. |
| `countersPersistAcrossZones` | `boolean` | "Counters remain on ~ as it moves to any zone other than a player's hand or library" (Skullbriar, the Walking Grave). `moveObject` keeps `counters` on every other move (graveyard, exile, command zone, stack, and back onto the battlefield, where enters-with-counters adds to them); everything else rule 400.7 resets still resets. Read off the object as it leaves, so a copy of the card keeps them and a permanent that has lost its abilities doesn't. Counters apply to P/T in every zone (layer 7c), so a grown card is that size in the graveyard too. |
| `revealsOwnLibraryTop` | `boolean` | play with your top card revealed (Oracle of Mul Daya) |
| `looksAtOwnLibraryTop` | `boolean` | "You may look at the top card of your library any time" (Glarb, Calamity's Augur; rule 401.5): while this permanent is on the battlefield with its abilities, `viewFor` shows its controller their own top card — in their view only, where `revealsOwnLibraryTop` shows it to everyone. Goes with a `mayPlay` static (`from: "library-top"`, §6), which is what lets them do something with it. Held only sometimes, it's a static instead, `visibility: { looksAtOwnLibraryTop: true }` with a `condition`: Case of the Locked Hothouse's "Solved —", Ranger Class's level 3. |
| `pairing` | `CommanderPairing` | the partner-family ability that lets this card be one of **two** commanders (rule 702.124) — §12. Never inferred from `text`. |
| `canBeCommander` | `boolean` | "~ can be your commander." (rule 903.3a) — how a legendary card that isn't a creature, Vehicle or Spacecraft with P/T (a planeswalker) commands a deck — §12. Never inferred from `text`; `pool.test.ts` checks the two agree. |
| `deckCopies` | `"any" \| number` | "A deck can have any number of cards named ~." (`"any"`: Rat Colony) or "A deck can have up to seven cards named ~." (`7`: Seven Dwarves) — the card's own exception to the copy limit (rules 100.2a, 903.5b; the card wins, 101.1), read by `deck-validation.ts`'s `copiesAllowed`, and by nothing in play. |
| `rulebreaker` | `Rulebreaker` | "Rulebreaker — A deck with this commander can have …" (Mystery Booster Commander Edition): `anyIdentity` lists the cards allowed of any colour identity, each a `RulebreakerCards` that must have every type, supertype and subtype given and at least `minManaValue` ("Angel cards": `{ subtypes: ["Angel"] }`; "any basic land cards": `{ supertypes: ["basic"], types: ["land"] }`); `extraColorFor: ["instant", "sorcery"]` is Tolabow's one extra colour of the deck's choice; `noMaximumSize: true` is Whtz's. Read by `deck-validation.ts` (`fitsDeckIdentity`, the deck builder's identity filter too), and by nothing in play. Singleton still holds. |
| `companion` | `CompanionCondition` | "Companion—[Condition]" (rule 702.139), the condition as data, the line's words in `text` without the reminder. `{ kind: "each-card", of: "card" \| "nonland" \| "creature" \| "permanent", test }` with `test` one of `{ manaValueIs: "even" \| "odd" }`, `{ manaValueAtLeast: n }`, `{ manaValueAtMost: n }`, `{ subtypeAmong: [...] }`, `{ hasActivatedAbility: true }`, `{ noRepeatedManaSymbol: true }`; `{ kind: "different-names", of }` (Lutri); `{ kind: "shared-card-type", of }` (Umori); `{ kind: "deck-size-over-minimum", atLeast: 20 }` (Yorion). "…and land cards" is `of: "nonland"`. Everything else is the engine's: the reveal before the game (103.2b) for a card in the deck's sideboard, the {3} special action (116.2g), and a Commander deck bringing one. `kaheera-the-orphanguard.ts`, `keruga-the-macrosage.ts`. |
| `beginsOnBattlefield` | `boolean \| { notStartingPlayer?, counters?, thenExileFromHand? }` | "If this card is in your opening hand, you may begin the game with it on the battlefield" (rule 103.6a — the Leylines, Quicksilver, Brash Blur). Once every hand is kept, the starting player and then each other player in turn order is asked which such cards to put onto the battlefield (a `choose-from-zone` flagged `openingHand`). Nothing else on the card changes. The scaffolder reads the line. The object form is the same permission with more to it, Gemstone Caverns': `notStartingPlayer` isn't offered to the player who starts, `counters` are on it as it arrives, and `thenExileFromHand` asks that many cards of what's left of the hand (`destination: "exile"`) before the next question. |
| `mulliganHandAbility` | `"exile-hand-draw-that-many"` | "Any time you could mulligan and this card is in your hand, you may exile all the cards from your hand, then draw that many cards" (rule 103.5b — Serum Powder). Offered beside keep and mulligan each time its holder declares, in any round: not a mulligan, so nothing more is owed and nothing is shuffled, and they declare again over the new hand. The scaffolder reads the line. |
| `openingHandReveal` | `{ at, effect, text }` | "You may reveal this card from your opening hand. If you do, at the beginning of the first upkeep, …" (rule 103.6b — the Chancellors, Sphinx of Foresight). Asked after the `beginsOnBattlefield` question, the same player, as a `choose-from-zone` with `destination: "reveal"` flagged `openingHand`; each revealed card stays in the hand and sets up a delayed trigger its owner controls. `at`: `{ step: "upkeep" }` ("the first upkeep", whoever's turn), `{ step: "upkeep", whose: "you" }` ("your first upkeep"), `{ step: "main", whose: "you" }` ("your first main phase of the game"). Chancellor of the Annex's "when each opponent casts their first spell of the game" is a cast-keyed delayed trigger that lasts past turn 1 and isn't this. |

---

## 4. Mana cost strings

Parsed by `parseManaCost` (`mana.ts`). Symbols, in `{…}`:

| symbol | meaning |
| --- | --- |
| `{1}` `{2}` … | generic |
| `{W}` `{U}` `{B}` `{R}` `{G}` | coloured |
| `{C}` | colourless (paid only with colourless mana) |
| `{X}` | see below |
| `{W/U}` | hybrid — either half |
| `{2/W}` | twobrid — `{2}` or `{W}` |
| `{C/W}` | colorless hybrid — `{C}` (colorless mana only) or `{W}`; a white symbol, mana value 1 (Ulalek, Fused Atrocity) |
| `{W/P}` | Phyrexian — `{W}` or 2 life |
| `{S}` | snow (rule 107.4h) — one mana of any type made by a snow source (a permanent with the `snow` supertype); no generic reduction touches it; counts 1 toward mana value. "The amount of {S} spent to cast this spell" is `{ manaSpentOf: "source", from: { supertype: "snow" } }` (Graven Lore, Tundra Fumarole); "if {S} was spent" is a `source` condition on `{ manaFrom: { supertype: "snow" } }` (Berg Strider). |

`{X}` in a **spell's** cost: the caster chooses X as the spell is cast
(`cast-spell.xValue`), it's folded into generic, and effects read it via
`amount: "x"` / `ctx.x`. `{X}` in an **activated ability's** cost works the same
way (`activate-ability.xValue`). See `Fireball`, `Cinder Elemental`.

A **permanent** spell's X carries onto the battlefield for its own
enters-the-battlefield abilities only (rule 107.3m): an "enters with X
counters" replacement (`counters.amount: "x"`, `walking-ballista.ts`) and a
`trigger: { on: "enters-battlefield", who: "self" }` ability whose effect says
`"x"` both see the X it was cast with — the trigger snapshots it as it
triggers, so flickering the permanent in response doesn't change it. Any other
ability of the permanent sees X = 0, as does a permanent that entered without
being cast, and the card after it leaves and returns (a new object). A
"whenever *another* creature enters" trigger is not this permanent's ETB and
reads 0 too.

`manaValue` counts `{C}` as 1, a hybrid pip as its greatest half, `{X}` as 0.

---

## 5. Keywords

`keywords: [...]` — the supported `Keyword` union (`define.ts`):

**Wired into combat / SBAs:** `flying`, `reach`, `haste`, `vigilance`,
`defender`, `first-strike`, `double-strike`, `trample`, `deathtouch`,
`lifelink`, `menace`, `indestructible` (SBAs skip it — but 0 toughness still
kills), `unblockable` (evasion — Invisible Stalker).

**Casting:** `flash` (cast at instant speed).

**Targeting:** `hexproof` (can't be targeted by opponents).

**Evasion:** `fear` (rule 702.36 — blockable only by artifact and/or black
creatures) and `intimidate` (702.13 — artifact creatures and/or creatures
sharing a colour with it; a colourless attacker with intimidate is blockable
only by artifact creatures), and `skulk` (702.118 — can't be blocked by a
creature with greater power, compared as blockers are declared; grant it with
a static's `grantKeywords`, as Behind the Scenes does), and `shadow` (702.28 —
blocks and is blocked only by creatures with shadow: Dauthi Voidwalker), and
`horsemanship` (702.31 — blocked only by creatures with horsemanship, and blocks
anything: Portal Three Kingdoms' Shu Cavalry).

**Banding** (rule 702.22): `banding` — its controller may declare it attacking
in a band (an `AttackerDeclaration.band` number shared by the band; creatures
with banding and at most one without), which is blocked as one (a blocker of
any member blocks them all — `GameObject.blockingAlso`), and the other side
divides a creature's combat damage when banding is among the creatures it's
blocking or blocked by (702.22j-k: the `assign-combat-damage` decision's
`forOpponent`). "Bands with other [quality]" is a static's `bandsWithOther:
CardFilter` (§ static fields), which adds the `bands-with-other` keyword while
it applies; "loses all 'bands with other' abilities" is `become` of
`bands-with-other`, and losing `banding` takes them too (702.22b). "Creatures
banded with it" is the `CardFilter` clause `bandedWithSource: true` (Icatian
Skirmishers, Urza's Engine). All of it lives in `combat/banding.ts`.

**Phasing** (rule 702.26a): `phasing` — as each of its controller's untap
steps begins, before anything untaps, it phases out, or back in
(`Game.phasingStep`); read off its current keywords, so one granted it phases
too. Phasing out as an effect is the `phase-out` effect (§6).

**Decayed** (rule 702.147a): `decayed` — "this creature can't block" (a
`cant-block` restriction while it has the keyword) and "when this creature
attacks, sacrifice it at end of combat", a trigger the keyword carries: a
decayed token is `keywords: ["decayed"]` and nothing else. One that gains it
by an effect (`grant-keyword`, Gisa's "they gain decayed") or a decayed
counter (rule 122.1b) has both halves; a **static** granting decayed isn't
read for the trigger (no card does it yet — `Game.effectiveTriggeredEntries`
would need to look). "If it didn't have decayed" on a dies trigger is the
filter's `notKeyword: "decayed"` (Wilhelt, the Rotcleaver), read as it last
existed; "if you control no creatures with decayed" a `controls` condition
with `keyword: "decayed"` (Jadar). `decayed.test.ts`.

**Riot** (rule 702.136): `riot` — the engine asks "+1/+1 counter or haste" as
the permanent is about to enter (a fixed-menu `choose-creature-type` with
`riot`), puts the counter on as it enters or gives it haste for as long as it
stays (an effect, not its own ability: a change of control keeps it).
A static's riot ("nontoken creatures you control have riot", Rhythm of the Wild) and one gained as a
spell are asked the same way, each instance apart (rule 702.136b); only a token isn't asked: it gets haste.

**Unleash** (rule 702.98): `unleash` — the engine asks "+1/+1 counter or no
counter" as the permanent is about to enter (a fixed-menu
`choose-creature-type` with `unleash`), and the keyword's other half is a
`cant-block` restriction in the layer fold while it has any +1/+1 counter
(Rakdos Cackler, Gore-House Chainwalker). The enter choice is printed or
copied only, as riot's: a static granting unleash to others ("other Dogs you
control have unleash" — Tesak) isn't asked as they enter (§15).
`unleash-detain.test.ts`.

**Flanking** (rule 702.25): `flanking` in `keywords` *and* the `flanking()`
helper in `triggered` — the keyword is what "a creature without flanking"
asks, the helper the trigger (`blocked-by`, §9).

**Provoke** (rule 702.39): the `provoke()` helper in `triggered` (Goblin
Grappler; `grantsTriggered: [provoke("Provoke")]` for "All Sliver creatures
have provoke" — Hunter Sliver). It's an attack trigger whose "may" untaps the
target and then a **`restrict`** with a `must-block` record: a blocking requirement on one
creature (rule 509.1c), weighed with Lure's and the rest as blockers are
declared (`combat/blocking.ts`). The same effect is "target creature blocks
this turn if able" (the word `"must-block"`), "blocks it/this creature this turn if
able" (`attacker: "source"`), "blocks target creature" (`attacker: 1`), and
"this combat" (`duration: "until-end-of-combat"`). A creature that can't block (that
attacker) is simply under no requirement. `amplify-provoke.test.ts`. With
`filter` in place of `target` it's a rule for the turn over whatever matches,
later arrivals too (rule 611.2c): "each creature your opponents control blocks
this turn if able" (Predatory Rampage), "all creatures with magnet counters on
them block that creature this turn if able" (`attacker: "trigger-object"`,
Magnetic Web). `combat-requirements-by-filter.test.ts`.

**Amplify N** (rule 702.38): `amplify: N` on the card. As it's about to
enter, its controller reveals any number of cards from their hand sharing a
creature type with it (never itself) — a `choose-from-zone` with destination
`"reveal"` — and it enters with N +1/+1 counters for each.

**Landwalk** (rule 702.14): `plainswalk`, `islandwalk`, `swampwalk`,
`mountainwalk`, `forestwalk`, `desertwalk` — can't be blocked as long as the
defending player controls a land of that *type* (a Breeding Pool is a Forest).
One keyword per land type a card prints; a new type is a new keyword, added to
`LANDWALK` in `subtypes.ts` and to the client's `KEYWORD_GLYPH`. **Any other
kind** is a static's `landwalk`, its land as a filter: nonbasic landwalk is
`landwalk: { type: "land", notSupertype: "basic" }` (Dryad Sophisticate,
Trailblazer's Boots), artifact landwalk `{ types: ["artifact", "land"] }` (Vectis
Gloves), and `"chosen-land-type"` reads `chooseOnEnter: LAND_TYPES` (Traveler's
Cloak). A `grant-static` carries one until end of turn, its `subtype` the
sentinel of a `choose-creature-type` (Illusionary Presence). A land type alone
with a keyword of its own *gives* that keyword, so Quagmire and "a creature with
islandwalk" see it; the rest show as the `landwalk` keyword, which is what
`become` (Hammerheim) and `blockableDespiteLandwalk` (Staff of the Ages)
name for them. Never grant `landwalk` directly: it would walk nothing.

**Day/Night:** `daybound` / `nightbound` — the two faces of a modern werewolf;
`Game.setDayNight` transforms them with the cycle. Nothing else transforms
them (rules 702.145b, 702.145e): a `transform` effect leaves a daybound or
nightbound permanent alone (Tovolar, Dire Overlord; Moonmist's ruling).

**Changeling** (rule 702.73a): `changeling` — "this object is every creature
type", in every zone. Put it in `keywords` and keep the printed subtypes
(`["Shapeshifter"]`); layer 4 adds the `EVERY_CREATURE_TYPE` marker
(`subtypes.ts`) itself, so the card is a Goblin to a Goblin lord, a Dog *and* a
Cat spell to Rin and Seri, and an Army to amass (Morophon, the Boundless). It
survives losing its abilities and is replaced by a later "becomes a Frog", as
the rulings have it. Only a printed or copied changeling works — no effect
grants the keyword. "Is every creature type" / "every land type" granted by an
effect (Mutavault's animation, Omo's everything counters) is
`EVERY_CREATURE_TYPE` / `EVERY_LAND_TYPE` in an `addSubtypes`. **Never read a
subtype list with `includes`** in engine code — ask `hasSubtype`.
"**~ is also a Cleric, Rogue, Warrior, and Wizard**" (Veteran Adventurer,
Burakos) is the same kind of CDA (rule 604.3, its ruling: every zone): the
card field `alsoSubtypes: ["Cleric", "Rogue", "Warrior", "Wizard"]`, the
printed `subtypes` left as the type line has them. The scaffolder reads it.
On a land it's land types: Planar Nexus's "this land is every nonbasic land
type" lists the twelve that aren't basic (rule 205.3i) — not
`EVERY_LAND_TYPE`, which would make it a Forest too.

**Toxic** (rule 702.164) is a field, not a `keywords` string, because it's
parameterised and cumulative: `toxic: 1` is "Toxic 1" (Karumonix, the Rat
King). A static grants more with `grantToxic: N` (Karumonix's "Other Rats you
control have toxic 1" — `affects: { scope: "creatures-you-control",
excludeSelf: true, subtype: "Rat" }`); an effect does with `grant-toxic { target
| filter, amount, duration }` (Aspirant's Ascent's "gains flying and toxic 1 until
end of turn"; Plague Nurse's "each other creature you control with toxic gains
toxic 1", over a filter as it resolves). "With toxic" / "if that creature has
toxic" is the filter `hasToxic: true` (printed or granted; Slaughter Singer,
Hexgold Slash). "With flashback" is `hasFlashback: true` (rule 702.34 — the
printed flashback, or Snapcaster Mage's resolved grant where the card is; not a
static's graveyard-only grant, so ask it of cards in exile: Runic Repetition). The layer fold sums every instance into
`Characteristics.toxic`, the creature's total toxic value (702.164b; a
creature that loses its abilities loses the printed one), and combat damage it
deals a player gives that player that many poison counters on top of the
damage (120.3g) — however much damage it was, and never for noncombat damage
(the rulings). Keep "Toxic N" in `text`. A token with toxic is a token card
with the field (`Phyrexian Mite Token`). A static scoped to "creatures you
control with toxic" is a `filter` scope with `hasToxic: true` (Skrelv's Hive's
corrupted lifelink): like a keyword-scoped static it waits for the fold's
other statics, so toxic a static or an effect grants counts too, and a
creature that lost its abilities has none (rule 613.8).

**Dredge** (rule 702.52) is a field: `dredge: 3` is "Dredge 3" (Life from
the Loam). Keep the reminder text in `text`. While the card is in its owner's
graveyard, each draw they'd make is asked about first — "Draw a card" or
"Dredge N: mill N, return [card] to your hand" (a `choose-modes` the engine
answers itself) — one draw at a time, so a card milled by one dredge can
replace the next draw; never with fewer than N cards in the library
(702.52b). The opening hand isn't asked. The mill is a mill (Bruvac doubles
it); the draw it replaced never happened ("whenever you draw" doesn't see it).

**Infect** (rule 702.90) and **wither** (702.80): `infect` / `wither` in
`keywords`, or granted (`grantKeywords`, `grant-keyword`, `become`'s
`keywords` — Inkmoth Nexus, Tainted Strike, Phyresis). Damage from a source
with either to a creature is that many -1/-1 counters, put on by the
source's controller, instead of marked damage (120.3d — so Doubling Season
and Hapatra see them); damage from one with infect to a player is that many
poison counters instead of life lost (120.3b). Any damage, combat or not, and
still damage in every other respect: lifelink, deathtouch (destroys though
nothing is marked — 704.5h), "is dealt damage", prevention; a planeswalker
loses loyalty as usual. A source that has left is read as it last existed
(702.90d). `Game.dealDamage`; `infect.test.ts`.

Anything not in that list (protection wording, ward, prowess, …) is **not** a
keyword string — it's a static or triggered ability. See §9–10.

---

## 6. Effects (`effect`)

### References: one `ObjectRef`, one `PlayerRef` (`refs.ts`)

Every field that names an object or a player takes the same two types. **Reads**
(`{ controllerOf }`, an amount, `sharesColorWith`, `{ attachmentsOf }`) take an object as it is
in the public zone it was expected in, and otherwise as it last existed (rules 608.2h, 113.7a);
**acting** on one needs it to be the same object still (400.7), and an illegal slot names nothing
(608.2b).

- **`ObjectRef`**: a slot number, `"source"`, `"trigger-object"`, `"attached"` (the source's host),
  `"chosen"`, `"granter"`, `"trigger-recipient"`, `"created"`, `"put-this-way"`, `"amassed"`, `"priced"`;
  any `ObjectSetRef` as its one member ("the sacrificed creature" is `{ paid: "sacrificed" }`); and
  composed, `{ hostOf: ObjectRef }` ("the creature that Equipment was attached to", Unforge) and
  `{ pairedWith: ObjectRef }` (702.95b). Never `{ hostOf: "source" }`: that's `"attached"`.
- **`PlayerRef`**: `"you"`, `"active-player"`, `"trigger-controller"`, `"trigger-player"`, `"that-player"`,
  `"chosen-player"`, `"player-to-your-left"` / `-right`, `{ target: n }`, and composed
  `{ controllerOf: ObjectRef }` (a card with no controller is read as its owner, 108.4a),
  `{ ownerOf: ObjectRef }` and `{ defendingPlayerOf: ObjectRef }` (508.5: as it was before it was
  removed from combat, from the journal). A player who has left names nobody.
- **`PlayerScope`** is any `PlayerRef` or a plural word (`"each-player"`, `"each-opponent"`, the vote
  scopes), or `{ otherThan: PlayerRef }` ("each other player", Oft-Nabbed Goat). Every `who` takes all of it.
- **Sets**: `{ attachmentsOf: ObjectRef }` ("all Auras attached to that creature"), `{ targetsOf: ObjectRef }`
  (Storm, Windrider's "those creatures"), beside the `ObjectSetRef`s of theme 1.
- **Attaching to a player**: `attach`'s `target` also takes `{ player: PlayerRef }` (Archnemesis).

**Relational `CardFilter` clauses take refs too** (`filter.ts`): `sameNameWith` (a slot or
trigger object also matches itself, as "that permanent and all others with the same name" needs),
`sharesColorWith`, `sharesCardTypeWith` / `sharesPermanentTypeWith` / `sharesCreatureTypeWith` /
`sharesLandTypeWith`, `attachedToObject`, and `controlledByRef: PlayerRef` ("all lands that player
controls"; `controlledByTarget` on an effect is the older form, for a slot, and reads the whole filter
from that player's side), and `ownedByRef: PlayerRef` (Expropriate's "choose a permanent **owned by the
voter**", `"that-player"` in a `for-each-vote`, the caster choosing). All are bound as the effect applies; only `"source"`, `"attached"` and
`{ attachmentsOf: "source" }` read inside a static (a test holds the pool to it).
"Choose a land you control. Then search … for basic land cards **which have the same name as the
chosen land**" (Canoptek Wraith) is a `choose-permanents` with `remember: true` and an empty `then`,
followed by a `search-library` whose filter is `sameNameWith: { thisWay: "chosen" }`: the pick is
this resolution's even after the source was sacrificed, and with nothing chosen nothing matches.
`greatestInZone` and `greatestAmongItsController` take `least: true`. `hasKeyword: CardKeyword` is one
row per printed keyword read off the text box (morph, madness, kicker, flashback, cycling, fading, ...);
`keyword` is still the computed evergreen list. `hasKeyword: "partner"` is partner or "partner with",
not the other partner abilities (702.124f). `hasKeyword: "devoid"` is the printed devoid line (702.114a),
which a devoid card's `colors: []` alone doesn't say — "a spell with devoid" (Corrupted Crossroads's
`spendOnly: { spell: { hasKeyword: "devoid" } }`; the scaffolder reads the line). `keywordVariant: "hexproof" | "protection"` is the keyword in
any variant, printed or granted — hexproof or a "hexproof from [quality]" (702.11d), any "protection from"
(702.16a) — where `keyword: "hexproof"` is the plain ability alone. `hasActivatedAbility: { mana?: boolean, tapCost?: boolean }` is a non-mana
activated ability (605.1a); `tapCost: true` one with {T} in its cost (Magewright's Stone; a basic
land type's intrinsic mana ability counts, "tap an untapped creature you control" doesn't). `castFrom` takes `{ not: ZoneType }`. `aboveSourceInGraveyard` reads
graveyard order (404.2). Condition `{ kind: "object-matches", object: ObjectRef, filter }` is the general
"if that object is ...", `{ paid: "sacrificed" }` among its objects.

`EffectSpec` (`effects.ts`) is the declarative vocabulary for what a spell or
ability does on resolution. A `target:` field is an **index into `targets[]`**
(0-based), or the literal `"source"` where allowed. Where it's an
`ObjectRef`, `"trigger-recipient"` is **what the triggering event was
aimed at**: the creature a `deals-damage` trigger's damage hit ("put a -1/-1
counter on that creature" — Obelisk Spider; "that creature becomes a copy of
this creature" — Permeating Mass, `become-copy`; "doesn't untap … for as long
as this Equipment remains on the battlefield" — Neko-Te, `restrict`'s
`while-source`), or the player or planeswalker an attacker is attacking
(`attacks`, `becomes-blocked`, `attacks-alone`, `attacks-unblocked` — Rakdos
Roustabout's `damage` with `toTriggerRecipient`). Not a target, acted on only
while it's the same permanent (rule 400.7), read as it last existed once it
has left (608.2h). A `delayed-trigger` the ability makes keeps it (603.7c):
Ohran Viper's "destroy that creature at end of combat" is `{ kind:
"delayed-trigger", at: "end-of-combat", effect: { kind: "destroy", target:
"trigger-recipient" }, … }`. And `"attached"` is **"enchanted creature" / "equipped
creature"** — the permanent the source (an Aura or Equipment) is attached to
as the effect resolves, or, the source gone, the one it was last attached to
while that's still the same object (rule 400.7): Starlit Mantle's "enchanted
creature gains hexproof", Warbriar Blessing's `fight` `a: "attached"`,
Dreadful Apathy's "exile enchanted creature" (each one's ruling covers the
Aura leaving first). Not a target. A `delayed-trigger` with `about:
"attached"` carries that permanent as its one target (Wings of Hubris's
"sacrifice it at the beginning of the next end step", `sacrifice-target`
slot 0). `attached-ref.test.ts`. An `EffectAmount` is a
number, `"x"` (the cast `{X}`), `{ countOf: CardFilter }` — a live count of
battlefield permanents matching the filter, from the effect's controller's
view (Scourge of Valkas: `{ countOf: { subtype: "Dragon", controlledBy: "you" } }`;
Craterhoof: `{ countOf: { type: "creature", controlledBy: "you" } }`);
`{ timesKicked: "source" }` — how many times the source's spell paid its
multikicker cost (rule 702.33c): a resolving spell's own count (Spell
Contortion's "draw a card for each time Spell Contortion was kicked"), or a
permanent's as it entered (Wolfbriar Elemental's "create a 2/2 green Wolf
creature token for each time it was kicked"; Deathforge Shaman's twice that is a
`product`); 0 when it wasn't kicked. Not built: the count of a *triggering*
spell (Rumbling Aftershocks) or an "up to X targets" reading it (Voyager Drake);
`{ suspendedCardsYouOwn: true }` — how many suspended cards (rule 702.62b)
the effect's controller owns (Rose Tyler's "a time counter on it for each
suspended card you own and each other permanent you control with a time
counter on it", a `sum` with a `countOf`);
`{ countInGraveyard: CardFilter }` — how many cards in *graveyards* match
(Undergrowth — Lotleth Giant's "for each creature card in your graveyard";
`ownedBy: "you"` is what narrows it to your own). In an "enters with a
counter for each …" replacement it still counts a card entering **from** a
graveyard, itself or one entering with it, since the replacement applies
before it moves (rule 614.12 — Diregraf Colossus's and Unbreathing Horde's
rulings);
`{ lifeTotal: "you" }` — the controller's life total (Ajani's ultimate);
`{ lifeTotal: "each" }` — the life of **each player a scoped effect is
applied to**, read once per player ("each opponent loses half **their**
life" is a `lose-life` with `who: "each-opponent"` and this inside `half`;
works for scoped `damage` / `draw` / `mill` / `discard` / `gain-life` /
`lose-life`; outside a scope it reads the controller's);
`{ librarySize: "you" | "each" }` / `{ graveyardSize: "you" | "each" }` —
how many cards are in a library or graveyard, yours or (with `"each"`) the
player the effect is acting on, the same way: Singularity Rupture's "each
mill half **their** library, rounded down" is `{ half: { librarySize:
"each" }, round: "down" }`;
`{ half: EffectAmount, round: "up" | "down", fraction? }` (`fraction: 10` is a
tenth — Legate Lanius's decimate) — half of an amount, rounded
the way the card says (rule 107.1a);
`{ powerOfTwo: EffectAmount }` — 2 to that power (Mathemagics' "draws 2ˣ
cards" is `{ powerOfTwo: "x" }`; 2⁰ = 1), its exponent capped at 52;
`{ manaSpentOf: ref }` — how much mana was actually spent to cast the source
or trigger object (Prossh: "X is the amount of mana spent to cast it";
commander tax and {X} count, a free cast is 0, convoked creatures aren't
mana), or of a target spell, read as it last was on the stack once it has
left (rule 608.2h — Mana Sculpt's delayed `{ manaSpentOf: 0 }` after
countering it, as Mana Drain's `{ manaValueOf: 0 }`);
`{ manaSpentOf: ref, count: "colors" }` — how many **colours** of mana were spent to cast it,
converge (rule 207.2c — Painful Truths: `{ manaSpentOf: "source", count: "colors" }`):
colourless isn't one, mana for cost increases and additional costs counts,
a copy or a free cast is 0 (the converge rulings), kept by the permanent a
spell becomes;
`{ commanderCastsOf: ref }` — how many times that commander has been cast
from the command zone this game, by its owner (rule 903.8's count, the one
the tax reads) — Study Hall's `whenSpent` "scry X, where X is the number of
times it's been cast from the command zone" is `{ commanderCastsOf: 0 }`
(slot 0 is the spell), which counts the cast it rides on;
`{ commanderCasts: "you" }` — every cast of the effect's controller's own
commanders from the command zone this game, added up (Thunderclap Drake's
"for each time you've cast your commander from the command zone this game",
a partner pair's both counted — its ruling), or `{ commanderCasts: 0 }`, the
player in a target slot's (Commander's Insight);
`{ manaValueOf: ref }` — the mana value of whatever a target slot (or
`"source"` / `"trigger-object"` / `"sacrificed"`) points at, as it last
existed on the battlefield if it has left since (rule 608.2h, last known
information — Feed the Swarm destroys the permanent and *then* reads it,
and `0` for a player target). A spell **on the stack** counts its chosen {X}
(rule 202.3e — Kaervek reading a Fireball cast for 3 sees 4), and a target
that was a spell and has since left the stack is read as it last existed
there, X included (Mana Drain's "that spell's mana value" after countering
it). Anything else reads X as 0, so Reanimate on a Stonecoil Serpent costs no
life; or
`{ triggerValue: true }` — a number the firing event supplied to a **triggered
ability**: the entering / attacking creature's power (Terror of the Peaks:
`damage`), or the combat damage a creature dealt a player (Old Gnawbone:
`create-token` `count`). `0` outside a triggered-ability resolution; or
`{ chosenNumber: true }` — the number chosen as the source entered, from a
`chooseOnEnter` of numbers (Talion, the Kindly Lord's "the chosen number",
compared in its trigger's filter as `n: { amount: { chosenNumber: true } }`).
`NaN` when none was chosen, so a comparison with it never holds; or
`{ ifCondition: StaticCondition, then: EffectAmount, else: EffectAmount }` — one
amount or the other by a condition asked as the amount is read, from the
controller's side with the source counted (as a `conditional` effect's is):
Urza's Tower's "{T}: Add {C}. If you control an Urza's Mine and an Urza's
Power-Plant, add {C}{C}{C} instead" (`urzaLand` in `helpers.ts`) — the way a
mana ability says "instead", since it can't be a `conditional`; the auto-payer
sizes it against the board as it stands. An
`EffectAmount` is accepted by `damage` / `damage-all` / `mill` / `discard` /
`draw` / `gain-life` / `lose-life` / `prevent-damage` `amount`, `modify-pt` /
`modify-pt-all` `power`/`toughness`, `add-mana` `amount`, and `create-token`
`count`.

The rest of the shapes: `{ countOf: CardFilter, times?, excludeSelf?,
excludeTarget?, forTarget? }` (a battlefield count, optionally multiplied — Shamanic
Revelation's "4 life **for each**"; `excludeSelf` is "for each **other**
creature you control", `excludeTarget: i` is "other than **that** creature",
leaving out whatever target slot `i` names, `excludeTriggerObject` the permanent that
fired the trigger (Shared Animosity). All leave out one *permanent*:
a source that is a member of a token stack leaves the rest of its stack
counted. `forTarget: i` reads the filter from the side of the player in
slot `i` — Will of the Mardu's "the number of creatures **target player**
controls" is `{ countOf: { type: "creature", controlledBy: "you" },
forTarget: 0 }`; `forEachPlayer: true` reads it from the side of each player
a scoped effect acts on, once for each — Zodiark, Umbral God's "each player
sacrifices half the non-God creatures they control" is a `sacrifice` of
`who: "each-player"` with `count: { half: { countOf: …, forEachPlayer: true
}, round: "down" }`, each player's count read before anyone sacrifices — and
`damage`/`draw`/`lose-life` with a `who` scope read it for each player the
same way (Typhoon's "each opponent … the number of Islands that player
controls"; a `countInGraveyard` takes `forEachPlayer`, `forTarget` and
`forPlayer` too — Nature's Resurgence, Corpse Augur's "target player's
graveyard", Roiling Terrain's "that player's graveyard"); `forPlayer: PlayerRef` reads it from one named player's
side — `{ controllerOf: 0 }` (Weight of Spires' "that creature's
controller"), `"trigger-player"` (Emissary of Hope's "that player"),
`"chosen-player"` — 0 when it names nobody),
`{ aggregate: "sum" | "max", of: "power" | "toughness" |
"mana-value" | { counters }, filter, excludeSelf? }` (an `AggregateSpec`,
`filter.ts` — "X is the **total power** of creatures you control", "the
**greatest mana value** among permanents you control", Tom Bombadil's "four
or more **lore counters among Sagas you control**" (`of: { counters: "lore"
}` in an `aggregate` condition). Computed values, so anthems and counters
count; mana value off the printed cost with `{X}` as 0. A **sum counts a
token stack once per token** — twenty 1/1 Goblins in one stack are 20 power.
A max over no permanents is 0, and the amount is clamped at 0, rule 107.1b;
`aggregate: "distinct"` counts the **different** values instead, each once —
`of: "mana-value" | "mana-cost" | "power" | "name" | "color-pair" |
"permanent-type" | "card-type" | "counter-kind" | { subtypesOf: "creature" | "planeswalker" }`: Lunar Insight's
"each different mana value among nonland permanents you control", Embodiment of
Agonies' "each different mana cost among nonland cards in your graveyard" (the
symbols, not their total; no mana cost adds nothing, rule 202.1b), Golden Ratio's "each
different power", Awakened Amalgam's "differently named lands" (as a CDA's
`setBasePtFromCount.countOf`), Tam's "planeswalker types among planeswalkers
you control", a changeling every creature type; `in: "graveyards"` reads the
cards in graveyards instead, `ownedBy: "you"` for yours — Aven Heartstabber's
"five or more mana values among cards in your graveyard" is an `aggregate`
condition, Sewer Crocodile's the `condition` on an activated ability's
`costReduction`. **Any set** (2026-10-31): `in` is `"battlefield"` (the
default), `"graveyards"`, `"exile"` (a card exiled face down matches only an
owner-only filter, rule 406.3a) or `"attackers"` — the attackers that counted
for the `attacks-batch`/`attack-with`/`attacks-player` trigger that fired, read as it resolves
(as last on the battlefield if gone; filter `{}`, the trigger already
narrowed them: Shriekwood Devourer's "the greatest power among those
creatures", Vulpine Harvester's "their total power"); a list is a union, and
`plus: [{ filter, in? }]` adds a set with a filter of its own (Ambitious
Dragonborn's "creatures you control and creature cards in your graveyard");
`aggregate: "greatest-shared-creature-type"` is how many of them share the type most
of them have, a changeling in every group (Skemfar Shadowsage, Basalt Ravager, White
Lotus Tile; a `kind: "aggregate"` condition of `{ op: "gte", n: 2 }` is Synchronized
Eviction's "at least two creatures that share a creature type"). `of: { manaSymbols:
"B" }` is chroma, that colour's symbols in the costs, a hybrid one counting once (Umbra
Stalker); of one object, `{ manaSymbolsOf: ref, color }` (Fiery Bombardment), of a
set, an aggregate `of: { manaSymbols }` `in: { thisWay }` (Phosphorescent Feast), of the creature a static
affects, `ofAffected: { manaSymbols }` (Light from Within). What a permanent devoured
(rule 702.82b): `{ devoured: "source", filter? }` (Marrow Chomper; Voracious Dragon's
Goblins, as they last were) and the condition `{ kind: "self-devoured" }` (Hellkite
Hatchling).
`aggregate: "count"` counts them (Crackling Drake's "instant and sorcery cards
you own in exile and in your graveyard" — `in: ["graveyards", "exile"]`);
`of: "counters"` sums every counter of every kind (Maester Seymour); an
effect amount's `forTarget: slot` reads it from a target player's side
(Ferrafor's "creatures target player controls"). A static's
`grantPtPerCount: { aggregate, pt }` is "+X/+0, where X is …" (Carrion Grub;
Emissary Escort with the aggregate's `excludeSelf`)),
`{ countersOn: ref, counter? }` (how many counters of one kind are on it —
every kind when `counter` is omitted, "the number of counters on it" —
Black Market's charge counters; from a dies trigger, the counters it died
with, Chasm Skulker), `{ countInGraveyard }`, `{ manaValueOf }`, `{ powerOf }`, `{ toughnessOf }`
(Condemn; each takes a target slot, `"source"`, `"trigger-object"`,
`"sacrificed"`, `"tapped"` — the one permanent tapped to pay the ability's
cost, station's — or `"discarded"`, the one card discarded to pay the
cost, read where the discard put it: Volrath the Fallen's "where X is the
discarded card's mana value" — see "Last-known information" below), `{ lifeTotal: "you" }`
(Storm Herd), `{ devotionTo: Color }` (rule 700.5 — Gray Merchant of
Asphodel; a hybrid pip counts for each colour it contains, `{X}` and generic
for nothing; `"that-color"` is the colour an `"any-color"` `add-mana` is
making — Nykthos, Shrine to Nyx; a list is "your devotion to [one] and
[other]", a `{W/B}` counted once; Altar of the Pantheon's `devotionBonus`
adds to every one; as a `selfCostReduction` amount it takes a list —
`{ devotionTo: ["B"] }`, Drag to the Underworld's "costs {X} less to cast,
where X is your devotion to black", generic mana only), `{ basicLandTypes: "you" }` (domain, an ability word —
rule 207.2c: the basic land types among lands you control, each once, 0 to 5 —
Meria's Outrider; the same form is a `costReduction`/`selfCostReduction`
amount, Jodah's Codex and Yavimaya Sojourner, and a CDA count, Nishoba
Brawler), `{ partySize: "you" }` (party, rule 700.8: the creatures in your
party, 0 to 4 — up to one each of Cleric, Rogue, Warrior and Wizard you
control, a creature of two of them counted in whichever role makes the party
largest, 700.8b — Malakir Blood-Priest; the same form is a
`selfCostReduction` amount, Deadly Alliance, and a CDA count, Archpriest of
Iona; `grantPtPerCount: { partySize: true }` is Ravager's Mace's "+1/+0 for
each creature in your party"; "if you have a full party" (700.8c) is the
condition `{ kind: "full-party" }`, Linvala, Shield of Sea Gate's
intervening if; "if two or more players have lost the game" is `{ kind:
"players-lost", atLeast: 2 }`, Hot Pursuit's), **undaunted** (rule 702.125a — Coastal Breach, Curtains'
Call: "costs {1} less to cast for each opponent you have") is the
`selfCostReduction` amount `{ opponents: true }` under the always-true gate
`{ kind: "controls", filter: {}, atLeast: 0 }`, the opponents still in the
game (702.125b); the scaffolder reads the keyword line,
`{ greatestCommanderManaValue: true, onBattlefieldOrInCommandZone? }`
(the greatest mana value among your commanders, wherever they are — Cactus
Preserve's X/X — or only there — Cloudkill; `each-player-may` asks of each player's own,
Imposing Grandeur. "**A** commander you own there" is a `choose-value` of `value:
"commander-mana-value"`, `then` reading it as `"x"`: Stinging Study, asked only when
their mana values differ), `{ creaturesDiedThisTurn: true }`
(per *player*, unlike `GameState`'s global counter — Liliana's Standard
Bearer; with `anyController: true`, the global one — Spymaster's Vault's
"the number of creatures that died this turn"), `{ countPlayers: PlayerScope }` (Inspired Sphinx; counts living
players, so it shrinks as a multiplayer game does; `where: StaticCondition`
counts only the players it holds for, each read as a `for-each-player`'s
`whoIf` — "you" the controller, the player asked about `"that-player"`:
Oreskos Explorer's "players who control more lands than you" is `{
countPlayers: "each-player", where: { kind: "player-compare", stat: {
controls: { type: "land" } }, compare: "fewer", than: "that-player" } }`,
"each graveyard with seven or more cards" an `of-player` over
`cards-in-graveyard`),
`{ castThisTurn: CardFilter, who?, greatest?: "mana-value", total?: "mana-value", other? }` (the spells `who`
— you by default — cast this turn that match, as they were cast: how many, or
the greatest mana value among them, {X} counted — Rootha, Mastering the
Moment's "the greatest mana value among instant and sorcery spells you've cast
this turn" — or the sum; `other` leaves out the spell reading it: Call Forth the
Tempest's "the total mana value of other spells you've cast this turn" is `{
castThisTurn: {}, total: "mana-value", other: true }`),
`{ countersPutThisTurn: { by?, counter?, onType?, onYours? } }` (counters
put on permanents this turn, each read as it went on, gone or not. `by` is who put
them: `"you"` by default, the controller of the effect or the permanent's own
controller for what it entered with, or `"any-player"`. Iridescent Hornbeetle's
"each +1/+1 counter you've put on creatures under your control this turn" is `{
counter: "+1/+1", onType: "creature", onYours: true }`; the `counters-put-this-turn`
condition takes the same fields and `atLeast?`: Lord Jyscal Guado's "if you put a
counter on a creature this turn" `{ onType: "creature" }`, Fairgrounds Trumpeter's
"if a +1/+1 counter was put on a permanent under your control this turn" `{ by:
"any-player", counter: "+1/+1", onYours: true }`. No "on this creature": a list
naming objects would keep tokens from folding back into their stacks),
`{ turnStat: TurnStat, who?: PlayerScope | "each", target? }` (`who: "each"` for each
player a scoped effect reaches — Wound Reflection's "each opponent loses life equal to
the life they lost this turn" — with `target` a player
target slot instead of a scope — Astarion's "life **they** lost this turn" — a per-turn running total —
`"opponents-attacked"` (Militant Angel, Rose: at any combat of the turn, a planeswalker
attacked isn't its controller),
`"life-lost"`, `"life-gained"`, `"cards-drawn"`, `"spells-cast"`,
`"damage-taken"`, `"combat-damage-taken"`, `"noncombat-damage-taken"` (the
rest of `"damage-taken"`: Whiplash Wordsmith's and Grim Repriser's "an
opponent was dealt noncombat damage this turn" is the `turn-stat` condition
`{ stat: "noncombat-damage-taken", who: "opponent", atLeast: 1 }`), `"attacked"` (1 once they've
declared an attacker — raid), `"attackers"` (how many different creatures
they've declared as attackers — one declared in two combats counts once, one
put onto the battlefield attacking never: Windbrisk Heights' "if you attacked
with three or more creatures this turn" is the `turn-stat` condition
`{ stat: "attackers", who: "you", atLeast: 3 }`),
`"power-attacked-with-this-combat"` (the total power of the creatures they
declared as attackers this combat, as they were declared — later changes and
creatures put onto the battlefield attacking don't touch it: pack tactics' "if
you attacked with creatures with total power 6 or greater this combat" is the
`turn-stat` condition `{ stat: "power-attacked-with-this-combat", who: "you",
atLeast: 6 }`),
`"cards-to-graveyard-from-hand-or-library"` (cards put into their graveyard
from their hand or library — discarded, milled, surveilled, cycled; Welcome
the Dead's X) or `"cards-left-graveyard"` (cards that left their graveyard,
for anywhere — Essence Anchor's "only if a card left your graveyard this
turn", the `turn-stat` condition `{ stat: "cards-left-graveyard", who:
"you", atLeast: 1 }`), `"scried-or-surveilled"` (scries and surveils of one
or more — Surveillance Phantasm's "as long as you've scried or surveilled
this turn", Proctor of Potential's "activate only if …" as an activated
ability's `condition`), `"surveilled"` (Darkblade Agent), `"own-library-searched"`
(Archive Trap's "if an opponent searched their library this turn") or
`"cards-put-into-exile"` (cards a player owns put into exile from any zone by
anyone, no token or copy of a spell: Ennis's "if one or more cards were put into
exile this turn", `who: "any-player"`) — summed over the scope,
default `"you"`: Kydele's "for each card you've drawn this turn", or the life
your opponents lost this turn as `who: "each-opponent"`; Aetherflux Reservoir's
"1 life for each spell you've cast this turn" as `"spells-cast"`, which counts
countered spells too),
`{ playersWithTurnStat: TurnStat, who: PlayerScope }` (how many players in the
scope have a nonzero total — "for each opponent who lost life this turn";
Tymna the Weaver's "the number of opponents that were dealt combat damage this
turn" is `"combat-damage-taken"`),
`{ turnHistory: "entered" | "left" | "died" | "sacrificed" | "exiled" | "descended" | "discarded" | "to-graveyard", who?, target?, filter?, from?, notFrom? }`
(`"discarded"`: the cards the scope's players discarded this turn, a madness
card discarded into exile too — Change of Fortune's "draw a card for each card
you've discarded this turn" is `{ turnHistory: "discarded" }`; `"to-graveyard"`:
everything put into their graveyards this turn, each with the zone it came
from, which `from` / `notFrom` narrow — cards from anywhere, permanents from
the battlefield with tokens, a battlefield one read as it last existed there;
Structural Assault's "the number of artifacts that were put into graveyards
from the battlefield this turn" is `{ turnHistory: "to-graveyard", who:
"each-player", from: ["battlefield"], filter: { type: "artifact" } }`, Fraying
Sanity's "cards put into their graveyard from anywhere" `filter: { token:
false }` (a token isn't a card); `target` reads a player target slot's list —
Cruel Calculations' `{ turnHistory: "to-graveyard", target: 0, from:
["library"] }`. A card counts though it has left the graveyard since. Else:
(how many permanents entered under the scope's control, left the battlefield
from under it — for anywhere, however, a token too, its controller as it left
(Kutzil's Flanker's "for each creature that left the battlefield under your
control this turn": `{ turnHistory: "left", filter: { type: "creature" } }`),
creatures died under
it, permanents they sacrificed, permanents were exiled from under their
control (Vren, the Relentless: `{ turnHistory: "exiled", who:
"each-opponent", filter: { type: "creature" } }`), or permanent cards were put
into their graveyards — "you descended" — this turn; a token stack counts every token.
`filter` narrows them: a permanent that has left as it last existed (a `left`
entry as it was in the stint it left, though it has come back and left again
since — rule 603.10a), a card in
a graveyard as it is now. See `PlayerState.turnHistory`),
`{ damageDealtThisTurn: true, who?, combat?, colors? }` (how much damage
sources the scope's players controlled dealt this turn, to anything — only
combat or only noncombat damage if `combat` says, only from sources that were
one of `colors` as they dealt it; see the `damage-dealt-this-turn` condition),
`{ playerCounters: "poison" | "experience", who?: PlayerScope, forTarget?: number }`
(the counters of that kind the scope's players have, summed, default `"you"` —
Ezuri, Claw of Progress's "where X is the number of experience counters you
have"; `forTarget`, the player in that target slot — Vraska, Betrayal's Sting's
"the difference"),
`{ opponentsControllingFewer: CardFilter }` (Voice of Many — a comparison per
player, which no single filter can express),
`{ cardsInHand: PlayerScope | "each" | { target: n } }` (the hand sizes of the scope's players, summed —
"the number of cards in **defending player's** hand" is `"trigger-player"` in
an attack trigger; `"each"` is the player a per-player effect is acting on —
Stormbreath Dragon's "damage to each opponent equal to the number of cards in
that player's hand" is a `damage` to `who: "each-opponent"` of `{ cardsInHand:
"each" }`; `{ target: n }` is the player in target slot `n`, for an effect
that doesn't act on them — Jeska's Will's "add {R} for each card in target
opponent's hand"), `{ amongPlayers: "greatest" | "least", of: amount, who?: scope, includingLeft?: true }` (the greatest or least of
`amount` read once per player in `who`, default every player, the amount's `"each"`
being that player — Investigator's Journal's "the greatest number of creatures a player
controls" over `{ countOf: …, forEachPlayer: true }`, Thought Sponge's "an opponent has
drawn" over `{ turnStat: "cards-drawn", who: "each" }` with `who: "each-opponent"` and
`includingLeft`; inside `difference`, "the player with the most": Tales of the Ancestors,
Scholarship Sponsor. A count of a hand through a filter is `reveal-hand` then `{ thisWay:
"revealed", filter }`: Inquisition, Baleful Stare, Darigaaz, the Igniter),
`{ attackingPlayer: "each" }` (the creatures attacking the player
a per-player effect is acting on — that player, not their planeswalkers;
Within Range's "each opponent loses life equal to the number of creatures
attacking them"), `{ colorsOf: ref }` (how many colours one object has —
Ramos, Dragon Engine's "for each of **that spell's** colors"; as it last
existed if it has left, colourless 0), `{ colorsAmong: CardFilter,
excludeSelf? }` (colours among battlefield permanents, each once — Sisay's
"each color among other legendary permanents you control"),
`{ distinctTokenNames: CardFilter }` (how many differently named tokens among
the matching permanents — Neriv, Crackling Vanguard's "the number of
differently named tokens you control" is `{ token: true, controlledBy: "you"
}`; a token's name is the one its maker gave it — a `tokenName`, or a named
token's own key (Karox Bladewing) — what it copies, or its subtypes plus
"Token" — rule 111.4 — never a generic token's registry key: so a generic
token's key must say "Token", and no card's may),
`{ cardTypesInGraveyard: CardFilter }` (card types among cards in graveyards,
each type once and a two-typed card giving both — Tarmogoyf is `{}`, delirium's
"in your graveyard" `{ ownedBy: "you" }`), and the arithmetic that composes
the rest without every shape growing a modifier: `{ product: [...] }` (Gray
Merchant's "life equal to the life lost this way" is devotion × opponents, and
neither factor is static), `{ sum: [...] }` ("N plus an amount" — "mana value 1
greater than the sacrificed creature's" is `{ sum: [{ manaValueOf: "sacrificed"
}, 1] }`, in a filter's `{ amount }` operand as well as an effect) and
`{ difference: [a, b], absolute? }` (`a` minus `b`, never below 0 — Mr.
Foxglove's "cards in defending player's hand minus the number of cards in your
hand"; `absolute` is the larger minus the smaller, Doran, Besieged by Time's
"the difference between its power and toughness").

**Every amount is at least 0** (rule 107.1b): a sacrificed creature's
negative power gains no life and adds no counters. The arithmetic is done as
written and only its result is clamped. A `modify-pt`/`modify-pt-all` amount
is the one exception, and only for the card's own sign: "-X/-X" is `{
product: ["x", -1] }` (X clamped, then negated — The Meathook Massacre). A
"double its power" is `{ powerOf: ref, doubling: true }` (Unleash Fury,
Okaun), which reads a power below 0 as it is, since doubling a -2 power makes
it -4 (rule 701.10d). "+X/+X, where X is its power" is a plain `{ powerOf }`,
which adds nothing for a negative power.

**"The excess damage dealt this way."** `{ excessDamageThisWay: true, to? }` is
the damage the resolution under way has dealt to permanents past what each
needed (rule 120.4a): past lethal damage for a creature — its toughness less
damage already marked, or 1 from a deathtouch source — past its loyalty for a
planeswalker, the greater for one that's both. `to: n` counts only what went
to target slot `n` ("dealt to that creature this way" in a two-way fight —
Rhino's Rampage). Hell to Pay's "tapped Treasure tokens equal to the amount of
excess damage dealt to that creature this way" is a `create-token` counting it
after the `damage`. The condition `{ kind: "excess-damage-this-way", to? }`
asks whether there was any ("if excess damage was dealt this way"; "when
excess damage is dealt … this way", a `conditional` around a
`reflexive-trigger`).

**Expend, forage and valiant.** "Whenever you expend N" (rule 700.14) is the
trigger `{ on: "expend", who: "you", amount: N }`: the payment for a spell that
takes the mana you've spent on spells this turn from below N to N or more —
once a turn, counting mana spent before the permanent arrived (the rulings);
the running total is the `turnStat` `"mana-spent-on-spells"`. Forage (rule
701.61a) is `forageOptions()`, its two ways as an `each-player-may`'s
`options` — "you may forage. If you do, …" is `{ kind: "each-player-may",
who: "you", options: forageOptions(), ifDid: … }`, each way offered only when
it can be done — and "whenever you forage" is `{ on: "event", event: "forages", who: "you" }`;
forage as a cost isn't built. Valiant is `valiant(effect, text)`: the first
time this turn its controller's spell or ability targets the creature, in
this battlefield stint (a `becomes-target` trigger with `byControllerOnly`
and `firstTimeEachTurn`).

**Parley** (an ability word — Selvala's Charge) is `parley(...effects)`:
"each player reveals the top card of their library. For each nonland card
revealed this way, X. Then each player draws a card" — a `reveal-top` with
`who: "each-player"` (every player reveals, then its `then` runs once with no
targets) whose `then` is the effects and the draw. Each effect reads the
count as `PARLEY_NONLAND` (`{ thisWay: "revealed", filter: { notTypes:
["land"] } }`) — a token count, a counter amount, a `modify-pt-all`'s power
and toughness, `add-mana`'s and `gain-life`'s amount; Phabine's "for each
land card" is `PARLEY_LAND`. The scaffolder reads the three sentences when X
is one unit of a sentence it reads.

**"Those creatures" of a batch trigger.** The filter clause `inSet: "trigger-batch"`
is one of the objects the resolving trigger fired on: the attackers that counted
for an `attacks-batch`, `attack-with` or `attacks-player` trigger (of
`attacks-player`, those attacking that player), the permanents of a batched
entry, the cards of a batched arrival in a graveyard. Each is the object it was
then (rule 400.7), whatever it has become: one removed from combat is still one
of them. Any effect with a filter takes it: Sabotage Strategist's `modify-pt-all`,
Lightmine Field's `damage-all`, `add-counter-all`, `for-each-permanent` for "that
creature" (with `isSource: false`, Creepy Puppeteer). A `delayed-trigger`'s `at`
binds it as it's set up, so "whenever either of those creatures deals combat
damage to a player **this combat**" keeps them (Love on the Battlefield, with
`until: "end-of-combat"`); its `effect` reads the batch its own trigger fires on
(Garruk, Curse Breaker's −4). It matches nothing outside such a resolution.

**"Those creatures", "they gained control of this way".** `thisWay:
"control-effect"` (a filter clause or an amount) is every permanent a control
effect of this resolution applied to, already yours or not: "Untap them. They
gain haste" after a `gain-control-all` is an `untap-all` and a
`grant-keyword-all` of `{ thisWay: "control-effect" }` (Mob Rule's ruling).
`"gained-control"` is only what really changed hands, by its new controller:
Coveted Falcon's `draw` of that amount, Kain's and Yes Man's "if they do" as a
`this-way` condition. "They gain haste" after a return to the battlefield is
`{ thisWay: "put-onto-battlefield" }` (Wake the Past).

**Cards revealed this way, kept on top.** A `reveal-until` reports what it
revealed, so a following step reads `{ thisWay: "revealed", filter? }` wherever
the cards went (Madcap Experiment; Goblin Charbelcher's nonland count, its
Mountain a `this-way` condition with a `filter`). An aggregate `in: { thisWay: "revealed" }` reads a
revealed card even in a library (Naya Soulbeast, whose cast trigger gives the
spell `enters-with-counters`). `{ keptOnTopThisWay: true }` counts what a `scry`
or `surveil` left on top, in its `then` (Starving Revenant).

**"The damage prevented this way."** Right after each hit it's the shield's
`then` with `"x"` (rule 615.5 — Temper, Brace for Impact, Bone Mask, Refraction
Trap; a `prevent-damage-from-chosen-source`'s `then` reads the spell's own
targets, not the source chosen), or `gainLifePrevented`. Read later,
`{ damagePreventedThisWay: true }` is what the shields of this effect's
resolution have prevented so far, in a delayed ability it set up too: Sacred
Boon's `sequence` of a `prevent-damage` and a `delayed-trigger` whose
`add-counter` amount is this, read as that ability resolves.

**"The damage dealt this way."** `{ damageDealtThisWay: true, to? }` is all
the damage the resolution under way has dealt, after prevention — a prevented
hit was never dealt (rule 615.1): Creeping Bloodsucker's "you gain life equal
to the damage dealt this way". The condition `{ kind: "damage-dealt-this-way",
to?, player? }` asks whether any was — to target slot `to`'s player or object,
to players only with `player: true`. "If a creature is dealt damage this way"
(Provoke the Trolls) or "if a Dragon is" (The Black Arrow) is it `all` a
`target` condition on the slot; "if a player is dealt damage this way, they
discard" (Sonic Shrieker) is `{ to: 0, player: true }`; a "you may have it deal
2 damage to you. When you do" (Elektra, Femme Fatale) is `{ player: true }`
around the `reflexive-trigger` (rule 603.12). Never a bare second effect on the
same slot: that runs even when the damage was prevented.

**"This way."** `{ thisWay, who?, filter?, cardTypes? }` counts what the
resolving spell or ability has done **so far** — `thisWay` is one of
`"discarded"`, `"drawn"`, `"milled"`, `"sacrificed"`, `"destroyed"` (a destroy
effect — never a creature dying of damage or to the legend rule), `"died"`
(destroyed *and* put into a graveyard — Saw in Half's "if that creature dies
this way", which indestructible, a regeneration shield or a Rest in Peace
all say no to),
`"exiled"` (permanents and cards from any zone), `"returned-to-hand"`
(Temur Sabertooth's "you may return another creature you control to its
owner's hand. If you do, …": a `choose-permanents` with `min: 0` whose `then`
is `return-to-hand`, then a `conditional` on it — `may-return-if-you-do.test.ts`),
`"put-into-hand"` (cards put into a hand from any other zone, never by a
draw, and still there — a search's find, a look's pick, a milled card taken
back, a return: Adventure Awaits' "if you didn't put a card into your hand
this way, draw a card" is a `conditional` on `{ kind: "this-way", what:
"put-into-hand", atMost: 0 }`, Cache Grab's "returned a Squirrel card to your
hand this way" the same with a Squirrel `filter`),
`"put-into-graveyard"` (cards — tokens aren't), `"put-onto-battlefield"`
(moved there from a zone — not a token created), `"created"` (tokens
created, a compacted stack as each of its tokens), `"countered"` ("for each spell and ability countered this way" — Swift Silence, Glen Elendra's Answer), `"put-on-bottom"`
(cards a `look-and-choose` put from a hand on the bottom of a library —
Valakut Awakening's "draw that many cards plus one"), `"shuffled-into-library"`
(cards a `shuffle-graveyard-into-library` or a `put-on-libraries` `"shuffle"`
shuffled in — Elixir's "the number of cards shuffled into your library this
way") and `"tapped"` (permanents
tapped — Myr Battlesphere's "you may tap X untapped Myr you control. If you
do, this creature gets +X/+0": a `choose-permanents` that taps them, then `{
thisWay: "tapped" }`; one already tapped isn't counted), `"transformed"`
(permanents it transformed or converted — Megatron, Tyrant's "you may convert
Megatron. **If you do**, add {C} …" is a `conditional` on `{ kind: "this-way",
what: "transformed" }`), `"counters-put"`
(permanents it put a counter on — Ripples of Potential's "permanents you
control that had a counter put on them this way", after its proliferate, as a
`choose-permanents` filter's `thisWay`; Fangs of Kalonia's "then double the
number of +1/+1 counters on each creature that had a +1/+1 counter put on it
this way" is a `double-counters-all` over `{ type: "creature", thisWay:
"counters-put" }`, Spectacular Showdown's goad a `goad` with that filter — the
kind isn't asked, so use it only when nothing else was put), and
`"counters-removed"` (counters it removed, one by one — Take's "remove all
+1/+1 counters from target creature you control. Draw that many cards"; with
no `filter` it counts the counters a `remove-player-counters` took
off a player too, rule 122.1 — Leeches' "loses all poison counters … that much
damage to that player"). "Draw a card for each card
discarded this way", Celes's "draw that many cards plus one" (`{ sum: [{
thisWay: "discarded" }, 1] }`), Abdel Adrian's "create a Soldier for each
permanent exiled this way", Dihada's "a Treasure for each card put into your
graveyard this way". A token stack that went whole counts every token in it.
It's read off the resolution's own events (`GameState.resolutionSince`), so a
step that waited on a player's choice — the discard itself, usually — counts
once it has happened; put it in a *later* step of a `sequence`. `who` narrows
whose (default everyone's): the player who discarded, drew, milled or
sacrificed; a destroyed, exiled or returned permanent's controller as it left;
a card's owner otherwise (always, for a graveyard); a permanent put onto the
battlefield's controller there. `who: "each"` is the player a scoped effect is
applied to, read once for each — "destroy all creatures; for each creature
destroyed this way, its controller creates a 3/3 Beast" is `{ kind:
"create-token", token: "3/3 Beast Token", who: "each-player", count: {
thisWay: "destroyed", who: "each" } }`. `filter` narrows them — a permanent
that left doing it as it last existed, a card as it is now (in the graveyard a
discard put it in); `cardTypes: true` counts the card types among them
instead (Kefka, Court Mage); `sharingManaValue: true` counts only those sharing
a mana value with another of them, read where each is (Vault 21: House
Gambit's "for each of those cards that has the same mana value as another card
revealed this way"). `byOwner: true` reads whose each one is by its owner
rather than the player the kind names, for `who` and `perPlayer` — Kefka,
Dancing Mad's "each player who owns a spell you cast this way loses life equal
to its mana value" is a `lose-life` to `"each-player"` of `{ aggregate: "sum",
of: "mana-value", filter: {}, in: { thisWay: "cast", who: "each", byOwner: true } }`.
`perPlayer: "greatest"` sums each player's own and takes the largest —
Windfall's "draws cards equal to the greatest number of cards **a player**
discarded this way". **A total or the greatest of a characteristic is an
aggregate over the set** (§ object sets below): `{ aggregate: "sum", of:
"power", filter: {}, in: { thisWay: "sacrificed" } }` is Reign of the Pit's "X
is the total power of the creatures sacrificed this way", each permanent that
left doing it as it last existed (signed: a -2 counts as -2) and a whole stack
once per token; `of: "toughness"` is Tip the Scales' "the sacrificed
creature's toughness", and Disciple of Bolas's edict ("sacrifice another
creature … X is that creature's power") the power one after a `sacrifice` with
`exceptSource`. `of: "mana-value"` adds up mana values — Combustible Gearhulk's
"the total mana value of those cards" (`in: { thisWay: "milled" }`), each card
read where it went if that's a public zone (rule 701.17c), a card in a library
or hand only if it was shown. `aggregate: "max"` takes the greatest instead —
Heretic's Punishment's "the greatest mana value among the milled cards" — and
`"min"` the least.

**Object sets** (`engine/src/object-sets.ts`, 2026-11-08). One `ObjectSetRef`
names any set a card refers to, and every consumer takes it: an aggregate's
`in`, a filter's `inSet` ("one of them"), a share clause ("shares a creature
type with the exiled card": `sharesCreatureTypeWith: { thisWay: "exiled" }`),
an amount that reads one object (`{ powerOf: { paid: "sacrificed" } }`, "the
sacrificed creature's power"), `create-token-copy`'s `of`. The sets: `{
thisWay, who?, byOwner? }`; `{ paid: "sacrificed" | "discarded" | "exiled" |
"revealed" | "tapped" | "unattached" }`, what the cost took; `"exiled-with-source"`
(rule 607.2a); `"trigger-batch"`; `{ attachmentsOf: "source" }` ("each Aura and
Equipment attached to it", as it last existed once it has left); `{ targets:
[slots] }`; `{ remembered: name }`. Each member is read as it was in the act
once it has moved (608.2h) and acted on only while it's where the set found it
(400.7). In a static (a CDA) only the source's own sets name anything:
Unlicensed Hearse's "equal to the number of cards exiled with it" is `{
aggregate: "count", filter: {}, in: "exiled-with-source" }`. **A delayed or
reflexive ability remembers a set** with `remember: { name: { set, filter? } }`,
captured as it's made: Synthetic Destiny's "exile all creatures you control. At
the beginning of the next end step, reveal … until you reveal **that many**
creature cards" counts `{ remembered: "exiled" }`; Resplendent Marshal's
reflexive "shares a creature type with **the exiled card**" names its creator's
`{ thisWay: "exiled" }` the same way, since a reflexive ability's own this way
is empty. A delayed ability also keeps its creator's X and "that player". The `this-way` condition (§10) asks the same
question as an "if" — Hakbal's "you may put a land card from your hand onto
the battlefield. If you don't, draw a card" is a `look-and-choose` from the
hand, then a `conditional` on `{ kind: "this-way", what:
"put-onto-battlefield", atMost: 0 }` — and the `thisWay` `CardFilter`
clause (below) chooses among them.

### Damage / life / cards

| kind | fields | example |
| --- | --- | --- |
| `damage` | `amount`, `target` \| `who` (+ `whoseIf?`) \| `toControllerOfTarget` \| `toTriggerRecipient`, `from?` | Lightning Bolt (`target`); Breath of Malfegor (`who: "each-opponent"`); `target: "source"` is untargeted "deals 3 damage to itself" (Psionic Entity, beside a target in a `simultaneous` sequence), and with `from: { target: 0 }` "that artifact deals damage … to this creature" (Goblin Tinkerer), nothing once the source has left; `whoseIf` narrows `who` to the players a condition holds for, asked about each as `"that-player"` and dealt it all at once (Outpace Oblivion's "each player who doesn't have max speed"); Unlicensed Disintegration — "deals 3 damage to **that creature's** controller" (`toControllerOfTarget: 0`, mirroring `create-token`'s `who: "target-controller"`). `target: "trigger-object"` is untargeted damage to the trigger's object — "whenever this creature blocks or becomes blocked by a creature, this creature deals 1 damage to **that creature**" (Ornery Goblin: a `blocks` trigger with `object: "blocked"` and a `blocked-by` one, `sameAbilityAs`), Caltrops' "whenever a creature attacks, … deals 1 damage to **it**"; nothing once it has left the battlefield. `toTriggerRecipient: true` is "deals 2 damage to **that permanent or player**" in a damage trigger (Ghyrson Starn) — whatever the triggering damage hit, not a target, and nothing once a permanent recipient has left the battlefield. `from: "trigger-object"` makes the *triggering object* the source — "**it** deals damage equal to its power" (Be'lakor's entering Demon), "**it** deals that much damage to each other opponent" (Kediss's commander): its lifelink, deathtouch and colours apply, read as it last existed on the battlefield if it has left. `from: { target: n }` makes a *target* the source — Chandra's Ignition's "**target creature you control** deals damage equal to its power to … each opponent" (`DamageFrom`); a blank slot (an illegal target) deals nothing. `excessToController: { ifSourceHas? }` is "excess damage is dealt to that creature's controller instead" (Ram Through, with `ifSourceHas: "trample"`): beyond lethal — toughness less damage marked, 1 from deathtouch, ignoring prevention and indestructible (rule 120.4a) — goes to the controller, both at once. `then` is what else the redirect does when there was excess, once the damage is dealt (Megatron, Destructive Force's "…instead that damage is dealt to that creature's controller **and you convert Megatron**": `then: { kind: "transform", target: "source" }`). |
| `damage-divided` | `from` | "N damage divided as you choose among any number of targets" (Magma Opus): each target of the group from slot `from` on is dealt its share of the spell's division. The card says `divided: { total, slot }`; the cast announces the split (`division`, at least 1 each, all of the total — rule 601.2d; left out, an even split), a copy keeps it, and a target gone illegal loses its share (608.2b). Give the group a `max` of the total. **An ability divides too**: `divided: { total, slot }` on an activated ability (Skarrgan Hellkite's "2 damage divided as you choose among one or two targets" — the activation's `division`, rule 602.2b) or a triggered one (Dragonlord Atarka, Inferno Titan — the `choose-targets` answer's `division`, 603.3d; the offer's `divide` names the group's place in the answer, and the client asks the split as it does a cast's). Not `damage-divided-evenly`, which re-divides among the targets left: a two-target split whose one target goes still deals the other only its share (the Skarrgan ruling). |
| `counters-divided` | `from`, `counter` | "Distribute three +1/+1 counters among one, two, or three target creatures" (Armament Dragon, Glint Weaver; Stolen Goodies' "any number of" — `min: 0`): the ability's or spell's `divided: { total, slot, of: "+1/+1 counters" }` and an `any-number` target group, each target getting its share (at least one) as counters. `of` is what the division prompt calls it ("Divide 3 +1/+1 counters"). A total that isn't a fixed number reads as `divided`'s does (§3: a spell's `x: true`, or any amount read as it's announced — Undercity Upheaval's `{ countInGraveyard: … }` "as you cast this spell", Quirion Beastcaller's `{ countersOn: "source" }` from its dies trigger, Broodlord's ETB `"x"`). A distribution **without targets** is `counters-distributed`. |
| `counters-distributed` | `counter`, `total: EffectAmount`, `filter`, `controlledByTarget?`, `among?` | "Distribute N +1/+1 counters among any number of creatures you control" with no "target" (rule 608.2d — Vastwood Hydra, Feast of the Victorious Dead, Blessing of Frost): `total` read as it resolves; the controller chooses which of the permanents matching `filter` (from their side, or target slot `controlledByTarget`'s player's — Invoke Justice's "target player controls") get any, none to `total` of them (a token stack once per token — `choose-permanents`), then a share for each but the last (`choose-number`, at least one each, leaving one for each still to come; the last takes the rest). Not targeted, so hexproof doesn't stop it. `among` is the prompt's noun ("creatures you control"). "You may distribute" is a `may` around it. Not built: a required recipient (Stumpsquall Hydra's "among it and any number of commanders"). `counters-distributed.test.ts`. |
| `damage-divided-evenly` | `amount`, `from` | Fireball's "X damage divided evenly, rounded down, among any number of targets": the targets from slot `from` on (an `any-number` group) each take `amount` divided by how many are still legal as it resolves, all at once; more targets than damage deals none. |
| `damage-all` | `filter`, `amount`, `exceptSource?`, `whose?`, `from?` | Pyroclasm. `from` as `damage`'s: Chandra's Ignition's "target creature you control deals damage equal to its power to each **other** creature" is `from: { target: 0 }` with `exceptSource`, which then spares the creature dealing it; with the opponents' damage in a `simultaneous` `sequence`, it's one instruction. `exceptSource` spares the source itself — Harbinger of the Hunt's "each **other** creature with flying", which a `CardFilter` can't say (it describes the permanent matched, not its relationship to the damage source). `whose` (a `PlayerScope`) is only the permanents those players control: Balefire Dragon's "it deals that much damage to each creature **that player** controls" is `"trigger-player"`. |
| `creatures-damage-controllers` | `filter`, `amount` | Rakdos Charm — "each creature deals 1 damage to its controller"; the reverse direction from `damage-all` (each matching permanent is its own source, hitting its own controller, not the caster). needed-cards P20 |
| `each-deals-damage` | `filter`, `amount` (an `EffectAmount` or `"its-power"`), `to` (`"itself"` \| a target slot \| `"trigger-object"` \| `{ who }`), `controlledByTarget?`, `exceptSource?`, `exceptTarget?` | Every permanent matching `filter` deals the damage, each its own source (lifelink, deathtouch per source), read once and dealt at once (one damage event). Solar Blaze — "each creature deals damage to itself equal to its power" (`to: "itself"`); Moonlight Hunt — "each creature you control that's a Wolf or a Werewolf deals damage equal to its power to that creature" (`to: 0`); Bartz and Boko's "each **other** Bird" (`exceptSource`); Lukka's "… to each opponent" (`to: { who: "each-opponent" }`); Sarkhan the Masterless's "each Dragon you control deals 1 damage to that creature" (`amount: 1, to: "trigger-object"`); Alpha Brawl's "each of those creatures" (`controlledByTarget: 0, exceptTarget: 0`). Not for one creature's damage (`fight` `oneSided`, or `damage` with `from`) `to: "host"` is each one to what it's attached to: Aura Barbs' "each Aura attached to a creature deals 2 damage to the creature it's attached to". `filter: { thisWay: "created" }` is the token just made as the source, once for each token, with the amount read once: Chainer's Torment's "It deals X damage to you". |
| `gain-life` | `amount` (an `EffectAmount`), `who?` | Healing Salve; Shamanic Revelation's "4 life for each creature you control with power 4 or greater" is `{ countOf: …, times: 4 }` |
| `set-life-total` | `who` (a player target slot, a scope, or a `ChosenPlayerRef`), `amount` | "Your life total becomes 4", "target player's life total becomes 10" (Magister Sphinx), "each player's life total becomes the number of creatures they control" (Biorhythm: `{ countOf, forEachPlayer: true }`), "the lowest life total among all players" (Repay in Kind: `{ amongPlayers: "least", of: { lifeTotal: "each" } }`), "half your starting life total, rounded up" (The Endstone: `{ half: { startingLifeTotal: true }, round: "up" }`). Rule 119.5: a real gain or loss of the difference, so life triggers and replacements see it. Never write it as a `gain-life` or `lose-life` of a computed amount. |
| `lose-life` | `amount`, `who?` \| `target?` | Zulaport Cutthroat (`who`); Ob Nixilis, the Fallen — "target player loses 3 life" (`target`, a target-slot index — mutually exclusive with `who`, needed-cards P19). With `target`, a per-player amount is the target's own: Peer into the Abyss's "target player … loses half their life" is `{ half: { lifeTotal: "each" }, round: "up" }`. |
| `draw` | `amount`, `who?`, `target?` | Divination (controller draws); Stormfist Crusader (`who: "each-player"`); Bloodgift Demon (`target`, a player slot). `target` wins if both are set. `who: { controllerOf: i }` is "its controller draws" (Call to Heel), read as the permanent last existed. |
| `discard-hand` | `who` (a scope, a player target slot, or an `PlayerRef` object), `filter?`, `reveal?` | Dragon Mage — "each player discards their hand". A whole hand at once with nothing to choose, so unlike `discard` it never raises a decision, which is what lets "discards their hand, **then** draws seven" resolve in one pass. With `filter`, "discards **all** [filter] cards" (Amnesia's `{ notTypes: ["land"] }`, Trapfinder's Trick's `{ subtype: "Trap" }`, Shatter Assumptions' `colorless`/`multicolored`; a `choose-card-name`'s `{ hasName: CHOSEN_CARD_NAME }`), still asking nobody; `reveal: true` is "reveals their hand and discards…" (the whole hand, rule 701.20a). `discard-filtered.test.ts`. |
| `discard` | `target` (slot \| a `PlayerScope` \| `{ controllerOf: i }` — Assassin's Strike's "its controller discards a card"), `amount`, `random?`, `unlessOne?`, `anyNumber?`, `filter?` | Mind Rot / Faithless Looting (`"you"`) / "each opponent discards a card" (`"each-opponent"`). A scope asks each player with a real choice **in turn**, APNAP (`GameState.pendingDiscards`); a player whose hand is no bigger than the count discards it at once. `random: true` is "discards a card at random" (Hypnotic Specter): nobody is asked, and the game picks with its seeded shuffle. `unlessOne: CardFilter` is "discards two cards unless they discard a land card" (Compulsive Research; Thirst for Knowledge's "unless you discard an artifact card", `discard-unless-one.test.ts`): one card matching it is a whole answer by itself, and a hand of two or more holding one is a real choice even when it's no bigger than `amount`. `anyNumber: true` is "discard any number of cards" (Chance, Neheb, Dreadhorde Champion): the player picks how many, none to their whole hand (`amount` is ignored — write `0`); "then draw that many" is `{ thisWay: "discarded" }`. `filter: CardFilter` limits it to matching cards: "discard **a creature card**" (Hidden Horror's "sacrifice it unless…" is a `may` with `else: sacrifice-source`, never offered without one), "you may discard a land card. If you do…" (Pack Guardian), "discard any number of land cards" with `anyNumber` (Nantuko Cultivator, Mind Maggots). `discard-any-number.test.ts`, `discard-filtered.test.ts`. |
| `discard-chosen` | `target` (a player slot), `filter?`, `optional?`, `lookOnly?`, `upTo?`, `reveals?`, `picks?`, `chooser?` (another player chooses from the revealed hand — Rakdos Augermage's "discard a card of target opponent's choice": `target: "you"`, `chooser: { target: 0 }`) | `reveals` is "target player reveals **three cards from their hand** and you choose one of them" (Blackmail: `reveals: 3`; Mire's Toll's `{ countOf }`; Cabal Interrogator's `"x"`), the hand's owner picking which to show and the choice over those alone; `picks` is "you choose **two** of them" (Noggin Whack). "Target opponent reveals their hand. You choose a noncreature, nonland card from it. That player discards that card" (Duress: `filter: { notTypes: ["creature", "land"] }`; Thoughtseize, Inquisition of Kozilek's `manaValue`). The whole hand is revealed to everyone (rule 701.20), the effect's controller chooses (a `choose-from-zone` with destination `"discard"`), and the hand's owner discards it (701.9a — discard triggers see it, and it's `"discarded"` this way). "You choose" must take a card when one matches; with none, nothing is asked. `optional` is "you **may** choose"; `lookOnly` is "look at target player's hand" (only the chooser sees it). Oildeep Gearhulk's "if you do, that player discards that card, then draws a card" is a `sequence` with a `this-way` `"discarded"` conditional draw. `upTo` (an amount) is "choose **up to X** cards from it" (Discordant Dirge: `upTo: { countersOn: "source", counter: "verse" }`). `destination?: "exile" \| "library-top" \| "battlefield"` sends the chosen card elsewhere instead of discarding it — not a discard, so nothing that looks for one sees it: "you choose a nonland card from it and **exile that card**" (Thought-Knot Seer; linked to the permanent's stint, rule 607.2a, for Tidehollow Sculler's `return-exiled-by-source`, unless `unlinked: true`), "put that card **on top of that player's library**" (Painful Memories, with `lookOnly`), "put a creature card from it **onto the battlefield under your control**" (Treacherous Urge), `"library-bottom"` its owner's library bottom. `alsoFrom` widens the one choice to another of that player's zones: `{ zone: "graveyard", filter? }` — "you choose a nonland card from it **or a card from their graveyard**. Exile that card" (Agonizing Remorse: the hand by `filter`, the graveyard by its own, any card when omitted; a card must be taken if either zone has one); `{ zone: "library-top" }` — "reveals their hand **and the top card of their library**. You choose a card revealed this way. That player puts the chosen card on the bottom of their library" (Psychotic Episode, `destination: "library-bottom"`; the top card is revealed too and always choosable). Not with a discard. `mayPlay` is what the effect's controller may then do with the card exiled, as `exile`'s: Psychic Intrusion's "you may cast that card for as long as it remains exiled, and you may spend mana as though it were mana of any color" (`{ duration: "while-exiled", spendAs: "any-color" }`), the one filter in both places for "a nonland card from that player's graveyard or hand" (Memory Leak). `target` may also be a player the event names: Ghastlord of Fugue's "**that player** reveals their hand" is `"trigger-player"`. The scaffolder reads "Target opponent reveals their hand. You choose a … card from it [or a card from their graveyard] [and exile that card]" and Psychotic Episode's three sentences whole. `chosen-from-hand-destination.test.ts`, `choose-across-zones.test.ts`. |
| `look-at-hand` | `target` (a player slot) | "Look at target player's hand" alone (Glasses of Urza, Sorcerous Sight, Talas Explorer): only the effect's controller sees it, asked as a `choose-from-zone` with nothing to pick, closed with Done. Not "look at its controller's hand" (Lay Bare: no target slot names that player). |
| `look-at-library-top` | `target` (a player slot), `count?` (default 1) | "Look at the top card of target player's library" alone (Mishra's Bauble, Merfolk Observer), or the top `count` (Orcish Spy's three, as many as there are): as `look-at-hand`, the cards stay where they are, and an empty library asks nothing. With something to do to the card ("you may put that card into their graveyard", "on the bottom of that player's library") it's a `look-and-choose` with `from` (`{ target: 0 }`, or `"trigger-player"` for "defending player": Coral Fighters), inside a `may` for "you may look" (Precognition). A payment on it is `destination: "stay"` with a `then` of a `may` with `costLife` around `{ kind: "put-into-graveyard", target: 0 }`, which takes a card in a library as well as one in exile (Wand of Denial). |
| `mill` | `target` (slot \| a `PlayerScope`), `amount` | Tome Scour / Aftermath Analyst (`"you"`) / Hope Estheim (`"each-opponent"`) |
| `exile-from-library` | `whose?` (slot \| a `PlayerScope`, default `"you"`), `amount?` \| `allBut?`, `withCounters?`, `linked?`, `faceDown?` | (`linked`: exiled with this source, rule 607.2a — Nightveil Specter. `faceDown`, rule 406.3: `true` is "exile it face down. (You can't look at it.)", nobody may — Bomat Courier, Pyxis of Pandemonium; `"looked"` is "look at it, then exile it face down", the effect's controller alone, whoever controls the source later — Kayla's Music Box. The source's other abilities reach them: `return-exiled-by-source`'s `linked`, `turn-exiled-face-up`, a `linked` `mayPlay`, a `look-and-choose`'s `zone: "exiled-with-source"`, which takes a face-down one at random from its pile.) Exile the top `amount` cards of a library face up, or all but the bottom `allBut` — Nicol Bolas, the Arisen's "exile all but the bottom card of target player's library" is `{ whose: 0, allBut: 1 }`. No permission to play them (that's `impulse-exile`); `{ thisWay: "exiled" }` counts them. `withCounters: { kind, amount }` is "…and put a fetch counter on each of them" (Pako, Arcane Retriever). |

`who?` is a `PlayerScope`: `"each-player" \| "each-opponent" \| "you" \|
"active-player" \| "trigger-controller" \| "trigger-player" \|
"each-other-opponent" \| "that-player" \| "you-and-opponents-attacking-trigger-player" \|
{ controllerOf: "attached" } \| "opponents-of-trigger-controller"`
(default = the effect's controller). `{ controllerOf: "attached" }` is "enchanted
creature's controller" (Gremlin Infestation; read as the host last existed if
both left together; a sentence going on once the host may be gone names the
player first with a `for-each-player`). `"opponents-of-trigger-controller"` is
"each of that player's opponents" / "each other player" (Standstill, Bounty
Board). `"active-player"`
is "that player" in a trigger that fires on someone else's step.
`"trigger-controller"` is the controller of the triggering object (the player
who drew the card, cast the spell). `"trigger-player"` is **the player the
triggering event names** — the player dealt damage (or the controller of the
permanent dealt damage), the defending player of an attack (a planeswalker's
controller when the attack was at it); nobody outside such a trigger.
`"each-other-opponent"` is each of your opponents **but** that one (Kediss:
"it deals that much damage to each other opponent"). `"that-player"` is the
player an `each-player-may`'s follow-up is about (and otherwise the same as
`"trigger-player"`). `"you-and-opponents-attacking-trigger-player"` is the
Commander 2017 Curses' "[do X]. Each opponent attacking that player does the
same": you, then each of your opponents controlling a creature attacking the
trigger player as it resolves (just you, once none are). `"attacked-players"`
and `"you-and-attacked-players"` are "**those players**" of "whenever one or
more Devils you control attack one or more players" (Zurzoth, Chaos Rider — an
`attacks-batch` trigger whose `filter` has `attackingPlayer: true`): each
player one of the counted attackers was declared attacking, not one whose
planeswalker or battle was attacked, whatever became of the attackers since;
nobody outside an attack trigger. A Curse's trigger
whose event names no player names **the enchanted player** as its trigger
player (Trespasser's Curse's "that player loses 1 life"). "At the beginning of
**enchanted player's** upkeep / draw step / end step" is a `step-begins` trigger
with `who: "attached"`: it fires only in that player's own step, so "that
player" is `"active-player"` (Curse of the Bloody Tome, Cruel Reality, Torment
of Scarabs' `unless` with `chooser: "active-player"`); the scaffolder reads the
trigger clause. "Whenever **enchanted player** draws a card" is a `draws`
trigger with `who: "attached"`, once per card, "they" being who drew,
`"trigger-controller"` (Curse of Fool's Wisdom).

**An `unless`'s options**, one kind per payment (rule 118.12a), each offered only to
a player who can do all of it: `{ pay, times?, andLife?, ifPaid?, waterbend?, text }` ("{1} and 1
life" — Mundungu; "{G} for each wind counter on it. If you pay, …" — Cyclone,
`ifPaid` being the chooser's effect like the payment; `waterbend: true` is "unless
you **waterbend {2}**" — Waterbending Lesson, each {1} of `pay` payable by tapping
an untapped artifact or creature, rule 701.67a), `{ payGeneric }`, `{ payLife }`,
`{ payLifeAmount, text: "Pay {X} life" }` ("life equal to its toughness" — Essence
Vortex), `{ payManaCostOf, ifPaid?, text: "Pay {X}" }` (an object's mana cost, "that
spell's mana cost" — Ice Cave, Tariff: X as chosen for a spell on the stack and 0
otherwise, rule 107.3h; none, and it isn't offered, 118.6), `{ doing, text }` (**any
effect, done by the chooser**, "you" in it being them: Grip of Amnesia's "exiles all
cards from their graveyard", Perplex's "discards their hand", Tainted Specter's "puts a
card from their hand on top of their library"; offered as a `may` of it would be, so
not "a card" with none, while an empty graveyard can still be exiled. Reach for this
before a new option kind; when the chooser is `"you"`, it's a `may` with an `else`
instead: Hidden Horror), `{ payEnergy }` (Rush of Inspiration), `{ sacrifice, exceptTarget? }`
(`exceptTarget`: "another" beside a target — Torment of Venom), `{ putCounter, on }`,
`{ returnToHand }` (Karoo), `{ tapPermanent }` (Command Bridge; both filters say
`tapped: false` and `controlledBy: "you"`, you being the chooser), `{ sacrificeThat }`
("sacrifices it" — Enchanter's Bane with a slot, Curse Artifact with `"attached"`,
only while the chooser controls it), `{ discard }`, `{ exileFromGraveyard }`,
`{ putFromHand }`, `{ takeDamage }`. Several at once — "unless you sacrifice three
creatures, pay 3 life, and have target opponent draw three cards" (Tresserhorn's Lord,
Returned) — is one `{ allOf: [...parts], text }`: offered only when every part can be
done (rule 118.3), then each done in order; no part may pay mana.

**"Unless any player pays {N}"** (Prophecy's rhystic cards — Rhystic Tutor,
Wild Might, Icy Prison, Soul Strings' `payGeneric: "x"`) is `unless` with
`chooser: "any-player"`: each player still in the game is asked in turn from
the active player (rule 101.4, and the rulings), the next only once the one
before has declined or couldn't pay, and `otherwise` happens only if none did.
"Any player may have Browbeat **deal 5 damage to them**. If no one does, …" is
the same with the option `{ takeDamage: 5, text }` — the effect's source deals
it to whoever takes it, always open to anyone (Breaking Point, Book Burning,
Barbarian Bully's "unless a player has this creature deal 4 damage to them").
"**Any opponent may** have you put that card into your graveyard. If a player
does, … that player …. Otherwise, …" (Sin Prodder, Distant Memories) is `chooser:
{ anyOf: "each-opponent" }` with the option `{ doing, text }`: the first yes ends
it, `doing` is that player's own effect ("you" in it is them), and it isn't
offered when it couldn't be done (`mayBeDone`, rule 608.2d) — nothing revealed,
nothing exiled — so `otherwise` happens. Where a no does nothing at all, one
named player's "may" is `each-player-may`: `who: { controllerOf }` ("its
controller / that player may search", Arcum Dagsson, as it last existed) or
`"trigger-controller"` ("its controller may", Farrel's Mantle, whose Aura may be
someone else's, and who chooses the ability's targets). Its `effect` isn't
offered to a player who couldn't do it (`mayBeDone`, as for a plain `may`) and
counts as their not doing it: "they may tap that permanent. If they don't, you
create …" is `who: "trigger-player"` (the opponent it entered under), `ifDidnt`
the token, and the token comes with it already tapped or gone (Charismatic
Conqueror, rule 701.26a).
"When you cast this spell, **any player may pay 5 life. If a player does, counter
~**" (Dash Hopes) is an `each-player-may` of `who: "each-player"` with the
payment in `options` and `ifDid: { kind: "counter", target: "source" }`: everyone
is asked, even after one has paid (the ruling). An `each-player-may`'s option may
be `{ payLifeAmount, text: "Pay {X} life" }`, read for each player as they're
asked, a per-player amount being their own: "any player may pay **half their
life**, rounded up" (Temporal Extortion) is `{ half: { lifeTotal: "each" }, round:
"up" }`. The scaffolder reads both sentences. `each-player-may-life-amount.test.ts`.
Not yet: "**if** any player pays {2}, [effect]" (Rhystic Scrying), or one asked per object (Cleansing's
"for each land … unless any player pays 1 life"). The scaffolder reads the
"[effect] unless any player pays {N}." and "Unless any player pays {N}, [effect]."
sentences. None of these is a target, so hexproof doesn't stop them.

### Movement / removal

| kind | fields | example |
| --- | --- | --- |
| `tap` | `target` (an index, `"source"`, or `"trigger-recipient"`), `doesntUntapNext?`, `onlyDoesntUntap?`, `doesntUntapSteps?`, `untapStepOf?` | `"trigger-recipient"` is what a `deals-damage` trigger's damage hit, as `destroy` reads it: Kashi-Tribe Warriors' "deals combat damage to a creature, tap **that creature** and it doesn't untap during its controller's next untap step", nothing once it has left the battlefield. `"source"` taps the effect's own permanent with no target — Territorial Hellkite's "tap this creature" — while it's still that object. `doesntUntapNext` is "**it doesn't untap during its controller's next untap step**" (Junk Winder), tapped by this or already: the next untap step of whoever controls it then — the effect follows the permanent, not the player (Icy Blast's ruling) — and only its controller's (one it untaps in under Seedborn Muse isn't). With `onlyDoesntUntap` it's only that, untapped left untapped — "target creature doesn't untap during its controller's next untap step" with no "tap" (Kefnet's Monument, Barl's Cage, Stitcher's Graft's `"trigger-object"`, Vorinclex's land). `doesntUntapSteps: 2` is "its controller's next **two** untap steps" (Telekinesis), counted whoever controls it during each. `untapStepOf: "you"` is "during **your** next untap step" (Reveka, Samite Alchemist, Spectral Bears, the Tempest pain lands): the effect's controller's, so one that changes hands comes back under its new controller without a pause. Overlapping holds run side by side rather than add. `untap-holds.test.ts`. |
| `tap-all` | `filter`, `doesntUntapNext?`, `onlyDoesntUntap?`, `doesntUntapSteps?`, `controlledByTarget?`, `untapStepOfTarget?` | Thundermaw Hellkite's "Tap those creatures" — the mirror of `untap-all`. `tap` only ever takes one chosen target. `doesntUntapNext` / `onlyDoesntUntap` as `tap`'s — Tangle's "each attacking creature doesn't untap during its controller's next untap step". `controlledByTarget: N` reads `filter` from the side of the player in target slot N — "… **target player** controls" (River's Rebuke, Naya Charm), so its `controlledBy: "you"` is them. `untapStepOfTarget` (with both) is Sleep's "during **that player's** next untap step", tied to the target player's untap step (`GameObject.skipsUntapOf`). |
| `phase-out` | `target?` \| `attachedToSource?` \| `filter?` + `controlledByTarget?`, `untilSourceLeaves?`, `tappedOnReturn?` | Phasing out (rule 702.26b): the permanent is treated as though it doesn't exist — out of every battlefield read, untargetable, unaffected — without changing zones, so no leaves or enters trigger fires and it keeps its counters, status, attachments and stint (702.26d); it's removed from combat (506.4), and a "for as long as" effect tracking it ends (702.26f). What's attached to it phases out with it, indirectly (702.26g–h). It phases in as the untap step of the player who controlled it begins, before anything untaps (502.1), under whoever controls it then. **Which:** `target` (a slot, `"source"` — Kaito's "he phases out", Vision's mode — or `"trigger-object"`); `attachedToSource` is "equipped creature phases out" (Robe of Stars), the creature the source is attached to as it resolves; `filter` is every match at once from the controller's side — Teferi's Protection's "all permanents you control" `{ controlledBy: "you" }`, Galadriel's Dismissal's kicked "each creature target player controls" `{ type: "creature", controlledBy: "you" }` with `controlledByTarget: 0`. Several targets at once are a `for-each-target` with `simultaneous` (Clever Concealment, Guardian of Faith). **"Until [this] leaves the battlefield"** (Oubliette — rule 610.4) is `untilSourceLeaves`: it doesn't phase in at an untap step, only right after the source leaves (a source phased out hasn't left), and not at all if the source left before this resolved (610.4c); `tappedOnReturn` is "tap that creature as it phases in this way" — tapped as it arrives, which no "becomes tapped" trigger sees. **What it phased out** is `{ thisWay: "phased-out", filter? }`, each permanent read as it last was on the battlefield, a token stack as every token, what went with them indirectly included unless the filter leaves it out — Out of Time's "a time counter for each creature that phased out this way" is `filter: { type: "creature" }` after a `phase-out` of `{ type: "creature" }`. `phasing.test.ts`, `phased-out-this-way.test.ts`. |
| `counter` … `thenSource?` | `{ effect, filter?, evenIfNotCountered? }` | "If a permanent's ability is countered this way, destroy that permanent" (Green Slime, Teferi's Response): `effect` with the ability's source at target 0, only while it's still that permanent (rule 400.7). `filter`: "an ability of an artifact, creature, or planeswalker" (Tishana's Tidebinder, `become` for `"while-source"`). `evenIfNotCountered`: "…and destroy that artifact if it's on the battlefield" (Ouphe Vandals). Slots: `"activated-or-triggered-ability"`; `{ kind: "ability", whose?: "you" \| "opponent", abilityKind?, sourceTypes?, sourceFilter?, otherSource? }` ("you don't control" is `"opponent"`; `sourceFilter` is a `CardFilter` on the ability's source as it is or last was — "from a colorless source", Abstruse Archaic — and `otherSource` "from another … source", The Peregrine Dynamo); `{ kind: "stack", spells, abilities, whose?, targeting? }` — Disallow's three nouns, Teferi's Response's "an opponent controls that targets a land you control" (`targeting` as a filter's `targets`). |
| `for-each-on-stack` | `spells?`, `abilities?`, `whose?: "you" \| "opponent"`, `filter?` ("with those names": `{ sameNameWith: "exiled-with-source" }`), `effect` | `effect` at target 0 for each spell and/or ability on the stack, nobody choosing, never what's resolving: "counter all abilities your opponents control" (Kadena's Silencer), "exile all other spells and counter all abilities" (Summary Dismissal). An ability object standing for several copies is that many turns. `effect` mustn't stop to ask anything. |
| `choose-permanents` | `filter`, `upTo`, `min?`, `then`, `prompt`, `exceptSource?`, `remember?` (the one chosen kept as the source's "chosen creature" — see *Choosing a permanent as an ability resolves*), `together?: { distinctPowers: true } \| { distinctNames: true } \| { totalPowerAtLeast: n }`, `keepTargets?: true` | `keepTargets`: `then` still reads the resolution's own targets, from slot 1 ("choose a Giant creature you control. It deals damage equal to its power to **target creature**" — Crush Underfoot, `then: { kind: "fight", a: 0, b: 1, oneSided: true }`). `totalPowerAtLeast` is "any number of creatures **with total power 12 or greater**", each token of a stack counted, a negative power subtracting (`unless`'s sacrifice option, Phyrexian Dreadnought). `together` is "any number of creatures **with different powers**" (Sigarda's Vanguard), "tokens **with different names**" (Battle for Bretagard): `upTo: 99`, the offer capped at how many there can be; a token stack is one pick. A choice of permanents made **as it resolves, with no targeting** — "untap up to two lands" (Snap, Frantic Search, Peregrine Drake): `{ kind: "choose-permanents", filter: { type: "land" }, upTo: 2, then: { kind: "untap", target: 0 }, prompt: "Untap up to two lands" }`. The effect's controller picks from `min` (default 0) to `upTo` of the battlefield permanents matching `filter` from their side — anyone's, unless the filter says whose — and `then` applies to each as target 0 (a `choose-permanents` decision). Nothing chosen this way can make the spell fizzle, and a hexproof permanent can be chosen; don't author "up to N lands" as optional target slots, which gets both wrong. Nothing is asked when nothing matches. `then` shouldn't stop to ask anything itself. Every pick is one event (rule 608.2c — one instruction): God-Eternal Bontu's "sacrifice any number of other permanents" sacrifices them all at once, so a "whenever one or more" trigger sees one batch. `exceptSource` leaves the effect's own source out (Abdel Adrian, Gorion's Ward's "any number of **other** nonland permanents you control"). Steps after it in a `sequence` run once the choice is answered (Abdel Adrian's Soldiers count `{ thisWay: "exiled" }`). |
| `untap` | `target: ObjectRef` — an index, `"source"`, or `"trigger-object"`; `by?` | Amulet of Vigor: `target: "trigger-object"` untaps the permanent whose entering fired the trigger, with no target slot at all. `by` (an `PlayerRef`) is "that player … untaps it" (Alexios, Deimos of Kosmos: `"active-player"`): a player who has left the game untaps nothing. |
| `destroy` | `target` (a slot, or `"trigger-object"` — Mikaeus, the Unhallowed's "whenever a Human deals damage to you, destroy **it**" — or `"trigger-recipient"`, what a `deals-damage` trigger's damage hit: Stinkweed Imp's "deals combat damage to a creature, destroy **that creature**", nothing once it has left the battlefield), `cantBeRegenerated?` | Doom Blade. `cantBeRegenerated: true` is "It can't be regenerated" (Terminate, rule 701.15c): a regeneration shield doesn't replace this destruction. |
| `regenerate` | `target: ObjectRef` | "{B}: Regenerate this creature" (Mortivore: `target: "source"` — or the `regenerateSelfAbility(cost, text)` helper), "Regenerate target creature" (a slot). Rule 701.15a: the permanent gets a shield that replaces the next time it would be destroyed this turn — by an effect, or by lethal or deathtouch damage — with removing all damage from it, tapping it and removing it from combat (an attacker it was blocking stays blocked). One shield per regeneration; unused ones go at cleanup. 0 toughness, sacrifice and the legend rule aren't destruction, so no shield helps. |
| `regenerate-all` | `filter` | "Regenerate each creature you control" (Wrap in Vigor). |
| `put-on-bottom-of-library` | `target` | Condemn — buries a permanent under its **owner's** library. Not a shuffle and not a bounce, which is why it isn't a `return-to-hand` variant. |
| `exile-if-dies-this-turn` | `target` (slot, `"source"`, `"trigger-object"`) | "**If that creature would die this turn, exile it instead**" (Lava Coil, Ob Nixilis's Cruelty, Mawloc's fight — rule 614.1a): put after the effect that targeted, on the same slot. A replacement that follows that permanent until the turn ends or it changes zones (`GameObject.exileIfDiesTurn`), whether or not the damage was dealt and whatever kills it — a creature or planeswalker going to a graveyard from the battlefield. A player target (any target) is left alone. `dealtDamageThisWay: "creature"` (no `target`) is "If a **creature dealt damage this way** would die this turn, exile it instead" (Anger of the Gods, Incendiary Flow): every creature the resolution has dealt damage to so far, so it goes after the damage — a target whose damage was prevented isn't covered, nor is a planeswalker; `"permanent"` covers planeswalkers too (Underworld Fires, Torch the Tower's "a permanent dealt damage by ~"). The scaffolder reads both sentences: the target form after a one-target sentence, the other after one that deals damage. |
| `destroy-all` | `filter`, `cantBeRegenerated?`, `controlledByTarget?`, `exceptSource?`, `exceptTriggerObject?` | Wrath of God (`cantBeRegenerated: true` — "They can't be regenerated"). `exceptTriggerObject` spares the trigger object while it's still that object (rule 400.7) — Eye of Singularity's "destroy all **other** permanents with that name", with `sameNameAsTriggerObject`. `exceptSource` is "destroy all **other** creatures" (Novablast Wurm), "all permanents **other than this Equipment**" (Worldslayer), "except for Mageta". `controlledByTarget: N` reads `filter` from the side of the player in target slot N — "… **target player** controls" (River's Rebuke, Naya Charm), so its `controlledBy: "you"` is them. |
| `exile` | `target`, `untilSourceLeaves?`, `withCounters?`, `mayPlay?: PlayGrant` (a permission over the card exiled, for any `impulse-exile` duration — `play` takes a land too: Victor Mancha, Runaway's `"while-you-control"`, Scholar of Combustion's `"your-next-turn"`, Containment Construct's `"end-of-turn"`; `byOwner` is "**its owner** may play it", the window read from their side: Suspend Aggression's "until the end of their next turn"; `free` "without paying its mana cost", only so: Release to the Wind; `tax` "a spell cast this way costs {2} more", `opponentsOnly` "by an opponent": Soul Partition. The same `ExilePermission` is `discard-chosen`'s `mayPlay` — Elite Spellbinder — and `look-and-choose`'s `mayPlay`, which plays unless `castOnly`: Gonti, Lord of Luxury; `landsEnterTapped`: Lightstall Inquisitor), `airbend?` | Angelic Edict. `target: "trigger-recipient"` is what a `deals-damage` trigger's damage hit, as `destroy` reads it — Pit Spawn's "deals damage to a creature, exile **that creature**". `airbend: true` is **airbend** (rule 701.65a — Airbending Lesson, Aang): the card this exiled may be cast from exile by its **owner** (not the effect's controller) for {2} rather than its mana cost for as long as it stays there (`GameObject.airbended`, offered as a `via: "airbend"` cast) — an alternative cost, so no other goes with it (no evoke, overload or free cast), while kicker and mandatory additional costs are paid on top and X is 0; a token exiled ceases to exist and a land card can't be played. Several targets airbended are one instruction: a `simultaneous` `sequence` (Whirlwind Technique's "up to two target creatures") or a `simultaneous` `for-each-target` over an `any-number` group (Appa, Steadfast Guardian). Works on a card in a **graveyard** as well as a permanent (Withered Wretch), and on a **spell**: it leaves the stack without being countered, so one that can't be countered goes too (Mindbreak Trap), and a copy ceases to exist (rule 707.10c). `untilSourceLeaves` is an "O-Ring" (Banishing Light, Conclave Tribunal) — see below. `target` may be `"trigger-object"`: a dies trigger's "you may exile it" (Brenard, Ginger Sculptor; Myrkul, Lord of Bones), which acts only while it's still the card that died (rule 400.7 — reanimated in response, it's a new object and stays put); follow it with a `this-way` `"exiled"` `conditional` for "if you do". `withCounters: { kind, amount }` is "exile it **with a croak counter on it**": counters the card gets in exile, only if this effect put it there (whatever it had on the battlefield is gone, rule 400.7). `mayPlay: { duration, spendAs?, … }` gives the controller an impulse permission to *cast* the card this exiled ("you may cast that card for as long as it remains exiled, and mana of any type can be spent to cast that spell"); a token exiled has ceased to exist. With `untilSourceLeaves` it's Hostage Taker's "until … leaves the battlefield. You may cast that card for as long as it remains exiled": the card returns the moment the source leaves (610.3), so the permission never outlives it. The effect's controller is recorded as having exiled the card (`exiledByPlayer` — Haldan's "cards you exiled"). `linked: true` exiles it **with** this source (rule 607.2a — `GameObject.exiledWith`, the battlefield stint the ability refers to) and counts it on the source for good (`exiledWithCount`, read by the `exiled-with-source` condition): Colfenor's Urn's "you may exile it" and "if three or more cards have been exiled with this artifact" — every card ever exiled with it, though some have left exile since (its ruling). |
| `return-exiled-by-source` | `linked?: "hand" \| "battlefield" \| "graveyard"` | `linked: "graveyard"` puts the cards exiled with it, those exiled "until it leaves" included (`exile`/`exile-all`'s `untilSourceLeaves`, rule 610.3), into their owners' graveyards as one event, and a later `{ thisWay: "put-into-graveyard" }` counts them: Valakut Exploration's "put them into their owner's graveyard, then this enchantment deals that much damage", Pinnacle Starcage's Robots, Gravegouger's leaving trigger. The other half of an O-Ring: returns everything this source exiled, to the battlefield under its **owner's** control. `linked: "hand"` instead puts the cards **linked** to this source (hideaway's, rule 607.2a — `GameObject.exiledWith`) into their owners' hands, unrevealed: Watcher for Tomorrow's "When this creature leaves the battlefield, put the exiled card into its owner's hand" — the leaves trigger reaches the card the stint that left exiled, so one that left before its hideaway resolved finds nothing (the ruling). `linked: "battlefield"` puts those linked cards onto the battlefield under their owners' control, together — Colfenor's Urn's "sacrifice it. If you do, return those cards", found though the Urn has just gone (a `sacrifice-source`'s `then`). `linked: "hand"` is also the Champions' "return the exiled card to its owner's hand", whose card a `behold … and exile it` cost linked (rule 607.2q — `additionalCost.behold`). With `linked: "battlefield"`: **`under: "you"`** is a "put" rather than a return — "put all cards exiled with it onto the battlefield" (Underworld Sentinel) enters them under the effect's controller (rule 110.2a); **`others`** leaves out the cards this resolution has just exiled and **`filter`** takes only matching ones — Mirror of Life Trapping's "exile it, then return all other permanent cards exiled with this artifact" (`others: true`, `filter: { typesAnyOf: [the permanent types] }`). |
| `put-onto-battlefield` | `target` (an `ObjectRef`, so `"trigger-object"` works — Undying returns *itself*), `underYourControl?`, `under?`, `enterTapped?`, `withCounters?`, `exileIfItWouldLeave?`, `transformed?`, `setTypes?`, `addSubtypes?`, `enterAs?`, `attacking?` | Reanimation that names one card, from anyone's graveyard — as opposed to `return-from-graveyard`'s filter over your own. `underYourControl` makes controller diverge from owner, so the card still goes back to its **owner's** graveyard when it dies. `under` (an `PlayerRef`) is someone else's control instead — The Beamtown Bullies' "target opponent … puts target … card from your graveyard onto the battlefield under their control" (`under: { target: 0 }`); an illegal target, either one, moves nothing (rule 608.2b). `transformed` is "…onto the battlefield transformed" (Ojer Axonil's "return it to the battlefield tapped and transformed"): a transforming double-faced card enters back face up; anything else just enters. A **spell that puts itself onto the battlefield transformed** (Esper Origins' "if this spell was cast from a graveyard, exile it, then put it onto the battlefield transformed under its owner's control with a finality counter on it") is a `sequence` of `{ kind: "exile", target: "source" }` — which takes the resolving spell off the stack — then `put-onto-battlefield` of `"source"` with `transformed` and `withCounters`: the rest of the effect finds it in exile (rule 400.7j), and a spell that has already left the stack goes nowhere as it finishes resolving (608.2n). `setTypes` replaces its card types for as long as it stays: the Enduring cycle's "return it to the battlefield under its owner's control. It's an enchantment. (It's not a creature.)" is `setTypes: ["enchantment"]` (the `enduringReturn(name)` helper writes the whole trigger). It's in place as the card enters (rule 614.12), so it enters *as* an enchantment — a "whenever a creature enters" never sees it, an enchantment's enters trigger does — and the subtypes that went only with the lost types go too (rule 205.1a); supertypes stay. `addSubtypes` is the same for "in addition to its other types": Portal to Phyrexia's "put target creature card from a graveyard onto the battlefield under your control. It's a Phyrexian in addition to its other types" is `addSubtypes: ["Phyrexian"]`, in place as it enters. **`enterAs`** (an `EnterTypes`, the same as `look-and-choose`'s and `return-from-graveyard`'s) is the rest of what it is as it enters, each a lasting effect of the resolution in its layer (rule 611.2c) and in place before anything sees it arrive: `addColors` ("a black Zombie in addition to its other colors and types" — Rise from the Grave: `enterAs: { addColors: ["B"], addSubtypes: ["Zombie"] }`), `setColors` (Chainer's "That creature is black"), `addTypes` ("They're artifacts in addition to their other types"), `basePt` (layer 7b — Relive the Past's "5/5 Elemental creatures in addition to their other types": `{ addTypes: ["creature"], addSubtypes: ["Elemental"], basePt: [5, 5] }`), `keywords` (Excava's "a 1/1 Spirit creature **with flying**"), `loseAbilities` ("It's a Skeleton in addition to its other types and **has no abilities**" — Xu-Ifit, Osteoharmonist: lost before it enters, so no enters trigger, no "enters tapped", no Clone copy; abilities gained later stay), and `ifCreature` — every part only if it's a creature as it enters, judged on the battlefield under every other effect (Lim-Dûl the Necromancer's "If it's a creature, it's a Zombie in addition to its other creature types"). Its `addSubtypes` joins the top-level one. `enter-as-additional.test.ts`. `attacking` (an `EnterAttacking`, with `enterTapped`) is "…tapped and attacking" (Chorale of the Void: `attacking: "choose"` — its controller picks what it attacks, rule 508.4; it was never declared an attacker). `attachedTo` (an `ObjectRef`) is "…onto the battlefield **attached to** this creature / that creature / target creature" — Magnetic Snuffler's `"source"`, Smoke Shroud's `"trigger-object"`, Eagle's Rescue's and Unfinished Business's slot (that creature, after an earlier step returned it): an Aura that can't legally enchant it, or with it gone, stays where it was (rule 303.4i); an Equipment that can't equip it enters unattached (301.5e), as does anything else (303.4h). A **player** in the slot is enchanted by an Aura that can enchant them (a Curse — rule 303.4). `attachedTo: { among: CardFilter }` is "…attached to **a creature you control**" — the host chosen as it enters, not targeted (One Last Job, Nomad Mythmaker: `{ among: { type: "creature", controlledBy: "you" } }`): an Aura's choice of what it enchants (303.4f) limited to the matches, none and it stays (303.4g); an Equipment's among the matches it could equip, none and it enters unattached. The same `attachedTo` (an `AttachHostRef`) is on `return-from-graveyard`, `search-library` (Bitterheart Witch's "a Curse card … attached to target player", Arachnus Spinner) and `look-and-choose` (Academy Researchers' "an Aura card from your hand … attached to this creature" — `attachedTo: "source"`). `attach-hosts.test.ts`. `faceDown: true \| FaceDownAs` enters it face down (rule 708.3 — no "as this enters" choices, its enters abilities silent): `true` the plain 2/2 (Ashcloud Phoenix), else what the effect lists (Missy's 2/2 Cyberman, Yedora's "It's a Forest land" — `faceDown: "Forest land"`); any card may enter so, an instant too. The same `faceDown` is `look-and-choose`'s `enterAs.faceDown` (Tezzeret, Cruel Machinist's "put any number of cards from your hand onto the battlefield face down. They're 5/5 artifact creatures"); from another player's library (`from`) the cards enter under the effect's controller (110.2a — Cybership). `withCounters.amount` is any amount, read as it resolves: Nine-Lives Familiar's "with one fewer revival counter on it" is `{ difference: [{ countersOn: "trigger-object", counter: "revival" }, 1] }`, the counters it died with. |
| `exile-graveyard` | `target` (a player slot, `"you"`, `"each-player"` or `"each-opponent"`) | Bojuka Bog — exiles that player's whole graveyard at once (rule 406; the cards in it are never individually targeted). `"each-opponent"` is Soul-Guide Lantern's "exile each opponent's graveyard", all of them in one move. `filter?` exiles only the matching cards — Living Death's "each player exiles all creature cards from their graveyard" (`{ target: "each-player", filter: { type: "creature" } }`). `linked?: true` exiles them **with this source** (rule 607.2a), as `exile`'s `linked` — Nautiloid Ship's "exile target player's graveyard", which its `look-and-choose { zone: "exiled-with-source" }` reads. `untilSourceLeaves` is Idol of Endurance's "until this artifact leaves the battlefield" (rule 610.3): nothing moves if it has already left, and each card goes back to its owner's graveyard when it does. |
| `vote`'s `for.permanent.about` | a `PlayerScope` | With `choose`: "**for each player, you choose** a creature that player controls" — one question per player, the effect's controller answering, among what that player controls, the prompt naming them; a player with nothing that matches isn't asked about. `for-each-voted` with `which: "voted"`, `simultaneous` acts on them together: Ultimate Magic: Meteor's "Destroy the chosen permanents" (`destroy`, target 0), Winnowing's `sacrifice-all` of `who: { controllerOf: 0 }`, `filter: { type: "creature", not: { sharesCreatureTypeWith: 0 } }` (the chosen one always shares with itself). "Each opponent chooses a creature they control" is `who: "each-opponent"`, `own: true` (Fell Beast's Shriek). "Destroy **one of them chosen at random**" (Chaos Defiler) is a `choose-permanents` after it with `random: true` and `filter: { thisWay: "chosen", notKeyword: "indestructible" }`, `then` the `destroy`: one draw among this resolution's choices, an indestructible one left out while another can be destroyed (its ruling) — `random-among-chosen.test.ts`. |
| `sacrifice-all` | `who` (a scope, or one player as a `ChosenPlayerRef`), `filter` | "Each player sacrifices **all** creatures they control" (Living Death): every matching permanent each player in `who` controls, all at once (one event, rule 603.10a), nobody choosing; one that can't be sacrificed stays. |
| `put-exiled-this-way-onto-battlefield` | `filter?` (Omen Machine's "if it's a land card, the player puts it onto the battlefield") | Living Death's "then puts all cards they exiled this way onto the battlefield": every card the resolution has exiled so far from a graveyard, hand or library — not a permanent it exiled (a Leyline of the Void's replacement as a creature is sacrificed — the ruling) — still in exile, onto the battlefield under its owner's control, together; each one's "as this enters" choices asked first. |
| `move-exiled-this-way` | `to: "hand" \| "library-bottom"`, `filter?` | Worlds Within Worlds' "then put all cards exiled this way into their owners' hands": every card the resolution has exiled so far, from anywhere — a permanent too — still in exile as the same object (one cast from there has left; a token has ceased to exist), into its owner's hand. `"library-bottom"` is "then put the rest on the bottom of your library in a random order" after an `exile-from-library` and a `cast-now` `from: "exiled-this-way"` (Herald of Amity; Muse Vortex moves its instants and sorceries `to: "hand"` first). `filter` (from your side) narrows them. A creature put onto the battlefield from among the cards exiled is a `look-and-choose` over `zone: "exile"` with `filter: { thisWay: "exiled", … }` (Lord of the Void). |
| `flicker` | `target` (an `ObjectRef`, slots, `{ from }` or `{ all: CardFilter }`), `thenCounters?`, `underYourControl?`, `transformed?`, `tapped?`, `returnAt?`, `returnOnOwnersTurn?`, `returnText?`, `returnThen?` | Essence Flux — exiles `target`, then immediately returns it to the battlefield under its owner's control (rule 400.7 — a brand-new object; a token exiled this way never comes back). `target` is a slot, `"source"` (the ability's own permanent *as it was when the ability triggered* — one that has blinked since is left alone) or an array of slots, all exiled first and returned together so each one's enters triggers see the others — or `{ from: n }`, every slot from `n` on, an "any number of target …" group (Eerie Interlude). `thenCounters: { kind, amount, onlyIf?, entering?, and? }` (`and`: more counters at once, each with its own `onlyIf` — Semester's End's +1/+1 counter if it's a creature and loyalty counter if it's a planeswalker) is Essence Flux's "if it's a Spirit, put a +1/+1 counter on it", put on once it's back; with `entering: true` it's Planar Incision's "return it … **with** a +1/+1 counter on it" — on it as it enters (rule 122.6), so its enters triggers (evolve) see it. `underYourControl` returns them under the effect's controller. `transformed` is "…return it to the battlefield **transformed**" (Clive, Ifrit's Dominant), now or at a delayed return — a card that isn't double-faced (a Clone of Clive) stays in exile, asked no "as this enters" choice (rule 712.14a; `put-onto-battlefield`'s `transformed` likewise leaves it where it is); `tapped` is "return it to the battlefield **tapped**" (Nezahal, Primal Tide), likewise. `returnAt` (a `DelayedTriggerTiming`) makes the return a delayed trigger instead — Norin the Wary's "exile Norin. Return it … at the beginning of the next end step" — linked to the exile (rule 610.3): a card that left exile in between stays where it is, and nothing is set up when nothing was exiled, so a second trigger in one turn does nothing. Don't build that with `exile` + `delayed-trigger`: the delayed effect can't tell the exiled card from a new object. (`return-flickered` is the delayed half it builds; never author it.) `returnOnOwnersTurn: true` with a `"your-…"` `returnAt` waits for **each card's owner's** turn instead of the controller's: The Eternal Wanderer's "return that card … at the beginning of **that player's** next end step" is `returnAt: "your-next-end-step", returnOnOwnersTurn: true` (one delayed return per owner, still the controller's — rule 603.7e). `returnThen` is what the delayed return goes on to do, reading it through the `this-way` condition or filter's `"put-onto-battlefield"`: Phelia, Exuberant Shepherd's "if it entered under your control, put a +1/+1 counter on Phelia", Obzedat, Ghost Council's "it gains haste". An immediate return needs only a `sequence` after the flicker (Hallowed Respite). |
| `manifest` | `who: PlayerScope \| { controllerOf }`, `count?`, `cloak?: true`, `from?: PlayerRef` | "Manifest the top card of your library" (rule 701.40) — or cloak it (701.58, the same with ward {2}): `who` puts the top card of their own library onto the battlefield face down as a 2/2 with no name, text, subtypes or mana cost (`GameObject.faceDown`; its characteristics are the internal `FACE_DOWN_CARDS` definition's, so its own enters abilities never happen, 708.3). Reality Shift's "its controller manifests" is `{ controllerOf: 0 }`, the exiled creature's controller as it last existed. `count` manifests one at a time (701.40e) — an amount, read as it resolves (Omarthis, Ghostfire Initiate's "equal to the number of counters on it"). Its controller turns it face up any time they have priority for its mana cost if it's a creature card (the `turn-face-up` special action, 701.40b); it's revealed as it leaves (708.9). A manifested card with morph may also be turned up for its morph cost (701.40c, a second offer). `from` is another player's library — "you manifest the top card of **that player's** library" (Orochi Soul-Reaver: `"trigger-player"`; Thieving Amalgam: `"active-player"`): it enters under the manifesting player's control (110.2a) and its owner can't look at it (708.5). Not built: "turn a permanent face up" effects (Ugin's Mastery, Zimone), returning a card "face up or face down" (Deathmist Raptor), manifesting from the hand (Scroll of Fate), Magar's noted name. `face-down.test.ts`, `face-down-effects.test.ts`. |
| `turn-face-up` | `target: ObjectRef` | "Turn target face-down creature face up" (Ixidor, Reality Sculptor, Break Open, Skirk Alarmist) by an effect, nothing paid (rule 708.7), the same permanent (708.8): a "when this is turned face up" triggers, a megamorph gets no counter (702.37b), `asTurnedFaceUp` applies. Nothing happens to one not face down (Showstopping Surprise's "turn it face up if it's face down") or under `cant-turn-face-up`; an instant or sorcery card is revealed and stays face down, nothing triggering (701.40g, 701.58g). "You may turn a face-down creature you control face up" (Ugin's Mastery) is a `choose-permanents` over `faceDown: true` with `min: 0`, this as its `then`. |
| `as-player` | `who: PlayerRef`, `effect` | Any effect done by another player: inside it "you" is them, what it asks is theirs and what it makes is theirs. "Target player scries 2" is `{ kind: "as-player", who: { target: 0 }, effect: { kind: "scry", amount: 2 } }`; "its controller incubates X" `who: { controllerOf: 0 }` (Excise the Imperfect, read as it last existed); "Gandalf's owner & draws three cards" `who: { ownerOf: "source" }`. **Reach for this before asking for a `who` on an effect.** `as-player.test.ts`. |
| `for-each-permanent` | `filter`, `effect`, `as?`, `exceptSource?`, `exceptTriggerObject?`, `exceptTarget?`, `controlledByTarget?`, `simultaneous?` | Any effect that names one object, done to every permanent `filter` matches, nobody choosing: a mass type change that leaves P/T alone is `become` here ("Vehicles you control become artifact creatures until end of turn", Start Your Engines; "lands you control gain all basic land types", Energybending; "each land you control becomes that type", Terraformer; with P/T, `become`); "tap all other creatures" (Thundermare) is `{ filter: { type: "creature" }, exceptSource: true, simultaneous: true, effect: { kind: "tap", target: 0 } }`. `controlledByTarget` only says whose side the filter reads from, so "each creature target player controls" still needs `controlledBy: "you"` in the filter (Clone Legion); `damage-all`'s restricts by itself, so there the filter leaves it out (Aggravate). **Reach for this before asking for a new `-all` effect**, and over a `choose-permanents` with `min` and `upTo` both every match (which makes the player click them all). Each match binds to target slot `as` (default 0), so beside a target use `as: 1` with `target: 1` inside (Public Execution, `exceptTarget: 0`); a filter or amount inside `effect` reads that slot per permanent (Baki's Curse's Auras on that creature). `simultaneous` is one instruction, for a mass effect, and `effect` mustn't ask anything; without it the permanents take turns and a `may` inside is answered for each. A token stack is woken first (rule 700.3b); one gone by its turn is skipped (400.7). `for-each-permanent.test.ts`. |
| Before asking for an option | | **"Another" is `isSource: false`** in any filter: a trigger's (Enduring Scalelord, Salt Road Ambushers), a graveyard choice (Ichorid), `doubleTriggersOf` (Twinflame Travelers), `become-copy` (Deceiver of Form). **An amount or scope about another player is `as-player`** with "you" inside (Flunk's "that creature's controller's hand", Burn Away's "its controller's graveyard", Encircling Fissure's "creatures target opponent controls", Render Silent's "its controller can't cast spells"). **"An opponent has …" is `of-player` with `"an-opponent"`** (Guul Draz Specter), and "attacks a player who controls …" a `whileCondition` of `of-player` with `"defending-player"` (Owlbear Cub). **"Attacking alone" is now:** the host attacking and its controller not controlling two attackers (Security Bypass). A restriction may scope by power or toughness (Meekstone), and a static by `hasAbilities` (Muraganda Petroglyphs). "Chosen at random" among permanents is `choose-permanents`'s `random` (Cinderheart Giant). `need-key-recheck.test.ts` runs each. |
| `cloak-exiled-pile` | `libraryTop?`, `enterTapped?` | "Exile target nontoken creature you own and the top two cards of your library in a face-down pile, shuffle that pile, then cloak those cards. They enter tapped" (Become Anonymous): every permanent in the target slots and the library cards exiled as one event, shuffled, each cloaked under the controller in that random order. Expose the Culprit's "any number of creatures" is a `choose-permanents` with `thenTogether` around it. |
| a name an effect gives | | A static's `setName`, with `affects: { scope: "attached" }` (Witness Protection, Honest Work): its only name for as long as it applies. `become`'s `setName` and `addSupertypes` (Awakening of Vitu-Ghazi: "It becomes a legendary 0/0 Elemental creature with haste named Vitu-Ghazi"). Everything that reads a name goes through `nameOf`; neither is a copiable value, so a copy doesn't have it (rule 707.2). |
| `turn-face-down` | `target: ObjectRef`, `as?: FaceDownAs` | "Turn target creature face down" (rule 708.2a): the same permanent — counters, attachments and effects stay — now a face-down 2/2 with no name, text, subtypes or mana cost, or the characteristics `as` lists (708.2: Cyber Conversion's "It's a 2/2 Cyberman artifact creature" is `as: "2/2 Cyberman artifact creature"`). The `"effect"` face-down kind: neither manifested nor cloaked, so it's turned face up only by its morph or disguise cost (702.37e — Backslide), never its mana cost. Nothing happens to one already face down (708.2b) or a double-faced, melded or merged permanent (712.16). `"source"` for "turn ~ face down" (Wall of Deceit); "any number of target creatures" wraps it in `for-each-target`. `FaceDownAs` (`state.ts`) is a closed list, each an internal definition in `cards/face-down.ts` — `"2/2 Cyberman artifact creature"`, `"2/2 Horror creature"` (Illithid Harvester), `"5/5 artifact creature"`, `"Forest land"` (a land with Forest's intrinsic {G}, 305.6); a new listing is a new member and definition. `face-down-effects.test.ts`. |
| `exile-into-piles` | `piles: [{ libraryTop, faceUp? }, { libraryTop, faceUp? }]`, `turnOneFaceUp?`, `chooser` (an `PlayerRef` or `"an-opponent"`), `chosen`, `rest?` | Two piles made in exile, nobody separating them (Hostile Negotiations, Abstract Performance): a face-down pile is seen by nobody until something says so; `turnOneFaceUp` is "look at the cards in each pile, then turn a pile of your choice face up". `"an-opponent"` is asked only then, once the cards are seen. `{ together: EffectSpec, word }` as a fate is one effect over the whole pile, in the target slots from 0: `{ kind: "cast-now", from: "targets", free: true, rest: "hand" }` is "you may cast a spell from among them without paying its mana cost. Put the rest into your hand". |
| `manifest-dread` | `who?: "you" \| { controllerOf }`, `count?` | Manifest dread (rule 701.62a): the player looks at the top two cards of their library, manifests one (their choice, seen by no one else) and puts the rest into their graveyard — a `look-and-choose` with `destination: "manifest"`. Unwanted Remake's "its controller manifests dread" is `{ controllerOf: 0 }`; `count: 2` is "twice", each finished before the next — an amount, read once as it resolves: Valgavoth's Onslaught's "manifest dread X times" is `count: "x"`. "Then put N +1/+1 counters on that creature / each of those creatures" (Weight Room, Valgavoth's Onslaught; after a `manifest`, Wildcall's "on it") is a later `add-counter-all` over `{ thisWay: "put-onto-battlefield" }`: a manifested card is put onto the battlefield (rule 701.40a). The scaffolder reads these. `morph.test.ts`, `manifested-this-way.test.ts`. |
| `return-to-hand` | `target: ObjectRef`, `from?: "battlefield" \| "graveyard" \| "exile" \| "stack" \| "library"`, `now?` (with `from: "stack"` and `"source"`: at this point of the instructions, not as their final part — "return ~ to its owner's hand, then discard a card at random", Hanabi Blast) | Unsummon (a bounce — `from` omitted). With `from`, it takes a card out of that zone instead, to its **owner's** hand: `"library"` + a `reveal-top`'s slot is "otherwise, put that card into your hand" (Sin Prodder), put and not drawn; `"graveyard"` + a `card-in-graveyard` target is "return target creature card from your graveyard to your hand" (Golbez, Crystal Collector); `"source"` / `"trigger-object"` with `"graveyard"` or `"exile"` is "return it to its owner's hand" off a dies / leaves trigger, and works inside a `delayed-trigger` too. `"stack"` + a `"spell"` target is Unsubstantiate or Venser, Shaper Savant — **not a counter**: a spell that can't be countered still goes back, a copy of a spell ceases to exist (rule 707.10c), and an ability or the resolving spell itself is left alone. The object has to be in the `from` zone when the effect applies, or nothing happens. A commander returned this way offers the command zone (rule 903.9b), like a bounced one. |
| `return-to-hand-all` | `filter`, `controlledByTarget?` | Cyclonic Rift, overloaded — mirrors `destroy-all` `controlledByTarget: N` reads `filter` from the side of the player in target slot N — "… **target player** controls" (River's Rebuke, Naya Charm), so its `controlledBy: "you"` is them. |
| `exile-all` | `filter`, `airbend?`, `exceptTarget?`, `exceptSource?`, `untilSourceLeaves?`, `linked?`, `controlledByTarget?` | Farewell's "Exile all artifacts" — the mass `exile`, one event (each one's leaves trigger sees the rest go), a token stack exiled whole. `airbend: true` airbends them (as `exile`'s); `exceptTarget: N` spares the permanent in target slot N — Avatar's Wrath's "choose up to one target creature, then airbend all other creatures" (an empty slot spares nothing). `untilSourceLeaves` is the mass O-Ring — Temporary Lockdown's "exile each nonland permanent with mana value 2 or less until this enchantment leaves the battlefield" (rule 610.3, as `exile`'s; nothing at all if the source has already left). `exceptSource` spares the source ("all **other** permanents you control"), and `linked` exiles them **with** it (607.2a, as `exile`'s) — Worldgorger Dragon's leaves trigger returns them with `return-exiled-by-source { linked: "battlefield" }` `controlledByTarget: N` reads `filter` from the side of the player in target slot N — "… **target player** controls" (River's Rebuke, Naya Charm), so its `controlledBy: "you"` is them. |
| `return-from-graveyard` | `filter`, `destination: "battlefield" \| "hand" \| "exile"` (Mairsil's exile, `withCounters` on it there), `count: EffectAmount \| "all"` (read as it resolves — Worldsoul's Rage's "put up to X land cards from your hand and/or graveyard onto the battlefield tapped" is `count: "x"`, `upTo: true`, `from: "hand-or-graveyard"`; the scaffolder reads that line), `enterTapped?`, `withCounters?` | Splendid Reclamation (from *your* graveyard; a `number` less than the match count raises a `choose-from-zone`). **Untargeted only** — "return a creature card", chosen as it resolves (Dogmeat, Takenuma). "Return **target** … card" is a `card-in-graveyard` target with `return-to-hand`/`put-onto-battlefield` (Regrowth, Eternal Witness): the target is chosen on the stack, and with none there's no casting it and no trigger (rule 603.3d). `withCounters: { kind: "finality", amount: 1 }` is "…with a finality counter on it" (Shilgengar, Sire of Famine) — put on each card that enters, before its entry is announced, whether everything returns at once or the player chooses. `from: "all-graveyards"` (with `count: "all"`) is every player's graveyard, a card someone else owns entering under your control — Grimoire of the Dead's "put all creature cards from all graveyards onto the battlefield under your control" — and `enterAs` (as `look-and-choose`'s) its "They're black Zombies in addition to their other colors and types". `from: "hand-or-graveyard"` is one choice over your hand and graveyard together — Kastral, the Windcrested's "a Bird creature card from your hand or graveyard". `from: "command-zone-and-graveyard"` adds the commanders you own in the command zone — Campfire's "put all commanders you own from the command zone and from your graveyard into your hand" (`filter: { isCommander: true }`, `count: "all"`, `destination: "hand"`). `attachedTo` (an `ObjectRef`) is "…onto the battlefield attached to ~" (Danitha, Benalia's Hope's `"source"`): an Aura that can't legally enchant it, or with it gone, stays where it was (rule 303.4i); an Equipment that can't equip it enters unattached (301.5e), as does anything else (303.4h). |
| `exile-graveyard` … `fromHand?` | `"also" \| "only"` | The player's hand too, in one move — "exile all noncreature, nonland cards from that player's **hand and graveyard**" (Thought Distortion) — or instead: "exiles all cards **from it**" (Hour of Glory). Every match goes, with no search: put a `reveal-hand` first. `target` as ever, `{ controllerOf: 0 }` for "that player" (Legion's End). `faceDown: true`: "exiles all cards from their hand **face down**", nobody may look (Suppress). With `linked` it's "the exiled cards" of another ability (Induced Amnesia); a `delayed-trigger`'s `about: "exiled"` is "those cards", each returned by a `for-each-target` of `return-to-hand` with `from: "exile"` (Ignorant Bliss, Memory Jar). |
| `search-library` … `zones?` | `"library" \| "graveyard" \| "hand" \| "library-and-graveyard" \| "graveyard-and-hand" \| "hand-and-library" \| "graveyard-hand-library"` | Which zones are searched. "Your graveyard, hand, **and** library" (Kassandra, Eagle Bearer) is the last. "…**and/or**…" is the player's choice as it resolves: `searchZonesAndOr(["graveyard", "hand", "library"], search)` from `helpers.ts` writes the `modal` over every set of them (Boonweaver Giant, Dark Supplicant); wrap it in a `may` for "you may search". Only a set with the library in it shuffles. |
| `{ damageDealtThisTurn: true, who?, combat?, colors?, to?, by? }` amount | `to: "you" \| "source"`, `by: { type?, name?, other? }` | Damage dealt this turn, by what dealt it (as it dealt it) and what took it: Reverse Polarity's `who: "each-player", to: "you", by: { type: "artifact" }`, Blazing Effigy's `to: "source", by: { name, other: true }`. The `damage-dealt-this-turn` condition's `toSelf` is the Zubera's "if 4 or more damage was dealt to it this turn", dies triggers included. |
| `choose-value` … `value: "spell-damage"` | `among` | "One of those sorcery spells" (Backdraft, a `choose-opponent` with `whoIf`'s `then`): a menu of the spells that player cast this turn, asked only when the damage differs; `then` reads it as `"x"`. |
| `additional-combat` … `forcedAttackers?` | `{ filter, cantAttackYou? }` | With `afterThisPhase`: what matches as it's done attacks that combat if able, and not you or your planeswalkers (Illusionist's Gambit). |
| `additional-combat` … `onlyAttackers?` | `CardFilter` | With `afterThisPhase`: "only land creatures can attack during that combat phase" (Bumi, Unleashed — `{ type: "land" }`): as that phase begins, a creature not matching it (read from your side as attackers are declared) can't attack until its end of combat — no other combat that turn (rule 508.1c). |
| `additional-combat` … `atBeginning?` | `{ effect, text }` | "At the beginning of that combat, untap all creatures you control" (Moraug, Fury of Akoum): a delayed ability on that one phase. From a precombat main, `afterThisPhase` comes before the turn's own combat (rule 500.8). |
| `additional-combat` … `afterSecondMain?` | `true` | Without `afterThisPhase`: "after the second main phase this turn" (World at War): nothing once that phase is over. |
| `take-extra-turn` … `thatTurn?` | `{ damageCantBePrevented?, atEndStep?: { effect, text } }` | What the effect says about that turn alone, taken up as it begins and lost with it if it's skipped: "at the beginning of that turn's end step, you lose the game" (Warrior's Oath, Final Fortune), "during that turn, damage can't be prevented" (Alchemist's Gambit). The scaffolder reads both. |
| `additional-combat` twice, in a `conditional` on `turn-structure`, with a `delayed-trigger` | `at: { whenever: { on: "step-begins", step: "begin-combat", who: "any" } }` | "After this main phase, there are two additional combat phases. At the beginning of each combat this turn, untap all creatures that attacked this turn" (Full Throttle): `afterThisPhase` twice is no main phase between them, the condition is the nothing they add outside a main phase, and a `whenever` delayed ability has "this turn" as its duration, so it triggers in every combat left (rule 603.7b). |
| `remove-from-combat` … `unblockSoleBlocked?`, `thenMayBlock?` | `true` | "Creatures it was blocking that had become blocked by only that creature become unblocked", "You may have it block an attacking creature of your choice" (False Orders). The filter clause `controlledByDefendingPlayer` is that spell's "creature defending player controls", with no attacker of its own to read one from. |
| `search-library` … `upTo?` | `true` | The count is printed "**up to** N" (The Five Doctors' "your library and/or graveyard for up to five Doctor cards"): none need be found, in a graveyard searched alone too. Without it, `min: 0` is only leave to miss in a hidden zone (rule 701.23b), so "a card" in a graveyard searched alone must be found. |
| `search-library` … `enterUnder?` | an `PlayerRef` | With `destination: "battlefield"`: "under target player's control" (Yavimaya Dryad: `{ target: 0 }`). |
| `search-library` … `alongExiledThisWay?` | `true` | With `destination: "battlefield"`: what this resolution exiled enters with the find, one event, whatever is found (Sword of Hearth and Home's "Put both cards onto the battlefield"). |
| `search-library` … `exileRest?`, `inAnyOrder?` | `true` | Doomsday's "five cards **and exile the rest**" (every searched card not found is exiled, and nothing is shuffled) and, with `destination: "library-top"`, "on top of your library **in any order**" (the order is asked once they're there). |
| searches by several players together | `each-player-may` over a bare `search-library`; `for-each-player` of `choicesHeld` over one of `who: "that-player"`; `shufflesLater?` with a closing `shuffle-library` of `searchers: true` | Rule 101.4. "Each opponent may search …" (Veteran Explorer, Hired Giant) asks everyone first, then those who said yes search in turn order, what they find held in their libraries until the last has searched; it all enters at once and they shuffle. "Each player searches …" (Field of Ruin) is the `for-each-player`. A search spread over a whole spell, "then each player who searched a library this way shuffles" (Tempt with Discovery), writes `shufflesLater` on every search and the closing `shuffle-library`, so each shuffles once; Claim Jumper's "repeat this process once. If you search your library this way, shuffle" is one player's two: a `may` around each search, the second in a `conditional`, and a decline owes no shuffle. A find going anywhere but the battlefield moves as it's found. |
| `search-library` … `reveal?` | — | "…, **reveal it**, …" (Enlightened Tutor, Mystical Tutor): shows the find to every player, rule 701.16. Off by default — a plain "search your library for a card" (Vampiric Tutor) reveals nothing, and the difference is printed on the cards. |
| `search-library` … `instead?` | `{ destination: "battlefield" \| "hand" \| "graveyard" \| "library", enterTapped?, filter?, condition?, pick: "all" \| "any" \| "one" \| { exactly: n }, chooser?: { target: n } \| "an-opponent", under?: "you" }` | **Each find to a destination of its own** (the `SearchInstead` doc; `"library"` is Threats Undetected's "shuffle the chosen cards into your library"; `chooser` hands the second choice to another player — Intuition's target opponent, Realms Uncharted's "an opponent", the controller's pick made with the finds revealed; `{ exactly: 2 }` with no more finds than that asks nothing — Gifts Ungiven; with no `chooser` it's the searcher's own split, Viewpoint Synchronization's "put two of them onto the battlefield tapped and the other into your hand": `destination: "hand"`, `instead: { destination: "battlefield", enterTapped: true, pick: { exactly: 2 } }`): the finds are picked and revealed first, then a second `choose-from-zone` over them (with its own prompt) picks the ones that go to `instead.destination`; the rest go to the search's `destination`, and the library is shuffled after both. `filter` reads the card — Archdruid's Charm's "onto the battlefield tapped if it's a land card. Otherwise, put it into your hand" is `destination: "hand", instead: { destination: "battlefield", enterTapped: true, filter: { type: "land" }, pick: "all" }` (no choice asked); Guidelight Pathmaker's "if its mana value is 2 or less" the same with `filter: { manaValue: { op: "lte", n: 2 } }`. `condition` (a `StaticCondition`, read as it resolves) gates a "you may put … if": Ruin in Their Wake's "if you control a land named Wastes" with `pick: "any"`; Caravan Vigil's morbid, Scholar of New Horizons' `opponent-controls-more`. `pick: "any"` alone is a choice of place — Dina's Guidance's "into your hand or graveyard" is `destination: "hand", instead: { destination: "graveyard", pick: "any" }`. `pick: "one"` is a split: Jarad's Orders' "put one into your hand and the other into your graveyard" is `destination: "graveyard", max: 2, instead: { destination: "hand", pick: "one" }` (a single find goes to the hand — rule 609.3). `under: "you"`: those picked enter under the effect's controller's control — Rootweaver Druid's opponents search in an `each-player-may`'s `ifDid` (a no-op `effect`, `who: "that-player"` on the search). Not with `then`, `restDestination`, `together` or `all`. The scaffolder reads the split, the hand-or-graveyard and the by-the-card forms whole. |
| `search-library` … `withCounters?` | `{ kind, amount: EffectAmount }` | Battlefield-bound finds **enter with counters** (rule 122.6): Neoform's "with an additional +1/+1 counter on it" (`{ kind: "+1/+1", amount: 1 }`), Vision Quest's "X additional +1/+1 counters" (`amount: "x"`), Magmatic Hellkite's "tapped with a stun counter on it" (`{ kind: "stun", amount: 1 }`, with `enterTapped`). |
| `search-library` … `outside?`, `faceUpExile?` | — | A **wish** (rule 701.23j): cards outside the game are the player's sideboard (400.11a, `DeckList.sideboard`; none in a Commander game, 903.5e). `outside: "only"` searches the sideboard alone — "you may reveal a sorcery card you own from outside the game and put it into your hand" (Burning Wish) is `{ filter: { type: "sorcery" }, destination: "hand", min: 0, max: 1, reveal: true, outside: "only" }` with `exileOnResolve`; "put a card you own from outside the game into your hand" (Mastermind's Acquisition) has no `reveal`; "on top of your library" (The Raven's Warning) is `destination: "library-top"`. Always `min: 0`: the sideboard is hidden, so the search may find nothing. `outside: true` adds it to `zones` ("search your library, graveyard, and/or outside the game"). `faceUpExile: true` also offers the searcher's face-up exiled cards matching `filter` ("or choose a face-up Eldrazi card you own in exile" — Coax from the Blind Eternities, Karn, the Great Creator). The scaffolder drafts all three wish lines. Not covered: playing or casting straight from outside the game (Wish, Spawnsire of Ulamog), a draw replaced by a wish (Ring of Ma'rûf), an opponent choosing among the finds (Turtles Forever, Extrapolate the Impossible). |
| `search-library` … `linked?` | `true` | With an exile destination, the finds are exiled **with this source** (rule 607.2a — `GameObject.exiledWith`), as `exile`'s `linked`: Skyship Weatherlight's "search your library for any number of artifact and/or creature cards, exile them, then shuffle", which its `choose-random-card { zone: "exiled-with-source" }` reads. Nothing is linked when the source isn't a permanent. |
| `put-on-library` | `target`, `position: "top" \| "bottom" \| { fromTop: n }` | Academy Ruins, Mortuary Mire — puts one **targeted** card on its owner's deck. Pair it with a `card-in-graveyard` target for the graveyard-recursion lands; unlike `return-from-graveyard` it is target-driven, so it reaches any graveyard. `target: "trigger-object"` is Murderous Rider's "when this creature dies, put it on the bottom of its owner's library" — the card, found only in the graveyard it went to. `target: "source"` is a spell putting itself there as it resolves (a copy of a spell can't, and ceases to exist — rule 707.10a). `{ fromTop: 7 }` is "seventh from the top" (Approach of the Second Sun): under the top six, or on the bottom of a library with fewer. `{ beneathTop: EffectAmount }` is "just beneath the top X cards of that library" (Unexpectedly Absent's `"x"`, Quarry Colossus's Plains count), read as it resolves. `position: { ownerChooses: ["top", "bottom"] }` is "target creature's **owner** puts it on their choice of the top or bottom of their library" (Misleading Motes; Lost Days' "second from the top or on the bottom" is `[{ fromTop: 2 }, "bottom"]`): the owner of what's in that target slot — not its controller — picks as it resolves; a spell target goes too (a copy of one ceases to exist). |
| `put-on-libraries` … `what: { graveyardOf }`, `position: "bottom-random"` | a player slot or a scope | "Up to one target player puts all the cards from their graveyard on the bottom of their library in a random order" (Endurance): one move, no shuffle, nothing asked. A commander among them lands at random among the rest once its owner declines the command zone. |
| `put-on-libraries` | `what: { targetsFrom: n } \| { all: CardFilter }`, `position: "top" \| "bottom" \| "owner-chooses"` | **Several cards into their owners' libraries at once** — one instruction, never a `for-each-target` of `put-on-library` (which moves them one at a time, in target order): Plow Under's "put two target lands on top of their owners' libraries" (two slots, `targetsFrom: 0`), Forever Young's "put any number of target creature cards from your graveyard on top of your library" (an `any-number` group), Harmonic Convergence's "put all enchantments on top of their owners' libraries" (`all`). They leave together, then each owner, the active player first, orders their own cards on each end (rule 401.4 — a `choose-from-zone` order, asked only when the order is a choice). `"owner-chooses"` is "its owner puts it on their choice of the top or bottom of their library" for several (Aetherspouts' attackers, Tolarian Contempt's targets): each owner, APNAP, picks which of theirs go on the bottom (a `choose-permanents`, the rest on top), then the moves, then the orders — battlefield permanents only. `"shuffle"` is "the owners of those cards shuffle them into their libraries" (Turn the Earth): each library a card went into is shuffled, counted `"shuffled-into-library"` this way; `withSource: true` sends the resolving spell too (Serene Remembrance). "Shuffle … target cards from your graveyard into your library", one library, stays Piper's Melody's `for-each-target` + `shuffle-library`. One card's owner's choice stays `put-on-library`'s `ownerChooses`; "Nth from the top" for several isn't here
| `delayed-trigger` | `at`, `effect`, `text`, `controller?`, `about?`, `orNone?`, `if?` | `at: { whenever: { on: "cast-spell", who: "any" }, byPlayer: "trigger-player", until: { throughTurnOf: "trigger-player" } }` is Nuka-Nuke Launcher's "until the end of defending player's next turn, that player gets two rad counters whenever they cast a spell": `byPlayer` is the one player whose spells fire it and `{ throughTurnOf }` whose next turn it lasts through, each read as it's set up; the watch is still its controller's (603.7e), and the caster in its effect is `"trigger-controller"`. `at: { whenever, until: "while-exiled" }` with `about: "exiled"` is Dimensional Breach's "for as long as any of those cards remain exiled, at the beginning of each player's upkeep", read with `look-and-choose`'s `zone: "targets"`, `exiledThatCanEnter`, `player: "active-player"`. Whip of Erebos's "exile it at the beginning of the next end step", Arcane Denial's upkeep draws; `at: "next-cleanup"` is "at the beginning of the next cleanup step" (Thawing Glaciers), put on the stack once that step's discard and damage removal are done, the active player then getting priority and another cleanup step following (rule 514.3a); `about` (a `ThisWayKind`) makes its targets what this resolution did that to so far, in place of the creating ability's own — `about: "created"` is "sacrifice **that token**" off a token the same resolution made (Satya, Aetherflux Genius), and nothing is set up when there's none; with `at: { leaves, to, thisTurn? }`, Kelsien, the Plague's "when that creature dies this turn"; with `at: { losesControl, thisTurn?, onlyIf? }`, "when you lose control of the creature, tap it" (Ray of Command, Ogre Geargrabber; `"source"` for Seraph's "sacrifice the creature when you lose control of this creature", with `about`) — for any reason, its until-end-of-turn ending in cleanup or it leaving the battlefield included, once unless `thisTurn` (rule 603.7b), `onlyIf` an intervening "if" over the creating effect's targets (Stolen Uniform; ask it again in a `conditional`); with `at: { nextSpell }`, "when you next cast a creature spell this turn" (Yuna); with `at: { whenever: TriggerSpec, until?, targets?, watching?, once?, orLosesControl? }`: `watching` (a slot, `"source"`, `"trigger-object"`, or `"targets"` for all of them) is what `"self"` in the trigger reads as, each for this stint — "whenever target creature deals damage this turn" (Paladin of Prahv), "is dealt damage" (Arcbond), "whenever that creature deals combat damage to a player" (Captain Howler; double strike twice), "either of those creatures" (Tamiyo, Field Researcher); `until: "game"` has no duration, `once` is "when" (rule 603.7b), `orLosesControl` a permanent leaving your control fires it too: Coffin Queen's "when this creature becomes untapped or you lose control of this creature". Also `at: { whenever: TriggerSpec, until?, targets? }`, any "until end of turn, whenever …" or "until your next turn, whenever …" (Glimpse of Nature, Vraska the Unseen, Massacre Girl). Rule 603.7 — see below. |
| `enters-with-counters` | `target`, `counter`, `amount` | "That creature enters with two additional +1/+1 counters on it" — a spell on the stack (Yuna's `nextSpell` trigger object) enters with them as it resolves. `counter: "sunburst"` is "that spell gains sunburst" (Solar Array, rule 702.44a): `amount` is ignored, a counter for each color spent to cast it, +1/+1 counters if it enters as a creature, else charge. |
| `reflexive-trigger` | `targets: TargetSpec[]`, `effect`, `text` | "**When you do**, …" — a reflexive triggered ability (rule 603.12): Terra, Herald of Hope's "you may pay {2}. When you do, return target creature card with power 3 or less from your graveyard to the battlefield tapped" is a `may` with `cost: "{2}"` and this as its `effect`. Applying it triggers an ability that goes on the stack once the creating spell or ability has finished resolving, choosing `targets` then — so it *can* target, unlike a `may`'s `then`, and players can respond to it. `effect` reads its own targets by slot; `"source"`, X (including an X paid for the `may`) and the triggering event are the creator's. With no legal target it's removed as it would go on the stack. Put it only where the action has certainly happened: a `may`'s `effect`, a `sacrifice-source`'s `then`, a `conditional` on a `this-way` condition. `value?: EffectAmount` is read as it triggers and becomes its `{ triggerValue: true }` — Tip the Scales' "Sacrifice a creature. When you do, all creatures get -X/-X until end of turn, where X is the sacrificed creature's toughness" is a `sacrifice`, then this under a `this-way` `"sacrificed"` conditional with `value: { aggregate: "sum", of: "toughness", filter: {}, in: { thisWay: "sacrificed" } }`: only the spell's resolution knows what it sacrificed, and players respond knowing X (its ruling). It's read in a target filter too: `{ amount: { triggerValue: true } }` in `targets` is this value, not the creating ability's. **It can divide**: `divided: { total, slot }` beside an `any-number` group and a `damage-divided` (or `counters-divided`) effect — Death to Our Enemies' "sacrifice it. When you do, it deals 7 damage divided as you choose among one or two targets": the targets and the split are announced as it's put on the stack (rules 603.12, 603.3d, 601.2d), a `total` amount read then. `about` names what "it", "that token" or "that creature" means when the ability doesn't target it: `"created"` (Dáin Ironfoot's Axe), `"put-this-way"` (Back for More's returned creature) or a slot of the creating ability (Curse of the Werefox, Behemoth of Vault 0); `effect` reads it as `"trigger-object"`, followed as one (rule 400.7). Naming nothing, nothing triggers. |
| `counter` | `target` (a spell slot, or `"trigger-object"` — a cast trigger's "counter that spell", Vexing Bauble), `into?: "hand" \| "exile" \| "library-top" \| "library-bottom" \| "battlefield"`, `intoIf?`, `withTimeCounters?` | Counterspell. `into: "battlefield"` with `intoIf: { typesAnyOf: ["artifact", "creature"] }` is Desertion's "if an artifact or creature spell is countered this way, put that card onto the battlefield under your control instead of into its owner's graveyard": the spell is judged on the stack, any other is countered into the graveyard, and the card that enters is a new object nobody cast (not kicked, X 0), its "as this enters" choices yours. A spell that can't be countered stays on the stack and resolves (`counter-failed`); a countered copy of a spell ceases to exist (rule 707.10c). `into: "library-top"` / `"library-bottom"` are Memory Lapse's and Spell Crumple's "on top of / the bottom of its owner's library instead" (Hinder's "your choice of" is an `each-player-may` of the two); `withTimeCounters: 3` beside `into: "exile"` is Delay's "exile it with three time counters on it … it gains suspend". `ifCountered` is what follows only "if that spell is countered this way": Transcendent Dragon's `cast-now` of the same slot. `into: "hand"` is Remand's "if that spell is countered this way, put it into its owner's hand instead" — still a counter, so it does nothing to a spell that can't be countered, unlike `return-to-hand` with `from: "stack"`. `into: "exile"` is "exile it instead of putting it into its owner's graveyard" (Transcendent Dragon, whose `cast-now` of the same slot then finds it in exile — one that wasn't countered is still on the stack, where nothing is cast from). |
| `sacrifice-all-but` | `who`, `keep`, `filter` | "chooses up to N they control, then sacrifices the rest" (Archfiend of Depravity) — the inverse of `sacrifice`, which names how many to give up. Raised only when they're over the limit. `keep` is an amount, `who` may be one player named through a target (Choice of Damnations' `{ target: 0 }`, `keep: { votedNumber: 0 }`). |
| `separate-into-piles` | `objects`, `separator?`, `each?`, `chooser`, `faceDown?`, `chosen`, `rest?` | `each: PlayerScope` (Make an Example's "Each opponent separates the creatures they control into two piles. For each opponent, you choose one of their piles. Each opponent sacrifices…"): every player of the scope separates their own `objects: { permanents, whose: "that-player" }` in turn order, then `chooser` chooses a pile of each, then all the fates happen at once (rule 608.2e) — not a `for-each-player` around it, which would finish one player before asking the next. Rule 700.3: `separator` (default you) puts each object into one of two piles, either may be empty; `chooser` chooses one; `chosen` / `rest` say each pile's fate. `objects`: `{ libraryTop: n, reveal?: true }` (your library's top — Fact or Fiction's "Reveal the top five"; without `reveal`, only the separator looks — Curator of Destinies, Fortune's Favor), `{ permanents: filter, whose: PlayerRef }` (Liliana of the Veil's "all permanents target player controls" — `whose: { target: 0 }`; a token stack is separated token by token), `{ graveyard: filter }` (Death or Glory), or `"targets"` (the spell's own targets, still in a graveyard; cards it exiled first are `effect:separate-exiled-cards-into-piles`). `separator` / `chooser` are `PlayerRef`s, or `"an-opponent"`: "**an opponent** separates / chooses", named as the text reaches them (rule 608.2c) — after the reveal, and for a chooser after the piles are made. Only "Choose an opponent. They look …" (Sauron's Ransom) is a `choose-opponent` around this naming `"that-player"`. `faceDown: true` is "a face-down pile and a face-up pile": pile 1 hidden from all but those who looked, pile 2 revealed. A `PileFate` is `"hand"`, `"graveyard"`, `"exile"` (the owner's), `"battlefield"` (under your control), or `{ effect }` applied to each object as target 0, all as one event — Liliana's `{ effect: { kind: "sacrifice-target", target: 0, byItsController: true } }`, Do or Die's `destroy` with `cantBeRegenerated`. The scaffolder reads Fact or Fiction's, Steam Augury's, Curator's, Fortune's Favor's, Liliana's, Do or Die's and Death or Glory's lines whole. |
| `choose-among-targets` | `chooser`, `count`, `chosen?`, `rest?`, `prompt?` | A player picks among the spell's own targets as it resolves — Barrin's Spite's "their controller chooses and sacrifices one of them. Return the other to its owner's hand" is `{ chooser: "their-controller", count: 1, chosen: { effect: { kind: "sacrifice-target", target: 0, byItsController: true } }, rest: "hand" }`. Only targets still legal (608.2b); with `count` or fewer, all are chosen unasked. `chosen`/`rest` are `PileFate`s (a zone, or `{ effect }` with each object as target 0). "An opponent chooses one of them" (Wake to Slaughter) is a `choose-opponent` around it with `chooser: "that-player"`. |
| `choose-one-of-each` | `who`, `slots`, `filter`, `prompt`, `fromHand?`, `anyController?`, `chosenBy?`, `chosen?`, `rest?` | One for each of several categories, untargeted: `slots` is card types (Cataclysm; all six permanent types, Liliana, Dreadhorde General; the nonland four over `filter: { notTypes: ["land"] }`, Cataclysmic Gearhulk), `chosenBy: "you"` the effect's controller answering for each player (Mythos of Snapdax), or `"basic-land-types"` (Global Ruin, Planar Overlay, Sundering Titan) or `"colors"` (Noxious Vapors). A slot with a candidate must be filled, one card may stand for several, and each chosen must be the one for a slot of its own. `chosen: "destroy" \| "return-to-hand"`, `rest: "sacrifice" \| { discard: filter }`, all at once after every player has chosen in turn order |
| `choose-for-each-slot` | `slots`, `filter`, `prompt`, `each` | "**For each color**, put a +1/+1 counter on a Dragon you control **of that color**" (Call the Spirit Dragons): the controller chooses one permanent matching `filter` for each slot in turn (`slots` as `choose-one-of-each`'s; none for a slot with no candidate, unasked with one), one permanent free to be chosen for several; then all at once (rule 608.2f) `each` applies to every one chosen as target 0, `"x"` the number of slots it was chosen for (`amount: "x"` — a Dragon of two colors gets two counters in one placement). `{slot}` in `prompt` is the slot's word. Follow with a `this-way` `"counters-put"` condition for "five Dragons this way" |
| `unless` option `{ sacrifice, totalPowerAtLeast, text }` | | "Sacrifice it unless you sacrifice **any number of creatures with total power 12 or greater**" (Phyrexian Dreadnought): offered only when what the chooser can sacrifice reaches it, then chosen on the `choose-permanents` decision, all sacrificed at once. |
| `vote`'s `for.permanent.prompt` and the filter operand `{ chosenThisWay: "power" }` | | "You may choose a creature. ~ deals 3 damage to each creature not chosen this way" (Thunderwave) is a `vote` with `choose`, `upTo: 1`, `keep`, its own `prompt`, then a mass effect with `notThisWay: "chosen"`. "Each opponent chooses a creature they control **with equal or lesser power**" (Sculpted Sunburst) is a second `vote` whose filter says `power: { op: "lte", n: { chosenThisWay: "power" } }`, the greatest power chosen so far in this resolution, not an amount so a negative one stays negative; "if you chose" is the `this-way` condition with `what: "chosen"`, `who: "you"`. "Each opponent chooses two cards in their graveyard and exiles the rest" (Watchers of the Dead) is a `for-each-player` of a `look-and-choose`, `destination: "stay"`, `leftover: "exile"`. `look-and-choose`'s `together: { totalPowerAtMost: amount }` is "any number of other creature cards with total power X or less" (Moorland Rescuer), `isSource: false` for "other". |
| `keep-total-power` | `who`, `filter`, `maxTotalPower`, `prompt` | "Each player chooses any number of creatures they control with total power 4 or less, then sacrifices all other creatures they control" (Slaughter the Strong): each player in turn order from the active player, knowing the choices before theirs, picks which of their own to keep (a `choose-permanents` with `maxTotalPower`, a negative power subtracting — the ruling); then everything not kept goes at once (rule 603.10a). A token stack can be kept in part. |
| `sacrifice` | `who`, `filter`, `count`, `exceptSource?`, `exceptHost?`, `andEach?` | `exceptHost`: "other than enchanted creature" (Sporogenic Infection). Diabolic Edict (`who: "target"`), Fleshbag Marauder (`who: "each-player"`), Korvold (`who: "you"`, `exceptSource: true` = "another"). `andEach: [filter, …]` is "sacrifice a creature, **an artifact, and a land**" (Tomb of Annihilation's Oubliette — `filter: { type: "creature" }, count: 1, andEach: [{ type: "artifact" }, { type: "land" }]`): one permanent per filter, each a different one (an artifact creature pays only one part), each part asked in turn offering only what leaves the most of the rest payable, then all sacrificed at once (603.10a). |
| `reveal-drawn` | — | "Draw three cards **and reveal them**" (the Mad Wizard's Lair): a step after the `draw` that shows every player the cards this resolution drew, still in hand (701.16). Then `cast-now { from: "drawn-this-way" }` is "you may cast one of them". |
| `sacrifice-source` | `then?` | Defense of the Heart — "Sacrifice ~. **If you do,** …"; no choice, and `then` only applies if the source was still there to sacrifice: the same object the ability refers to (rule 400.7), still controlled by the ability's controller (rule 701.21a — Colfenor's Urn's ruling: taken by another player, it isn't sacrificed and nothing returns) |
| `sacrifice-target` | `target` | "Sacrifice **it**" — one named permanent (a target slot, `"source"`, `"trigger-object"`), no choice: Sneak Attack's delayed "sacrifice the creature at the beginning of the next end step", Come Back Wrong. Sacrificed by the effect's controller, so only while they control it (rule 701.21a): one someone else took meanwhile stays. "Its controller may sacrifice it" is an `each-player-may` with `who: { controllerOf }` around it (Star Athlete), which makes it theirs |
| `created-tokens-fight` | `among` | "**Each of those tokens fights a different one of those creatures**" (Ezuri's Predation): after a `create-token` in a `sequence`, this resolution's tokens each fight a different permanent `among` matches, all at once; extras fight nothing, and the controller is asked for the pairs only where the tokens differ. |
| `fight` | `a`, `b`, `oneSided?` | Prey Upon / Rabid Bite. With `oneSided`, `b` may be a planeswalker (Stump Stomp's "deals damage equal to its power to target creature or planeswalker you don't control"). A real fight (not `oneSided`) emits `creature-fought` for each creature in it (rule 701.14), which a `fights` trigger ("whenever a creature you control fights" — Foe-Razer Regent) reads; its trigger object is the creature that fought. |
| `gain-control` | `target` (an `ObjectRef`), `untilEndOfTurn`, `who?`, `whileSource?` | Act of Treason; `untilEndOfTurn: false` is "lasts indefinitely" (Sliver Overlord). `whileSource: true` (with `untilEndOfTurn: false`) is "for as long as [this] remains on the battlefield" — Opportunistic Dragon: it ends as the source leaves, whoever controls the source then, and doesn't begin at all if the source has already left as it would (rule 611.2b). A timestamped layer-2 effect: the latest control effect on a permanent wins, Aura or not (rule 613.7), and when one ends the next-latest takes over — including when the player it gave control to leaves the game (rule 800.4a), so it goes back to the player still in the game who most recently had it. `who` (an `PlayerRef`) is who gains control, the effect's controller by default: a player slot — Zedruu the Greathearted's "target opponent gains control of target permanent you control" is `targets: ["opponent", { kind: "permanent", whose: "you", filter: {} }]` with `target: 1, who: { target: 0 }` — or a player the event names, like Alexios, Deimos of Kosmos's "that player gains control of Alexios" (`target: "source", who: "active-player"`). If either the permanent or the player has become an illegal target by resolution, it does nothing (rule 608.2b — `ResolutionContext.illegalTargets`). A player who has left the game gains control of nothing (800.4b). |
| `gain-control-spell` | `target` (a slot) | "Gain control of target spell" (Commandeer, Aethersnatch — with a `change-targets` of `how: "choose-new"` after it): the effect's controller controls the spell, so its "you" is them and its targets are judged from their side (rule 112.2). Who cast it still did (`spellCaster` — "if you cast it", a spell you cast countered, rebound's "your hand"); it goes to its owner's zones. The permanent it becomes is theirs, by an effect that goes on applying (rule 110.2b): it goes back to the caster if they leave the game (800.4a), and is exiled if the caster has left too (800.4c). |
| `gain-control-all` | `filter`, `untilEndOfTurn`, `who?`, `exceptSource?` | Every permanent matching `filter` changes control at once, as one effect with one timestamp (rule 613.7b): "gain control of all nonland permanents until end of turn" (Dihada, Binder of Wills), "gain control of all commanders" (Tevesh Szat). `who` as `gain-control`'s, or `"owner"`: "each player gains control of all creatures they own" (Homeward Path). A token stack changes hands whole. `controlledBy: "trigger-player"` keeps only what the player the trigger names controls — Hellkite Tyrant's "gain control of all artifacts that player controls" — and does nothing once they've left. `controlledByTarget: N` keeps only what the player in target slot N controls (Call for Aid's "all creatures target player controls"). |
| `exchange-control` | `objects: [a, b]`, `then?`, `otherwise?` | Exchange control of two permanents (rule 701.12b): each controller gains the other's at once, one lasting effect, one timestamp. All or nothing (701.12a): nothing when either is gone or an illegal target, or one player controls both. `objects` are target slots, `"source"` (Avarice Totem's "this artifact and target nonland permanent"), `"trigger-object"`. `then` is "if you do" (Volatile Stormdrake), `otherwise` "if you don't or can't make an exchange" (Gilded Drake's sacrifice). Switcheroo's "two target creatures" is `["creature", { kind: "other", of: "creature", than: { slot: 0 } }]`. `exchange-control.test.ts`. Either object may be a **spell on the stack** (Sudden Substitution's "target noncreature spell and target creature", then `change-targets` with `by: "its-controller"`): its new controller controls it as `gain-control-spell` has it. `exchange-control-spell.test.ts`. |
| `exchange-control-all` | `filter`, `with: PlayerRef`, `untilEndOfTurn` | "You and target opponent each gain control of all creatures the other controls" (Reins of Power, Twist Allegiance): both sets fixed first, then moved at once with one timestamp. Not an exchange in 701.12's sense: one side having none doesn't stop the other. |
| `rotate-control` | `direction: "left" \| "right"`, `filter`, `exceptSource?` | "Each player gains control of all [filter] controlled by the next player in the chosen direction" (Aminatou, the Fateshifter's −6): left is the next player in turn order (rule 101.4), right the one before, skipping anyone who has left the game. Every share is worked out first and changes hands at once, as one lasting effect. "Choose left or right" as it resolves is a `modal` with one `rotate-control` per mode. |
| `opponent-compared`'s `comparedTo: "active-player"` | with a trigger's `targetsChosenBy: "active-player"` | The Oaths' "that player chooses target player who controls more creatures than they do and is their opponent": the active player's own is compared, the Oath's controller may be the target, and it's part of the requirement, so it's read again as it resolves (rule 608.2b). "The first player may …" is an `each-player-may` of `"active-player"`. Magus of the Abyss's "target nonartifact creature that player controls of their choice" is the same chooser over a `controlledBy: "active-player"` filter; hexproof still reads the ability's controller. |
| `gain-control`'s computed `who` | `"player-to-your-left"`, `"player-to-your-right"` (also `PlayerScope`s) | "The player to your right gains control of this artifact" (Hithlain Rope, Bucknard's Everfull Purse): read as it resolves from the effect's controller, skipping anyone who has left. "The player who controls the most Wizards" (Thoughtbound Primoc) is a `for-each-player` with `whoIf` of `of-player` `that-player` over `player-compare`, under an intervening-if of `of-player` `"a-player"`; "that creature's controller gains control of one of those lands of their choice" (Turf War) is `choose-permanents` with `chooser: "trigger-controller"` and `controlledByPlayer: "trigger-player"`; `target: "trigger-recipient"` is "the other creature" (Charisma). |
| `reveal-until-count`'s `thenEach?`, `thenToDifferentOpponents?` | an effect with each entered permanent at slot 0; `true` | "They're goaded for the rest of the game. For each of those permanents, choose a different opponent. Each opponent gains control of the permanent for which they were chosen" (Dack Fayden, Helping Hand): the engine builds a `distribute-control`, one `choose-modes` a permanent with more than one opponent left, all changing hands at once (rule 613.7b). |
| `block-additional` | `target`, `amount: number \| "any"`, `duration` | "It can block an additional creature this turn" (Act of Heroism, Coastline Chimera's activation) — `amount` more attackers than rule 509.1a's one, or `"any"` number (Valor Made Real, Give No Ground). A modifier, lost with a later loss of all abilities; the static form is §10's `blockAdditional`. `block-additional.test.ts`. |
| `loyalty-activations` | `target`, `times: 2`, `duration` | "You may activate loyalty abilities of Kaito twice this turn rather than only once" (Kaito, Dancing Shadow, rule 606.3) — `target: "source"`, `duration: "end-of-turn"`. A rule about that permanent for a while, not an ability it gains; two of them are still twice. The static forms are §10's `loyaltyActivationsEachTurn`. `loyalty-twice-this-turn.test.ts`. |
| `cant-be-sacrificed` | `target` or `filter`, `duration`, `by?` | "It gains 'This creature can't be sacrificed'" (Jon Irenicus, Shattered One) — `"end-of-turn"` or `"permanent"` (while it stays on the battlefield). The static form, and what it stops, is §10's `cantBeSacrificed`. `filter` instead of `target`: every permanent matching it as this resolves ("those creatures" is `{ thisWay: "control-effect" }`). `by: "you"`: "**You** can't sacrifice those creatures this turn" (Call for Aid) — a rule over that player and those permanents, not an ability they gain. |

#### Delayed triggered abilities (`delayed-trigger`)

"At the beginning of the next end step, exile it" is not part of the effect
that says it — it is a separate ability that fires later (rule 603.7). Set one
up with a `delayed-trigger` effect:

```ts
{
  kind: "delayed-trigger",
  at: { step: "end" },
  effect: { kind: "exile", target: 0 },
  text: "Exile the creature Whip of Erebos returned.",
}
```

A step timing is `{ step, whose?, which? }` (`delayed-at.ts`). `step` is `"upkeep"`,
`"draw"`, `"precombat-main"`, `"postcombat-main"`, `"main"` (either main phase, the
first to begin), `"begin-combat"`, `"end-combat"`, `"end"` or `"cleanup"`. `whose` is
`"any"` by default, `"you"` (the delayed ability's controller) or any `PlayerRef`
(`{ target: 0 }`, `"that-player"`, `{ ownerOf: "trigger-object" }`), the ability
staying yours (rule 603.7d: Suppress). `which` is `"next"` by default, `"this-turn"`
("at this turn's next end of combat": Venomous Breath, lapsing if there's none left)
or `"next-turn"` (the end step of your next **turn**, never this one's: Kav Landseeker,
lapsing if that turn's step never comes). "Next" never means a step already in
progress: an ability created *during* an end step waits for the following turn's.
A `blockedThisTurn` clause's `of` in its effect is bound as it's set up and it keeps
no targets, so it can't fizzle with "it" gone. An intervening "if" (rule 603.4), on any
kind of `at`, is `if: <StaticCondition>`: asked as it would trigger and again as it
resolves (Fight for the Throne). With `about`, `orNone: true` sets it up with nothing
done too, for an ability with more to do (Ignorant Bliss's "then draw a card" with an
empty hand).

The delayed ability chooses no new targets — its text doesn't say "target", so
it has none of its own (rules 115.1d, 115.10a) — and it carries forward the
objects the creating effect had (rule 603.7c), so `target: 0` inside it means the same
object the spell or ability was already pointed at, and `"source"` still means
the card that set it up. Neither has to still be around when it fires.

`controller` (`{ controllerOf: n }`) hands the ability to someone else —
Arcane Denial's "**its controller** may draw up to two cards".

**When a permanent leaves.** `at` can instead wait on one permanent leaving
the battlefield — "when that creature dies this turn, you get an experience
counter" (Kelsien, the Plague):

```ts
{
  kind: "delayed-trigger",
  at: { leaves: 0, to: ["graveyard"], thisTurn: true },
  effect: { kind: "add-player-counters", counter: "experience", amount: 1 },
  text: "When that creature dies this turn, you get an experience counter.",
}
```

`leaves` is a slot, `"source"` or `"trigger-object"`, and has to be a
permanent on the battlefield as the effect applies — otherwise nothing is set
up. `"created"` is "that token": every token this resolution has made, each
watched on its own, so whichever leaves first fires (Ugin, the Ineffable's
ruling). `about` works here too, the delayed ability's slot 0 being what the
resolution did that to: Ugin's "when that token leaves the battlefield, put the
exiled card into your hand" is `leaves: "created"`, `about: "exiled"`,
`return-to-hand` of slot 0 `from: "exile"`; Stangg's "exile that token when
Stangg leaves the battlefield" is `leaves: "source"`, `about: "created"`.
`to` lists the destinations that fire it (`["graveyard"]` is "dies",
`["graveyard", "exile"]` "dies or is exiled"); `thisTurn` makes it lapse as the
next turn begins. It watches that permanent's current stint only: it is used up
the first time the permanent leaves for anywhere, so one bounced to hand and
replayed is a new object it never fires for (rule 400.7). When it fires, the
permanent is its trigger object, wherever it went — "return it to the
battlefield" is `{ kind: "put-onto-battlefield", target: "trigger-object" }`
(under its owner's control unless it says otherwise), and finds the card only
in the zone it went to: exiled from the graveyard in response, it stays in
exile. The same is true of every leave-triggered ability's "it" — undying's
return included.

Earthbend is built on this — use the `earthbend` effect rather than spelling
it out (§ P/T, counters, keywords).

**When you next cast a spell.** `at: { nextSpell: CardFilter }` waits for its
controller's next spell this turn matching the filter (`{}` for any), fires
once, and lapses as the turn ends; that spell is its trigger object. Yuna,
Grand Summoner's "when you next cast a creature spell this turn, that creature
enters with two additional +1/+1 counters on it" is `at: { nextSpell: { type:
"creature" } }` with `{ kind: "enters-with-counters", target:
"trigger-object", counter: "+1/+1", amount: 2 }` (counters a spell enters the
battlefield with as it resolves — before its enters triggers look); with
`amount: 1`, "an additional +1/+1 counter", it's a Saga chapter too (Summon:
Fenrir's II, Kumano Faces Kakkazan's), and the scaffolder reads the sentence.
Codie,
Vociferous Codex's "when you cast your next spell this turn, exile cards from
the top of your library until you exile an instant or sorcery card with lesser
mana value. Until end of turn, you may cast that card without paying its mana
cost. Put each other card exiled this way on the bottom of your library in a
random order" is `at: { nextSpell: {} }` with a `reveal-until` (`exile: true`,
a `manaValue` compare on `{ amount: { manaValueOf: "trigger-object" } }`,
`rest: "bottom-random"`, `keepFound: true`) whose `then` is `{ kind:
"grant-play", cards: 0, duration: "end-of-turn", free: true }` — "until end of turn, you may
cast that card" (`free`: only without paying its mana cost). `orNextAbility: {
xInCost: true }` also fires it on its controller's next activated ability with
{X} in its activation cost, whichever comes first, the ability its trigger
object — Magus Lucea Kane's "when you next cast a spell with {X} in its mana
cost or activate an ability with {X} in its activation cost this turn, copy
that spell or ability" is `at: { nextSpell: { xInManaCost: true },
orNextAbility: { xInCost: true } }` over a `sequence` of `copy-spell` of
`"trigger-spell"` and `copy-ability` of `"trigger-ability"` (each finds nothing
when the trigger object is the other kind), set up by its mana ability's
`add-mana` `also`. `orNextAbility: { loyalty: true }` is "…or activate a
loyalty ability this turn" (Repeated Reverberation, each copy step with
`count: 2`). "Copy the **next loyalty ability** you activate this turn when
you activate it" alone (Jaya's Phoenix) is the `whenever` watch below with
`once`: `at: { whenever: { on: "activates-ability", who: "you", loyalty: true
}, once: true }` over a `copy-ability` of `"trigger-ability"`.

**"Whenever …, for the rest of the turn."** `at: { whenever: TriggerSpec,
until?: "your-next-turn", targets? }` is "until end of turn, whenever …",
"whenever … this turn" and a planeswalker's "until your next turn, whenever …"
(rule 603.7c): a delayed ability with a duration, matched against every event
as a printed trigger is — its controller is "you", the object that set it up
is `"self"` (and the `to: "self"` of a `deals-damage`) while it's still that
object — firing each time, once per token of a stack the event names, until
the turn ends or, with `until`, until its controller's next turn begins. It
belongs to no permanent: the source leaving, losing its abilities or
changing hands doesn't end it. Glimpse of Nature is

```ts
{
  kind: "delayed-trigger",
  at: { whenever: { on: "cast-spell", who: "you", filter: { type: "creature" } } },
  effect: { kind: "draw", amount: 1 },
  text: "Whenever you cast a creature spell this turn, draw a card.",
}
```

and Vraska the Unseen's +1 `at: { whenever: { on: "deals-damage", who: "any",
filter: { type: "creature" }, to: "self", combat: true }, until:
"your-next-turn" }` over `{ kind: "destroy", target: "trigger-object" }`. The
event's object is `"trigger-object"` and its "that many" the `{ triggerValue:
true }`, as for the printed trigger. With no `targets` the effect reads the
creating ability's slots (Jaya, Fiery Negotiator's "to that creature"); with
`targets` it chooses its own each time it triggers and its slots are those
(Origin of Thor's "whenever you cast a spell this turn, put a +1/+1 counter on
target creature you control" — `targets: ["creature-you-control"]`). Massacre
Girl sets one up in her enters ability's `sequence`, after the first -1/-1.
`delayed-trigger-rest-of-turn.test.ts`.

**"That card."** A delayed trigger carries the creating ability's trigger
object: Shirei, Shizo's Caretaker's "whenever a creature you control with power
1 or less is put into a graveyard from the battlefield, you may return that
card to the battlefield under its owner's control at the beginning of the next
end step if Shirei is still on the battlefield" is a `dies` trigger whose
`delayed-trigger` effect is a `conditional` on `{ kind: "source-on-battlefield"
}` of a `put-onto-battlefield` of `"trigger-object"`. The card has to still be
the object that died — gone from its graveyard and back is a new one (rule
400.7) — and "if Shirei is still on the battlefield" is the same Shirei.

For the common "create a token, then get rid of it at end of turn" shape, use
`create-token` / `create-token-copy`'s `sacrificeAtEndStep` (Kiki-Jiki,
Chandra, Acolyte of Flame) or `exileAtEndStep` (Miirym) instead — the delayed
ability would have no way to name a token that didn't exist when it was set up.
Each sets up that delayed trigger over the tokens it made (rule 603.7 —
`endStepTokenRemoval`): it goes on the stack as the next end step begins, can be
responded to, countered (the tokens stay) or copied, and a sacrifice is by its
controller while they control the token (701.21a). The tokens are each their
own object, so it reaches every one.

### P/T, counters, keywords

| kind | fields | notes |
| --- | --- | --- |
| `modify-pt` | `target`, `power`, `toughness`, `duration` | `duration` is any `PermanentDuration`, as it is for every effect below that takes one: `"end-of-turn"`; `"permanent"` (while it stays on the battlefield); `"until-your-next-turn"` — the effect's controller's, ending as that turn begins, or as it would have begun once they've left the game (rule 800.4m); a later point in that turn (`PointDuration`, each waiting past a skipped step, rule 614.10a): `"until-your-next-upkeep"` (Xenic Poltergeist), `"until-end-of-your-next-upkeep"` (Halfdane; one made during an upkeep waits for the next), `"until-end-of-your-next-turn"` (Stilt-Man, Towering Terror; `gain-control` takes these as `until`), `"until-its-controllers-next-untap-step"` (Orcish Farmer; whoever controls it as a step begins); or `{ whileCounter: kind }`, "for as long as it has a [kind] counter on it" (rule 611.2b), which does nothing if it has none as it would begin, ends as the last one is removed, and isn't brought back by a new one; or `"while-source"`, "for as long as [this] remains on the battlefield" — the effect's source in the stint it had as the effect began (rule 611.2b): nothing if it had already left by then, and it ends as the source leaves. Ending waits until everything leaving with the source has left, so that event's look back (rule 603.10a) still sees the effect: Opportunistic Dragon's stolen Syr Konrad, without abilities as the Dragon dies, doesn't see the death. |
| `modify-pt-all` | `filter`, `power`, `toughness`, `duration`, `exceptSource?`, `controlledByTarget?`, `controlledByPlayer?` | Overrun. `controlledByPlayer` is the same scope for a player the event names: Silumgar's "creatures defending player controls" (`"trigger-player"`). `exceptSource` spares the source ("**other** attacking creatures you control with flying" — Steel-Plume Marshal, itself one). `controlledByTarget` scopes to a *targeted seat* (Great Oak Guardian), which a `CardFilter`'s `controlledBy` can't name — it only knows "you" and "opponent". `perMatchOf: CardFilter[]` gives each permanent the amount once for each listed filter it matches and nothing for none, all counted before any is changed (rule 611.2c): "+1/+1 if it has flying, +1/+1 if it has first strike, and so on for …" (Akroma, Vision of Ixidor), one filter a listed ability. |
| `switch-pt` | `target?` \| `all?: CardFilter`, `duration` | "Switch target creature's power and toughness until end of turn" (Twisted Image; `target: "source"` for "switch this creature's"; Mannichi, the Fevered Dream's "each creature's" is `all: { type: "creature" }`). Layer 7d (rule 613.4d): after every counter and pump, whenever those arrive, so a 2/4 switched and then given +3/+3 is 7/5; two switches undo each other. A 0-power creature switched dies to state-based actions. The scaffolder reads the line. `switch-pt.test.ts`. |
| `grant-keyword` | `target`, `keyword`, `duration` | A permanent — or a spell on the stack: Judith, Carnage Connoisseur's "whenever you cast an instant or sorcery spell, … that spell gains deathtouch and lifelink" is two of these on `"trigger-object"`, lasting while it's on the stack. A spell's lifelink and deathtouch apply to the damage it deals. |
| `player-effect` | `duration` (a `PlayerDuration` — `engine/src/duration.ts`: `"end-of-turn"`, `"until-end-of-combat"`, `"permanent"` for the rest of the game, `"until-your-next-turn"`, `"until-end-of-your-next-turn"`, `"during-your-next-turn"`, another player's with `{ untilTurnOf \| throughTurnOf \| duringTurnOf: "that-player" }` — Teferi's Reproach, Willie Lumpkin, Sphinx's Decree — or the source's, `"while-you-control-source"` / `"while-source"`: The Great Synthesis's "you have no maximum hand size for as long as you control this Saga", nothing if that already isn't so as it resolves and over for good once it stops, rule 611.2b; `timed-static`, `prohibit` and a game-wide `restrict` take them too), `graveyardExile?` (`{ filter?, from?: "battlefield", returnAtEndStep? }` — a would-go-to-a-graveyard replacement for the turn, read live from your side: Malicious Eclipse, Gaea's Will; `returnAtEndStep`, Cosmic Intervention's return), `looksAtOwnLibraryTop?` (the statics' library-top permissions for the duration: The Belligerent's "until end of turn, you may look at the top card of your library any time, and you may play lands and cast spells from the top of your library" is `{ type: "land" }`, `{ filter: {} }` and `true`; Gwenom, Remorseless adds `payLifeManaValue`, Bolas's Citadel's alternative cost, rule 118.9), `entersTapped?` (a `CardFilter`: "lands you control enter tapped this turn", Nahiri's Lithoforming, rule 614.1d), `tokensComeToOwner?` ("each token that would be created under an opponent's control this turn is created under your control instead": Crafty Cutpurse, ahead of every other token replacement), `nextDrawInstead?` (`{ effect, text }` — "the next time you would draw a card this turn, … instead": the Words cycle, spent when it applies, the ability's targets carried to the draw; `~` in `text` is the source's name, for the choice among several), `damageReplacement?` (`{ plus?, setTo?, source?, combat?, to?: "player-or-battle" }` — a would-deal-damage replacement for the duration: The Flame of Keld, Equal Treatment), `reduceSpells?`, `castFromHandFree?`, `mayPlay?`, `castAsThoughFlash?`, `damageTo?` | A continuous effect for the controller that expires — an emblem with a clock (`GameState.playerEffects`): `castAsThoughFlash: { filter?, next? }` is "you may cast [creature] spells this turn as though they had flash" (Borne Upon a Wind `{}`, Winding Canyons `{ filter: { type: "creature" } }`, rule 601.3b), and with `next: true` "the next sorcery spell you cast this turn can be cast as though it had flash" (Quicken): the next matching spell its controller casts ends it, whenever and however it's cast, several at once (Quicken's rulings); a filter's `ofChosenType` is the source's chosen creature type, fixed as it resolves (Progenitor's Icon — none chosen, no effect). Suspend reads it too (702.62a); `mayPlay: { from, …PlayTerms, whose?, linked? }` is a permission for the effect's duration (see **`mayPlay` / `grant-play` / `impulse-exile`** in §6); `reduceSpells: { applies, reduceGeneric }` is Rowan, Scion of War's "spells you cast this turn that are black and/or red cost {X} less to cast, where X is the amount of life you lost this turn" (`applies: { anyOf: [{ colors: ["B"] }, { colors: ["R"] }] }`, `reduceGeneric: { turnStat: "life-lost", who: "you" }` — read as it resolves and fixed, rule 611.2b); `castFromHandFree: { filter? }` is Yusri's "you may cast spells from your hand this turn without paying their mana costs" (offered as a `free` cast); `damageTo: { who, multiplier, permanentsToo? }` is "until your next turn, if a source would deal damage to that player or a permanent that player controls, it deals double that damage instead" (the players fixed as it resolves). Anything a player can't do for a while is a `prohibit` (the game-outcome locks, a cast limit, "your life total can't change"), see §10's `prohibits`. `damageLifeFloor: { who, floor }` (Angel's Grace's "damage that would reduce your life total to less than 1 reduces it to 1 instead" — the damage is still dealt in full, a total already below the floor drops as normal, and life *lost* isn't stopped). `tokenMultiplier: 2` is Kaya, Geist Hunter's "until end of turn, if one or more tokens would be created under your control, twice that many of those tokens are created instead" — a Doubling Season for a while, compounding with one on the battlefield. `protectionFromEverything: "you"` is its "you gain protection from everything" (rule 702.16j): no spell or ability may target that player (their own included), no Aura may enchant them (a Curse on them goes, 704.5m), and all damage to them is prevented. `playFromHandOf` (a player slot) is Sen Triplets' "you may play lands and cast spells from that player's hand this turn" (rule 601.3, a `via: "other-hand"` cast, ordinary timing, costs and land drop); `handRevealed` (a slot) is "and plays with their hand revealed", to every player. `extraLoyaltyActivation: true` is The Chain Veil's "for each planeswalker you control, you may activate one of its loyalty abilities once this turn as though none … have been activated" — one more loyalty activation of each permanent you control, adding up per resolution. |
| `repeat` | `effect`, `times?`, `again?`, `mayAgain?` | "…, then repeat this process": `effect` is one pass, run again as these allow. `times` is how many passes in all ("proliferate X times" — Expansion Algorithm, `times: "x"`; "repeat the following process X times" — Torment of Hailfire; Professor Onyx's "repeat this process six more times" is `times: 7`), read once as the first pass begins; with `again` or `mayAgain` it's the most there may be (Claim Jumper's "repeat this process once" is `times: 2`). `again` is "if [this], repeat this process": a condition read after each pass over **that pass alone** — each pass is its own "this way" — so Grist's "if an Insect card was milled this way" is `{ kind: "this-way", what: "milled", filter: { subtype: "Insect" } }`, and the `this-way` condition's `sharing: "color" \| "card-type" \| "name"` counts the largest group sharing one: Grindstone's "if two cards that share a color were milled this way" is `{ kind: "this-way", what: "milled", sharing: "color", atLeast: 2 }`. A `this-way` condition's `acrossPasses: true` reads **every pass so far** instead, in `again` or inside a pass: Tainted Pact's "the same name as another card exiled this way", Helm of Obedience's "until a creature card or X cards have been put into their graveyard this way" (`atLeast: "x"`, and a process with a target's library, which runs out: its `again` also says a pass milled something). `mayAgain: true` is "you may repeat this process any number of times" (Ad Nauseam), asked after each pass; `{ cost: "{G}" }` is "you may pay {G}. If you do, repeat this process"; `{ costLife: 1 }` is "as many times as you choose, you may pay 1 life, …" (Lim-Dûl's Vault, inside a `may` of the same cost). A pass that stops to ask is answered before the next begins. What follows the process reads every pass's "this way" (Demonlord Belzenlok's "1 damage for each card put into your hand this way"). At most 200 passes. |
| `clash` | `won?`, `lost?`, `repeat?` | "Clash with an opponent. If you win, …" (rule 701.30 — Lorwyn block): the controller chooses an opponent (not a target; asked only among several), both reveal the top card of their library, each in APNAP order leaves it on top or puts it on the bottom, and a greater mana value wins (an empty library can't win, and loses to any card). Then `won` or `lost` applies, `"that-player"` naming the opponent clashed with (Captivating Glance's "Otherwise, that player gains control"). `repeat` is "if you win, repeat this process" (Hoarder's Greed): on a win, `repeat` and then the clash again. Each clashing player then **clashes** (a `clashed` event, won or not), which the `{ on: "clashes", who, won? }` trigger fires on: "whenever you clash" (Entangling Trap), "whenever you clash and win" (`won: true`, Sylvan Echoes) — for a clash anyone started. Its "if you won" is the condition `{ kind: "trigger-value", compare: { op: "gte", n: 1 } }` (the trigger's value is 1 for a win, 0 for a loss — Rebellion of the Flamekin). |
| `flip-coin` | `won?`, `lost?`, `count?`, `sides?`, `heads?`, `tails?`, `then?` | "Flip a coin. If you win the flip, …; if you lose the flip, …" (rule 705): the controller flips on the game's seeded random stream (so a seed replays), then `won` or `lost` applies as their effect. `count` is "flip five coins", one instruction. `sides: true` is a flip that only cares about heads or tails (705.2): nobody wins it, `heads` / `tails` are its branches. `then` comes after the last coin and reads them: `{ thisWay: "flips-won" }` (`"flips-lost"`, `"coins-heads"`, `"coins-tails"`), and the same words in a `this-way` condition. "Until you lose a flip" is `flipUntilLose()` in `helpers.ts`, a `repeat`: `{ times: "x" }` for "that many times or until…", `{ mayStop: true }` for "or choose to stop". "That player flips" is `as-player`. Each flip is a `coin-flipped` event, which the `wins-coin-flip` and `loses-coin-flip` triggers read. Replacements: `would-flip-coin` (`{ who, ignore }` for "flip two and ignore one"; `{ who, comesUp, wins, firstEachTurn }` for a named result, 705.3). Dice: `roll-dice`'s `keepHighest` ("ignore all but the highest", 706.6), `would-roll-dice` (`{ who, instead: { modify: { plus: 1 } }, ignoreLowest: true }`), the amount `{ roll }` (also `"highest"`, `"distinct"`, `{ atLeast: n }`), and `{ on: "event", event: "rolls-die", die?: { atLeast?, natural? } }` for "whenever you roll a 4 or higher" or "a natural 20", one trigger per die, its value that die's result. A trigger on a roll reads that roll through `{ roll }`. |
| `prohibit` | `who` (a target slot or a `PlayerScope`, default you) with `spells` / `abilities`, or `target` (a permanent) | Prohibitions until end of turn: Sen Triplets' "this turn, that player can't cast spells or activate abilities" (`who: 0, spells: true, abilities: true`); `spells` may instead be `{ filter, label }` for only some spells — Ranger-Captain of Eos's "your opponents can't cast noncreature spells this turn" is `{ who: "each-opponent", spells: { filter: { notTypes: ["creature"] }, label: "noncreature spells" } }`, the filter matched against the card as it would be cast and `label` naming them in the log; Koma, Cosmos Serpent's "its activated abilities can't be activated this turn" (`target: 0` — that permanent this stint; flickered, it's a new object). Mana abilities are activated abilities, so they're barred too. `GameState.turnProhibitions`. Other forbidden actions: **`regeneration: true`** — "target creature can't be regenerated this turn" (Hurr Jackal: `{ target: 0, regeneration: true }`; rule 701.19c, its shields stay but aren't applied), or with `dealtDamageThisWay: "creature"` and no target every creature the resolution has dealt damage to so far (Incinerate, Flamebreak — after the damage); Disintegrate's "if it's a creature, it can't be regenerated this turn" is a `conditional` on `{ kind: "target", index: 0, filter: { type: "creature" } }` (`GameObject.cantBeRegeneratedTurn`). **`lands: true`** — "target player can't play lands this turn" on the `who` players (Turf Wound, Pardic Miner: `{ who: 0, lands: true }`; rule 305.2, a land from any zone). **`monarch: true`** — "you can't become the monarch this turn" on the `who` players (Jared Carthalion, True Heir; `PlayerState.cantBecomeMonarchTurn`, rule 725.4). On `target`, `abilities` is the default only when nothing else is named; **`duration: "until-your-next-turn"`** makes a target's abilities prohibition last until your next turn without detain's attack/block half (Dovin Baan's +1) — "until your next turn, it can't attack or block, and its activated abilities can't be activated" is `detain` (Academic Probation, Mythos of Vadrok). |
| `restrict` | `target` or `filter`, `restrictions` (`CombatRule`s, see *Combat rules*), `controlledByTarget?`, `sideOf?`, `exceptTarget?`, `asItResolves?`, `duration?` | The one effect that makes a combat rule. A `target` (or `asItResolves` filter): the set fixed as it resolves, on that creature, for any `PermanentDuration`, or `"during-its-controllers-next-turn"`, `"during-its-controllers-next-combat"`, `{ duringTurnOf }` (nothing until then). A `filter` without `asItResolves`: a rule over the game reaching later arrivals (611.2c), for any `PlayerDuration`. A record's `"source"`, slots and `PlayerRef`s are read as it resolves. A record naming something gone leaves nothing to obey. Combat restrictions until end of turn, or on `target` or an `asItResolves` `filter` for any `PermanentDuration` (`"while-source"`: Opportunistic Dragon's "for as long as this creature remains on the battlefield, … it can't attack or block"; `"until-your-next-turn"`: Taunt from the Rampart's "until your next turn, those creatures can't block", and beside `prohibit { target, abilities: true, duration: "until-your-next-turn" }` Linvala, Shield of Sea Gate's and Edifice of Authority's "can't attack or block, and its activated abilities can't be activated"; `"until-end-of-combat"`: Ma Chao's "it can't be blocked this combat", Flummoxed Cyclops's "can't block this combat", and on `grant-keyword` Battering Ram's "gains banding until end of combat"). **`duration: "during-its-controllers-next-turn"`**, a `target`'s alone, binds it only during the next turn of whoever controls it as this resolves, and not before (Wall of Dust's "that creature can't attack during its controller's next turn" — `PtModifier.restrictionsLater`). "Target creature can't block this turn" (`restrictions: ["cant-block"]`), Anzrag, the Quake-Mole's "~ must be blocked each combat this turn if able" (`target: "source"`, `["must-be-blocked-if-able"]`). On `target` it's a modifier, like a keyword grant; with `filter` instead it's a rule for the rest of the turn over everything matching it from your side — "creatures your opponents control can't block this turn" binds a creature that enters later too (rule 611.2c; `PlayerEffect.combat`). With `filter`, **`controlledByTarget: slot`** reads it from the side of the player in that slot, or of the permanent's controller there, as it resolves — Oriss's "creatures target player controls can't attack this turn", Concussive Bolt's "creatures controlled by that player or by that planeswalker's controller", Mark for Death's "creatures that player controls" (`filter: { type: "creature", controlledBy: "you" }`); **`exceptTarget: slot`** leaves that permanent out (Mark for Death's "**other** creatures"); **`asItResolves: true`** gives the restrictions to the permanents matching it now, until end of turn, instead of a rule binding later arrivals — for a sentence that also changes their characteristics, which fixes the set (611.2c): Joraga Invocation's "each creature you control gets +3/+3 … and must be blocked this turn if able", Suicidal Charge's "those creatures attack this turn if able". "Creatures named Leitmotif Composer can't be blocked this turn" is `filter: { type: "creature", name: … }, restrictions: ["cant-be-blocked"]` (`restrict-scoped.test.ts`). **A `cant-be-blocked` record's `by: CardFilter`** is "can't be blocked by [X] this turn" (Ghirapur Guide's `{ power: { op: "lte", n: 2 } }`, Tower of Coireall's `{ subtype: "Wall" }`), with `restrictions: []` beside it; "except by [X]" is its negation — `{ notKeyword: "haste" }`, or `CardFilter.not` for a whole clause ("except by creatures with flying or reach": `{ not: { anyOf: [{ keyword: "flying" }, { keyword: "reach" }] } }`). A rule about the creature, not an ability, so a loss of abilities doesn't end it. **A `cant-block` record's `attacker: "source"`** is "target creature can't block **this creature** this turn" (Kozilek's Pathfinder, Auriok Siege Sled): the target can't block that one attacker, the object it is as this resolves (rule 400.7); its twin, "blocks this creature this turn if able", is a `must-block` record's `attacker: "source"`. `grant-static.test.ts`, `block-requirements-per-creature.test.ts`. |
| `grant-static` | `target` or `filter`, `ability: StaticAbility`, `duration` | "Becomes a Monk Avatar creature and gains 'This creature's power and toughness are each equal to the number of lore counters on it'" (Myth Realized; Svogthos, Druid Class): an `become` with no `power` or `toughness`, then this with `setBasePtFromCount`, read live (`countOf` may be `{ countersOnThis: kind }`), not a CDA once granted (604.3a). **"Becomes a creature with [a whole ability]" is `become` then the grant, in one `sequence`, by one duration:** this for a static (Restless Spire's `condition: { kind: "your-turn" }`, Veiled Serpent's `cant-attack` record, Monument to Perfection's `grantToxic` after an `become` with `loseAbilities`), `grant-triggered` for a trigger (Raging Ravine, Veiled Apparition, Dancing Sword's `ward(…)`), `grant-protection` for a protection (Opal Guardian); the scaffolder reads these. `animate-grants-ability.test.ts`. "It gains '[static ability]'": Full Steam Ahead's "This creature can't be blocked by more than one creature" (`filter`, locked as it resolves — 611.2c), Carnage's "This creature attacks each combat if able" (`restrictions: ["must-attack"]`, `"permanent"`), Earthbind's Aura gaining "Enchanted creature loses flying" (`target: "source"`, `affects: { scope: "attached" }`). The ability works from that permanent as its own static would, its effects timestamped by the later of the permanent and the grant (613.7a), and a later loss of all abilities takes it (613.7). Read for P/T, keyword and restriction statics, block filters, `grantsActivated`/`grantsTriggered`, `doesntUntap`, `prohibits`, and a granted "base power is equal to …" (`setBasePtFromCount` — layer 7b by timestamp, not a CDA once granted, 604.3a). A layer-4 part isn't applied. `grant-static.test.ts`. |
| `attack-despite-defender` | `target` or `filter` | "Can attack this turn as though it didn't have defender" (rule 702.3b). On `target` (Assault Formation) a modifier until end of turn; with `filter` a rule for the rest of the turn over everything matching it from your side, so a defender that comes under your control later is covered too (Wakestone Gargoyle's ruling; `GameState.turnDefenderAttacks`). A rule about the creature rather than an ability it gains, so a loss of all abilities doesn't end it. The static form is §10's `canAttackAsThoughNoDefender`. |
| `damage-by-toughness` | `target` | "Assigns combat damage equal to its toughness rather than its power" until end of turn (rule 510.1a — Walking Bulwark). Its power is unchanged for everything else (a fight still uses power). The static form is §10's `combatDamageByToughness`. |
| `assign-as-though-unblocked` | `target` or `filter`, `optional?` | "[It] assign[s] its combat damage this turn as though it weren't blocked": as combat damage is assigned, a blocked creature assigns all of it to the player, planeswalker or battle it's attacking (rule 510.1b), none to its blockers. `optional` is "you may have …" — its controller chooses then, on the `assign-combat-damage` decision (Gurzigost's `target: "source"`); without it there's no choice (Outmaneuver's "X target blocked creatures", the `blocked` filter). On `target` a modifier until end of turn; with `filter` a rule for the turn over everything matching it from your side, one arriving later too (Predatory Focus — it changes no characteristic, so 611.2c doesn't lock the set in; `GameState.turnUnblockedAssignments`). Not an ability. The static form is §10's `assignAsThoughUnblocked`. `assign-as-though-unblocked.test.ts`. |
| `become-blocked` | `target` or `filter` | "Target unblocked attacking creature **becomes blocked**" (rule 509.1h — Trap Runner; `filter`, Fog Patch's "attacking creatures become blocked"; X targets through `for-each-target`, Choking Vines): blocked with no creature blocking it until it leaves combat or combat ends, one that can't be blocked too. It deals no combat damage unless it has trample, when all of it goes to what it's attacking (702.19e). `becomes-blocked` triggers fire only for one that was unblocked (509.3c); `blocked-by` never does (509.3d). Combat timing is `castOnlyIf` or `condition` `turn-structure`'s `steps`. |
| `reselect-attack` | `target` or `filter`, `onlyPlayers?` | "You may reselect which player or permanent target attacking creature is attacking" (rule 508.7 — Misleading Signpost; `filter`, Windshaper Planetar's "for each attacking creature"; `onlyPlayers`, Capricopian's "which player"): this effect's controller answers the `enter-attacking` decision among what the creature's controller could attack (508.7c), what it's attacking now first, which is the "may". Not `may`-wrapped. It isn't declared again (508.7a) and requirements and restrictions don't apply (508.7b). "When this enters during the declare attackers step" is `whileCondition`. |
| `attack-random-opponent` | `target`, `notAttackedLastCombat?`, `else?` | Territorial Hellkite's "choose an opponent at random that this creature didn't attack during your last combat. This creature attacks that player this combat if able. If you can't choose an opponent this way, tap this creature" (`{ target: "source", notAttackedLastCombat: true, else: { kind: "tap", target: "source" } }`): the game picks among the effect's controller's opponents still in the game — with `notAttackedLastCombat`, not the one `target` attacked during its controller's previous combat phase (any, if it didn't attack then) — and `target` must attack that player this combat if able, as encore's tokens must theirs (`GameObject.mustAttackPlayer`, only this combat): not a planeswalker of theirs, and nothing forces a cost to be paid. `else` happens when nobody can be picked. Logged as `random-player-chosen`. |
| `put-in-command-zone` | `target` | "Return it to the command zone" (Hellkite Courser's delayed trigger): a commander still on the battlefield as the same object goes there (its ruling — gone elsewhere, it stays); anything else isn't moved. |
| `exchange-life-totals` | `first?: PlayerRef`, `second: PlayerRef` | "Exchange life totals with target opponent" (Mirror Universe), "two target players exchange life totals" (Soul Conduit: `first: { target: 0 }, second: { target: 1 }`) — rule 701.12c: each gains or loses what it takes to reach the other's previous total, so replacement effects and triggers see it. Neither changes if a player can't gain, or can't lose, the life it would take (rules 119.7–8, 701.12a), or one is an illegal target. The `{ lifeDifference: [0, 1] }` amount reads "the difference between those players' life totals" afterwards (Profane Transfusion), and `player-compare`'s `compare: "within", by: 5` "if the difference is 5 or less" (Psychic Transfer). |
| `exchange-life-stat` | `stat: "power" \| "toughness"`, `target`, `player?: PlayerRef` | "Exchange your life total with this creature's toughness" (Tree of Redemption; Evra, Halcyon Witness's "with Evra's power" is `stat: "power"`; Tree of Perdition's "target opponent's life total" is `player: { target: 0 }`) — rule 701.12g: the number becomes the player's former life total, a layer-7b set with no end (`PtModifier.setToughness`; counters and bonuses still apply on top — the Lunarch Mantle ruling), and the player gains or loses the life to reach its former toughness, so life-gain replacements and triggers see it. Gone before it resolves, nothing happens (the ruling); a player who can't gain, or can't lose, that life, and neither half does (701.12a). |
| `grant-flashback` / `grant-flashback-all` | `target` / `filter` | Snapcaster Mage's "target instant or sorcery card in your graveyard gains flashback until end of turn. The flashback cost is equal to its mana cost"; `grant-flashback-all` is Past in Flames' "each instant and sorcery card in your graveyard gains flashback …" over your graveyard as it resolves (a card put there later gains nothing; one with no mana cost gains nothing). A card with a flashback of its own may be cast with either (the Past in Flames ruling): each is offered, named by `graveyardGrant.source` — the card for its own, the granting object for the other. `grant-flashback`'s `cost` is a fixed flashback cost instead — Archmage's Newt's "flashback {0}" (a card with no mana cost gains that too). |
| `grant-graveyard-keyword` | `target` or `filter`, `grant: { keyword, cost?, exileCount? }` | A card in your graveyard gains unearth, encore, embalm, harmonize, retrace, sneak or escape until end of turn (`keyword: "escape"`, `exileCount` its other cards to exile, no `cost` being its mana cost: Desdemona, Freedom's Edge; The Grim Captain's Locker): Cursecloth Wrappings' "target creature card in your graveyard gains embalm until end of turn. The embalm cost is equal to its mana cost" (`cost` left out), Ghost Ark's "each artifact creature card in your graveyard gains unearth {3} until end of turn" (`filter`, fixed as it resolves). |
| `grant-protection` | `target?`, `filter?` (+ `exceptSource?`), `from`, `duration`, `asHexproof?` | With `asHexproof`, **hexproof** from those qualities rather than protection (rule 702.11d; a later loss of hexproof takes it, 702.11e): Veil of Summer, Mondo Gecko. Otherwise "gains protection from [quality]" for a while (rule 702.16): the target's — Gods Willing's "target creature you control gains protection from the color of your choice until end of turn" — and every other permanent matching `filter` as it resolves (611.2c), all with one timestamp: Brave the Elements' "white creatures you control" is `filter: { type: "creature", colors: ["W"], controlledBy: "you" }` alone, Bathe in Light's "target creature and each other creature that shares a color with it" `target: 0` with `filter: { type: "creature", sharesColorWith: 0 }`. `from` is fixed — `{ colors: ["R"] }`, `{ types: ["artifact"] }`, all five for "each color", a `filter` for anything else (`{ colorless: true }`, `{ type: "creature", notSubtypes: ["Human"] }`; a filter's "you"/"your opponents" is the effect's controller's, fixed as it resolves — Crypsis's "creatures your opponents control") — or chosen as it resolves: `{ choose: "color" }`, `{ choose: "card-type" }` (Pippin: the nine card types), with `or` alternatives offered first (Giver of Runes' "colorless or the color of your choice": `or: [{ text: "colorless", from: { filter: { colorless: true } } }]`; Apostle's Blessing's artifacts, `{ types: ["artifact"] }`) and `optional: true` for "you **may** choose a color. If you do, …" (Kabira Evangel). Asked as a `choose-modes` decision, one mode per quality ("Protection from red"), before anything gains it; a "choose a color" the text makes before several clauses that all use it is one `modal` of whole modes instead. "Of its controller's choice" (Wishmonger) is an `each-player-may` with `who: { controllerOf: 0 }` and `choices` of fixed grants. Layer 6 (613.1f): a later loss of all abilities takes it away. The bots weigh each colour by the opposing spell or ability aimed at the permanent it would stop. `grant-protection.test.ts`. |
| `grant-triggered` | `target`, `ability`, `duration` | "gains 'Whenever this creature deals combat damage to a player, draw that many cards'" (Hunter's Prowess, Hunter's Insight). Rides on the target's own modifiers, so `"end-of-turn"` expires with every other until-end-of-turn modifier. The ongoing equivalent is `StaticAbility.grantsTriggered` (§10). |
| `become` | `target`, `loseLandTypes?`, `activated?`, `duration` | "It loses all abilities" (layer 6) — and, with `loseLandTypes`, "all land types" (layer 4; its other types and supertypes stay) — and "has" `activated`, granted by the same effect so they aren't lost with the rest (rule 613.7). Ultima, Origin of Oblivion's blight is an `add-counter` of `blight` and then this, with `loseLandTypes`, `activated: [{T}: Add {C}]` and `duration: { whileCounter: "blight" }`. |
| `become` | `filter`, `duration` | "All creatures lose all abilities until end of turn" (Final Showdown): every permanent matching `filter` as it applies (rule 611.2c), one effect with one timestamp, so an ability granted after it isn't lost (613.7 — the ruling). |
| `grant-activated-of` | `target`, `of`, `duration` | "This creature gains all activated abilities of target creature until end of turn" (Quicksilver Elemental): those `of` has as this resolves, as if printed on `target`. |
| `grant-activated` / `grant-activated-all` | `target` or `filter`, `ability`, `duration` | The activated-ability twins of `grant-triggered` and `grant-triggered-all`: Rain of Filth's "until end of turn, lands you control gain 'Sacrifice this land: Add {B}.'" is `grant-activated-all` over `{ type: "land", controlledBy: "you" }`. A granted mana ability pays for things like a printed one — or, like any mana ability the auto-payer can't plan with (no `{T}`, here), is activated by hand. The ongoing equivalent is `StaticAbility.grantsActivated`. Keep the ability's `resolve: null`: it lives in the game state. |
| `grant-triggered-all` | `filter`, `ability`, `duration` | The mass form of `grant-triggered`: every permanent matching `filter` gains the ability — Azlask, the Swelling Scourge's "Scions and Spawns you control gain … annihilator 1 until end of turn" (`ability: annihilator(1)`). Matches are fixed as it resolves; a token stack gains it whole. A granted `deals-damage` trigger's `to: "spell-caster"` is "the player who cast [this spell]" (Hellish Rebuke): both grants write that player in as the spell resolves — its caster though another player controls it, nobody for a copy that wasn't cast (which then never triggers). |
| `grant-keyword-all` | `filter`, `keyword`, `duration`, `exceptSource?` | Overrun's trample. `exceptSource` is "**other** Spiders you control gain …" (Cosmic Spider-Man). Hits what matches as it resolves (rule 611.2c) — a creature arriving later doesn't gain it. |
| `become` | `target` or `filter` (+ `controlledByTarget?`), `keywords`, `duration` | "Target creature **loses flying** until end of turn" (Emerald Charm), "permanents your opponents control lose hexproof and indestructible until end of turn" (Shadowspear — a `filter`, what matches as it resolves, rule 611.2c), "creatures **target opponent** controls lose first strike" (Quick Draw — `controlledByTarget`, the filter read from that player's side). Layer 6 at its timestamp (rule 613.7): it takes away what had the keyword before — printed or granted earlier — and a grant after it gives it back. A static's "equipped creature … loses flying" is `loseKeywords` on the static (Starforged Sword), at the Equipment's timestamp (when it became attached, 613.7e). **"Can't have or gain"** beats every timestamp: `cantHave: true` here (Arcane Lighthouse, on what the filter reaches as it resolves), or `cantHaveKeywords` on a static (the Archetypes), which needs no `loseKeywords` beside it; a static grant waits it out and a resolving grant made meanwhile is never created (`grantableKeywords`). Losing or being unable to have hexproof takes "hexproof from" too (702.11e). Ward and protection aren't keywords here (ward is a trigger, protection its own static), so "loses ward"/"loses protection" is not yet. |
| `connive` | `target`, `amount?` | Connive (rule 701.50): the permanent's controller draws `amount` (1 by default; "connives X" is an amount), discards that many, then puts a +1/+1 counter on it for each nonland card discarded — by its own discards only, so two connives in one resolution don't count each other's. A permanent that has left is connived with by its last controller and gets no counter (701.50b). Ledger Shredder (`target: "source"`), Raffine, Scheming Seer, Spymaster's Vault. |
| `for-each-convoker` | `effect` | `effect` for each creature that convoked the resolving spell (rule 702.51c) — for a copy of it, the original's (rule 707.10: an effect of a copy that refers to objects used to pay its costs uses the original's) — bound to target 0 — Lethal Scheme's "each creature that convoked this spell connives" is `{ kind: "for-each-convoker", effect: { kind: "connive", target: 0 } }`. One at a time in the order the spell's controller chooses (a `choose-modes` naming each, asked while more than one is left — the ruling), each step done before the next is asked. One that has left the battlefield since — or is back as a new object — is only read, as it last existed: it still connives (its controller draws and discards) with no counter (rule 701.50b). The spell records its convokers as it's cast (`GameObject.convokedBy`), and a copy carries them (`SpellSnapshot.convokedBy`). The permanent a convoked spell becomes keeps them too (`enteredConvokedBy`), so its own abilities read "each creature that convoked it" (Zephyr Singer's enters trigger); `{ convokers: true }` is the amount, "the number of creatures that convoked it" (Knight-Errant of Eos; Ancient Imperiosaur's enters-with counters). "A spell that has convoke" is the filter `hasConvoke: true` (Kasla, the Broken Halo). |
| `add-counter` | `target`, `counter` (string), `amount`, `by?` | `by` (an `PlayerRef`) is who puts them when the card says someone else does — Alexios's "that player … puts a +1/+1 counter on it" is `by: "active-player"` — which a "whenever you put … counters" trigger reads; the effect's controller otherwise. `counter: "+1/+1"` etc. A **keyword counter** (rule 122.1b) is a counter named for the keyword, spelled as the engine's `Keyword` — `"flying"`, `"first-strike"`, `"double-strike"`, `"deathtouch"`, `"haste"`, `"hexproof"`, `"indestructible"`, `"lifelink"`, `"menace"`, `"reach"`, `"shadow"`, `"trample"`, `"vigilance"` — and the permanent has that keyword while the counter is on it (layer 6; `KEYWORD_COUNTERS` in `characteristics.ts` — Minas Morgul, Dark Fortress's shadow counter). Decayed and exalted counters aren't modeled. A **stun counter** (rule 122.1d) is `"stun"`: whenever a permanent with one would become untapped — in its untap step or by an effect — one is removed instead (`Game.untapUnlessStunned`; Pugnacious Hammerskull, Baloth Prime's entering six by an `enters-battlefield` replacement's `counters`). |
| `remove-counters` | `from?: CardFilter` \| `target?`, `counter` (a kind or `"any"`), `orKinds?`, `count: EffectAmount \| "any"`, `among?`, `perObject?`, `upTo?`, `inExile?` (`from` over the cards in exile, any owner's — Mari, the Killing Quill's "remove a hit counter from a card that player owns in exile", `from: { ownedByRef: "trigger-player" }`) | Counters the controller **chooses** to remove, as it resolves (the `remove-counters` decision): Mister Hyde's "remove a counter from a creature you control. If you do, draw a card" (`from: { type: "creature" }`, `counter: "any"`, then a `this-way` condition on `"counters-removed"`); Overseer of Vault 76's "you may remove three quest counters from among permanents you control" (`among`, `upTo`); Garnet's "a lore counter from each of any number of Sagas you control" (`count: "any"`, `perObject: 1`, the `thisWay: "counters-removed"` amount for "for each removed this way"); Gremlin Mine's "remove up to four charge counters from target noncreature artifact" (`target: 0`, `upTo`); Render Inert's "remove up to five counters from target permanent" (`counter: "any"`, `count: 5`, `upTo`); Hex Parasite's "up to X" (`count: "x"`, then a `modify-pt` by `thisWay: "counters-removed"`). "You may remove a counter" is `upTo` with `count: 1` (a "may" over more is a `may`: all or none). `from` reads from the controller's side ("you control" is implied) unless `anyController` (Eventide's Shadow's "from among permanents on the battlefield"); all from one permanent unless `among`. Fewer there than `count`: as many as there are. A token stack gives each token's, one at a time. A **player** target (a `permanent` slot's `orPlayer` — Price of Betrayal's "…, or opponent") gives up their own counters, energy included, asked kind by kind (`choose-modes`) and removed together; those aren't counted "this way". `activation-choices.test.ts`, `remove-any-counters.test.ts`. |
| `remove-counter` | `target`, `counter` (string, or `"any"`), `amount: EffectAmount \| "all"` | The reverse of `add-counter` — Unbreathing Horde's "prevent that damage and remove a +1/+1 counter from it" (the `then` of its `would-deal-damage` prevention, `target: "source"`). Removes up to `amount`, as many as there are, and none from a permanent with none (its ruling); announced as `counter-removed`, so "for as long as it has a counter" durations end with the last. Only a permanent still on the battlefield as the same object loses any (rule 122.2). `amount: "all"` is "remove all [kind] counters from it" (Blood Hound); with `counter: "any"`, "remove all counters from target permanent" — every kind (Vampire Hexmage, Blitz Leech, Enchanted River's Grasp). `"any"` with a number removes nothing: a kind the player picks is `remove-counters`. What came off is `{ thisWay: "counters-removed" }`. |
| `remove-counter-all` | `filter`, `counter` (string, or `"any"` with `"all"`), `amount: EffectAmount \| "all"` | The mass form: every permanent matching `filter`, read before any counter comes off — Oblivion Stone's "then remove all fate counters from all permanents" (`filter: {}`, `amount: "all"`), Aether Snap's "remove all counters from all permanents" (`counter: "any"`), Pestilent Haze's "remove two loyalty counters from each planeswalker", Heartmender's "remove a -1/-1 counter from each creature you control". A token stack loses them together, counted token by token "this way". |
| `move-counters` | `from`, `to`, `counter?`, `amount?`, `ifMoved?` | **Move** counters (rule 122.5): each removed from `from` (`counter-removed`) and put onto `to` (`counter-added`, by the effect's controller) — so a "whenever counters are put on" trigger, a "whenever you put" one and Doubling Season all see the put (the rulings). If either half can't happen, neither does: nothing moves between a permanent and itself (two instances of "target" may name one permanent, rule 115.3 — Nesting Grounds, Tidus), from one without that kind, or with either end gone; a `may` of one isn't offered then. `amount` 1 (default) is "move **a** counter": of `counter` (Costume Closet's `"+1/+1"`), or — no `counter` — of a kind the controller chooses among those on `from` as it resolves (a `choose-modes`, asked only with two or more kinds: Nesting Grounds, Tidus). `"all"`: every counter on `from` (The Ozolith). `"each-kind-missing"`: one of each kind `from` has and `to` hasn't (Goldberry's first ability). `"any"`: how many of each kind, kind by kind, none included (Resourceful Defense); `"one-or-more"` the same but not none (Goldberry's second, whose "if you do, draw a card" is `ifMoved`). With `"any"` one end may be `{ choose: filter, prompt }` — chosen as it resolves, one permanent at a time (a `choose-permanents`, none to stop), never the other end nor one chosen already; not a target: Forgotten Ancient's "onto other creatures" (`to`, with `counter`: at least one onto each one chosen), Slippery Bogbonder's "from among creatures you control" (`from`). Not "put its counters on" — that's `put-counters-of`. Graft is the `graft` row under "Tokens / attach / transform". `move-counters.test.ts`. |
| `put-counters-of` | `of` (an `AmountRef`), `target` | "Put its counters on target creature you control" (Essence Channeler, Broodguard Elite: `of: "source"` on its own dies or leaves trigger), "put those counters on The Ozolith" (`of: "trigger-object"`, `target: "source"`): the same number of each kind `of` had, read as it last existed (rule 608.2h), put onto `target` — **not** a move (rules 122.8, 122.9, every such card's ruling): nothing is removed, so The Ozolith and Iron Apprentice's own trigger both get the full set. Each kind goes on as `add-counter` puts it (a doubler applies; -1/-1 counters too). "If it had counters on it" is the trigger's `counters` filter (`{ compare: { op: "gte", n: 1 } }`), or `self-counters` on a self trigger; "this creature or another creature you control dies" is `thisOrAnother`, with the same `counters` filter as its self half (Host of the Hereafter, Reluctant Role Model) — the self half's trigger object is the source. `target: "created"` is each token an earlier step of the same resolution created — Ambitious Augmenter's "create a 0/0 Fractal token, then put this creature's counters on that token" (give the `create-token` `separate`, so a doubled token is two objects, each getting the set). |
| `earthbend` | `target`, `amount` | Earthbend N — "target land you control becomes a 0/0 creature with haste that's still a land. Put N +1/+1 counters on it. When it dies or is exiled, return it to the battlefield tapped." (Toph, the First Metalbender's end-step earthbend 2 is a `step-begins` trigger with a land-you-control target slot and `{ kind: "earthbend", target: 0, amount: 2 }`). Permanent, not until end of turn. The return is a delayed trigger keyed to the land leaving (see *Delayed triggered abilities*), so it survives the land losing its abilities, returns it under its owner's control, and only from the graveyard or exile it went to. |
| `add-counter-all` | `filter`, `counter`, `amount`, `exceptSource?`, `exceptTarget?` | the untargeted mass form (Loyal Guardian: "a +1/+1 counter on each creature you control"); `exceptTarget: 0` spares the object in that slot — "each **other** creature you control" after a targeted one (Moment of Glory). Routes through `add-counter` per permanent, so Doubling Season still composes. `exceptSource` is "each **other** creature you control" (Finneas, Ace Archer). `controlledByTarget: slot` reads `filter` from the side of the player in that slot, as `modify-pt-all`'s does: Requisition Raid's "each creature **target player** controls" is `{ type: "creature", controlledBy: "you" }` with slot 0 — that player an illegal target, none. `amount: "own-toughness"` is "a number of counters on each … equal to **that creature's** toughness" (Canopy Gargantuan): every one's toughness read before any counter goes on; `"own-power-over-base-power"` is "equal to the difference" between its power and base power (Sovereign Okinec Ahau, with the filter `power: { op: "gt", n: { own: "basePower" } }`). `putByTarget: true` with `controlledByTarget` is "target player **puts** a +1/+1 counter on each creature they control" (Shadrix Silverquill): that player is who puts them, for "whenever you put" (Exemplar of Light). |
| `populate` | — | Populate (rule 701.36a): choose a creature token you control and create a token copying it (Rootborn Defenses, Trostani, Selesnya's Voice). With two or more that differ (tokens alike in all but their timestamps are one choice), the controller picks on the board — a `choose-permanents` whose `then` is the copy; with one, nothing is asked. |
| `monstrosity` | `amount` | Monstrosity N (rule 701.37a): "if this permanent isn't monstrous, put N +1/+1 counters on it and it becomes monstrous" — always its own source, and only while that's the same permanent (400.7): one that left and came back, or is monstrous already, gets nothing and fires no `becomes-monstrous` trigger event (the rulings). `GameObject.monstrous` is a designation, not an ability: losing abilities keeps it, leaving the battlefield ends it. `amount: "x"` is "Monstrosity X" off `{X}` in the cost (Hydra Broodmaster), and the trigger's `{ triggerValue: true }` is that X (701.37c). |
| `harness` | — | Harness [this permanent] (rule 701.64a): "if this permanent isn't harnessed, it becomes harnessed" — always its own source, while it's the same permanent (400.7). `GameObject.harnessed` is a designation (701.64b): a copy isn't harnessed, leaving the battlefield ends it, and the `harnessed` filter clause reads it. "∞ — [ability]" (702.186b) is `infinity({ grantsTriggered \| grantsActivated \| …, text })`, a static on the card itself under that condition (The Soul Stone, The Mind Stone). |
| `renown` | `amount` | Renown N's effect (rule 702.112a): "if it isn't renowned, put N +1/+1 counters on it and it becomes renowned" — monstrosity's shape for the `renowned` designation: always its own source, while it's the same permanent; one already renowned (a second instance, 702.112c) gets nothing and fires no `becomes-renowned` trigger. Authored only through `renown(n)`. |
| `become-saddled` | `target` | "[It] becomes saddled until end of turn" (rule 702.171b): a saddle ability's own effect (`"source"` — the `saddle()` helper writes it), Guidelight Matrix's target Mount (a slot), Kolodin's entering Mount (`"trigger-object"`). Only a permanent can be; one saddled already becomes saddled again, firing `becomes-saddled` but not a first-time one. Saddled this way, nothing "saddled it" (702.171c). |
| `exert` | `target`, `asItAttacks?` | Exert a permanent (rule 701.43): it won't untap during its exerter's next untap step — the effect controller's, whoever controls it by then (a borrowed creature exerted still untaps in its owner's), and the mark is gone after that untap step whether it untapped or not. Tapped or untapped, again or not (701.43b); only on the battlefield (701.43c). You rarely write it: a creature's "you may exert this creature as it attacks" is the static `exertAsItAttacks` (§10), which asks and exerts with `asItAttacks`. |
| `amass` | `amount`, `creatureType`, `who?` | `who` (an `PlayerRef`) is who amasses, when that isn't the controller: Azog, Moria's Ruin's "its controller amasses" (`{ controllerOf: 0 }`). Amass N (rule 701.44). One effect rather than create-then-count, because "an Army you control" has to resolve to the **same** object each time — that's what makes repeated amassing grow one creature. A changeling is an Army creature too. With two or more Army creatures that differ, the controller chooses which (a `choose-permanents`, whose `then` is the amass again with the engine-only `onto` slot); counters go on one token of a stack. **"The amassed Army"** (the one chosen, counters or none — rule 701.47a) is the ref `"amassed"`, in a later step of the same resolution: `{ powerOf: "amassed" }` (Surrounded by Orcs), `damage-all`'s `from` (Widespread Brutality), `attach`'s `target` (Goblin Plate Mail), a `reflexive-trigger`'s `about` (Foray of Orcs; Grishnákh's target filter reads `{ amount: { powerOf: "trigger-object" } }` itself, as it goes on the stack and again as it resolves). `amassed-army.test.ts`. |
| `incubate` | `amount` | Incubate N (rule 701.53a): an Incubator token (`"Incubator Token"`, a double-faced token — "{2}: Transform this token." on the front, the 0/0 Phyrexian artifact creature `"Phyrexian Token"` on the back, rule 111.10i) that **enters with** N +1/+1 counters, so Doubling Season and its kind apply. Converter Beast. |
| `bolster` | `amount` | Bolster N (rule 701.39a — Dromoka's Gift, Anafenza, Kin-Tree Spirit): the controller chooses a creature they control with the least toughness, or tied for it, as this resolves — not a target, so hexproof and protection don't matter — and puts N +1/+1 counters on it. Asked (`choose-permanents`) only among tied creatures; a token stack's identical tokens are one choice, and only one token gets the counters. `amount` is an `EffectAmount`: "bolster X, where X is the number of differently named artifact tokens you control" (Sandsteppe War Riders) is `{ distinctTokenNames: { token: true, type: "artifact", controlledBy: "you" } }`. No creature, nothing. |
| `blight` | `amount`, `who?`, `then?` | Blight N (rule 701.68a): each player in `who` (default `"you"`) puts N -1/-1 counters on a creature **they** control, choosing it as this resolves (a `choose-permanents`, asked only with more than one; one at a time from the active player, rule 101.4) — High Perfect Morcant's "each opponent blights 1" is `who: "each-opponent"`. A player with no creature does nothing (701.68b). "You may blight 1. If you do, …" is a `may` of it with the rest as the may's `then` (Boggart Mischief, Scuzzback Scrounger): the may isn't offered at all without a creature (`mayBeDone`). **"The blighted creature"** (701.68c) is the blight's own `then`, applied right after the counters with that creature as target 0 and the blighting player its controller — Grub, Notorious Auntie's `then: { kind: "create-token-copy", of: 0, … }`; it shouldn't stop to ask anything. `who: { target: n }` is "**target opponent** blights 2" (Champion of the Weird, with `targets: ["opponent"]`). Not built: "whenever a player blights" (701.68d). |
| `behold` | `filter`, `text`, `count?`, `then?` | Behold (rule 701.4a — `BeholdSpec`) as an effect: the controller reveals a matching card from their hand or chooses a matching permanent they control, as this resolves (a `choose-from-zone` over both zones, asked only when there's a choice). "You may behold a Dragon. If you do, …" is a `may` of it with the rest as the may's `then` (Sarkhan, Dragon Ascendant; Elven Passage): the may isn't offered with nothing to behold (`mayBeDone`). The behold's own `then` reads the beheld object as target 0. |
| `grant-player-hexproof` | `who?`, `from?` | "You gain hexproof until end of turn" (Lazotep Plating). A *player* can't be targeted by opponents; permanents gaining hexproof is `grant-keyword-all`. Turn-scoped on `GameState.hexproofPlayers`. `from` (`colors`, `types`, `filter`) is "hexproof from [quality]" (Veil of Summer; `GameState.hexproofFromPlayers`). |
| `grant-spells-this-turn` | `castFrom?`, `filter?`, `next?`, `triggered?`, `cantBeCountered?`, `convoke?`, `improvise?`, `intoHandAsItResolves?` (Soulfire Grand Master's "put that card into your hand instead of into your graveyard as it resolves": no trigger; a spell's own exile text keeps it out, and another replacement of the move is a rule 616.1 choice), `entersWithCounters?`, `payLifeManaValue?` (Marshland Bloodcaster's "rather than pay the mana cost of the next spell … pay life equal to that spell's mana value", with `next`), `reduceGeneric?` (an amount fixed as it resolves — "the next spell you cast this turn costs {1} less", Hardened Berserker; Kaza's {X}), `affinityFor?` (a filter read as the spell is cast — "has affinity for artifacts", Don & Raph) | "As you cast spells from your hand this turn, they gain cascade" (Yidris, Maelstrom Wielder): the controller's spells cast for the rest of the turn — from `castFrom`, matching `filter` — have `triggered` (a `this-cast` cascade) as they're cast, whatever becomes of the source; each resolution adds another (its ruling). With `next`, only **the next** matching spell this turn, which uses it up as it becomes cast (rule 601.2i): "the next noncreature spell you cast this turn has cascade" (Dark Apostle), "… can't be countered" (`cantBeCountered` — Overmaster, Insist), "the next spell you cast this turn has convoke" (`convoke`, judged while it's cast — Wand of the Worldsoul), "… has improvise" (`improvise`, the same — Archway of Innovation), "that creature enters with an additional +1/+1 counter" (`entersWithCounters` — Savage Summoning, beside a `player-effect` `castAsThoughFlash` with `next` for its flash). "The next instant spell and the next sorcery spell … each have cascade" is two of them. A static that grants abilities to spells while it's on the battlefield is `grantsToSpells` (§10) instead. |
| `spell-cant-be-countered` | `target` | "**Target spell can't be countered**" (Vexing Shusher: `targets: ["spell"]`, `{ kind: "spell-cant-be-countered", target: 0 }`): the spell is marked for as long as it's on the stack (`GameObject.uncounterable`, Cavern of Souls' mark). A counterspell may still target it and does the rest of what it says (its ruling). Your own spells for a turn are `grant-spells-this-turn`'s `cantBeCountered`; a printed "this spell can't be countered" is the card's `cantBeCountered`. |
| `double-counters` | `target` | Deepglow Skate's "double the number of each kind of counter on" one permanent: another of each kind for each one there, put as `add-counter` puts them (Doubling Season applies). `target: "you"` doubles each kind of counter **you have**, energy included (Aetheric Amplifier). |
| `another-counter-of-each-kind` | `target`, `orRemove?` | "For each kind of counter on target permanent or player, give that permanent or player another counter of that kind" (Powerful Broker): proliferate's step on one thing, nothing chosen, put on as any effect's counters are so a Doubling Season applies; a player's energy counts. `orRemove`: "…put another counter of that kind on it or remove one from it" (Quarry Hauler), a `choose-modes` per kind as it resolves. |
| `double-counters-all` | `filter`, `counterKind` | Kalonian Hydra / Bristly Bill — doubles each matching permanent's own current count of that counter kind (routes through `add-counter`'s own logic, so Doubling Season's replacement still composes on top: 3x, not 4x) |
| `double-pt-all` | `filter`, `duration`, `powerOnly?`, `exceptSource?` | Unnatural Growth — doubles each matching permanent's own *current computed* power/toughness individually (a 2/2 and a 5/5 both matching become a 4/4 and a 10/10), unlike `modify-pt-all`'s single shared amount. `powerOnly` is "double the **power** of …" (+X/+0), `exceptSource` "each **other** creature you control" (God-Eternal Rhonas) |
| `proliferate` | `then?` | Proliferate (rule 701.27): a `proliferate` decision — the controller chooses any number of the permanents and players with counters, none included. |
| `double-x` | `target: "trigger-spell"` | "Double the value of X" (Unbound Flourishing, on a `cast-spell` trigger whose filter has `xInManaCost: true`): the X of the spell whose casting fired it, while it's still that spell on the stack (rule 400.7) — its mana value there counts the new X (202.3e), and its permanent keeps it for "enters with X counters" (107.3m). No more mana is paid; 0 stays 0. Two such triggers make it four times X. |
| `time-travel` | — | Time travel (rule 701.56a — Wibbly-wobbly, Timey-wimey): a `time-travel` decision — for each permanent its controller controls with a time counter and each suspended card they own with one, add one, remove one or neither, all at once (the rulings). Nothing eligible, nothing asked. A permanent's last coming off fires vanishing's sacrifice (`counters-removed`'s `last`); a suspended card's last coming off offers its owner the free play once the effect is done (rule 702.62a — off the stack, as at the upkeep). "Time travel three times" is a `sequence` of three, each asked after the one before. |
| `remove-time-counters-in-exile` | `amount`, `exceptExiledThisWay?` | "Remove a time counter from each other card you own in exile" (Alaundo the Seer). `give-suspend`'s `timeCast` is what its card gains: only "When the last time counter is removed from this card, if it's exiled, you may cast it without paying its mana cost. If you cast a creature spell this way, it gains haste until end of turn" (`cast-now`'s `gainsHaste`), no upkeep, not suspended unless it has suspend. `add-counter`, `remove-counter` and `remove-counter`'s `target` reach a suspended card in exile for `counter: "time"`: the filter `suspended` is "suspended card" (`{ kind: "card-in-exile", filter: { suspended: true } }`, in a `one-of` with a permanent for "target permanent or suspended card"); `remove-counter-all`'s and `add-counter-all`'s `andSuspended` is "and each suspended card" (Dust of Moments); `exile-spell-as-it-resolves`' `timeCounters` is Gandalf of the Secret Fire's. A spell exiling itself with time counters as it resolves is `give-suspend` with `target: "source"`, last in a `sequence` (Charnel Serenade). |
| `give-suspend` | `timeCounters` (an amount, or `"mana-value"`), `filter?`, `target?`, `onlyWithSuspend?` | "Put N time counters on it. If it doesn't have suspend, it gains suspend" (rule 702.62b). Without `target`: every card this resolution exiled that's still in exile and matches `filter` — after an `exile`, `exile-from-library`, `impulse-exile`, a `reveal-until` with `exile: true`, or a hand `look-and-choose` to exile (The Parting of the Ways, Suspend, Kang Prime, The Eleventh Doctor). With `target`: that card exiled first, from a library (Sibylline Soothsayer's card found, `reveal-until`'s `then` target 0) or the stack (Rory Williams' `"source"`, Taigam's `"trigger-object"` — via `exileSpell`); a spell countered in response is a new object and stays put. `"mana-value"` is each card's own; a card left with no time counter isn't suspended (stays exiled). `onlyWithSuspend`: only cards with suspend printed get them, none gains it (Ecstatic Beauty). |
| `become` | `target`, `power?`, `toughness?`, `addColors?` (colours **in addition** to its others, layer 5 — Phantasmal Form's "become blue Illusions in addition to their other colors and types", beside `setColors`, which replaces them; either alone sets **base power or base toughness alone**, layer 7b, rule 613.4b, the other left as it is — with `addTypes: []`, `addSubtypes: []` nothing becomes a creature: Island of Wak-Wak's "target creature with flying has base power 0 until end of turn" is `power: 0`, Chariot of the Sun's "gains flying and has base toughness 1" `toughness: 1` with `keywords: ["flying"]`, Riptide Mangler's "base power becomes equal to target creature's power (this effect lasts indefinitely)" `power: { powerOf: 0 }` with `duration: "permanent"`, Wall of Tombstones' "base toughness becomes equal to 1 plus the number of creature cards in your graveyard" `toughness: { sum: [1, { countInGraveyard: … }] }`; an amount is read once, rule 608.2h), `addTypes`, `setTypes?` ("becomes a [type]" with no "still a": the types replace its others and a subtype tied to a lost one goes, rule 205.1a — Sarkhan, the Dragonspeaker's +1 stops him being a planeswalker; supertypes stay), `addSubtypes`, `setSubtypes?`, `setColors?`, `loseAbilities?`, `keywords?`, `duration` | man-lands, Turn to Frog. `power`/`toughness` take a live amount, read once as the effect applies and fixed (rule 608.2h): Zur, Eternal Schemer's "base power and base toughness each equal to its mana value" is `{ manaValueOf: 0 }` each. |
| `become` | `filter`, `power`, `toughness`, `addTypes?`, `addSubtypes?`, `keywords?`, `duration`, `controlledByTarget?` | `controlledByTarget` reads `filter` from a target player's side (Mass Diminish). The mass form: every match becomes an N/N at once (Vihaan: "have Treasures you control become 3/3 Construct Assassin artifact creatures … until end of turn"). With no `addTypes` it only sets base P/T. Matches are fixed as it begins, and a token stack is animated whole. `power` / `toughness` may be live amounts, read once as it resolves — Mirror Entity's "{X}: … creatures you control have base power and toughness X/X and gain all creature types" is `"x"`, with `addSubtypes: [EVERY_CREATURE_TYPE]`. |
| `become` | `target: ObjectRef`, `addTypes?`, `addSubtypes?`, `setTypes?`, `removeTypes?`, `removeSubtypes?`, `setSubtypes?`, `addColors?`, `duration` | **`removeTypes`** is "isn't a creature until end of turn" (Blink's Alien Angel, Neurok Transmuter's "isn't an artifact"): those card types go with the subtypes that went only with them, its others stay, an attacker or blocker out of combat (506.4). **`removeSubtypes`** is "it isn't an Equipment" (Dancing Sword): those subtypes go, its types stay. **`addColors`** are colours in addition to its others (layer 5, rule 105.3 — Unctus, Grand Metatect's "becomes a blue artifact in addition to its other colors and types" is `{ addTypes: ["artifact"], addColors: ["U"], duration: "end-of-turn" }`; the scaffolder reads it). **`setTypes` / `setSubtypes`** are "becomes a [type]" with no "in addition" (rule 205.1a): `setSubtypes: ["Coward"]` replaces its creature types (Boldwyr Intimidator, Ursine Champion's "becomes a Bear Berserker"), `setTypes: ["enchantment"]` its card types (Opal Acrolith's "becomes an enchantment" — no longer a creature, its creature types gone with it), each applied before the adds and with a timestamp of its own; P/T, colours and abilities stay. "Becomes the creature type of your choice" is a `choose-creature-type` (with `exclude: ["Wall"]` for "other than Wall") whose `then` is this with `setSubtypes: [CHOSEN_CREATURE_TYPE]` (the Mistforms, Imagecrafter). `set-types-effect.test.ts`. Otherwise "it becomes a Demon **in addition to its other types**" (Clavileño, First of the Blessed; Jenova, Ancient Calamity's "that creature becomes a Mutant"): layer 4 only — P/T, colours and abilities are untouched, unlike `become` — until end of turn or for as long as it stays on the battlefield. A lord of the new type reaches it. After a `put-onto-battlefield` in the same `sequence`, the same slot reaches the returned permanent ("…return it to the battlefield. It's a Zombie in addition to its other types"). |

### Tokens / attach / transform

| kind | fields |
| --- | --- |
| `create-token` | `token` (a registry name), `count`, `who?: "target-controller" \| PlayerScope` (Beast Within — under `targets[0]`'s controller; a scope has each of its players create `count` — "each opponent creates a Treasure token"), `tapped?` (Army of the Damned — "create thirteen **tapped** … tokens"; a tapped batch is never folded into a token stack, since a stack carries one `tapped` flag for all of it) `gainUntilEndOfTurn?: Keyword[]` is "they gain haste until end of turn" (Ovika, Enigma Goliath): the keywords go on the tokens this makes as they're made, never on ones already there, and such a batch only folds into a token stack made the same way. `gainKeywords?: Keyword[]` is the same with no end — "they gain haste" (Chandra, Acolyte of Flame): gained, not printed, so not a copiable value (rule 707.2) — a copy of one of those tokens doesn't have it; use the plain token, never one that prints the keyword. `goadedForGame?: true` is "the tokens are goaded for the rest of the game" (Rendmaw, Creaking Nest), by the effect's controller — a token of their own included — made that way, as `gainUntilEndOfTurn` is. `basePt?: { power, toughness }` is "create an **X/X** token" (Rootha, Mastering the Moment): the token's base P/T, set as it's made, as part of what it is (rule 111.3) — a copiable value, so a copy of the token (populate, a Clone) is X/X too (707.2) — so counters and anthems go on top and a later "becomes 1/1" replaces it. The token definition prints 0/0. `thenCounters?: { kind, amount }` is "create a token, **then put N counters on it**" (Zaxara, the Exemplary's 0/0 Hydra with `{ kind: "+1/+1", amount: "x" }`): the effect's controller puts them on each token this made once it has entered — counters put on, not ones it entered with — before state-based actions see a 0/0; such tokens are always made as separate objects, so a stack of the same token already there never absorbs them and their counters. `exileAtEndStep?: true` is "exile that token at the beginning of the next end step" (Manaform Hellkite) — exiled, not sacrificed, so nothing sees it die (`sacrificeAtEndStep?` is the sacrificed kind). `separate?: true` makes them so without counters — for an effect that goes on to tell the tokens it made from older ones (Martial Coup's "destroy all **other** creatures" is a `destroy-all` with `notThisWay: "created"`, which a stack the new Soldiers joined would dodge whole). `attacksThisCombat?: true` is "that token gains haste until end of turn and **attacks this combat if able**" (Legion Warboss, with `gainUntilEndOfTurn: ["haste"]`): a requirement on the tokens made (rule 508.1d), part of making them, that ends with this combat (rule 500.5a) — a later combat that turn doesn't bind them. `attacking?: EnterAttacking` is "…tokens **that are tapped and attacking**" (rule 508.4 — Hero-style, with `tapped: true`): `"choose"` lets their controller choose a defending player or a planeswalker one controls for each, asked (the `enter-attacking` decision) only where there's more than one; `{ player: "that-player" \| "trigger-player" \| …, orTheirPlaneswalker? }` is "attacking **that player** (or a planeswalker they control)" (Soaring Lightbringer; Adeline, inside a `for-each-player`). Only a creature under the attacking player, during combat, attacks at all (506.3); it never "attacked", so no attack trigger fires (508.3a). A token **named** after a real card (Murmuration's "a 1/2 blue Bird … named Storm Crow") is defined under a `" Token"` registry key with `tokenName: "Storm Crow"` on its definition: it's made with that name as a copiable value (rule 111.3), so `nameOf`, the legend rule and every "named …" / "same name" check read the real name. A named token whose name collides with nothing (Karox Bladewing) just uses its name as the key. `attachedTo?: ObjectRef` is "create a Monster Role token **attached to target creature**" (rule 303.7 — the Roles; a slot, `"source"` — "attached to it" — or `"trigger-object"`): each token is created attached to that permanent as it enters, as its own object. Enchanting isn't targeting, so hexproof doesn't stop it, but a permanent the token's enchant ability doesn't allow, protection from it, nothing there, or a target found illegal (608.2b) and **none is created** (the Role rulings). The seven Roles are `Cursed`, `Monster`, `Royal`, `Sorcerer`, `Virtuous`, `Wicked` and `Young Hero Role Token` (rules 111.10j–r); of one player's Roles on one permanent only the newest stays, a state-based action (704.5z). The scaffolder reads the Role sentence. |
| `conjure` | `name`, `to: "hand" \| "library" \| "battlefield"`, `count?`, `attachedTo?` — **MTG Arena's conjure** (digital-only; the Comprehensive Rules have no such action — the user's call, 2026-11-12): a new card, not a token, owned by the effect's controller, put there as any card is (the battlefield: its enters triggers; `attachedTo` an Aura's host). "Conjure … into your library, then shuffle" is this then `shuffle-library`. Mystery Booster Commander's conjure cards. Arena's "perpetually" is `grant-keyword`'s `perpetually: true` (`duration: "permanent"`): the change stays with the card through every zone change. "This ability triggers only once" (ever, for the object) is a triggered ability's `triggersOnlyOnce`. |
| `create-token-copy` | `of: "source" \| "trigger-object" \| "equipped" \| "enchanted" \| <ObjectSetRef> \| slot \| { each } \| { eachExiled }` (a card set — any `ObjectSetRef` but `"trigger-batch"`, `{ attachmentsOf: "source" }`, `{ targets }` and `{ thisWay: "destroyed" \| "died" \| "sacrificed" }`, whose members are permanents: "for each artifact destroyed this way, create a token that's a copy of it" copies each as it last existed on the battlefield, rule 608.2h, a destroyed token or copy included, under its last controller unless `who: "you"` — Red Sun's Twilight — and `{ eachExiled }` are copies of **cards**, as printed — `asCard` — under the effect's controller, and a copy of an instant or sorcery card is no token, rule 111.5: `"exiled-with-source"` is each card linked to this source, an "until this leaves" exile's too, rules 607.2a, 610.3, with `chooseOne` "a card exiled with this", asked if there are several — Mimic Vat, The Cloning of Shredder, Mardu Siegebreaker; `{ paid: "exiled" }` what paying `exileFromGraveyard` exiled — Dollhouse of Horrors; `{ thisWay: "exiled" }` what this resolution exiled — Foggy Swamp Visions; `{ eachExiled: filter }` each face-up card in exile matching — Altaïr Ibn-La'Ahad; `"enchanted"`, as `"equipped"`, the host — Followed Footsteps), `count` (an `EffectAmount` — Rionya, Fire Dancer's X), `sacrificeAtEndOfCombat?` (Phantom Steed's "sacrifice that token at end of combat"), `atYourNextEndStep?` (with `exileAtEndStep`/`sacrificeAtEndStep`: your own next end step — Foggy Swamp Visions), `exceptions.static?` (Dollhouse of Horrors's "and it has 'This token gets +1/+1 for each Construct you control'"), `gainsHaste?`, `gains?: { keywords?, triggered? }` (what the copies *gain* — Jaxis, the Troublemaker's "it gains haste and 'when this token dies, draw a card'": a non-copiable modifier, so a copy of the token doesn't get it, unlike a copy exception), `exileAtEndStep?`, `notLegendary?`, `basePt?: [p, t]` (each an `EffectAmount`: Saw in Half's "except their power is half that creature's power" is `[{ half: { powerOf: 0 }, round: "up" }, { half: { toughnessOf: 0 }, round: "up" }]`, read as the creature last existed and never clamped at 0, rule 107.1b), `who?: "you"` — a token that's a copy of a permanent, under *its* controller by default; `who: "you"` puts it under the effect's controller instead, which is what a card copying something an **opponent** controls means (Hate Mirage). `"trigger-object"` = the permanent whose entering/attacking fired the trigger (Miirym); `"trigger-batch"` = "for each of them": `count` copies of each permanent of the entry a `batched` enters trigger fired on, a compacted stack as each of its tokens (Kambal, Profiteering Mayor); `{ each: filter }` = a copy of each permanent matching it as this resolves, a stack as each of its tokens (Redoubled Stormsinger's "for each creature token you control that entered this turn, create a tapped and attacking token that's a copy of that token" — `enteredThisTurn` holds per token, since tokens made on different turns never share a stack); a slot = a target (Saw in Half); `"equipped"` = "a copy of equipped creature" — the creature the source equips as this resolves (none, so no token, once it has left), or, the source gone, the one it last equipped, as it last existed if that's gone too (Helm of the Host's rulings). `gainsHaste` is the copy exception "except it has haste" (Kiki-Jiki), which lasts; `gainUntilEndOfTurn?: Keyword[]` is "it gains haste until end of turn" (Mishra, Eminent One). `exceptions?: { name?, setTypes?, setSubtypes?, addTypes?, addSubtypes?, setColors?, addColors?, basePt?, noManaCost?, keywords?, activated?, triggered?, notLegendary?, addSupertypes?, legendRuleOff? }` is the rest of "a copy of it, **except** …" (rule 707.9b) — the same `CopyExceptions` a `copyOnEnter` takes (§3): Anikthea, Hand of Erebos's "except it's a 3/3 black Zombie creature in addition to its other types" is `{ basePt: [3, 3], setColors: ["B"], addTypes: ["creature"], addSubtypes: ["Zombie"] }`; Mishra, Eminent One's "except its name is Mishra's Warform" is `name`. `noManaCost` is eternalize's and embalm's "with no mana cost": mana value 0. `loyalty: 1` is "and its starting loyalty is 1" (Jace, Mirror Mage): the copy, and anything entering as a copy of it, enters with that many loyalty counters in place of the printed loyalty (rule 306.5b). `setTypes` is "it's an enchantment and loses all other card types" (Myrkul, Lord of Bones), taking the subtypes that went only with the lost types (rule 205.1a — no Bear, no Food, no Forest; `subtypeFitsTypes`). `activated` is "and it has '{2}, {T}, Sacrifice this token: You gain 3 life.'" (Brenard): the copy has those activated abilities — offered, activated and paid for with like its own, a mana ability included — and loses them to a later "loses all abilities" (rule 613.7); keep their `resolve: null`, since they live in the game state. `triggered` is the same for triggered abilities (Phantasmal Image's "and it has 'When this creature becomes the target of a spell or ability, sacrifice it'"). `notLegendary` is "and it isn't legendary" (Spark Double), `addSupertypes` "it's legendary in addition to its other types" (Sakashima the Impostor) — both read through `supertypesOf`. `legendRuleOff: AffectSpec` is a copy that has "the 'legend rule' doesn't apply to …" (Sakashima of a Thousand Faces' "it has Sakashima's other abilities"), scoped from the copy's side as §10's static is. The exceptions are the copy's **copiable values**: a `copiable` modifier under every other effect (a later Turn to Frog replaces the P/T and takes the keywords), and anything that copies the copy — a token copy, a Clone — copies them too, a newer copy's own winning where they differ. `gainsHaste`, `basePt` and `notLegendary` are copy exceptions too, and carry the same way. A new name is what the legend rule and `name` filters read (`nameOf`); the registry is still keyed by the copied card. A copy of something that has since left the zone the effect refers to it in — "a copy of that creature" of one that died (Ratadrabik of Urborg), its `trigger-object`, source or a target that was a permanent — copies it **as it last existed there** (rule 608.2h): a Clone that died as a copy of a legend gives a copy of that legend, and a token that ceased to exist is still copied, exceptions and all. A card targeted where it is now (Anikthea's exiled card) is read as it is. `tapped?`, `attacking?` (as `create-token`'s) and `exileAtEndOfCombat?` make "a token copy that's tapped and attacking … exile the tokens at end of combat" — a real delayed trigger at the `"end-of-combat"` timing (myriad; use `myriad()`). `asCard: true` copies **the card as it is now** instead of as it last existed: Myrkul's "a copy of that card" — the card it just exiled — is a copy of Bloodline Keeper however transformed the creature died, where Brenard's "a copy of that creature" is a Lord of Lineage. A token copy makes its own "as this enters" choices, each token for itself, before any of one instruction's tokens enter (§15). Handed to someone else: `who: { target: 0 }` is Wedding Ring's "target opponent creates a token that's a copy of it"; `who: "that-player"` inside a `for-each-player` with `simultaneous: true` is Life of the Party's "each opponent creates …" (with `goadedForGame`, "the tokens are goaded for the rest of the game", by the effect's controller) and Fractured Identity's. What a later sentence does to the token made — no "except", so not a copy exception — is a next step over `{ thisWay: "created" }`: Ultron, Artificial Malevolence's "if the token isn't a creature, it becomes a 2/2 Robot Villain creature in addition to its other types" is `become` with `filter: { thisWay: "created", notTypes: ["creature"] }`, `duration: "permanent"` (the scaffolder reads it after "You may pay {N}. If you do, create a token that's a copy of …"). `withCounters: { kind, amount }` is counters the copies **enter with**, beside their own (rule 122.6), the amount read as they're made: Littjara Mirrorlake's "except it enters with an additional +1/+1 counter on it", Ochre Jelly's "the token enters with half that many +1/+1 counters on it, rounded down" (`{ half: { countersOn: "source", counter: "+1/+1" }, round: "down" }`, in the delayed ability its dies trigger sets up). An additional effect, not a copiable value (707.9e): a copy of the token gets none. `thenCounters` is the other thing, counters put on once they're there. `token-copy-enters-with-counters.test.ts`. |
| `become-copy` | `target?` \| `filter?` + `exceptOf?`, `of`, `ofCard?`, `until?: "end-of-turn" \| "next-end-step" \| "your-next-turn" \| "while-source" \| "while-source-attached" \| { whileTapped }`, `exceptions?` | Its `until` may be a condition, nothing at all if it couldn't begin (rule 611.2b): `"while-source"` is Secret Invasion's "until this Aura leaves the battlefield", `"while-source-attached"` Blade of Shared Souls's "for as long as this Equipment remains attached to it", `{ whileTapped: 0 }` Zygon Infiltrator's "for as long as that creature remains tapped". `of: "sacrificed"` is The Ever-Changing 'Dane's. `ofCard: "when-a-card"` is for a slot holding a permanent or a card (Taskmaster, Mercenary Mimic); with `ofCard` a card gone from its slot does nothing (The Animus's ruling). "Choose a creature on the battlefield. Target creature becomes a copy of it" is this inside `choose-permanents`' `then` with `keepTargets`: `of: 0`, `target: 1` (Cytoshape; Polymorphous Rush's `for-each-target { from: 1 }`). An existing permanent **becomes** a copy of an object (rules 707.2, 707.4, layer 1) — Sarkhan, Soul Aflame's "you may have Sarkhan become a copy of it until end of turn, except its name is Sarkhan, Soul Aflame and it's legendary in addition to its other types" is `{ target: "source", of: "trigger-object", until: "end-of-turn", exceptions: { name: "Sarkhan, Soul Aflame", addSupertypes: ["legendary"] } }` inside a `may`. **Which:** `target` (a slot, `"source"`, `"trigger-object"`) — it must still be the same object (rule 400.7) — or every permanent `filter` matches as it applies, from the effect controller's side: Mirrorform's "each nonland permanent you control" `{ notTypes: ["land"], controlledBy: "you" }`, Niko, Light of Hope's "Shards you control"; `exceptOf` leaves out `of` itself ("each **other** creature" — Nanogene Conversion, Loki, Lord of Misrule, Brudiclad's "each other token" after a `choose-permanents`). All change at once, each copying `of` as it was before any did. **Of what:** `of` is read as it is now — what it copies, if it's a copy, with that copy's exceptions (707.9b) — or as it last existed if it has left the battlefield (608.2h: Niko's exiled creature). A **card** (a graveyard or exile target — Likeness Looter's "target creature card in your graveyard with mana value X", Shifting Woodland) has only its printed values, front face up (712.8a). `ofCard: true` says `of` is "that card" even where it was a permanent or is one again (Lazav, Dimir Mastermind's trigger object: never what the permanent copied, and as it last existed in that graveyard). It copies no counters, tapped state or other effects; the permanent keeps its own, and its attachments, and nothing enters, so no "enters" or "as this enters" ability of what it copies applies (707.4). **For how long:** absent `until`, as long as it's that object (rule 611.2a — Thespian's Stage, Irma, Mirrorform: the ruling "lasts indefinitely"); `"end-of-turn"` ends in the cleanup step (514.2); `"next-end-step"` as the next end step begins (Niko); `"your-next-turn"` as the effect controller's next turn begins (800.4m if they've left). Copy effects stack by timestamp (613.7a): a temporary one over another is undone back to the one under it as it ends (`GameObject.temporaryCopies` / `copyBase`), and a lasting one made later replaces them all — Mirage Mirror copying Thespian's Stage and using its ability stays the land. `exceptions` are a `CopyExceptions` (the `create-token-copy` row); **`thisAbility: { card, activated?: i \| triggered?: i }`** is "except it has **this ability**" — the card's own ability at that index, named by the card since the permanent by then copies something else (Thespian's Stage `{ card: "Thespian's Stage", activated: 1 }`, Court of Vantress, Irma, Sunfrill Imitator, Likeness Looter, Lazav): a copiable value (707.9a), so a copy of the copy has it too. Usable in any `CopyExceptions`. |
| melee | `melee()` from `helpers.ts` — rule 702.121, "Whenever this creature attacks, it gets +1/+1 until end of turn for each opponent you attacked with a creature this combat", as the attack trigger it is, reading the `{ opponentsAttacked: true }` amount (a planeswalker attacked isn't its controller). |
| demonstrate | `demonstrate()` from `helpers.ts` — rule 702.144a, "When you cast this spell, you may copy it and you may choose new targets for the copy. If you copy the spell, choose an opponent. That player copies the spell and may choose new targets for that copy": a `this-cast` trigger, a `may` over your `copy-spell` of `"trigger-spell"` then a `choose-opponent` whose `copy-spell` has `controller: "that-player"`. Their copy goes on top and resolves first; declined, nobody copies; a spell countered in response is still copied, as it last was on the stack (as storm's are). Put the reminder text in `text` (Transforming Flourish, the Strixhaven Techniques). |
| annihilator | `annihilator(n)` from `helpers.ts` — rule 702.86, "Whenever this creature attacks, defending player sacrifices N permanents", as the attack trigger it is (a `sacrifice` of `"trigger-player"`, who is the player attacked or the attacked planeswalker's controller). Put it in `triggered` or grant it with `grantsTriggered`, and the printed line in `text`. `annihilator(amount, text)` is annihilator X: Ulamog, the Defiler's "where X is the number of +1/+1 counters on it" is `{ countersOn: "source", counter: "+1/+1" }`, read as the trigger resolves. |
| crew | `crew(n, text?)` and `crewText(n)` from `helpers.ts` — rule 702.122a, "Tap any number of other untapped creatures you control with total power N or greater: this becomes an artifact creature until end of turn": a `tapOthers.totalPower` cost (summoning-sick creatures may pay, never the Vehicle itself) and an `become` of the source. A Vehicle is an `artifact` with subtype `Vehicle` and its printed `power`/`toughness`, which it has once it's a creature (rule 301.7). Grant it with `grantsActivated` (Kotori, Pilot Prodigy's "Vehicles you control have crew 2"). `crewText(n)` is the line with its reminder; Smuggler's Copter, Cultivator's Caravan. The ability carries `crew: true` (spell it out on a hand-written crew ability) — what marks the cost as crew's for a creature that "crews Vehicles as though its power were 2 greater" or "using its toughness rather than its power" (§10's `crewsAs`; the Pilot tokens are `"Pilot Token"` and `"Pilot Token (Crews Vehicles)"`). "Whenever this Vehicle becomes crewed" isn't built. |
| saddle | `saddle(n, text?)` and `saddleText(n)` from `helpers.ts` — rule 702.171a, "Tap any number of other untapped creatures you control with total power N or greater: This permanent becomes saddled until end of turn. Activate only as a sorcery": crew's `tapOthers.totalPower` cost (summoning-sick creatures may pay, never the Mount itself), `sorcerySpeed`, a `become-saddled` of the source, and `saddle: true`, which records each creature tapped for it as having saddled the Mount this turn (702.171c — `GameObject.saddledThisTurn`, kept on the creature, so it outlives the Mount; cleared when the creature changes zones and at cleanup). Saddled is a designation (`GameObject.saddled`, 702.171b): until the cleanup step or the Mount leaves, not copiable, and it may be activated again while saddled. "Whenever this creature attacks while saddled" is `...ATTACKS_WHILE_SADDLED` (an `attacks` trigger whose `whileCondition` is `{ kind: "source", filter: { saddled: true } }` — saddled as it's declared an attacker, not an intervening "if"); "if this creature is (isn't) saddled" a `conditional` on that `source` condition, read as it last was once it has left (Caustic Bronco). "A creature that saddled it this turn" is the filter clause `saddledSource: true` (Giant Beaver's target, The Gitrog's sacrifice, Rambling Possum's and Calamity's choice). "Whenever this creature becomes saddled [for the first time each turn]" is the `becomes-saddled` trigger. `saddleText(n)` is the line with its reminder; Venomsac Lagac, Calamity, Galloping Inferno. "Saddles Mounts … as though its power were 2 greater" / "using its toughness" is §10's `crewsAs` with `saddles: true`. |
| enlist | `enlist(text?)` and `ENLIST_TEXT` from `helpers.ts` — rule 702.154a: the static `enlist: true` (§10), an optional cost to attack asked as the attack is declared, whose +X/+0 the engine adds itself. Put it in `static`; no `keywords` entry. Coalition Warbrute, Guardian of New Benalia, Aradesh, the Founder. |
| graft | Spelled out, both parts with `text: "Graft N"` (no helper, no `keywords` entry — modular's way): rule 702.58a, an `enters-battlefield` replacement's `counters: { kind: "+1/+1", amount: N }`, and an `enters-battlefield` trigger, `who: "any"`, `filter: { type: "creature" }`, `otherOnly`, its intervening if `condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } }`, the effect a `may` of `{ kind: "move-counters", from: "source", to: "trigger-object", counter: "+1/+1" }`. Llanowar Reborn, Plaxcaster Frogling; the scaffolder writes it. |
| forecast | `forecast(ability)` from `helpers.ts` — rule 702.57, "Forecast — [cost], Reveal this card from your hand: [effect]": pass the ability as it would be written on a permanent (cost without the reveal, targets, effect, the printed line with its reminder as `text`) and spread the result into `activated`. It becomes an ability of the card in its owner's hand (`zone: "hand"`, `staysInZone` — not discarded, revealed as it's activated, 702.57b), `oncePerTurn`, with the condition `your-turn` and `turn-structure` `steps: ["upkeep"]`. The once-each-turn record of a card in a hand is cleared as each turn begins. The card is still cast normally from the same hand. The scaffolder reads the line whole. Skyscribing, Pride of the Clouds, Sky Hussar; `forecast.test.ts`. |
| ninjutsu | `ninjutsu(cost, text?)` and `ninjutsuText(cost)` from `helpers.ts` — rule 702.49a, "[Cost], Reveal this card from your hand, Return an unblocked attacking creature you control to its owner's hand: Put this card onto the battlefield from your hand tapped and attacking": an ability of the card in the hand (`zone: "hand"`, `staysInZone` — it isn't discarded, and is revealed as it's activated, 702.49b; `ninjutsu: true` names it), at instant speed, whose `returnToHand` cost takes an `unblocked` creature you control, chosen as the cost is paid. Its `ninjutsu` effect puts the card onto the battlefield tapped and attacking what the returned creature was attacking (702.49c — recorded on the ability as the cost is paid, `LastKnownRefs.returnedAttacking`), unblocked (508.4d); not attacking at all if that player or planeswalker is gone (508.4a), and nothing if the card left the hand in response (400.7). An "as this enters" choice is still asked (Sakashima's Student enters as a copy, attacking). `commanderNinjutsu(cost)` (rule 702.49d) is two entries, hand and command zone — spread it into `activated`; no commander tax, as nothing is cast. Ninja of the Deep Hours, Yuriko, the Tiger's Shadow; `ninjutsu.test.ts`. Not built: a static granting ninjutsu to cards in a hand (Satoru Umezawa) and "whenever you activate a ninjutsu ability". |
| morph, megamorph, disguise | `morph: { keyword: "morph" \| "megamorph" \| "disguise", cost }` on the card (rules 702.37, 702.168): the hand card is also offered face down (`cast-spell` with `via: "face-down"`) — a 2/2 creature spell with no name, text, subtypes or mana cost for {3}, an alternative cost, at sorcery speed whatever the card is (708.4); it stays face down on the stack (only its controller sees what it is — `GameObject.faceDown`, kind `"morph"` or `"disguise"`) and resolves into a face-down permanent, a disguised one with ward {2}. It's turned face up only for `cost` (the `turn-face-up` special action with `morph: true`), megamorph with a +1/+1 counter as it is (702.37b); a face-down spell leaving the stack any other way is revealed (708.9). "As this is turned face up, put N +1/+1 counters on it" is `asTurnedFaceUp: { counters: N }` (Hooded Hydra), however it's turned; anything else it says happens then is `asTurnedFaceUp: { effect }`, done before any state-based action is checked — "As this Aura is turned face up, you may attach it to a creature" (Gift of Doom) is `{ kind: "attach", attachment: "source", target: { among: { type: "creature" }, prompt, optional: true } }`, the host chosen and not targeted, the Aura put into the graveyard if it's left unattached (704.5m). "When this is turned face up" is `{ on: "turned-face-up", who: "self" }` (Den Protector, Rattleclaw Mystic); "whenever a permanent you control is turned face up" is `who: "you-control"`, its trigger object the permanent — "if it's a creature" is a trigger `filter` plus a `conditional` on the trigger object (603.4; Trail of Mystery). "A face-down creature" is the filter's `faceDown: true` (read from a snapshot too: Kadena's "the first face-down creature spell you cast each turn"). A morph cost that isn't mana is `morph.also` beside an empty `cost` (`MorphCost`): `{ payLife: 5 }` (Zombie Cutthroat), `{ sacrifice: { filter, count } }` (Skirk Volcanist's two Mountains; "another creature" is `{ type: "creature" }`, the permanent itself never pays), `{ discard: { count, filter? } }` (Putrid Raptor's Zombie card), `{ returnToHand: { count, filter } }` (Raven Guild Initiate's Bird) — one choice at most — with `text` the printed cost the offer shows; paid as it's turned face up, chosen while it's still face down. `{ reveal: { count, filter, text } }` is "Morph—Reveal a white card in your hand" (Watcher of the Roost: `filter: { colors: ["W"] }`, `text: "white card"`), the card staying there. An `{X}` in `cost` (Bane of the Living, Warbreak Trumpeter's `{X}{X}{R}`) is announced as it's turned up, its trigger reading it as `{ triggerValue: true }` (702.37f, 702.168e), 0 turned up any other way. `morph.costReduction` is "This cost is reduced by {1} for each …" (Fugitive Codebreaker, a `EffectAmount`), generic mana only. The static's `morphCostIncrease: N` is "All morph costs cost {N} more" (Exiled Doomsayer): morph and megamorph, never disguise. `morph.test.ts`, `morph-nonmana-cost.test.ts`, `morph-cost-kinds.test.ts`. |
| Room | Three files, as a split card's are (Expansion // Explosion): each door its own definition — `types: ["enchantment"]`, `subtypes: ["Room"]`, `split: true`, `faces: [whole, left, right]`, its text ending in `ROOM_REMINDER` — and the whole card `roomCard(name, left, right)` from `helpers.ts`, which combines their costs, colours, text and abilities (rule 709.4; the left door's abilities first). Rule 709.5: the door cast enters unlocked, any other entry leaves both locked (`GameObject.doors`); a locked door's name, cost and text aren't the permanent's (one door unlocked reads as that half, neither as the internal `LOCKED_ROOM`); unlocking a door is a special action at sorcery speed for its mana cost (the `unlock-door` action). "When you unlock this door" is `unlockThisDoor("left" | "right")` — the door that prints it — and triggers as it enters too (709.5h); "whenever you fully unlock a Room" is `{ on: "door-unlocked", who: "you-control", fully: true }` (709.5i). The `unlock-door` effect unlocks a locked door of a Room you control, or with `target` of that Room, `orLock` for "lock or unlock" (Marina Vendrell) — asking which door as it resolves when there's a choice. "Unlock costs you pay cost {1} less" is `abilityCostModification: { applies: {}, reduceGeneric: 1, unlock: true }` (Inquisitive Glimmer). Eerie's "whenever an enchantment you control enters **and whenever** you fully unlock a Room" is two triggered entries, the second `sameAbilityAs: <the first's index>` so a "this ability has resolved this turn" counts them as one (Victor, Valgavoth's Seneschal). Bottomless Pool // Locker Room, Unholy Annex // Ritual Chamber; `rooms.test.ts`. |
| Class | `types: ["enchantment"]`, `subtypes: ["Class"]`, its text beginning with `CLASS_REMINDER` and printing each level bar (`{2}{W}: Level 2`) where the card does. Rule 716: each bar is `classLevel(n, cost)` from `helpers.ts` in `activated` — a sorcery-speed ability offered only at level n−1 (716.2a; its `gain-class-level` effect), so levels go up one at a time. A Class with no level is level 1 (716.2d); the level is gone when it leaves the battlefield (716.2b — `GameObject.classLevel`, kept in its last-known information). Wrap any ability a level adds in `atLevel(n, ability)` — static, triggered, activated or replacement — which gates it through its `condition` (`{ kind: "class-level", atLeast: n }`, joined to a condition it already has); level 1's abilities are written plainly. "When this Class becomes level N" is `{ on: "class-level-gained", who: "self", level: N }`, printed under level N's bar and wrapped in `atLevel(N, …)` like the rest. A gains-life trigger's `firstTimeEachTurn: true` reads "whenever you gain life for the first time each turn" (Gourmand's Talent). Paladin Class, Wizard Class, Artist's Talent; `classes.test.ts`. |
| afflict | `afflict(n)` from `helpers.ts` — rule 702.130a, "Whenever this creature becomes blocked, defending player loses N life": a `becomes-blocked` trigger (once however many block) with a `lose-life` of `"trigger-player"`, the player who blocked. Put it in `triggered` or grant it with `grantsTriggered` (Cyberman Patrol's "artifact creatures you control have afflict 3"), and the printed line in `text`. |
| transmute | `transmute(cost, manaValue, text)` from `helpers.ts` — rule 702.53a, "[cost], Discard this card: search your library for a card with the same mana value, reveal it, put it into your hand, then shuffle; only as a sorcery": a hand activated ability (`zone: "hand"`, the discard being the cost) with `sorcerySpeed`. `manaValue` is the card's own printed one (Tolaria West's is 0). `text` is the printed line, reminder included (Muddle the Mixture). |
| extort | `extort()` from `helpers.ts` — rule 702.101a, "Whenever you cast a spell, you may pay {W/B}. If you do, each opponent loses 1 life and you gain that much life", as the cast trigger it is (Sorin of House Markov). "That much" is one per opponent. Each instance triggers on its own. |
| myriad | `myriad()` in `triggered` (or a static's `grantsTriggered` — Legion Loyalty, Blade of Selves) — rule 702.116a: for each opponent other than the defending player, "you may" (asked per opponent, naming them) create a tapped, attacking token copy, exiled at end of combat. |
| mobilize | `mobilize(n)` in `triggered` — rule 702.181a: `n` (an `EffectAmount`: Avenger of the Fallen's `{ countInGraveyard: … }`, Infantry Shield's granted `{ powerOf: "source" }`) 1/1 red Warriors (`Red Warrior Token`), tapped and attacking, sacrificed at the next end step. |
| offspring | `kicker: { cost, keyword: "offspring" }` plus `offspringTrigger()` in `triggered` — rule 702.175a, "When this permanent enters, if its offspring cost was paid, create a token that's a copy of it, except it's 1/1." The copy is made even if the creature has left by then (as it last existed), and isn't cast, so it has no offspring of its own. |
| gift | `kicker: GIFT_KICKER` from `helpers.ts` (`{ cost: "", keyword: "gift" }`) — rule 702.174a, "as an additional cost to cast this spell, you may choose an opponent": promising it is the kicked variant (the offer's `kickerKeyword: "gift"`), and the opponent is chosen as the cost is paid, after the targets (601.2h) — nothing to ask with one opponent; with more, the caster is asked about each in turn, the last one left taking it (`GiftAsk`, logged as `gift-promised`). **An instant or sorcery** spreads its "if the gift was promised" into it: `kicker: { ...GIFT_KICKER, targets?, effect }`, `effect` opening with `{ kind: "gift", gift }` (702.174j — Dawn's Truce, Into the Flood Maw, whose promised target differs, 702.174m); "if the gift wasn't promised" is the unkicked `effect` (Parting Gust). **A permanent** puts `giftTrigger(gift)` in `triggered` (702.174b), and its own "when this enters, if the gift was promised" is an ETB trigger with `condition: { kind: "self-kicked" }` (Scrapshooter). `gift` is a `GiftKind`: `"card"`, `"tapped-fish"`, `"food"`, `"treasure"`, `"octopus"`, `"extra-turn"` (702.174d–i). A copy of a promised spell is promised to the same opponent; a token copy of the permanent isn't (the rulings). Put the "Gift a card (…)" line in `text`. |
| ravenous | `ravenous()` from `helpers.ts` — rule 702.156a: spread its `static` (enters with X +1/+1 counters) into `static` and its `triggered` ("when it enters, if X is 5 or more, draw a card" — an intervening-if on the X it was cast with, so it never triggers below 5) into `triggered`; put the "Ravenous (…)" line in `text` (Jacked Rabbit). Entering without being cast — a token copy included — X is 0. |
| eternalize | `eternalizeAbility(cost, text)` in `activated` — rule 702.129a: from the graveyard, exiling the card, as a sorcery; a token copy of the card, a 4/4 black Zombie with no mana cost (the `noManaCost` copy exception). |
| regenerate | `regenerateSelfAbility(cost, text)` in `activated` — "{B}: Regenerate this creature" (rule 701.15; the `regenerate` effect, §6). |
| hideaway | `hideaway(n, "land")` from `helpers.ts` (the second argument is the reminder text's word: `"land"`, `"enchantment"`, `"creature"`) — rule 702.75a: "When this permanent enters, look at the top N cards of your library. Exile one of them face down and put the rest on the bottom of your library in a random order." A `look-and-choose` with `destination: "exile-face-down"` (min 1, max 1, `leftover: "bottom-random"`): the controller picks the card (a `choose-from-zone` decision), it's exiled face down (rule 406.3 — `GameObject.exiledFaceDown`) and **linked** to this object (607.2a — `GameObject.exiledWith`, the battlefield stint the trigger refers to). Only its controller may look at it, and whoever controls the permanent later may too, and goes on being able to (702.75a, 406.3 — the rulings). Its payoff is `playHideawayCard()` from `helpers.ts`, inside a `conditional` for the card's "if …", checked as the ability resolves: a `cast-now` with `from: "exiled-with-source"`, `play: true`, `free: true` — "you may play the exiled card without paying its mana cost". A spell is cast free, timing ignored (608.2g); a land is played, on its controller's own turn with a land play left, which it uses (rules 305.2a, 305.2b, 305.3). A permanent back from a blink is a new object whose abilities never reach the old card (rule 400.7). Since 2022 hideaway doesn't tap the permanent: the older cards' separate "This land enters tapped." (702.75b) goes on as its own `static`. Mosswort Bridge, Spinerock Knoll, Windbrisk Heights, Shelldock Isle, Howltooth Hollow, Watcher for Tomorrow (`return-exiled-by-source { linked: "hand" }`), Fight Rigging, Rabble Rousing, Cemetery Tampering; `hideaway.test.ts`. |
| living weapon | `livingWeapon()` from `helpers.ts` — rule 702.92a, "When this Equipment enters, create a 0/0 black Phyrexian Germ creature token, then attach this to it" (Nettlecyst, Batterskull): the Germ is equipped before state-based actions see a 0/0; with two made (Doubling Season) one is equipped and the other dies (the rulings); an Equipment that has left, or come back as a new object, attaches to nothing. Put it in `triggered`, and the printed line in `text`. |
| outlast | `outlast(cost)` from `helpers.ts` in `activated` — rule 702.107a, "[Cost], {T}: Put a +1/+1 counter on this creature. Outlast only as a sorcery" (Abzan Falconer). |
| unearth | `unearth(cost)` from `helpers.ts` in `activated` — rule 702.84a, "[Cost]: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery" (Molten Gatekeeper). A graveyard ability that stays put (the card isn't a cost); a card that left the graveyard in response returns nothing, and the end-step exile doesn't follow it anywhere else. |
| battle / Siege | `types: ["battle"], subtypes: ["Siege"], defense: N`, `text` starting with `SIEGE_REMINDER`, `triggered: [siege(), …]` (both from `helpers.ts`), and `faces` + `transform: true` with the back face in its own file — rule 310. It enters with N defense counters (310.4b); its controller chooses an opponent as its protector as it enters (310.12a — `GameObject.protector`), who defends it: it's among the attack targets of every other player (its controller too, 310.9b) and only the protector's creatures may block those attackers (310.9c). Damage removes defense counters (310.6) and "any target" includes it (115.4). `siege()` is the intrinsic "when the last defense counter is removed from this permanent, exile it, then you may cast it transformed without paying its mana cost" (310.12b — `cast-now` with `from: "source-exiled-this-way"`, `transformed`); a 0-defense battle goes to the graveyard once that has left the stack (310.7). Invasion of Lorwyn // Winnowing Forces. Cards that care about battles: "deals combat damage to a player **or battle**" is `deals-combat-damage-to-player` with `orBattle: true` (Furnace Reins); "whenever ~ attacks **a battle**" is `attacks` with `defender: "battle"`; "if it's attacking a battle" is the filter `attackingBattle: true`; "if an opponent protects it" / "each battle they protect" is the filter `protectedBy: "opponent"` (with `type: "battle"`); a battle card or spell is `type: "battle"`; excess damage to a battle is past its defense (120.4a). Not yet: a target of "player or battle", defense counters put on by other effects beyond the generic counter effects, "attacked a battle this turn". |
| backup | `backup(n, { keywords?, triggered?, activated? })` from `helpers.ts` — rule 702.165a: "when this creature enters, put N +1/+1 counters on target creature; if that's another creature, it gains the abilities printed below this one until end of turn". The grants are the card's own abilities printed **below** the backup line (and only those — 702.165c), written out again in the call; the card keeps them as usual. Boon-Bringer Valkyrie: `triggered: [backup(1, { keywords: ["flying", "first-strike", "lifelink"] })]`. Not yet: a static ability among the grants. |
| vanishing | `vanishing(n)` from `helpers.ts` — rule 702.63a: spread its `static` (enters with `n` time counters) and its `triggered` (your upkeep removes one, an intervening if; "when the last time counter is removed from this permanent, sacrifice it", a `counters-removed` with `last` — so time travel removing the last sacrifices it too) into the card. `vanishing()` with no N (702.63b) has no enters counters. Put "Vanishing N" in `text` (Four Knocks, Crack in Time, Deep Forest Hermit). |
| undying | `undying()` from `helpers.ts` in `triggered`, or a static's `grantsTriggered` — rule 702.93a, "When this creature dies, if it had no +1/+1 counters on it, return it to the battlefield under its owner's control with a +1/+1 counter on it" (Mikaeus, the Unhallowed grants it to his other non-Humans). The "if" reads the counters it died with. `persist()` is its mirror (rule 702.79): no -1/-1 counters, back with one (Glen Elendra Archmage). |
| evolve | `evolve()` from `helpers.ts` — rule 702.100a, "Whenever a creature you control enters, if that creature's power is greater than this creature's power and/or that creature's toughness is greater than this creature's toughness, put a +1/+1 counter on this creature": the comparison as the creature enters is the trigger's filter, and again as it resolves a `conditional` (the entering creature read as it last existed), power against power and toughness against toughness. Gyre Sage. Put it in `triggered`; its `text` is the keyword line with reminder text. Its counter is marked `evolve: true` (written out too, when the ability is inlined), so "whenever this creature evolves" (702.100b) is `{ on: "evolves", who: "self" }`: once per evolve ability that puts one or more counters, never for a counter put any other way (Watchful Radstag). |
| soulbond | `soulbond()` from `helpers.ts` — rule 702.95a, as its two triggers: "when this creature enters, if you control another unpaired creature and it's unpaired, you may pair it with one" (chosen as it resolves, not targeted; choosing none is the "may") and "whenever another creature you control enters, if both are unpaired, you may pair them" — both intervening-ifs, and the `pair` effect checks 702.95c. Spread it: `triggered: soulbond()` (or `[...soulbond(), …]`). What the pairing gives is a static with `affects: { scope: "paired" }` — this creature and its partner, only while paired: "both creatures have flying" is `grantKeywords`, "each of those creatures gets +2/+2" `grantPt`, "each of those creatures has '…'" `grantsActivated` / `grantsTriggered` (Silverblade Paladin, Druid's Familiar, Deadeye Navigator, Doom Weaver). A pairing ends for good when either leaves, changes control or stops being a creature (702.95e, `Game.unpairBrokenPairs`); the `paired` filter clause (`paired: false` is "unpaired") reads it. Soulbond isn't a `Keyword`, so "a creature **with soulbond**" (Flowering Lumberknot) and "the creature it's paired with" as a trigger or effect subject (Donna Noble, Joint Assault) can't be said yet. The scaffolder reads the keyword line and the keyword / P/T pairing statics. `soulbond.test.ts`. |
| increment | `increment()` from `helpers.ts` — rule 702.191a, "Whenever you cast a spell, if this permanent is a creature and the amount of mana spent to cast that spell is greater than this creature's power or this creature's toughness, put a +1/+1 counter on this creature": a `cast-spell` trigger whose intervening-if is the `increment` condition, asked as the spell is cast and again as the ability resolves — the source's power and toughness then, the spell's mana spent as it was on the stack if it has been countered since (the rulings). Cuboid Colony, Berta, Wise Extrapolator. Put it in `triggered`; its `text` is the keyword line with reminder text. The scaffolder reads the line. |
| dethrone | `dethrone()` from `helpers.ts` — rule 702.105a, "Whenever this creature attacks the player with the most life or tied for most life, put a +1/+1 counter on this creature", as the attack trigger it is (`defenderLife: "most"`). Every player is compared, you included, and attacking a planeswalker never counts. Not an intervening-if — the counter goes on however life totals change before it resolves. Put it in `triggered`, or grant it with `grantsTriggered` (Marchesa, the Black Rose's "other creatures you control have dethrone" is `affects: { scope: "creatures-you-control", excludeSelf: true }`), and the printed line in `text`. |
| firebending | `firebending(amount, text?)` from `helpers.ts` — "Firebending N (Whenever this creature attacks, add N {R}. This mana lasts until end of combat.)" as the triggered ability it is: put it in `triggered` (or grant it with `grantsTriggered`), and the printed line in `text`. `amount` takes any `EffectAmount` — Fire Lord Zuko's "firebending X, where X is Fire Lord Zuko's power" is `firebending({ powerOf: "source" })`, read as the trigger resolves. |
| investigate | `investigate(times?)` from `helpers.ts` — rule 701.36a, "create a Clue token", written as the `create-token` of `"Clue Token"` it is ("investigate twice" is `investigate(2)`; `times` takes any `EffectAmount`). The Clue (`{2}, Sacrifice this token: Draw a card.`) has an activated ability, so Clues are never folded into a token stack. |
| learn | `learn()` from `helpers.ts` — rule 701.48a, "you may discard a card. If you do, draw a card. If you didn't, you may reveal a Lesson card you own from outside the game and put it into your hand". The rummage is the `may` of a discard and a `this-way` draw; then, when nothing was discarded, a `search-library` of the sideboard (`outside: "only"`) for a Lesson, revealed (2026-10-30 — before then decks had no sideboard and learn was the rummage alone). In a Commander game there is no sideboard (903.5e), so only the rummage can do anything. Write `learn()`, never the shape inline. The scaffolder reads "Learn." "If you would learn, … instead" (Retriever Phoenix) replaces a learn and isn't modeled. |
| station | `station(text)` and `stationBand(n, band)` from `helpers.ts` — rule 702.184a, "Tap another untapped creature you control: Put a number of charge counters on this permanent equal to the tapped creature's power. Activate only as a sorcery", as the activated ability it is (a `tapOthers` cost, and `{ powerOf: "tapped" }` for the power, read as it resolves), and each station symbol (rule 721.2) as a `stationBand`: a static on the card itself, live while it has `n` or more charge counters, holding whatever that striation holds — `grantsActivated`, `grantsTriggered`, `grantKeywords`, and for a power/toughness box `addTypes: ["creature"]` with `setBasePt`. A striation runs to the next station symbol: in Oracle text **every** line after an "N+ |" line belongs to it, not just the first (Hearthhull's "Whenever you sacrifice a land" is an 8+ ability, granted by that band), and one of its statics that reaches other permanents passes its own `affects` (Inspirit's "Other artifacts you control have hexproof and indestructible"). A station card's printed `power`/`toughness` (kept for `card:verify` and commander eligibility, rule 903.3) only ever apply through that band (721.2b–c). Hearthhull, the Worldseed; Inspirit, Flagship Vessel; Infinite Guideline Station. |
| assimilate | `ASSIMILATE` from `helpers.ts` (Star Trek), spread into the effect that puts the card onto the battlefield: "put it onto the battlefield under your control with a +1/+1 counter. It's a Borg artifact creature and loses all other creature types" is `withCounters` and `enterAs: { addTypes: ["artifact", "creature"], setSubtypes: ["Borg"] }` (`EnterTypes.setSubtypes`: rule 205.1b's "[creature type] artifact creature" keeps every other type and subtype, an Equipment's too, and replaces its creature types). A `put-onto-battlefield` adds `underYourControl: true` (Borg Queen, Perfection Manifest; Death Is Irrelevant); a `reveal-until`'s `then` (The Borg Queen), a `look-and-choose` of `"exiled-with-source"` (Assimilation Assessor) or of `"targets"` with `min` = `max` (Assimilate the Wounded, one optional slot per opponent seat). Assimilating a *permanent* is `gain-control`, `add-counter` and `become` with the same parts, `duration: "permanent"`. |
| power-up | `powerUp(mana, effect, text, targets?)` from `helpers.ts` — rule 702.193a, "Power-up — [Cost]: [Effect]": the activated ability it is, activatable only once for as long as the permanent exists (like `exhaust`), and on the battlefield the turn it entered it costs less by the permanent's mana cost — generic by generic, each coloured symbol by a symbol of its colour, the excess off generic (702.193b, rule 118.7; a hybrid symbol takes off the half that helps most). No timing restriction of its own. Put the printed line, reminder text and all, in `text` and in the card's `text`. Aerial Doombot; Brawn, Amadeus Cho (a hybrid cost). |
| `attach` | `target` (Equip-style), `planeswalkerToo?` ("Equip planeswalker", rule 702.6e: attached as though the planeswalker were a creature — Luxior, Giada's Gift, written out over a `{ kind: "permanent", whose: "you", filter: { type: "planeswalker" } }` slot), `attachment?` — the source (an Equip ability) by default; with `attachment` (an `ObjectRef`) another Aura or Equipment: Hammer of Nazahn's and Sigarda's Aid's "you may attach **that Equipment** to target creature you control" is `attachment: "trigger-object"`, the Equipment whose entering fired it. The same object only (rule 400.7), and only onto something it could legally be attached to (rule 301.5c). `target: "created"` is the token an earlier step of the same resolution made, not a target — living weapon's "create a 0/0 black Phyrexian Germ creature token, then attach this to it" (rule 702.92a; the whole trigger is `livingWeapon()` from `helpers.ts`, with `attachment: "source"`, and needs the `Phyrexian Germ Token`). `target` may also be `"trigger-object"` — the creature whose entering fired it, no target (Hero's Blade's "you may attach this Equipment to **it**", Shielded by Faith, Sword of the Squeak) — or `"source"` — the ability's own permanent (Cloud, Ex-SOLDIER's "attach up to one target Equipment you control **to it**", with `attachment: 0`); each only while it's still that object (rule 400.7, which an enters or attacks trigger's object now honours too). `attachment: { all: CardFilter }` attaches **every** match, as a group — Balan, Wandering Knight's "attach all Equipment you control to Balan" (`{ all: { subtype: "Equipment", controlledBy: "you" } }`, `target: "source"`); sets come through the filter's `inSet` (Fumble's `{ all: { inSet: { attachmentsOf: 0 } } }`). `target: { among: CardFilter, prompt, optional?, another?, chooser? }` is a host chosen as it resolves among those everything being attached can legally go on (Stonehewer Giant; `chooser`, a `ChooserRef`: Steam Vines); `fortify(cost)` in `helpers.ts`, `unattach` takes the same `attachment`, and `{ thisWay: "unattached-from" }` is what it came off. `attachment: { choose: CardFilter, prompt, upTo?, min? }` attaches **any number** of matches chosen as it resolves (a `choose-permanents`, not targeted) — Ardenn, Intrepid Archaeologist's "you may attach any number of Auras and Equipment you control to target permanent or player" (`{ subtypes: ["Aura", "Equipment"], controlledBy: "you" }`, `target: 0`), Beatrix, Loyal General; `upTo: 1` is Vow to Erebor's "you may attach **an** Equipment"; `upTo: 1, min: 1` a mandatory one. "That was attached to Zack Fair" / "attached to that creature" (as it dies) is the filter's `wasAttachedTo: "source" | "trigger-object"`: what was attached to it as it last existed once it has left (608.2h), as it is now while it's there, the same objects only (400.7) — Zack Fair's `choose: { filter: { subtype: "Equipment", wasAttachedTo: "source" }, upTo: 1, min: 1 }` after he's sacrificed for the cost, Rhuk, Hexgold Nabber's `attachments: { subtype: "Equipment", wasAttachedTo: "trigger-object" }`. A player `target` is enchanted only by an Aura that can enchant them (a Curse, rule 303.4); anything that can't go there doesn't move (701.3b). `target` or `attachment` `"put-this-way"` is the card an earlier step of the same resolution put onto the battlefield (Pre-War Formalwear's "return target creature card … and attach this Equipment to it" — `[put-onto-battlefield, { kind: "attach", target: "put-this-way" }]`). `ontoChosen: { filter, prompt, optional?, another? }` attaches it to **a permanent chosen as it resolves**, not targeted (rule 608.2c), among the matches it could legally go on now (rules 301.5, 303.4j) — Stonehewer Giant's "search … for an Equipment card, put it onto the battlefield, attach it to a creature you control" is the search's `then: { kind: "attach", target: 0, attachment: 0, ontoChosen: { filter: { type: "creature", controlledBy: "you" }, … } }`; Aura Graft's "attach it to another permanent it can enchant" adds `another: true`; `optional` is "you may attach"; with none it could go on, nothing moves. `attach-hosts.test.ts`. Not yet: one choice per Aura and Equipment (Inventory Management), or "the creature this is attached to" as an effect's object (Ring of Valkas). |
| `transform` | `target` (`"source"` \| slot) | A transforming DFC turns over; since the 2025 rules change so does a modal DFC, to a face that's a permanent (Kazandu Mammoth to Kazandu Valley, never Fell Mire to Fell the Profane). Rule 701.28f is built in: an ability transforming its own permanent does nothing if the permanent has transformed since the ability was put on the stack — for a delayed trigger ("transform it at the beginning of the next upkeep"), since the delayed trigger was created. A card put onto the battlefield transformed (`put-onto-battlefield`'s `transformed`, a flicker's return) enters with its back face up, so the back face's enters replacements apply — a planeswalker back face gets its loyalty. |
| `flip` | `target` (`"source"` \| slot) | "Flip this creature" (rule 710): the permanent gets the flipped status, one way (710.4) — kept through copy effects, gone when it leaves. A flip card (`flip: true`) then has its alternative half's name, text, type line and P/T; a copy of a flip card shows the half its own status picks (707.3 — a token copy of a flipped Tomoya is an unflipped Jushi Apprentice). Never a transform: a `transform` effect does nothing to a flip card, and "transforms" triggers don't see a flip. `put-onto-battlefield`'s `flipped: true` is "return it to the battlefield flipped" (Homura, Human Ascendant). Kamigawa's ki cycle: `callow-jushi.ts`. |
| `note` | `amount` | "Then **note** your life total" (Sigarda's Splendor — `{ lifeTotal: "you" }`): the source permanent keeps the number, read now and as written (a life total below 0 stays below 0), as the one it last noted — where a `choose-value`'s `remember` puts its number — replacing any before it, and `{ chosenNumber: true }` reads it back ("the last noted life total", compared with the `amounts` condition; `NaN` with none, so the comparison fails). "**As this enters**, note …" is the `enters-battlefield` replacement's `notes` (§10). A source that has left, or come back as a new object, notes nothing (rule 400.7). |
| `day-night` | `value: "day" \| "night"` |

### Tutors / library manipulation

| kind | fields | example |
| --- | --- | --- |
| `search-library` | `who?: { controllerOf }` (*its controller* searches — a search they must make; "its controller **may** search", Path to Exile, is an `each-player-may` of `who: { controllerOf }` around a search with no `who`, so declining neither searches nor shuffles — `min: 0` alone still does both), `filter`, `destination: "hand" \| "battlefield"`, `min`, `max`, `enterTapped?`, `restDestination?` | Demonic Tutor, Rampant Growth. **`min`**: 0 for a search with a stated quality ("a basic land card", "a card named …"), which may fail to find (rule 701.23b); the count for one simply for a quantity ("a card", "any card" — Demonic Tutor, Vampiric Tutor, Entomb), which must find that many while the library has them (701.23d; the search clamps `min` to what's there). A **"you may search"** is a `may` around the search (Fierce Empath), so saying no neither searches nor shuffles — `min: 0` alone still searches and shuffles, which undoes a scry or a Brainstorm. `zones?: "library" | "graveyard" | "library-and-graveyard"` is what's searched (default the library): "search your library **and/or graveyard**" (Finale of Devastation) is a resolution-time `modal` over the three, so the player picks; only a search that includes the library shuffles it, and a match in the graveyard — a public zone — must be found (failing to find is for hidden zones, rule 701.23b). `max` is an `EffectAmount`, so "up to X basic lands, where X is the number of tapped creatures you control" is a `countOf` (Harvest Season). `restDestination` sends every *chosen* card after the first somewhere else — Cultivate's "put one onto the battlefield tapped and the other into your hand" (distinct from `leftover`, which is about cards **not** chosen). `together?` is a rule over the finds *as a set*, which `filter` (one card at a time) can't say: `{ share: "land-type" }` is Myriad Landscape's "up to two basic land cards **that share a land type**" (one card alone always passes); `{ oneEach: [{ label, filter }, …] }` is Krosan Verge's "a Forest card **and** a Plains card" — one find per slot, each matching its slot's filter, a card that fits both filling either, any slot missable (rule 701.23b). `{ distinctNames: true }` is Tiamat's "Dragon cards … **that each have different names**". `attachedToSource: true` (with `destination: "battlefield"`) is Light-Paws, Emperor's Voice's "put that card onto the battlefield **attached to Light-Paws**": an Aura that can't legally enchant it, or with it gone, stays where it was (rule 303.4i); an Equipment that can't equip it enters unattached (301.5e), as does anything else (303.4h). With `oneEach`, `filter` should admit exactly what some slot does (`{ subtypes: ["Forest", "Plains"] }`) and `max` be the slot count. The decision offers every card `filter` admits and rejects a set that breaks the rule; the bots' picks are turned into legal ones (`zone-choice-together.ts`), and the client greys out Confirm. **Another player's zones** (the search-opponent-library family, B248): `whose?: PlayerRef` — `{ target: n }` "search **target opponent's** library" (Extract, Bribery), `{ controllerOf: n }` "**its controller's**" (Splinter; a countered spell's is its controller's, not its owner's — Counterbore), `{ ownerOf: n }` "**its owner's**" (Surgical Extraction), `"trigger-player"` "that player's" (Rootwater Thief). The searcher is still the controller and decides; the library's owner shuffles; a find put onto the battlefield is the searcher's ("under your control"), one put into a graveyard or hand its owner's. `zones: "graveyard-hand-library"` is the extract family's "graveyard, hand, and library" (the hand is shown to the searcher). `all: true` is "**all** cards with that name": the graveyard's matches go whatever is picked, the hidden zones' may be left (rule 701.23b, Counterbore's ruling) — "**any number** of cards" is no `all`, `min: 0, max: 99`. `destination: "exile" \| "exile-face-down"`, with `mayPlay: { duration: "while-exiled", play: true }` for Praetor's Grasp's "you may play that card for as long as it remains exiled", or any `ExilePermission` (as `exile`'s `mayPlay`) on every exiled find — Ugin, Eye of the Storms' "until end of turn, you may cast those cards without paying their mana costs" is `mayPlay: { duration: "end-of-turn", free: true }`, Chandra, Heart of Fire's "you may cast them this turn" `{ duration: "end-of-turn" }` (`play: true` for lands too); `"stay"` leaves the find where it is for `then` (Knowledge Exploitation's free cast from the library). `then?` runs after the shuffle with **the finds as its targets** and **`"that-player"` the searched player**: Seek's `gain-life` of `{ manaValueOf: 0 }`, Lost Legacy's `{ kind: "draw", who: "that-player", amount: { thisWay: "exiled-from-hand" } }`. So "**that card**" in the next sentence is slot 0: Scion of the Ur-Dragon's "If you do, [it] becomes a copy of that card" is a `conditional` on `{ kind: "target", index: 0, filter: { inZone: "graveyard" } }` (a find a replacement exiled isn't copied) around `become-copy` of `of: 0`, `ofCard: true`; Instrument of the Bards' "If that card is legendary" a `conditional` on `{ supertype: "legendary" }`. A find put onto the battlefield that then "**gains** …" is a `sequence` of the search and a `grant-keyword-all` over `{ thisWay: "put-onto-battlefield" }` (Nahiri, the Harbinger; Savage Order), which a find that couldn't enter is not among. The name comes from a `choose-card-name` around it (`{ hasName: CHOSEN_CARD_NAME }` — Memoricide), a target (`{ sameNameWith: 0 }`), or what this resolution exiled (`{ sameNameWith: { thisWay: "exiled" } }` — Haunting Echoes). The scaffolder reads these lines whole. |
| `scry` | `amount`, `then?` | Preordain (`then: { kind: "draw", amount: 1 }`). `amount` may be live, read as it applies (The Scarab God's "scry X, where X is the number of Zombies you control"). The player picks the cards for the bottom (the `scry` decision), then orders the cards kept on top, then the cards put on the bottom (rule 701.22a) — each a `choose-from-zone` with `order: true`, asked only for two or more cards that aren't all one card; `then` waits for both. `library-ordering.test.ts`. |
| `reveal-top` | `then`, `of?: { ownerOf }` | "Reveal the top card of your library. If it's a land card, put it onto the battlefield tapped. Otherwise, draw a card" (Thrasios). Reveals to every player, then applies `then` with **that card as target 0**, so a `{ kind: "target", index: 0, filter }` condition and a `put-onto-battlefield { target: 0 }` both reach it. The card doesn't move unless `then` moves it. `of: { ownerOf: n }` is the top of **another** library — that of the owner of target `n`, who reveals it (Chaos Warp's "then reveals the top card of their library"); the owner is known even once the target has moved or a token has ceased to exist, and a `put-onto-battlefield` puts the card under that owner's control. `who: <scope>` has **each player in it** reveal, then runs `then` once with no targets, reading the cards as `{ thisWay: "revealed" }` (parley — the `parley` helper). Inside a `for-each-player`, `then` still reads `"that-player"`: Protection Racket's "repeat the following process for each opponent in turn order … that player may pay life equal to that card's mana value" is a `for-each-player` of a `reveal-top` whose `then` is an `each-player-may` of `who: "that-player"` with a `payLifeAmount: { manaValueOf: 0 }` option (`each-opponent-pays-life-for-revealed.test.ts`). |
| `create-token-copy` via `embalmAbility(cost, text)` | — | **Embalm** (rule 702.128a — Sacred Cat): `activated: [embalmAbility("{W}", EMBALM_TEXT)]` from `helpers.ts`, eternalize's twin (`eternalizeAbility`): from the graveyard at sorcery speed, a token copy that's white, a Zombie besides its other types, with no mana cost, its size its own. `text` is the line as printed, reminder included. |
| `skip-next-untap` | `filter`, `who?` (a player slot or scope, `"you"` by default) | "Lands you control don't untap during your next untap step" (Kefnet's Last Word, Bontu's Last Reckoning): during that player's next untap step no permanent they control matching `filter` untaps — read then, so one that arrived since is held too (the rulings), unlike `tap-all`'s `doesntUntapNext`, which marks what's there now. Two of them wear off in the same step. `skip-next-untap.test.ts`. |
| `skip-untap-step` | `who?` (a player slot or scope, `"you"` by default) | "[That player] skips their next untap step" (Brine Elemental, Shisato, Dovin, Architect of Law's −9, Avizoa — rule 614.10): the whole step goes by — no phasing, no day/night check, nothing untapping. Two skip the next two (614.10a), and a "doesn't untap during its controller's next untap step" waits for the first one that happens. Not `skip-next-untap`, which only keeps permanents tapped. `take-extra-turn`'s `skipUntapStep` is Savor the Moment's "skip the untap step of that turn". `skip-untap-step.test.ts`. |
| `skip-step` | `step` (`"untap"`, `"upkeep"`, `"draw"` or `"combat"`), `who?` (a player slot or scope, `"you"` by default), `thisTurn?`, `allOfNextTurn?` | `"combat"` is a whole combat phase, its triggers and steps with it: "skips their next combat phase" (Stonehorn Dignitary, Blinding Angel: `who: "trigger-player"`) waits for that player's turn, `thisTurn` is "their next combat phase this turn" (Moment of Silence), `allOfNextTurn` is "all combat phases of their next turn" (False Peace). "[That player] skips their next draw step" (Fatigue, Molten Firebird) or upkeep step — rule 614.10: passed as though it didn't exist (500.11), no "at the beginning of" triggers, no priority. Two skip the next two (614.10a); a step a static `skipsSteps` already skips doesn't use one up. `thisTurn`: "you skip your draw step this turn" (Elfhame Sanctuary) — the active player's, this turn only, several giving one skip. The scaffolder reads "skips their next draw/upkeep step". `skip-step.test.ts`. `eachThisTurn: true` is "skips **each instance** of [it] this turn" (Fatespinner, its choice an `as-player` of `"active-player"` over a `modal`): every one the active player has left this turn, ones added later too, and `step` may then be `"main"` (both main phases and any additional one, rule 505.1; there's no "next main phase" skip). `skip-each-this-turn.test.ts`. |
| `shuffle-graveyard-into-library` | `target` (a player slot or a scope) | "Target player shuffles their graveyard into their library" (Reminisce), "each player …" (`"each-player"` — Survive), "shuffle your graveyard into your library" (`"you"` — Feldon's Cane): the whole graveyard into the library in one move, then shuffled (rule 701.24a), even when it was empty. `zones` names what goes in (default `["graveyard"]`): Timetwister's "shuffles their hand and graveyard into their library" is `["hand", "graveyard"]` (then a `draw` of seven, `who: "each-player"`), Sway of the Stars adds `"permanents"` (every permanent the player owns, whoever controls it). `drawThatMany: true` is "then draws that many cards" (Winds of Change, Whirlpool Warrior): each player draws as many as they put in, a token counting. `filter` takes only the graveyard's matching cards, the library shuffled either way: Barishi's "shuffle all creature cards from your graveyard into your library" (`{ type: "creature" }`), Elixir's "all nonland cards" (then `{ thisWay: "shuffled-into-library" }` for "the number of cards shuffled into your library this way"), Repopulate's "from target player's graveyard into that player's library" (`target: 0`). Target cards into their **owners'** libraries (Turn the Earth, Serene Remembrance) are `put-on-libraries`' `"shuffle"`. |
| `shuffle-into-library` | `target` | "The owner of target permanent shuffles it into their library" (Chaos Warp): into its **owner's** library, which is then shuffled (rule 701.24a) — even for a token, which ceases to exist there (rule 111.7), or a commander a replacement sent to the command zone. Nothing happens to one that has left the battlefield. |
| `reveal-until-count` | `whose?`, `filter`, `count`, `exile?`, `put?: "battlefield" \| "hand" \| "with-rest"`, `tapped?`, `rest` (as `reveal-until`'s) | "Reveal cards from the top of your library until you reveal **N** creature cards. Put those onto the battlefield, then shuffle the rest into your library" (Selvala's Stampede, `count: { votesFor: 0 }`): every card found enters together, under its owner's control, once each one's "as this enters" choices are made; nothing is revealed for 0; all of the library when there aren't that many. `put: "hand"`: Fathom Trawl's "put the nonland cards revealed this way into your hand", `"with-rest"`: all of them where the rest goes, in one event (Mind Funeral's graveyard). `exile`: each exiled, face up, as it goes (Auspicious Starrix, `rest: "stay"`). `reveal-until-rest.test.ts`. |
| `reveal-until` | `whose?`, `filter`, `exile?`, `put?: "battlefield" \| "hand" \| "graveyard"`, `tapped?`, `underYourControl?` (Sméagol, Helpful Guide's "put that card onto the battlefield tapped under your control" from an opponent's library), `attacking?` (as `create-token`'s — Raph & Mikey), `then?`, `thenKeepsTargets?` (`then`'s target 0 stays the card found, the resolution's own targets after it, each a slot up — Erratic Explosion's damage to its target is `target: 1`, `amount: { manaValueOf: 0 }`), `rest: "bottom-random" \| "bottom-any-order" \| "graveyard" \| "hand" \| "exile" \| "shuffle" \| "stay"` (`"bottom-any-order"`: its owner orders them, rule 401.4; `"hand"`: Treasure Hunt), `keepFound?` | A generalised cascade: reveal cards from the top of a library — the controller's, the player in target slot `whose`, with `whose: { controllerOf: n }` the controller of the permanent in slot `n`, as it last existed (Transforming Flourish, after destroying it), or with `whose: "that-player"` each one a `for-each-player` names (Consuming Aberration's "each opponent reveals cards … until they reveal a land card, then puts those cards into their graveyard": `{ whose: "that-player", filter: { type: "land" }, rest: "graveyard" }`) — until one matches `filter` (an `{ amount }` compare is bound as it applies: "a nonland card with lesser mana value"). The Prismatic Bridge's "…until you reveal a creature or planeswalker card. Put that card onto the battlefield and the rest on the bottom of your library in a random order" is `{ filter: { typesAnyOf: ["creature", "planeswalker"] }, put: "battlefield", rest: "bottom-random" }`; Umbris's "target opponent exiles cards from the top of their library until they exile a land card" is `{ whose: 0, filter: { type: "land" }, exile: true, rest: "stay" }` (`exile` exiles each card face up as it goes). `then` is applied with **the card found as target 0** after `put` — "you may put that card onto the battlefield. Then shuffle" is a `then` of `{ kind: "may", effect: { kind: "put-onto-battlefield", target: 0 } }` with `rest: "shuffle"`, and the rest wait for its answer. `rest` places every revealed card still where it was revealed — the card found too, if nothing moved it, unless `keepFound` ("put each **other** card exiled this way on the bottom" — it stays in exile to be cast); with nothing matching, that's all of them. |
| `surveil` | `amount`, `then?` | Consider. `amount` may be live, as `scry`'s. The cards kept on top are ordered as a scry's are (rule 701.25a). |
| `turn-exiled-face-up` | — | "Turn the exiled card / all cards exiled with this face up" (The Creation of Avacyn, Pyxis of Pandemonium): every card linked to this source, its characteristics back (rule 406.3a). An `exiled-with-source` condition's `filter` finds nothing in a card still face down. |
| `choose-exiled-card` | `filter?`, `prompt` | "Choose a creature card exiled with Koh" (rule 607.2a): not a target; this permanent remembers it for a `grantsActivatedOf`'s `"chosen-exiled"`. With none to choose, the last choice stands. |
| `choose-exiled-to-play` | `filter?`, `linked?`, `free?` | `linked: true` chooses among the cards exiled with this source only (rule 607.2a), no `filter` needed: Muse Vessel's "choose a card exiled with this artifact. You may play that card this turn". Dauthi Voidwalker's "choose an exiled card an opponent owns with a void counter on it. You may play it this turn without paying its mana cost" (`filter: { ownedBy: "opponent", counters: { kind: "void", compare: { op: "gte", n: 1 } } }`, `free: true`): the effect's controller picks one face-up exiled card matching `filter` — not a target; asked only with more than one — and may play it this turn, a land as their land play and a spell at its normal timing; with `free`, only without paying its mana cost. |
| `create-token`/`create-token-copy`'s `linkedToSource` | | "Tokens **created with this**": each token made remembers this effect's source, in the stint the ability refers to (`GameObject.createdWith`), Doubling Season's extra ones too; a copy of the token doesn't (Arcane Artisan's ruling). The filter clause `createdWithSource` then finds them, in an effect's filter: Saproling Burst's `destroy-all` of `{ token: true, createdWithSource: true }` with `cantBeRegenerated`, Faerie Artisans's `exile-all` with `notThisWay: "created"` for "all other tokens created with this creature", Arcane Artisan's inside a `delayed-trigger`, bound as that's created so "at the beginning of the next end step" still means the permanent that left. The count `{ countersOnMaker: "fade" }` in a token's `setBasePtFromCount` reads the counters on that permanent, 0 once it has left (Saproling Burst, Gutter Grime). "Exile **those tokens** when ~ leaves" isn't this: it's a `delayed-trigger` with `about: "created"` (Mysterio, Master of Illusion). `create-token-copy`'s `who: { target: 0 }` is "that player creates a token that's a copy". |
| `link-exiled-to-created` | `gains?` | "The exiled card" of a token's own ability: goes after the `exile` and the `create-token`/`create-token-copy`, and each token made holds what this resolution exiled (`GameObject.linkedExile`, rule 607.2a), so that token's `return-exiled-by-source` of `linked` reaches those cards alone, not others the maker exiled. Hofri Ghostforge's "it has 'When this token leaves the battlefield, return the exiled card to its owner's graveyard'" is a copy exception (`exceptions.triggered`) with `linked: "graveyard"`; Timothar, Baron of Bats's "it gains 'When this token deals combat damage to a player, sacrifice it and return the exiled card to the battlefield tapped'" is `gains`, not copiable, with `linked: "battlefield"`, `under: "you"`, `enterTapped`. A copy of the token isn't linked (their rulings). |
| `put-arrived-onto-battlefield` | `count` (a number, or `"all"` for "put **them** onto the battlefield tapped": Hedge Shredder, nothing to choose), `enterTapped?`, `underOwner?`, `withCounters?` | Colossal Grave-Reaver's "whenever one or more creature cards are put into your graveyard from your library, **put one of them onto the battlefield**" (on a `batched` `put-into-graveyard` trigger, `count: 1`): of the cards that move put there that counted for the trigger, those still there as the same objects, onto the battlefield under the effect's controller's control — the controller picking which when more are left than `count`. On a `batched` `dies` trigger, the cards among what died (a token is no card): Rinoa, Angel Wing's "return one of them to the battlefield tapped under its owner's control with a flying counter on it" is `enterTapped`, `underOwner`, `withCounters: { kind: "flying", amount: 1 }`. A `may` over it isn't offered with none left. |
| `choose-opponent` | `then` | "You choose an opponent" as this resolves (not a target): `then` with `"that-player"` naming them — asked as a `choose-modes` with more than one opponent left. Tasigur, the Golden Fang's "return a nonland card of an opponent's choice from your graveyard to your hand" is a `choose-opponent` whose `then` is a `look-and-choose` with `chooser: "that-player"` (you choose the opponent, then they choose — the ruling). `random: true` is "choose an opponent **at random**" (Vial Smasher the Fierce): nobody is asked — the game picks on its seeded random stream, each equally likely; add `anyPlayer: true` for "choose a **player** at random" (Wildfire Devils), the effect's controller among them. Logged as a `chosen-at-random` event. `anyPlayer: true` without `random` is "choose a player" (the controller asked, themself among the options). `mostLife: true` narrows the candidates to those tied for the most life as it resolves (The Master, Gallifrey's End; The Black Gate's "a player with the most life or tied for most life"). `remember: true` keeps the one chosen as the source's chosen player (see "Choosing a player"). `thenAnother: { kind: "choose-opponent", … }` is "choose a **second** player … then choose a **third** player" (Gluntch, the Bestower): once `then` is done, another choice among the same candidates less everyone chosen earlier in the chain (the engine carries them as `except`), nested for a third; with nobody left it does nothing (two players, no third). `purpose: "to draw a card"` ends each offer's text ("Choose Bob to draw a card"), so chained choices read apart. |
| `empower-jace` | `amount` | Empower Jace N (rule 701.71a — Reality Fracture): with no Jace planeswalker **token** under your control, it creates the blue `Jace Token` (0 loyalty, "[−1]: Surveil 1", "[−3]: Draw a card"), then puts `amount` loyalty counters on a Jace planeswalker token you control — never a nontoken Jace (a copy token counts, the rulings); with several (a Doubling Season made two), the effect's controller chooses. The counters are `add-counter`'s, so counter replacements apply. Way of the Pyromancer's "When … enters, empower Jace 2" is a `enters-battlefield` trigger of `{ kind: "empower-jace", amount: 2 }`. `empower-jace.test.ts`. |
| `become-prepared` | `target` \| `filter` | "… becomes prepared" (rule 722.3a — preparation cards, Secrets of Strixhaven / Reality Fracture): `target` a slot or `"source"` ("this creature becomes prepared"), or every permanent `filter` matches (Codie's "each creature you control"). Only a permanent with a prepare spell that isn't prepared already does (the rulings); as it does, its controller makes a copy of the spell in exile, castable by the permanent's controller while it stays on the battlefield and prepared (722.3c — a `cast-spell` offer with `via: "prepared"`, its normal timing and cost); casting it unprepares it (601.2i). **The card**: `prepareSpell: "<spell's registry name>"` on the creature, whose own definition and text are only the creature's (722.4). A spell that is a card of its own (Demonic Tutor, Reanimate, Rampant Growth) is that card's existing definition, Oracle text identical; one that isn't (Enroot, Soul Tether) is its own file with `prepareSpellOnly: true` (never deckable, shared by every card that prints it). "This creature enters prepared." is `static: [entersPrepared()]` (helpers.ts; pass the printed line, reminder text included — `PREPARED_REMINDER`). Filters: `prepared` (is it prepared — Woodwork Prodigy's "if this creature isn't prepared" is a `source` condition with `{ prepared: false }`) and `preparedSpell` (a spell cast as such a copy — Codie's "whenever you cast a prepared spell", on a `cast-spell` trigger's filter). Studious First-Year, Carnivorous Cultivator. `prepare.test.ts`. |
| speed (`"start-your-engines"`, `maxSpeed`, the `speed` condition and amount) | — | Speed (rules 702.178–702.179 — Aetherdrift): the `"start-your-engines"` keyword in `keywords` (its line `START_YOUR_ENGINES_TEXT`, helpers.ts; Hour of Victory prints it bare) gives its controller a speed of 1 if they have none, as a state-based action (704.5aa — `Game.startEngines`, so gaining control of one starts yours, and one that lost its abilities starts nothing); after that a sourceless inherent ability raises it by 1, once on each of your turns an opponent loses life, to 4 (702.179d — `cards/speed.ts`, on the stack as "Speed"), and nothing lowers it (`PlayerState.speed`, read as 0 while absent, 702.179f). "Max speed — [ability]" is `maxSpeed({ … })` (helpers.ts) in `static`: a static on the card itself, `condition: MAX_SPEED_CONDITION` (`{ kind: "speed", atLeast: 4 }`), holding the ability — `grantsActivated` (a mana ability too: Muraganda Raceway, Endrider Catalyzer), `grantsTriggered` (Aether Syphon, Risen Necroregent), `grantKeywords`/`grantPt` (Burnout Bashtronaut, Walking Sarcophagus), a `replacement` (Far Fortune's +1, Vnwxt's "draw two instead", which multiplies with another such effect), a `costModification` (Racers' Scoreboard). One that works from the graveyard keeps its place there with the condition (702.178b): the Surveyors' `activated` entry `{ zone: "graveyard", condition: MAX_SPEED_CONDITION }`, Lightwheel Enhancements' `mayPlaySelf: { from: ["graveyard"], if: MAX_SPEED_CONDITION }` — "you" its owner. "Unless you have max speed" is `{ kind: "speed", atMost: 3 }` (Hazoret's restrictions); "where X is your speed" the `{ speed: "you" }` amount (The Speed Demon, Point the Way's `max`, Momentum Breaker's life), cost reduction (Samut's noncreature spells) and `grantPtPerCount: { speed: true, pt }` (Samut's anthem); "each player who doesn't have max speed" a `damage`'s `whoseIf: { kind: "speed", who: "that-player", atMost: 3 }` (Outpace Oblivion). An effect "increases your speed" is `increase-speed` (702.179c: from none, it becomes that much). `speed.test.ts`, `set-batch-67d.test.ts`. |
| `enduring-story` (a `StaticCondition`) | — | Storied (rule 702.195 — The Hobbit): the `"storied"` keyword in `keywords` (its line is `STORIED_TEXT`, helpers.ts) gives its controller an enduring story for the rest of the game once they control three or more artifacts, Sagas and/or legendary permanents (`Game.grantEnduringStories`, each state-based check — 702.195c); "as long as you have an enduring story" is a static's `condition: { kind: "enduring-story" }` (Fíli, Thorin's granted ward, Dáin's `attackTax`, Bifur's `doubleTriggersOf`), "unless you have one" wraps it in `not` (Bombur's `doesntUntap`), and "if you have one" is a `conditional`'s (Balin). `storied.test.ts`. |
| `citys-blessing` (a `StaticCondition`) | — | Ascend (rule 702.131 — Rivals of Ixalan): the `"ascend"` keyword in `keywords`. On a permanent its controller gets the city's blessing for the rest of the game the moment they control ten or more permanents, each token of a stack counting (`Game.grantCitysBlessings`: as permanents enter or change control, mid-resolution too — Ocelot Pride's Cat that's the tenth permanent gives it before the same ability asks — and in each state-based check, 702.131d); on an instant or sorcery it's the spell's first instruction as it resolves (702.131a — Secrets of the Golden City). "As long as you have the city's blessing" is a static's `condition: { kind: "citys-blessing" }` (Dusk Charger, Skymarcher Aspirant), "if you have it" a trigger's intervening if (Resplendent Griffin) or a `conditional`'s (Secrets), and "Activate only if you have the city's blessing" an activated ability's `condition` (Arch of Orazca). The scaffolder reads all four. `ascend.test.ts`. |
| `top-of-graveyard` | `whose?` (as `choose-random-card`), `filter?`, `ifIt?`, `bottom?`, `then` | The top card of a graveyard by the pile's order (rule 404.2), to `then` as target 0, with no target and no choice: Soldevi Digger; `filter` "the top creature card" (Corpse Dance, Shallow Grave); `ifIt` "if the top card is a creature card" (Guiding Spirit); `bottom` (Phyrexian Furnace). A card with this or a `fromTop` cost makes owners arrange cards put into a graveyard together (rule 404.3, `choose-from-zone` `order`). |
| `reorder-graveyard` | none | "Reorder your graveyard as you choose" (Fossil Find): the whole pile, the first picked on top, asked only in a game where something reads the order. |
| `choose-random-card` | `zone: "graveyard" \| "hand" \| "exiled-with-source"`, `whose?: "you" \| "that-player" \| slot \| { controllerOf } \| { ownerOf }`, `filter?`, `show?: "reveal" \| "look"`, `slot?`, `then?` | A card **at random** from a graveyard as this resolves — Exalted Flamer of Tzeentch's "return an instant or sorcery card at random from your graveyard to your hand" (`{ filter: { typesAnyOf: ["instant", "sorcery"] }, then: { kind: "return-to-hand", target: 0, from: "graveyard" } }`), Deadbridge Chant's "choose a card at random in your graveyard. If it's a creature card, put it onto the battlefield. Otherwise, put it into your hand" (a `conditional` on `{ kind: "target", index: 0, filter: { type: "creature" } }`), Tomb Tyrant (`put-onto-battlefield`), Wondrous Crucible and Arcane Bombardment (an `exile` — `linked` for "exiled with this" — then `cast-now` copies). One of the cards in that graveyard matching `filter` (read from the effect's controller's side) is picked on the game's seeded random stream, each equally likely (the Deadbridge Chant ruling), and `then` applies to it as target 0. Not a target: a card put there in response can be picked, and nothing picked doesn't counter anything — with nothing matching, nothing happens and later `sequence` steps still do. Logged as a `chosen-at-random` event (graveyards are public, so everyone sees which). **`zone: "hand"`** picks from a hand, a hidden zone: `show: "reveal"` shows it to every player (rule 701.20a — Hired Torturer's "then reveals a card at random from their hand"), `show: "look"` to the effect's controller alone, a look they close (Urza's Bauble; a look takes no `then`), no `show` when `then`'s move shows it (Crabomination's "exiles … a card at random from their hand"). **`zone: "exiled-with-source"`** picks among the cards linked to this source (rule 607.2a — an `exile`'s or a search's `linked`, a craft's materials, 702.167c), `whose` unread: Skyship Weatherlight's "choose a card at random that was exiled with Skyship Weatherlight. Put that card into its owner's hand" (`then: { kind: "return-to-hand", target: 0, from: "exile" }`). **`slot`** puts the picked card in that target slot *beside* the ability's own targets rather than replacing them as target 0: Cursed Scroll's "reveal a card at random from your hand. If that card has the chosen name, this artifact deals 2 damage to any target" (`slot: 1`, a `conditional` on `{ kind: "target", index: 1, filter: { hasName: CHOSEN_CARD_NAME }, now: true }`, the damage at target 0), Singe-Mind Ogre's `{ kind: "lose-life", amount: { manaValueOf: 1 }, target: 0 }`. With no `then`, the reveal or look is all. |
| `cast-now` | `target?` or `from?`, `by?`, `spell?`, `free?`, `byDiscarding?`, `byPayingEnergy?`, `byPayingLife?`, `byPaying?`, `alsoPaying?`, `spendAs?`, `mustCast?`, `play?`, `exileAfter?`, `then?`, `else?`, `rest?`, `repeat?`, `onePerGraveyard?`, `upTo?`, `totalManaValue?`, `exceptChosen?`, `copies?` | What the cast costs: `byPaying: "{3}"` is "by paying {3} rather than paying its mana cost" (Blue Mage's Cane), `byPayingLife` "by paying life equal to its mana value" (Bismuth Mindrender), both alternative costs and the only way offered, X at 0; `alsoPaying: "{R}{R}"` is "by paying {R}{R} in addition to its other costs" (Ogre Battlecaster), X announced as usual; `spendAs: "any-type"` is "and mana of any type can be spent to cast that spell" (Tinybones, the Pickpocket). `mustCast` is "casts it … **if able**" (Omen Machine, Spelltwine): no decline is offered while a way to cast it can be paid with what's floating, since a mana ability is never mandatory (rule 118.3c), nor is a mandatory additional cost with a quality in a hidden zone (118.8c); nothing is asked when it can't be cast, and an offer no legal cast can be made from may be declined. A follow-up reads the spell cast with `{ aggregate: "sum", of: "mana-value", filter: {}, in: { thisWay: "cast" } }`: Ogre Battlecaster's "when you cast that spell" is a `reflexive-trigger` in `then`, whose `value` that is. `from: { graveyardOf: player }` is one named player's graveyard (Sorcerous Squall), `from: { zones: ["hand", "graveyard"] }` several of the controller's zones at once (Anrakyr the Traveller; `"exile"` there is the cards they own in exile, a face-down one only if they may look at it, rule 406.3b — Kaya the Inexorable's emblem), `from: { exiledOwnedWithCounter: "kick" }` their face-up exiled cards with that counter (Zethi, Arcane Blademaster, with `copies`), `from: "milled-this-way"` the cards this resolution milled (Jace's Mindseeker). `from: "discarded-this-way"` is "you may cast **the discarded card**" (Malcolm, Alluring Scoundrel): the cards this resolution had discarded, in the graveyard or the exile madness put one in instead (400.7j, 702.35a) — not one a replacement put on a library. `from: "opponents-graveyards"` with `repeat` and `onePerGraveyard` is Jetsam's "you may cast a spell from **each opponent's graveyard**": one at a time in the caster's order, a graveyard gone once a spell's cast from it — read by each card's owner, so with `from: "milled-this-way"` it's The Ur-Sphinx's "**for each player**, you may cast a card that player milled this way". With `repeat`, `upTo: n` is "you may cast **up to two** spells from among them" (Collected Conjuring) and `totalManaValue: n` is "any number of spells **with total mana value 10 or less**" (Primeval Spawn, with `copies` Uldaros Theorix): a limit read once, each spell its own offer showing what's left, a spell that no longer fits not offered. `exceptChosen: true` is "from among **the other** cards exiled this way" after an earlier step's choice: the cards chosen so far in the resolution (a `look-and-choose` with `destination: "stay"`, `chooser: "an-opponent"` — Plargg and Nassari) are left out. `from: "face-up-exile-opponents-own"` is Ashiok, Nightmare Muse's "from among face-up cards your opponents own from exile". `copies: n` casts **copies of the cards** instead of the cards (rule 707.12): n copies of each, made in its zone, owned by the effect's controller — Isochron Scepter's "you may copy the exiled card … cast the copy" (`from: "exiled-with-source"`, `copies: 1`), Mnemonic Deluge's "copy that card three times. You may cast the copies" (`copies: 3`), Mizzix's Mastery's and Narset, Enlightened Exile's "exile … and copy it" (an `exile` step, then `from: "exiled-this-way"`). Several copies are each their own "may", offered one after another (707.12a, as `repeat`); a copy not cast ceases to exist at the next state-based check (704.5e), a cast one as it leaves the stack, and a copy of a permanent card becomes a token as it resolves (608.3f). `{ libraryTop }` is an amount — Sunbird's Invocation's "the top X cards, where X is that spell's mana value" (`{ manaValueOf: "trigger-object" }`), Perception Bobblehead's count of Bobbleheads — and `reveal: true` reveals them to everyone instead of looking (Sunbird's Invocation, Powerbalance). `by` (an `PlayerRef`, with `target`) is who may cast it when that isn't the effect's controller — Transforming Flourish's "its controller exiles cards … then **they** may cast that card" is `by: { controllerOf: 0 }` (an `PlayerRef` naming the controller of the permanent in that slot, as it last existed); `then`/`else` follow whether *they* cast it. `from: "exiled-this-way"` with `repeat: true` is Gix, Yawgmoth Praetor's "you may play lands and cast spells from among cards exiled this way without paying their mana costs" after an `exile-from-library`: any number of them, one after another as it resolves (its ruling), the rest offered again after each until the player declines (`play: true, free: true`). "You may cast [a card]" **while this resolves** (rule 608.2g): the effect's controller is offered every ordinary cast of the card — modes, X, kicker, targets, costs — with timing ignored, or declines; nothing is asked when nothing can be cast. The card is `target` (Chandra, Acolyte of Flame's −2: a `card-in-graveyard` target; the card a `reveal-until` found, as its `then`'s 0 — Breaching Dragonstorm; the spell a `counter` with `into: "exile"` just exiled — Transcendent Dragon), or with `from` whichever card the player picks: `"hand"` ("you may cast a spell with mana value 4 or less from your hand" — Baral's Expertise, Electrodominance), `"graveyard"` (Diviner of Mist), `"any-graveyard"` — every player's graveyard, the spell then the caster's to control (Spectral Arcanist's "… from a graveyard"), or `{ libraryTop: 7 }` — "look at the top seven cards … cast … from among them", shown to that player alone (Velomachus Lorehold), with `rest: "bottom-random"` for "put the rest on the bottom in a random order". `spell` is what the spell must be, judged as the spell it would be (rule 601.3e — the face cast, an adventure, its prototype) at X = 0, so a mana-value clause goes with `free`: `{ typesAnyOf: ["instant", "sorcery"], manaValue: { op: "lte", n: { amount: { powerOf: "source" } } } }`, bound as the effect applies; `sharesCardTypeWith: "trigger-object"` with a `manaValueOf: "trigger-object"` compare is Baral and Kari Zev's "lesser mana value that shares a card type with it". `from: "exiled-with-source"` is "the exiled card" of a linked ability (rule 607.2a — hideaway's; see `hideaway` in §5), and `play: true` makes it "you may **play**": a land card is offered too, played on its controller's own turn with a land play left, which it uses (rules 305.2a, 305.2b, 305.3) — the decision's `lands`, answered with a `play-land` — from wherever `from` offers it: Ziatora's Envoy's "play a land from the top of your library" is `from: { libraryTop: 1 }, play: true`. `free` is "without paying its mana cost" — the only way offered; an alternative cost, so X is 0 and no other alternative cost goes with it, but kicker may be paid on top (rules 107.3b, 118.9a, 118.9d). `byDiscarding` is "by discarding a card **rather than** paying its mana cost" (The Infamous Cruelclaw): `free` with a card from the caster's hand discarded as it's paid, not offered with an empty hand. `byPayingEnergy` is "by paying an amount of {E} equal to its mana value rather than paying its mana cost" (Amped Raptor): `free` with that spell's mana value (X 0) in energy paid, not offered without it. `exileAfter` is "if that spell would be put into your graveyard, exile it instead"; `exileAfter: "instants-and-sorceries"` is "if an **instant or sorcery** spell cast this way would be put into your graveyard" — an artifact cast this way isn't exiled (Scholar of the Lost Trove). `from: "targets"` with `repeat` is the resolving ability's own target cards, cast one at a time in the order the player picks, each a "may" of its own — Diluvian Primordial's "for each opponent, you may cast up to one target instant or sorcery card from that player's graveyard" (one `{ seat }` slot per opponent). `then` / `else` are "if you do" / "if you don't" (declined or nothing castable): Conduit of Worlds' `prohibit`, Breaching Dragonstorm's `return-to-hand` from exile, Baral and Kari Zev's token. A `sequence` step after it waits for the answer, and an instant or sorcery casting one stays on the stack until it's cast (608.2n). `from: { handOf, look? }` is another player's hand, seen whole: Silent-Blade Oni's "look at that player's hand. You may cast a spell from among those cards" (`look`: still looked at with nothing to cast), Mindclaw Shaman's after a `reveal-hand`; the caster controls the spell and its owner still owns it (rule 108.3). |
| `look-and-choose`, untargeted picks | `zone: "graveyards"`, `"graveyard"` + `from`, `"exile"` + `from` | "Exile a card from a graveyard" is `zone: "graveyards"`, `min: 1, max: 1`, `destination: "exile"` (linked unless `unlinked`), "**another** card" `filter: { isSource: false }` (Cemetery Desecrator, dying). "Then choose a card from their graveyard" is `zone: "graveyard"`, `from: { target: 0 }` (Dreams of Steel and Oil); "for each player, choose a card in that player's graveyard. Put those cards onto the battlefield under your control" a `for-each-player` with `choicesHeld` over `from: "that-player"` (Breach the Multiverse). "A **face-up** exiled card they own" is `zone: "exile"`, `from`, `filter: { faceDown: false }`, into its owner's graveyard (Binding Negotiation); "an exiled card named X" `filter: { name }`, `under: "owners"` (Sengir Nosferatu's Bat). A graveyard with nothing that may be chosen asks nothing. |
| `look-and-choose`, the cards just exiled | `zone: "exiled-this-way"`, `destination` | The cards this resolution exiled, still in exile as the same objects, the chooser looking at them though they're face down: Scroll Rack's "then look at the exiled cards and put them on top of your library in any order" (`destination: "library-top"`, `min` and `max` `{ thisWay: "exiled" }`, picked in order, first on top; one card asks nothing). With `chooser: "an-opponent"`, "search … and exile them. **An opponent chooses one of those cards. Shuffle that card into your library.** You may cast the other cards without paying their mana costs" (Emergent Ultimatum): a `search-library` to `"exile"` with `shufflesLater`, this look of `min`/`max` 1 to `"library-top"`, `shuffle-library` of `searchers: true` (the one shuffle, owed even with nothing found — rule 701.24d), then `cast-now` of `from: "exiled-this-way", repeat, free`. "Put that many cards from the top of your library into your hand" is a `zone: "library"` look with `count`, `min` and `max` all "that many": taking everything looked at is never asked. |
| `look-and-choose` | `zone: "library" \| "graveyard" \| "hand" \| "graveyards" \| "command"` (`"command"`: your own commanders in the command zone — Command Beacon's "put your commander into your hand from the command zone", `min: 1, max: 1`, one of your choice with two; Hellkite Courser's "you may put a commander you own from the command zone onto the battlefield", whose `then` gives it haste and a delayed `put-in-command-zone`), `enterAs?`, `count?`, `min`, `max`, `destination`, `leftover: "bottom-random" \| "bottom-any-order" \| "stay" \| "hand" \| "graveyard" \| "exile" \| "exile-playable"` (`"exile"`: "exile the rest", face up and linked to nothing — Desperate Research; with `leftoverCounters: { kind, amount }` each gets those counters there — Karn, Scion of Urza's "exile the other with a silver counter on it"), `playable?: { duration: "end-of-turn" \| "while-exiled", spendAs? }` (with `destination: "exile"` or `"exile-face-down"`, the picks may be played by you: Florian, Voldaren Scion's "exile one of those cards … You may play the exiled card this turn", Black Cat, Cunning Thief's "for as long as they remain exiled. Mana of any type can be spent" — `spendAs: "any-type"`), `leftoverIf?`, `filter?`, `enterTapped?`, `attacking?` (as `create-token`'s: Kaalia's "onto the battlefield tapped and attacking that opponent", Winota) | Ureni of the Unwritten; **`leftover: "bottom-any-order"`** is "…and the rest on the bottom of your library **in any order**" (Stock Up, Dig Through Time, Experimental Augury, Growing Rites of Itlimoc): once the chosen cards have moved, the chooser orders the rest — a second `choose-from-zone` over all of them with `order: true`, the first picked highest (rule 401.4), asked only for two or more cards that aren't all one card; `then` and a `sequence`'s next step wait for it. `"bottom-random"` is "in a random order" — never use it for "any order". **`destination: "library-bottom"`** puts the chosen cards on the bottom in the order picked, the last on the very bottom: with `zone: "hand"`, Valakut Awakening's "put any number of cards from your hand on the bottom of your library" (`min: 0`, `max: { cardsInHand: "you" }`), counted as `{ thisWay: "put-on-bottom" }` for its "draw that many cards plus one". **`destination: "reveal"`** with `zone: "hand"` moves nothing: "reveal any number of green cards in your hand" (the Urza's Destiny Scents, Rofellos's Gift, Brine Seer — `min: 0`, `max: { cardsInHand: "you" }`, `filter: { colors: ["G"] }`, `leftover: "stay"`) reveals the chosen cards where they are (rule 701.20a), and the `sequence`'s next effect reads them as `{ thisWay: "revealed", who: "you" }` ("you gain 2 life for each card revealed this way" is a `product`; "unless its controller pays {1} for each" a `payGeneric`); with nothing matching in hand nothing is asked (`reveal-from-hand.test.ts`). Not in a mana ability, which can't stop to ask (Metalworker); Teferi's Puzzle Box puts the whole hand there (`min` and `max` both `{ cardsInHand: "that-player" }` — `min` takes a live amount too). "Look at the top three cards of your library, then put them back in any order" (Halimar Depths, Sensei's Divining Top) is Ponder's shape: every one chosen, `destination: "library-top"`, `leftover: "stay"`; Genesis Ultimatum uses `leftover: "hand"` — every non-chosen looked-at card goes to hand, regardless of `filter` (needed-cards P19); `"graveyard"` is "…and the rest into your graveyard", in the same move as the chosen cards. **`zone: "hand"`** is the "you may put a land card from your hand onto the battlefield" family (Growth Spiral, Ghalta, Terrain Generator): `min: 0` is the "you may", `leftover: "stay"` leaves the rest of the hand alone, and it bypasses the land-drop rule because putting a land onto the battlefield is not *playing* one. **`then`** is applied once the choice is answered, with the **chosen cards as its targets** — the only way to say anything about a card that was chosen rather than targeted (Sneak Attack's "that creature gains haste").; **`chooser: "an-opponent"`** is "reveal the cards in your library. An opponent chooses …" (Guided Passage): the controller picks which opponent once the cards are revealed, asked among two or more; **`under: "you"`** puts battlefield-bound picks under the effect's controller's control (Scrounge's "target opponent chooses an artifact card in their graveyard"; inside a `for-each-player` with **`choicesHeld: true`** the players choose in turn and the cards enter together, none chosen twice — Dredge the Mire, Rejoin the Fight); **`split`** (`[{ label, filter, destination, enterTapped? }, …]`) sends each chosen card to the first case it matches, the effect's `destination` otherwise — Zimone's Experiment's "put all land cards revealed this way onto the battlefield tapped and put all creature cards revealed this way into your hand"; **`from`** also reads another player's **graveyard** (Grime Gorger's "from defending player's graveyard", `"trigger-player"`); `filter: { thisWay: "discarded" }` finds a discarded card a replacement exiled, as `"milled"` does (Queen Kayla bin-Kroog); **`together`** (a `search-library`'s `SearchTogether`) is a rule over the chosen set: `{ oneEachTypeAmong: { spellsYouCastThisTurn: filter } }` is a slot per card type among those spells, read as it resolves (Hurkyl, Master Wizard); `{ totalManaValueAtMost: amount }` caps the chosen cards' total mana value, choosing none allowed (Smelting Vat, Ao, the Dawn Sky); a one-each's `min` is clamped to the largest set that can fill a slot each (Guided Passage's "ignore those types"); `{ oneEach: [{ label, filter }, …], text? }` is "for each card type, you may put a card of that type from among the revealed cards into your hand" (Atraxa, Grand Unifier: nine slots, `max: 9`, `text: "a card of each card type"`) and "you may reveal a Cleric card, a Rogue card, a Warrior card, and/or a Wizard card from among them" (Harper Recruiter, `reveal: "chosen"`) — a card fills any slot it matches, one card a slot (Atraxa's ruling: an artifact creature is the artifact or the creature), only a card fitting some slot may be chosen, and the client gates Confirm on the matching; the scaffolder reads both three-sentence shapes whole (`choose-across-zones.test.ts`). `leftoverIf: { condition, leftover }` is a leftover destination decided once the chosen cards have moved — Nine-Fingers Keene's "you may put a Gate card from among them onto the battlefield. Then if you control nine or more Gates, put the rest into your graveyard. Otherwise, put the rest on the bottom of your library in a random order" is `leftover: "bottom-random"` with `leftoverIf: { condition: { kind: "controls", filter: { subtype: "Gate" }, atLeast: 9 }, leftover: "graveyard" }`, and the Gate just put onto the battlefield counts `max` may be live, read as it applies, as `count` may. `secondPick?: { filter?, min, max, destination, enterTapped? }` is a second choice over the looked-at cards the first left, asked once the first's cards have moved; `leftover` waits for it and takes the rest in the same move as the second's cards — Choco, Seeker of Paradise's "You may put one of them into your hand. Then put any number of land cards from among them onto the battlefield tapped and the rest into your graveyard." With nothing the second could take, the rest go at once. Expressive Iteration is a hand pick, a `secondPick` with `destination: "library-bottom"`, and `leftover: "exile-playable"` — the rest exiled face up, playable (a land too) this turn. `destination: "library-top"` puts the chosen cards back in the order picked, the first on top (Ponder, Brainstorm), and the client numbers the picks. `destination: "exile-face-down"` is hideaway's "exile one of them face down" (rule 702.75a): the chosen card is exiled face down, seen only by the chooser, and linked to the source (607.2a) — use the `hideaway(n, …)` helper. `destination: "exile"` is the same link, face up (`unlinked: true` drops the link, for an exile no "the exiled card" refers to — Shadow Kin) — imprint's "you may exile a nonartifact, nonland card from your hand" (Chrome Mox: `zone: "hand"`, `min: 0`, `leftover: "stay"`), read back by an `add-mana` `colorAmong` with `zone: "exiled-with-source"`. `secondPick.ifNoneChosen` asks it only when the first took nothing — Planar Genesis's "You may put a land card from among them onto the battlefield tapped. **If you don't**, put a card from among them into your hand." `reveal: true` shows every looked-at card (Gishath's "reveal that many cards"); `reveal: "chosen"` shows only the cards taken, as they're taken — "look at the top five cards … You may **reveal** a historic card from among them and put it into your hand" (Monumental Henge, Adaptive Omnitool) — a `secondPick`'s too. `player: "that-player"` inside a `for-each-player` makes it that player's zone, look and choice, the cards theirs: Explore the Vastlands' "each player looks at the top five cards of their library and may reveal a land card and/or an instant or sorcery card from among them" is a `for-each-player` (`"each-player"`, the active player first) of a land pick with an instant-or-sorcery `secondPick`, both to hand, `reveal: "chosen"`, `leftover: "bottom-random"`. **`zone: "graveyards"`** is every player's graveyard (public, in turn order): a card from someone else's that goes to the battlefield goes under the chooser's control, kept there by a control effect — Necromantic Selection's "return a creature card put into a graveyard this way to the battlefield under your control" (`filter: { type: "creature", token: false, thisWay: "died" }`, `min: 1, max: 1`). **`enterAs: { setTypes?, addSubtypes?, addColors? }`** is "It's a black Zombie in addition to its other colors and types": in place as the cards enter (rule 614.12), as `put-onto-battlefield`'s types are. **`chooser: "that-player"`** has someone else choose from the zone, still the effect's controller's (or `player`'s): the opponent a `choose-opponent` chose — Tasigur's "a nonland card of an opponent's choice from your graveyard" — or a library they look at, inside a `for-each-player` of the target: Tahngarth's Glare's "that player looks at the top three cards of your library, then puts them back in any order" (only they see them; the cards stay yours). **`zone: "targets"`** is the resolving ability's own target cards still in a graveyard: which of them it does it to is chosen as it resolves, and they all go at once — Sepulchral Primordial's "for each opponent, you may put up to one target creature card from that player's graveyard onto the battlefield under your control" (one optional `{ seat }` slot per opponent, `min: 0`; they enter simultaneously, its ruling), under your control as `"graveyards"`' are.  **`from: PlayerRef`** is another player's library, the effect's controller still looking and choosing: "look at the top three cards of target player's library, then put them back in any order" (Architects of Will: `from: { target: 0 }`, `min`/`max` the count, `destination: "library-top"`), "you may put that card into their graveyard" (Draugr Thought-Thief: `destination: "graveyard"`, `min: 0`), "that player reveals the top two cards… You choose one… into their graveyard" (Balshan Beguiler: `from: "trigger-player"`, `reveal: true`). **`leftover: "top-any-order"`** is "…and the rest on top of their library in any order" (Cruel Fate, Sealed Fate): the rest stay on top and the chooser orders them. `look-at-another-library.test.ts`. **`zone: "exile"`** is the exile zone, only the cards that may be chosen shown: a processor's "you may put a card an opponent owns from exile into that player's graveyard. If you do, …" is a `may` of a `sequence` — this with `filter: { ownedBy: "opponent" }`, `min: 1, max: 1`, `destination: "graveyard"` (each card to its owner's), `leftover: "stay"`, then a `conditional` on `{ kind: "this-way", what: "chosen" }` (Wasteland Strangler); "two cards your opponents own … into their owners' graveyards" adds **`needsMin: true`** — all of `min` or nothing, as a cost is (Ulamog's Nullifier, with `atLeast: 2`). With `from` it's the cards that player owns: Oblivion Sower's "any number of land cards that player owns from exile onto the battlefield under your control" (`from: { target: 0 }`, `filter: { type: "land" }`, under the chooser's control), Memory Theft's "a card that has an Adventure that player owns from exile into that player's graveyard" (`filter: { hasAdventure: true }`, `min: 0`). A face-down card there (exiled face down, or foretold) has no characteristics: it's choosable only when `filter` asks nothing but its owner, hidden from a chooser who can't look at it, and taken from its group at random (the processors' ruling). **`zone: "exiled-with-source"`** is only the cards in exile linked to this source (rule 607.2a — an `exile`'s, `exile-graveyard`'s or a search's `linked`), in the stint the ability refers to, an "until this leaves" exile's too, `destination: "hand"` each to its owner's hand (Bag of Devouring's "up to X … where X is the result", `max: { roll: "total" }` in a `roll-dice`'s `then`), `destination: "stay"` moving nothing, for `then` to act on as target 0 (Lazav, Wearer of Faces: `then: { kind: "become-copy", target: "source", of: 0, ofCard: true, until: "end-of-turn" }`), `under: "owners"` for a "return" (Purgatory's "return a card exiled with this enchantment to the battlefield", rule 610.3c), otherwise under the chooser's control: Nautiloid Ship's "you may put a creature card exiled with this Vehicle onto the battlefield under your control" (`min: 0, max: 1, filter: { type: "creature" }, destination: "battlefield"`), Chaos Shrine's Black Crystal's "… with a finality counter on it" (`withCounters`); `enterTapped`, `enterAs`, `attacking` and `then` ride along as on any other zone. `put-exiled-into-graveyard.test.ts`. |

### Turn structure / cast-triggered

`control-player { target, controller?, during?, extraTurnAfter? }` ("you control target player during that player's next turn", rule 723; Mindslaver, Worst Fears: `target` the slot of the player controlled, `controller` a slot when it isn't this effect's controller, Cruel Entertainment's two; `during: "next-combat"`, Secret of Bloodbending; `extraTurnAfter`, Emrakul, the Promised End's "after that turn, that player takes an extra turn". Only who answers changes: `player-control.ts`.) `choose-combat { attackers?, blocks?, blockIfAble?, thisCombat? }` (`thisCombat`: "you choose which creatures block **this combat**", Odric, Master Tactician — ends with that combat) ("you choose which creatures attack this turn" and "which creatures block this turn and how those creatures block", `blocks: "all"`, Master Warcraft; "creatures your opponents control block this turn if able, and you choose how those creatures block", `blocks: "opponents", blockIfAble: true`, Brutal Hordechief: a rule over the rest of the turn, a creature arriving later too). `castOnlyIf: { kind: "before-attackers-declared" }` is Master Warcraft's "cast this spell only before attackers are declared". `skip-turn { who?, count? }` ("you skip your next turn", rules 500.11, 614.10; Meditate, Eater of Days' `count: 2`: `who` a player slot or scope, `"you"` by default. The next turn of theirs to begin, an extra one as readily as any other, passes as though it didn't exist; what waits for "their next turn" waits for the first not skipped, and two effects skip the next two, 614.10a; `skip-turn.test.ts`), `take-extra-turn { target?, skipUntapStep?, thatTurn? }` (`thatTurn` is what the effect says about that turn alone, taken up as it begins and lost if it's skipped: `damageCantBePrevented` — Alchemist's Gambit — and `atEndStep: { effect, text }`, "at the beginning of that turn's end step, you lose the game", Warrior's Oath's delayed ability, which lapses unfired if that end step never comes; the effect's controller, or with `target` the player in that slot — Time Warp's "target player takes an extra turn"; taken directly after this turn, the most recently created first, and the rotation then carries on from the turn it followed — rule 500.7), `additional-combat { afterThisPhase?, withMain? }`, `additional-upkeep-steps { amount }` (below), `additional-land-drop { amount }` (Explore's "You may
play an additional land this turn"), `untap-all { filter, controlledByTarget?, exceptSource?, who? }` (`exceptSource`: Combat Celebrant's "untap all **other** creatures you control"; `who`, a `PlayerScope`, has each of those players untap what matches `filter` from their own side — Curse of Bounty), `storm { of? }`
(`of: "trigger-object"` copies the trigger's spell rather than the source: a `nextSpell`
delayed trigger's "the next instant or sorcery spell you cast this turn has storm" — Storm, Force
of Nature),
`cascade`, `copy-spell { target, newTargets?, except?, gains?, ifTargets?, otherwise?, retargetTo?,
forEachItCouldTarget?, count?, controller? }`, `copy-ability { target, newTargets? }`,
`change-targets { target, how, to?, optional? }`,
`exile-spell-as-it-resolves { returnAtNextEndStep? }`,
`shuffle-library` (the effect's controller shuffles — Ponder's "You may shuffle" inside a `may`). `exceptTop: n` shuffles all but the top `n`, those staying on top — Lim-Dûl's Vault's "then shuffle and put the last cards you looked at this way on top in any order" (its ruling: shuffle the rest, then a `look-and-choose` `top-any-order` of the five).

`copy-spell` copies a spell with every choice made for it (modes, X, targets, kicker and the
other costs paid — rule 707.10); a copy of a permanent spell becomes a token as it resolves.
`target` is a target slot (Twincast, Narset's Reversal), `"source"` — "copy this spell", the
spell now resolving (Sevinne's Reclamation) — or `"trigger-spell"`: the spell whose
casting fired this trigger, as it last was on the stack if it has gone since (Shiko and Narset,
Unified; a `delayed-trigger` at `nextSpell` — Adaptive Training Post). `newTargets: true` is
"you may choose new targets for the copy" (rule 707.10c), asked as a `choose-targets` decision;
storm always asks, one copy at a time. `ifTargets: "permanent-or-player"` copies only a spell
that targets one, and `otherwise` is "if you don't copy a spell this way, …". `controller`
(an `PlayerRef`) puts the copy under another player, who chooses its new targets —
demonstrate's "that player copies the spell" (`"that-player"` under a `choose-opponent`).
`except` (a `CopyExceptions`, as `create-token-copy`'s) is "copy it, **except** …" — rule
707.9, the copy's copiable values (707.9b), kept by the token a permanent spell's copy becomes
(707.10f) and copied by anything that copies it: Iron Man's "except the copy isn't legendary"
(`{ notLegendary: true }`; Double Major's "except it isn't legendary if the spell is legendary"
is the same), Tawnos's "except the copy is an artifact in addition to its other types"
(`{ addTypes: ["artifact"] }`), Donal's "a 1/1 Spirit in addition to its other types"
(`{ basePt: [1, 1], addSubtypes: ["Spirit"] }`). `gains: { keywords?, triggered?, ifPermanent? }`
is "the copy **gains** haste and 'At the beginning of the end step, sacrifice this permanent'"
(Nalfeshnee, Choreographed Sparks): an effect on the copy with no end, not a copy exception, so
it goes on applying to the permanent it becomes (rule 400.7a) and a copy of that has none of it;
`ifPermanent` is "if the copy is a permanent spell" (110.4b), read on the copy.
`copy-spell-changes.test.ts`. Neither with `forEachItCouldTarget`. With
`"trigger-spell"`, two more aim the copy themselves:

- `retargetTo: "source" | slot` — "the copy targets Ivy" (rule 707.10e — Ivy, Gleeful
  Spellthief): every target of the copy is that one instead, and if it isn't a legal target
  for each of them (as the copy's controller would choose it), no copy is made and `otherwise`
  applies. A slot the spell's own rules filled isn't a target and keeps what it had. Wrap it in
  a `may` for "you may copy that spell".
- `forEachItCouldTarget: { filter, other? }` — "copy that spell for each other creature you
  control that the spell could target. Each copy targets a different one of those creatures"
  (rule 707.10d — Zada, Hedron Grinder: `{ filter: { type: "creature", controlledBy: "you" },
  other: true }`). One copy per battlefield permanent matching `filter` that is a legal target
  for every one of the spell's targets — a token stack counting as each of its tokens, each
  split off — and with two or more, their controller orders them: a `choose-permanents`
  naming every one, the copy for the first named going on the stack first (so resolving
  last). With `controller: "trigger-controller"`, the caster makes them, `filter` from their
  side (Mirrorwing Dragon); "could target" is always the caster's, even when another player
  makes the copies (Ink-Treader Nephilim's ruling: such a copy may then not resolve). `other:
  "targeted"` leaves out what the spell targets rather than the source ("each other Golem" —
  Precursor Golem). `chooseAndPayEach: "{2}"`: "you may choose any number … and pay {2} for each
  … for each of those creatures, copy that spell" (Feather, Radiant Arbiter), as many offered
  as can be paid for.
- **Gravestorm** is `gravestorm()` (helpers.ts, rule 702.69a): a `this-cast` `copy-spell` with
  `newTargets` and a `count` of `{ turnHistory: "to-graveyard", who: "each-player", from:
  ["battlefield"] }`, tokens included, read as it resolves (Ominous Harvest).

`count` is "copy it **for each** …", an `EffectAmount` read as the effect
applies: Thousand-Year Storm's `{ triggerValue: true }` off a cast trigger's
`countCastBefore` (§9), Thunderclap Drake's `{ commanderCasts: "you" }`. With
`newTargets`, each copy is asked about in turn, as storm's are; 0 copies
nothing (and applies `otherwise`).

`change-targets { target, how, to?, optional?, by? }` changes the targets of the
spell or ability in target slot `target` (a `{ kind: "stack" }` target, §7)
as it resolves, its controller choosing (rule 115.7; `by: "its-controller"`
for "the spell's controller may choose new targets for it", Sudden
Substitution): `how: "change"` —
"change the target(s)", every one to another legal target or none, and it
must change if it can (Bolt Bend, Redirect Lightning, Untimely Malfunction);
`"change-one"` — "change a target" (115.7b); `"choose-new"` — "you may
choose new targets", any of them, a kept one even if no longer legal
(Deflecting Swat, Wild Ricochet). New targets are legal as the spell's own
controller would choose them, never the spell itself (115.5); a divided
amount keeps its division (115.7f); each new target "becomes the target"
(ward, Phantasmal Image). `to: "source"` — "…to this creature": the only
new target is the effect's own permanent, if it's legal (Spellskite's
`"change-one"`, Hydroelectric Specimen); `optional: true` — "you may change"
(Hydroelectric Specimen). Asked as a `choose-targets` decision with `current`
(`GameState.pendingRetarget`) unless forced, and nothing at all when nothing
can change. Steps after it in a `sequence` wait for the answer (Imp's
Mischief's life loss, Wild Ricochet's copy).

`copy-ability` copies an **activated or triggered ability** on the stack (rule
707.10): the one in target slot `target` — a `{ kind: "ability" }` target
(§7; Lithoform Engine, Weaver of Harmony, Vantress Visions) — or with
`"trigger-ability"` the one whose activation fired an `activates-ability`
trigger (Illusionist's Bracers); `count` copies it that many times ("X
times" — Gogo, Master of Mimicry: `"x"`; each copy asked about new targets in
turn), as it last was on the stack if it has been
countered since (`GameState.departedAbilities`). The copy has the original's
source (707.10b — so it's the same ability for "the Nth time this ability has
resolved this turn"), modes, targets, X, trigger object and what paid its
costs (the creature it sacrificed, 707.10), one instance of a stacked one,
under the effect's controller; choices made as it resolves are made again (a
"you may pay"), and it isn't activated. `newTargets: true` asks for new
targets as `copy-spell`'s does, judged from the ability's source for the
copy's controller. A delayed trigger's captured objects ("that creature",
carried in its target slots) aren't targets, and stay. Neither copy is ever
offered itself as a new target (rule 115.5) — a copy of Lithoform Engine's
ability, or of Increasing Vengeance, could otherwise aim at itself.

`copy-all { what: "spells" | "other-abilities", newTargets? }` is "copy all spells you control" /
"copy all **other** activated and triggered abilities you control" (Ulalek, Fused Atrocity — the
two in a `sequence` for "…, then …"): each one the effect's controller has on the stack as it
begins, copied once (a stacked ability once per instance; the resolving ability left out), the
copies themselves never copied again. With two or more left the controller picks which goes next
(a `choose-modes` question), and `newTargets` asks each copy's new targets as it's made.

`exile-spell-as-it-resolves` is Feather, the Redeemed's "exile that card instead of putting it
into your graveyard as it resolves. If you do, return it to your hand at the beginning of the
next end step" (`returnAtNextEndStep: true`), on a cast trigger: it marks the trigger's spell
(`GameObject.exileAsItResolves`), which then waits on the spell. Only resolving uses it — a
spell countered or fizzling goes to the graveyard as usual — and only for a card its owner (the
effect's controller) would put into their own graveyard: never a copy, a spell they don't own,
or one whose own text moves it (`exileOnResolve`, `shuffleIntoLibraryOnResolve`). It holds
after the trigger's source has left. When another replacement would exile it too (flashback,
a Kess-style permission, Rest in Peace, an Adventure), its owner chooses which applies first
(rule 616.1) — a `choose-modes` decision; only Feather's brings the card back. `plotted: true`
is Lilah, Undefeated Slickshot's "if you do, it becomes plotted" (rule 702.170): the card it
exiles is plotted; exiled by the other replacement instead, it isn't. `anyOwner: true` is "exile
it instead of putting it into **a** graveyard" on "whenever **a player** casts …" (River Song's
Diary): whoever owns the spell, who also makes the rule 616.1 choice; `linked: true` exiles the
card **with** the effect's source (rule 607.2a, Imprint), for `exiled-with-source` reads.

`become-plotted { target }` is "if you do, it becomes plotted" after an instruction that
exiled a card (rule 702.170c) — the `then` of an exiling `look-and-choose`, whose chosen card is
its target 0: Kellan Joins Up's "you may exile a nonland card with mana value 3 or less from
your hand" (`zone: "hand"`, `leftover: "stay"`), Make Your Own Luck's "exile a nonland card
from among them" (the library's top three). Nothing chosen, nothing plotted; a card no longer in
exile or a token does nothing. "Exile target spell. It becomes plotted" (Aven Interrupter's
enters trigger) is an `exile` of the spell (it leaves the stack uncountered) then a
`become-plotted` of the same slot: the card's owner may cast it on a later turn, and a cost
increase still applies to that free cast (the Interrupter's own {2} on an opponent's).

`become-foretold { target, costReducedBy? }` is "it becomes foretold" (rule 702.143d): a card an
instruction just exiled is a foretold card, face down, its owner's to look at and to cast for any
foretell cost it has after this turn, even with the source gone or under another's control. Not
foretelling it: `card-foretold` isn't emitted. `target` is the `then` of an exiling
`look-and-choose`'s target 0 (Ethereal Valkyrie: `zone: "hand"`, `destination: "exile-face-down"`,
`unlinked`), or `"exiled-this-way"` after an `exile` (The Foretold Soldier's "exile it face down").
`costReducedBy: 2` is "its foretell cost is its mana cost reduced by {2}", generic mana only, on the
mana cost of the face cast, a land face never: a card that has its own foretell cost has both
(`via: "foretell"` the printed, `via: "foretell-given"` this, offered unless they're equal). No
mana cost, no cost given. Dream Devourer's `grantsToHand` foretell gives one the same way
(`GameObject.foretoldReducedBy`).

**Cards chosen for each to have something done to them** ("choose two cards in your hand drawn this
turn. For each of those cards, pay 4 life or put the card on top of your library" — Sylvan Library): a
`look-and-choose` with `destination: "stay"`, its `filter`, its own `prompt` (what `"stay"` can't say)
and `givesUp` (the picks are what's at stake, so a bot picks its worst), and `then` a `for-each-target`
of a `may` with `costLife`, an empty `sequence` as its `effect`, and the other side as its `else`. A
`may`'s **`aboutTarget`** names the card in that slot beside the prompt (the offer's `aboutCard`), which
a prompt can't when it's in a hand. Nothing eligible asks nothing.

**A card from a hand, face down**: a `look-and-choose` with `zone: "hand"`, `destination:
"exile-face-down"`, `leftover: "stay"`, linked to the source (rule 607.2a). **`faceDownLooks`** says
who may look at it (406.3). Left out, as hideaway: the chooser and whoever comes to control the source
(Bane Alley Broker's "you may look at cards exiled with this creature"). `"chooser"`: the chooser
alone (Gustha's Scepter's "you may look at it for as long as it remains exiled"). `"nobody"`: no more
said (Summoner's Egg). Getting one back is a `look-and-choose` from `zone: "exiled-with-source"`, or
`return-exiled-by-source`; `turn-exiled-face-up` shows them all.

`look-at-face-down { target? | filter? }` is a one-time look at face-down permanents the effect's
controller doesn't control (rule 708.5), in a look they close, as `look-at-hand`'s is, and not later
(Smoke Teller's ruling), nobody else learning anything. `target` is a slot holding the permanent
("look at target face-down creature": a `{ kind: "permanent", filter: { type: "creature", faceDown:
true } }` slot) or a player ("any face-down creatures they control", Spy Network); `filter` every one
it matches (Revealing Wind's "each face-down creature that's attacking or blocking"). None to look at
asks nothing. `reveal: true` is "**reveal** target face-down permanent" (Hauntwoods Shrieker): shown to
every player (rule 701.20a), whoever controls it, and still face down; "if it's a creature **card**"
after it is the `target` condition's `cardTypes: ["creature"]` (with `filter: { faceDown: true }`),
which reads the printed card — a face-down permanent is always a creature, so a filter can't ask. "Any time" is a static's `visibility` (Keeper of the Lens), or a `grant-static` of it
for a turn (Lumbering Laundry).

**What a source reads off the cards exiled with it** (rule 607.2a). The condition `{ kind:
"exiled-with-source", atLeast, now: true }` counts those still in exile, for a static (Veteran
Survivor's "three or more cards exiled with this creature"), an intervening if (Smirking Spelljacker's
"if a card is exiled with it") or an amount's `ifCondition` (Ugin's Labyrinth's "add {C}{C} instead");
without `now` it's every card ever exiled with it this stint (Colfenor's Urn). `filter` narrows `now`,
and `cardTypes: true` counts the card types among them instead (Keen-Eyed Curator's "four or more card
types"); a face-down card has no type. `sameNameWith: "exiled-with-source"` in a trigger's filter
(Circle of Confinement), a prohibition (Circu, Ixalan's Binding) or a target (Mindreaver, which still
reads it with the source sacrificed for the cost) is "the same name as a card exiled with this"; a
face-down card has no name to share (rule 406.3a).

`end-the-turn` is "End the turn" (rule 724.1: Time Stop, Ultima, Glorious End)
and `end-the-combat-phase` "End the combat phase" (724.2: Mandate of Peace, the
one card), neither with a field. Every trigger waiting ceases to exist and the
stack is exiled, this spell or ability included, so nothing is countered and
nothing resolves; state-based actions follow, then the skip to the cleanup step
or the next phase. Write the rest of the text in order: what comes before it
happens first (Ultima's destroy-all, whose dies triggers then vanish), and what
comes after still happens (Glorious End's delayed trigger). "The player whose
turn it is may end the turn" is an `each-player-may` of `who: "active-player"`
(Obeka, Brute Chronologist).

`additional-combat` alone is Aggravated Assault's "after this main phase,
there is an additional combat phase followed by an additional main phase":
both come after the postcombat main phase. `afterThisPhase: true` puts the
combat phase **straight after the combat phase under way** instead (Karlach,
Fury of Avernus; Anzrag: "after this phase, there is an additional combat
phase"), and `withMain: true` adds "followed by an additional main phase"
(Najeela, the Blade-Blossom) — one more main phase before the rest of the
turn. Use it from a combat trigger; the `turn-structure` condition's
`combatPhase: 1` is "if it's the first combat phase of the turn", which is
what stops Karlach's trigger adding a third.

`additional-upkeep-steps { amount }` is Obeka, Splitter of Seconds' "you get
that many additional upkeep steps after this phase" (`amount: { triggerValue:
true }` on its combat damage trigger). An upkeep step lives in a beginning
phase, so each is an additional beginning phase straight after the combat
phase under way with its untap and draw steps skipped (rules 500.10, 500.11);
"at the beginning of your upkeep" triggers and suspend's counters run in each,
a delayed "next upkeep" waits for it, and then the turn goes on to the
postcombat main phase. Phases added after the same combat phase go most
recent first (500.8), so an additional combat made during end of combat comes
before the upkeeps. Nothing is added on another player's turn (500.10a), and
only a combat phase can be "this phase" — use it from a combat trigger.

`additional-beginning-phase` (no fields) is Sphinx of the Second Sun's "there
is an additional beginning phase after this phase": untap, upkeep and draw
steps straight after the postcombat main phase or the combat phase under way
(rule 500.8), most recent first among phases added after the same one. Then
the turn goes on as it would have after that phase — to the ending phase
from a postcombat main phase (the rulings), to the main phase from a combat
phase (Cyclonus, Cybertronian Fighter). It's the turn's own, whoever's
ability it is (Shadow of the Second Sun's enchanted player), and still the
same turn: permanents untap and a card is drawn, but summoning sickness
doesn't wear off (302.6) and "until your next turn" doesn't end. Nothing from
a beginning phase or a precombat main phase.

`additional-end-step` (no fields) is Y'shtola Rhul's "there is an additional
end step after this step" (rule 500.9): another end step straight after the
one under way, no cleanup step between (its ruling), so "until end of turn"
lasts through it. "At the beginning of the end step" triggers again in it, and
a delayed "next end step" made during the first fires in it. Only from an end
step; "if it's the first end step of the turn" is a `conditional` on
`{ kind: "turn-structure", endStep: 1 }`.

### Format extras

**Rolling dice** (rule 706) is `{ kind: "roll-dice", sides, count?, modifier?, table?, then? }` (`modifier` is signed — The Deck of Many Things' "subtract the number of cards in your hand" is `{ product: [{ cardsInHand: "you" }, -1] }`, and a row with a low `min` and `max: 0` is "0 or less"; a row's `mayRollAgain: true` is its "You may roll again", Delina, Wild Mage, rule 706.3c):
the controller rolls `count` (1 by default; 0 rolls nothing) `sides`-sided dice
as one roll on the seeded stream. `sides: "planar"` alone is "**Roll the
planar die**" (Fractured Powerstone): Planechase's die (rule 901.3), which
no game the engine plays has, so nothing happens — no roll, no roll trigger
(rule 101.3 and the card's ruling). `table` is a results table (706.3a) — rows
`{ min, max?, effect }`, the first holding the result applying (no `max` is
"N+"); `then` follows any row. Amounts read the roll: `{ roll: "total" }` is
the result (the natural total plus `modifier`), `{ roll: "odd" }` /
`{ roll: "even" }` how many dice came up odd / even (Clown Car), `{ roll: {
equals: 6 } }` how many came up 6. "Whenever you roll one or more dice" is the
trigger `{ on: "event", event: "rolls-dice", who: "you" }`, once per roll (Brazen Dwarf), its
`triggerValue` the natural total. Every viewer sees the dice thrown and land on
the engine's results (the `dice-rolled` event). "Roll two d12 and choose one
result" is a `choose-value` of `value: "roll-result"` as the `then`, asked only
when the dice differ: its own `then` reads the chosen one as `"x"` (a filter's
`n: "x"` too) and "the other result" as `{ roll: "other" }` (Reckless Endeavor,
Valiant Endeavor, Wild Endeavor). Not yet: "roll an extra die and ignore the
lowest", "roll again", and each player rolling.

**The Ring tempts you** (rule 701.54) is `{ kind: "the-ring-tempts-you" }`: the
effect's controller gets the Ring emblem if they have none, chooses a creature
they control as their Ring-bearer (asked, never declined), and is tempted — the
count goes up and the emblem gains its next ability (`ring.ts`). With no
creature they're still tempted (701.54d). "Whenever the Ring tempts you" is the
trigger `{ on: "ring-tempts", who: "you" }`, the creature chosen its trigger
object; `chosen: true` is "whenever you choose a creature as your Ring-bearer"
(Call of the Ring). "Your Ring-bearer" is the filter clause `ringBearer: true`
(Frodo's "if Frodo is your Ring-bearer" is a `source` condition of it), and "the
Ring has tempted you N or more times" the condition `{ kind: "ring-tempted",
atLeast: N }`. The emblem's "legendary and can't be blocked by creatures with
greater power" is built in. Not yet: "a creature other than ~", "your
Ring-bearer's power", and Nazgûl's nine-copy deck rule.

**Coven** (Innistrad: Midnight Hunt's ability word) is the condition `{ kind: "coven" }`: three or more distinct powers among the creatures you control, read as it's checked — an intervening-if's `condition` ("at the beginning of combat on your turn, if you control three or more creatures with different powers", checked again on resolution) or an activated ability's "Activate only if …". The scaffolder writes both.

**Day and night** (rule 731): "whenever day becomes night or night becomes day" is `{ on: "day-night-changes" }` (`becomes: "night"` for one direction) — the first "it becomes day", from neither, isn't one (731.1a). "If it's neither day nor night, it becomes day as this creature enters" is `becomesDayAsEnters: true` (daybound does it through the keyword); "if it's night" is the condition `{ kind: "day-night", is: "night" }`; "it becomes night" is the `day-night` effect.

**Training** (rule 702.149 — Innistrad: Midnight Hunt and Crimson Vow) is `training()` from `helpers.ts` in `triggered` (the scaffolder writes it out): an `attacks` trigger with `withGreaterPower: true` — this creature and another with greater power attacking, judged as it triggers — putting a +1/+1 counter on it marked `training: true`. "Whenever this creature trains" (702.149c) is `{ on: "trains", who: "self" }`, which only that marked counter fires. "Creatures you control have training" grants `training()` with `grantsTriggered`, each instance triggering apart (702.149b).

**Exploit** (rule 702.110 — Dragons of Tarkir, Crimson Vow) is `exploit()` in `triggered`: an enters trigger that `may` `sacrifice` a creature with `exploit: true`. "When this creature exploits a creature" (702.110b) is `{ on: "exploits", who: "self" }` — it fires when the creature sacrificed itself, too — and "whenever a creature you control exploits a nontoken creature" (Skull Skaab) is `who: "you-control"` with a `filter` on the creature sacrificed, as it last existed.

**Cleave** (rule 702.148 — Crimson Vow) is `cleave: { cost, targets, effect }`: the spell with its bracketed text removed, offered as a second cast variant for `cost` (the overload machinery — `CardDefinition.overload` with `keyword: "cleave"`; the action's `overload: true`, labelled "cleave"). The card's own `targets`/`effect` are the bracketed version. An X only in the cleave cost (Lantern Flare's `{X}{R}{W}`) is the X paid, read as `"x"` in the cleave effect; the uncleaved text's own X is whatever it defines.

**Awaken N—[cost]** (rule 702.113 — Battle for Zendikar) is `overload: awaken(N, cost, { targets: TARGETS, effect: EFFECT })` (`helpers.ts`) beside the card's own `targets: TARGETS, effect: EFFECT`: an alternative cost on the overload machinery (`keyword: "awaken"`, labelled "awaken"), whose cast targets the printed ones and then "target land you control", and does the printed effect and then puts N +1/+1 counters on that land and makes it a 0/0 Elemental creature with haste for good (no color). The land is the last slot, so an illegal land skips only its part, and a spell with no other target doesn't resolve without it (the rulings). Ruinous Path; `awaken.test.ts`. The scaffolder reads the keyword line over a spell it reads whole.

**Reconfigure** (rule 702.151 — Kamigawa: Neon Dynasty) is `...reconfigure("{2}")` from `helpers.ts` spread into `activated` (the scaffolder writes the same two abilities out): attach to another creature you control and unattach, both sorcery speed, each marked `reconfigure` — what lets an Equipment creature equip (301.5c). Attaching one by any means stops it being a creature, creature types and P/T with it, until it's unattached from that creature (702.151b — `GameObject.reconfiguredOnto`, an effect of the attaching, so it survives losing its abilities); one still a creature once attached falls off. "Whenever this creature or equipped creature …" is two triggers, `who: "self"` and `who: "attached"`, the second `sameAbilityAs: 0` (Acquisition Octopus); "it" in its effect is `"trigger-object"`. Not yet: an Equipment granting a static (Cloudsteel Kirin), adding a color (Blade of the Oni).

**Licids** (Tempest, Stronghold): "{cost}, {T}: This creature loses this ability and becomes an Aura enchantment with enchant creature. Attach it to target creature. You may pay {cost} to end this effect." is one activated ability, `{ cost: { mana: "{G}", tap: true }, targets: ["creature"], effect: { kind: "become-licid-aura", target: 0, endCost: "{G}" }, resolve: null, licid: true }` (the scaffolder writes it). Resolved, the Licid is an Aura enchantment (layer 4 at that timestamp, no creature types) attached to the target, without that ability (`GameObject.licid`), until the player who activated it pays `endCost` — the `end-licid-effect` special action (rule 116.2c), offered in its ability menu — making it a creature again, unattached; if its host leaves it goes to the graveyard (704.5m). Write the rest of its text as an Aura's: `scope: "attached"` statics, `who: "attached"` triggers, `target: "attached"` effects, `controlEnchanted` (Dominating Licid) — none of which does anything while it's a creature attached to nothing. Pool: `pool/enraging-licid.ts`, `pool/nurturing-licid.ts`.

**Shield counters** (rule 122.1c — Streets of New Capenna) are ordinary counters named `"shield"`: `add-counter { counter: "shield" }` (Brokers Veteran), an enters replacement `counters: { kind: "shield", amount: 1 }` (Disciplined Duelist), `self-counters` conditions on them (Rhox Pummeler). The engine gives them their meaning: an effect's destroy removes one instead (`destroyByEffect`, after a regeneration shield), and damage to the permanent is prevented and one removed (`damageSteps`' `shield-counter` step, ordered with the other prevention by `bestDamageOrder`, a spent counter weighing more than a one-turn shield) — one counter however many it has, and one for a whole combat damage step (`shieldCountersSpent`). Not an ability, so they still work on a permanent that lost its abilities; state-based actions and sacrifices aren't stopped (the rulings). Not yet: "damage can't be prevented" (Call In a Professional).

**The initiative and dungeons** (rules 726, 309, 701.49 — `docs/plans/initiative-dungeons.md`):
`take-initiative { who? }` ("you take the initiative" — Rilsa Rael; the initiative's own three
abilities, `cards/initiative.ts`, then venture into Undercity at once and at each of its holder's
upkeeps, and pass it to whoever deals it combat damage), `venture { into?: "undercity" }` ("venture
into the dungeon" / "into Undercity"; a fork asks the `venture` decision, the bottommost room
completes the dungeon). Triggers: `takes-initiative`, `ventures` (Nadaar's "whenever you venture
into the dungeon"), `completes-dungeon` (Sefris), each with `who`. All four dungeons are authored
(`cards/dungeons.ts`, each room pinned against the printed card by `dungeons.test.ts`): a plain
`venture` offers Lost Mine of Phandelver, Dungeon of the Mad Mage and Tomb of Annihilation
(701.49a), `into: "undercity"` enters Undercity. Conditions (anywhere a `StaticCondition` goes: a trigger's
intervening if, a `conditional`, an amount's `ifCondition`, an activation's "Activate only if"):
`{ kind: "initiative", who: "you" | "opponent" }` ("if you have the initiative" — Feywild
Caretaker, Sarevok's Tome's mana) and `{ kind: "completed-dungeon" }` ("if you've completed a
dungeon" — Undermountain Adventurer's six {G}, Rilsa Rael). `attacks-player`'s
`defenderHasInitiative` is Loot Dispute's "whenever you attack the player who has the initiative".
Not yet: "a player you're attacking has the initiative" as an intervening if (Undercellar Sweep).

`become-monarch { who? }` (`who` a scope, or a target slot holding a player — Jared Carthalion's "target opponent becomes the monarch"), `get-energy { amount, who? }` (`amount` an amount: Aetherflux Conduit's
"equal to the amount of mana spent to cast that spell" is `{ manaSpentOf: "trigger-object" }`),
`add-player-counters { counter: "poison" | "experience" | "rad", amount, who?, target? }`
("you get an experience counter"; Fynn, the Fangbearer's "that player gets two
poison counters" is `who: "trigger-player"`, Pistus Strike's "its controller gets a poison
counter" `who: { controllerOf: 0 }`; ten poison counters lose the game,
rule 704.5c — energy keeps its own `get-energy`; **rad counters**, rule 728: "target player
gets two rad counters" — Mirelurk Queen — and the engine's own inherent trigger mills them at
that player's precombat main, never authored on a card, `cards/rad.ts`; life lost "from
radiation", 728.1a, isn't told apart yet),
`remove-player-counters { counter, amount | "all", who?, target? }` (Survivor's Med Kit's
"target player loses all rad counters"; never below none),
`collect-evidence { amount, then? }` ("you may collect evidence N", rule 701.59a — Surveillance
Monitor: exile any number of graveyard cards with total mana value N or more, a choice the
player may decline, offered only when the graveyard holds that much; `then` is "if you do" /
"when you do", the exiled cards its targets; every collecting fires `evidence-collected`
triggers — "whenever you collect evidence". `amount` is any amount, read as it resolves: "you may
collect evidence **X**. When you do, … X damage" (Incinerator of the Guilty) is a `may` around a
`choose-value` of `"number"` (`min: 0`, `max` the graveyard's total mana value, an `aggregate`
`"sum"` of `"mana-value"` `in: "graveyards"`, rule 701.59b) whose `then` is a `sequence` of
`collect-evidence { amount: "x", required: true }` and the `reflexive-trigger`, which reads the
same X. `required` is a collecting whose may was already answered: it can't be declined, and
evidence 0 with nothing exiled still counts (that card's ruling). As an activated ability's cost it's
`cost.collectEvidence: N` — Forensic Researcher (the record `{ totalManaValue: N, filter }` is the
same payment over the matching cards only, and no collecting of evidence: The Capitoline Triad's
"Exile any number of historic cards from your graveyard with total mana value 30 or greater");
as a spell's "you may collect evidence N"
additional cost, `kicker: { cost: "", keyword: "collect-evidence", collectEvidence: N }`, with
"if evidence was collected" the spell being kicked — Crimestopper Sprite),
`explore { target, times? }` ("it explores", rule 701.44 — Cenote Scout: `target: "source"`;
"target creature you control explores" a slot — Miner's Guidewing; `times` "explores X times" /
"explores, then it explores again" — Jadelight Spelunker, Over the Edge. A land card to hand,
otherwise a +1/+1 counter and "put it into your graveyard?" — the may is the effect
controller's, so the explorer must be theirs; one that has left still explores, as it last
was; every exploration fires `explores` triggers — `{ on: "explores", who: "self" | "you",
filter?, revealed?: "land" | "nonland" }`, the explorer the trigger object, "whenever a
creature you control explores" — Merfolk Cave-Diver. "Create a Map token" is the `Map Token`.
"Each [creature] explores" (rule 701.44d's APNAP order) and replacing an exploration
(Twists and Turns) aren't built),
`discover { amount }` ("discover N", rule 701.57 — Primordial Gnawer; `amount` any
`EffectAmount`, `{ triggerValue: true }` "discover again for the same value" — Curator of
Sun's Creation): the free cast offered, otherwise to hand, the rest to the bottom; every
discovering fires `discovers` triggers — `{ on: "event", event: "discovers", who: "you" }`, the value N),
craft (rule 702.167 — "Craft with [materials] [cost]": `craft(mana, materials, text)` from
`helpers.ts`, an `activated` ability — Oteclan Landmark; `materials` is `CraftMaterials`
(`abilities.ts`): `{ count, orMore?, filter?, cardsOnly?, share?: "card-type", oneEach?,
text }` — "artifact" is `{ count: 1, filter: { type: "artifact" } }`, "one or more Dinosaurs"
`{ count: 1, orMore: true, filter: { subtype: "Dinosaur" } }`, "two that share a card type"
`share`, "a Dinosaur, a Merfolk, a Pirate, and a Vampire" `oneEach` with one filter each, "four
or more red instant and/or sorcery cards" `cardsOnly`. The back face is the DFC's other file
(`faces`, `transform: true`). "The exiled cards used to craft it" (702.167c) are the cards
exiled with the permanent it became — `GameObject.exiledWith` its new stint, what
`cardsExiledWithSource` and the linked-exile vocabulary read),
`solve` (a **Case**'s "To solve — [condition]", rule 719.3: write it with `caseToSolve(condition,
text)` from `helpers.ts`; its "Solved — [ability]" is the ability gated on `{ kind: "solved" }` —
a static's or activated ability's `condition`, a triggered ability's `whileCondition` — Case of
the Crimson Pulse; solved lasts until the Case leaves the battlefield),
`timed-static { static, duration, text }` — **a timed static**: a resolved spell's or ability's rule change for a while, written as the static ability that says it forever, with a `PlayerDuration` (`engine/src/duration.ts`) — "players can't gain life this turn" (Skullcrack: a `would-gain-life` `prevent` replacement, `who: "any-player"`), "the 'legend rule' doesn't apply to permanents you control this turn" (Hall of Echoes: `legendRuleOff`), "until end of turn, you may activate loyalty abilities of Jace planeswalkers you control … any time you could cast an instant" (Jace's Machinations: `loyaltyAtInstantSpeed`, its `affects` a filter). It rides an emblem the table never sees, so only what an emblem's readers take works (below; `test/emblem-statics.test.ts` checks timed statics too), and it changes rules, not characteristics (rule 611.2c). Prefer it to a new `player-effect` field.
`create-emblem { text, static?, moreStatics?, triggered?, to? }` (`static`: its static
ability, written as a permanent's and read off the emblem with "you" its owner, rules 113.6p,
114.4 — an anthem of any scope (Elspeth, Knight-Errant), `noMaxHandSize`/`maxHandSize` (Tamiyo,
the Moon Sage), `prohibits`, `costModification`, a `would-deal-damage` `replacement` (Ajani
Steadfast), `prohibits`'s `lose-game` (Gideon of the Trials), `mayPlay` (Jaya Ballard), `alternativeCostForSpells` (its `fromHand`: Tamiyo, Field Researcher),
`loyaltyAtInstantSpeed` for every planeswalker its owner controls (Teferi, Temporal Archmage),
`grantsToGraveyard`, `untapLimit`, `grantsActivated` and `grantsTriggered` for permanents (Koth of
the Hammer's Mountains), `grantsToSpells` (Ral, Crackling Wit's storm); `moreStatics` the rest when it has several — Saheeli, Filigree
Master. Any other field isn't read: `test/emblem-statics.test.ts` fails on it until a reader takes
it; `triggered`: the emblem's triggered
abilities, rule 114.4 — an emblem object in the command zone whose abilities trigger and
resolve as a permanent's, "you" its owner and "this emblem deals 4 damage" damage from a
colorless source with no types: Koth, Fire of Resistance, Teferi, Hero of Dominaria; `to`: a
target slot holding the player who gets it, "target opponent gets an emblem" — Ob Nixilis
Reignited), `prevent-all-combat-damage` (Fog; `by: CardFilter` is only what
sources matching it would deal — Arachnogenesis's "by non-Spider creatures", matched as
each damage would be dealt, rule 615.1),
`prevent-damage-to-you { by }` (Deep Wood's "prevent all damage that would be dealt to you this turn by attacking creatures", Scarecrow's "by creatures with flying": combat and noncombat damage to you the player, not your permanents, each source matched as its damage would be dealt — `attacked-this-step.test.ts`),
`prevent-damage { target, amount, combatOnly? }` (kept as an `ActiveReplacement`; Healing Salve; `target` may be `"source"`, and `amount: "all"` is "prevent all damage that would be dealt to [it] this turn", never used up — Gideon Jura's 0. A shield on an object covers only that object, not the card back from another zone, rule 400.7). The untargeted "prevent the next 2 damage that would be dealt to you this turn" (Conservator, Shield of the Ages; "… combat damage …" — Decorated Griffin) is `damage-rule`'s `{ to: { players: "you" }, amount: 2 }` (`combat: true`), below. Prevention over the permanents a filter matches **as it resolves** — a fixed set, where `damage-rule`'s `permanents` is asked as the damage would be dealt — is a `for-each-permanent` (`simultaneous`) putting a `prevent-damage` `"all"` shield on each: Mutational Advantage's "permanents you control with counters on them gain hexproof and indestructible until end of turn. Prevent all damage that would be dealt to **those permanents** this turn" (the ruling: one that gets a counter later isn't covered, one that loses its counters stays covered). `prevent-damage-each-matching.test.ts`.
`prevent-damage-divided { from, combatOnly? }` (rules 601.2d, 615.7 — Remedy's "prevent the next 5 damage that would be dealt this turn to any number of targets, divided as you choose"): each target of the `any-number` group at `from` gets a shield of its share, at least 1 each; give the card or ability `divided: { total: 5, slot: 0, of: "damage to prevent" }` and the group `max: 5` (`prevent-next-damage.test.ts`).

**`damage-rule`** (rules 614.9, 615 — `damage-modification.test.ts`) is the general one-shot prevention or redirection over a set of damage events for a duration: `{ to?: { target? | players?: "you" | "each" | "opponents", permanents?: CardFilter, exceptTarget? }, by?: { target? | filter?, exceptTarget? }, combat?: boolean, amount?: "all" | "next-time" | EffectAmount, duration?: "end-of-turn" | "until-your-next-turn" | "while-source", redirectTo?: slot | "source" | "you" | { controllerOf: "source" } | "source-itself", then?, gainLifePrevented? }`. Omitted `to`/`by` is any recipient/source; `players` and `permanents` both count ("you and creatures you control"); a filter is asked as the damage would be dealt (615.1), so a creature arriving later is covered. Kor Haven: `{ by: { target: 0 }, combat: true }`; Dovin, Hand of Control's −1: two rules, `to: { target: 0 }` and `by: { target: 0 }`, `duration: "until-your-next-turn"`; Eerie Interference: `{ to: { players: "you", permanents: { type: "creature", controlledBy: "you" } }, by: { filter: { type: "creature" } } }`; Turn the Tables: `{ to: { players: "you" }, combat: true, redirectTo: 0 }`; Mirror Strike: `{ to: { players: "you" }, by: { target: 0 }, combat: true, redirectTo: { controllerOf: "source" } }`; Temper: `{ to: { target: 0 }, amount: "x", then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: "x" } }`. **`then`** is prevention's additional effect (615.5): `"x"` the damage that rule prevented, the spell's own targets, and the damage's source as `"trigger-object"` (its controller `who: "trigger-controller"`). `prevent-damage-from-chosen-source` takes `then` too (Deflecting Palm: `then: { kind: "damage", amount: "x", who: "trigger-controller" }`), `amount: "all"` (Kor Chant's "all damage … this turn", with `redirectTo: 1`), `to: "your-side"` (one shield over you and your permanents — not yet with an amount the player would divide, rule 615.7: Harm's Way and Divine Deflection wait on `decision:prevention-shield-allocation`) or `"any"` (Reflect Damage), and `redirectToSource`.

**Damage that can't be prevented** (rule 615.12): `damage`'s `cantBePrevented: true` (Combust), the `damage-cant-be-prevented` effect for the turn (Skullcrack, Flaring Pain), and a static's `damageCantBePrevented: { by?, fromSelf?, combat? }` (Leyline of Punishment `{}`, Excruciator `{ fromSelf: true }`, Questing Beast `{ by: { type: "creature", controlledBy: "you" }, combat: true }`). Every prevention effect then prevents none (its other effects still happen, a shield isn't used up, a shield counter still goes) — protection and Fog included; a redirection still applies.

**"All damage is dealt as though its source had wither"** (Everlasting Torment) is a static's `damageAsThoughSourceHad: { keyword: "wither" }` (`"infect"` too): every source's damage, from any zone, is dealt as one with that keyword deals it (rules 120.3d, 702.80a, 702.90b-c), though no source gains the keyword. `global-wither.test.ts`. `to: "you"` narrows it to damage dealt to the static's controller: Phyrexian Unlife's "as long as you have 0 or less life, all damage is dealt to you as though its source had infect" is `{ keyword: "infect", to: "you" }` under a `life-total` `condition` (`atMost: 0`), read once for damage dealt at once (rule 510.2), so the damage that takes you to 0 or less is all loss of life. `damage-to-you-as-though-infect.test.ts`.

`prevent-damage`'s **`redirectTo: slot | "source" | "you"`** is a redirection instead (rule 614.9): "The next 1 damage that would be dealt to this creature this turn is dealt to target creature you control instead" (the en-Kor creatures) is `{ target: "source", amount: 1, redirectTo: 0 }`; Daughter of Autumn's "… to target white creature … is dealt to this creature instead", `{ target: 0, amount: 1, redirectTo: "source" }`. The same source deals it to `redirectTo` (combat damage stays combat damage); while `redirectTo` is off the battlefield, no longer a creature/planeswalker/battle, or a player who has left, the shield does nothing and stays. A plain prevention shield is used before a redirection. `prevent-damage-from-chosen-source` takes `redirectTo` too (Shaman en-Kor's second ability, Jade Monolith's `"you"`). Not yet: static redirections (Palisade Giant, Veteran Bodyguard), "all damage … by target creature" (Shimian Night Stalker) — still `replacement:damage-redirection`. `damage-redirection.test.ts`.

`prevent-damage-from-chosen-source { filter?, to: "you" | slot | "your-side" | "your-side-creatures" | "any", amount: "next-time" | n | "all", redirectTo?, redirectToSource?, gainLifePrevented?, gainLifeFrom?, then? }` (rule 609.7 — Alpha's Circles of Protection: `{ filter: { colors: ["R"] }, to: "you", amount: "next-time" }`; Reverse Damage adds `gainLifePrevented`; Healing Grace is `{ to: 0, amount: 3 }`; Prahv's "prevent all damage a source of your choice would deal this turn", `{ to: "any", amount: "all" }`, with Burrenton Forge-Tender's `filter`; Pilgrim of Virtue's "the next time a black source … would deal damage this turn, prevent that damage", `to: "any"`; Opal-Eye's "that damage is dealt to Opal-Eye instead", `{ to: "any", amount: "next-time", redirectTo: "source" }`; Shadowbane's "to you and/or creatures you control", `to: "your-side-creatures"`, and its "if damage from a black source is prevented this way, you gain that much life", `gainLifeFrom: { colors: ["B"] }` beside `gainLifePrevented`; `chosen-source-recipients.test.ts`). As it resolves its controller chooses the source with the `choose-permanents` decision — a permanent or a spell on the stack matching `filter`; a permanent spell's shield covers the permanent it becomes (609.7a). The shield rechecks `filter` when damage would be dealt and isn't used up by damage it doesn't cover (609.7b). Not offered yet: objects an ability on the stack refers to (docs/engine-gaps.md). `chosen-source-and-color.test.ts`.

`become-color { target, colors, duration, inAddition? }` (layer 5 — the Laces: `{ target: 0, colors: ["B"], duration: "permanent" }` on a `{ kind: "spell-or-permanent" }` target; Crimson Wisps' `"end-of-turn"`; Indigo Faerie's "becomes blue in addition to its other colors until end of turn" adds `inAddition: true`, read by the scaffolder). Without `inAddition` its colours are replaced, not added to; a spell keeps them while it's on the stack, and the permanent it becomes has its own (400.7). The scaffolder reads both sentences.

`change-text { target, words: "color" | "land-type" | "color-or-land-type", duration }` (layer 3, rule 612 — Sleight of Mind's "change the text of target spell or permanent by replacing all instances of one color word with another" is `{ target: 0, words: "color", duration: "permanent" }` on a `{ kind: "spell-or-permanent" }` target; Magical Hack's `"land-type"`; Mind Bend's "… or one basic land type with another" `"color-or-land-type"` on `"permanent"`; Crystal Spray's "until end of turn" `"end-of-turn"`). As it resolves its controller picks the word to replace, then a different one of the same kind (the `choose-creature-type` menu); `from`/`to` are filled in by those answers — never write them. Every instance in the object's own text changes (`text-change.ts`): filters, protection, a static's scope, costs, landwalk, a spell's target restriction (re-checked as it resolves), its type line's land types (a Forest made an Island taps for {U}); never a name or a mana symbol (612.2). A spell's change stays on the permanent it becomes (400.7a). Not yet: a token its changed text creates keeps its own colours. The scaffolder reads all four sentences.

`visibility` (a `StaticAbility`, read by `viewFor`, so it changes only what a player knows): `handsRevealed: "you" | "opponents" | "each-player"` — "your opponents play with their hands revealed" (Telepathy, rules 701.18c, 701.20c), "players …" (Wandering Eye), to every player; `libraryTopRevealed`, the same for the top card (Wizened Snitches, rule 401.5; the "you" form is usually the card's `revealsOwnLibraryTop`); `looksAtFaceDownCreatures: true` — "you may look at face-down creatures you don't control any time" (Keeper of the Lens, Found Footage), its controller alone, creatures on the battlefield alone, never a face-down spell (the rulings); `looksAtOwnLibraryTop: true`, the card field's look as a static a permanent has by a grant (Glowcap Lantern). Grantable like any static: Lumbering Laundry's "until end of turn" is a `grant-static` on itself.

`skipsSteps: { who, steps }` (a `StaticAbility`, rule 614.10 — "Skip your draw step": Damia, Sage of Stone, Necropotence; "Players skip their untap steps": Stasis; "Players skip their upkeep steps": Eon Hub). `who` is `"you"`, `"opponents"` or `"each-player"` from the permanent's controller's side; `steps` any of `"untap"`, `"upkeep"`, `"draw"`. Each such step is passed as though it didn't exist (500.11) — an upkeep's "at the beginning of your upkeep" never triggers — read as the step would begin, so time it with `condition` (Gibbering Descent's hellbent `{ kind: "hand-size", atMost: 0 }`). A "next" `skip-step` waits past a step this skips (614.10a). The scaffolder reads the sentences above. `skip-step.test.ts`.

`untapLimit: { who, count, filter? }` (a `StaticAbility`, rule 502.3 — "Players can't untap more than one land during their untap steps": Winter Orb with `condition: { kind: "source", filter: { tapped: false } }`, Smoke, Winter Moon; "you": Mungha Wurm; no `filter` for "permanents": Static Orb). In each of `who`'s untap steps the player picks exactly `count` of the matching permanents about to untap (`choose-permanents`, asked only when there are more, one limit at a time, a token stack's tokens singly); the rest stay tapped. Limits are cumulative, identical ones redundant; read before anything untaps, so a tapped Orb limits nothing. It reaches from an emblem too. `untapOnlyChosenType: { who, types }` (Storage Matrix) asks a `choose-modes` of the types first, and only permanents with that type go on. `untap-step-limit.test.ts`.

`keepsDamageInCleanup: true` (a `StaticAbility`, `affects` ignored — "Damage isn't removed from this creature during cleanup steps": Ancient Adamantoise). The cleanup step's damage removal (rule 514.2) passes it by while it's phased in; regeneration still removes it (rule 701.19a). The scaffolder reads the line. `keeps-damage-in-cleanup.test.ts`.

`mayChooseNotToUntap: true` (a `StaticAbility`, rule 502.3 — "You may choose not to untap ~ during your untap step": Ashnod's Battle Gear, Phyrexian Gremlins, Entrancing Lyre). As its controller's untap step untaps their permanents, they pick which of these to leave tapped (the `choose-permanents` decision, asked only when one would untap; no priority, 502.4). Beside it, the `"while-source-tapped"` `PermanentDuration` — "for as long as ~ remains tapped" — on `modify-pt`, `restrict`, `become`, `become` and anything else taking a `PermanentDuration`, and `gain-control`'s `whileSourceTapped`: it ends as the source untaps or leaves, and does nothing if the source is already untapped (611.2b). The scaffolder reads the static line and "gets +N/+N for as long as ~ remains tapped". `choose-not-to-untap.test.ts`. **"For as long as you control ~"** is the `"while-you-control-source"` `PermanentDuration` (Aegis Angel's indestructible, Ty Lee's `doesnt-untap` restriction) and `gain-control`'s `whileYouControlSource` (Aladdin, Dragonlord Silumgar); with `whileSourceTapped` too, or `"while-you-control-source-tapped"`, it's "…and ~ remains tapped" (Rubinia Soulsinger, Willow Satyr). It ends as the source leaves or changes hands, and does nothing if you don't control the source as it would begin. `while-you-control.test.ts`.

`rampage(n)` (helpers.ts, rule 702.23 — Legends' Aerathi Berserker): the becomes-blocked trigger, +N/+N until end of turn for each creature blocking it beyond the first, counted as it resolves (702.23b) through the `{ blockersOf: "source" }` amount (each token of a blocking stack counting). The scaffolder reads "Rampage N". `rampage.test.ts`.

`levelUp(cost)`, `levelBand(min, max?)` and `levelStatic(band, power, toughness, text, keywords?)` (helpers.ts, rules 702.87 and 711 — Rise of the Eldrazi's levelers): `levelUp` is the sorcery-speed "{cost}: put a level counter on this" (the printed line and reminder in its text); each level symbol is a `levelStatic(levelBand(2, 6), 3, 3, "LEVEL 2-6\n3/3\nFirst strike", ["first-strike"])` — base P/T in layer 7b and the band's keywords while the permanent has that many `level` counters. Any other ability printed in a band is its own entry carrying the band: a static's `condition: levelBand(…)`, a trigger's `whileCondition` (it exists only while leveled — not an intervening if), an activated ability's `condition`. The card keeps its printed (lowest) P/T as `power`/`toughness` (711.5-711.6). The scaffolder reads the keyword line and each striation's P/T and keyword lines. Student of Warfare; `level-up-umbra-armor.test.ts`.

`keywords: ["umbra-armor"]` (rule 702.89a — totem armor on older printings): on an Aura, "if enchanted permanent would be destroyed, instead remove all damage from it and destroy this Aura" — `Game.umbraArmorInstead`, at an effect's destroy (after a regeneration shield and a shield counter) and at the lethal-damage and deathtouch state-based actions, not at a sacrifice or 0 toughness. Not regeneration: "can't be regenerated" doesn't stop it, and the creature isn't tapped or removed from combat. With several umbras on one creature the engine picks the one of least mana value (616.1's choice — docs/engine-gaps.md). Grant it with `grantKeywords` (Umbra Mystic's "Auras you control have umbra armor"). Bear Umbra; `level-up-umbra-armor.test.ts`.

`renown(n)` (helpers.ts, rule 702.112 — Magic Origins): the combat-damage-to-a-player trigger with the intervening `condition: { kind: "source", filter: { renowned: false } }` and the `renown` effect. `GameObject.renowned` is a designation, not an ability or a copiable value; leaving the battlefield ends it. "As long as this creature is renowned" is a static's `condition: { kind: "source", filter: { renowned: true } }` (Goblin Glory Chaser), "if it's renowned" the same as a trigger's intervening if (Consul's Lieutenant) or a spell's `{ kind: "target", index, filter: { renowned: true } }` (Enshrouding Mist); granting renown is `grantsTriggered: [renown(1)]` (Aragorn, Hornburg Hero). The scaffolder reads "Renown N", the "As long as ~ is renowned, it has …" static, "if it's renowned," and the becomes-renowned triggers. `renown.test.ts`.

`supertypes: ["world"]` (rule 704.5k — Legends' Nether Void, Gravity Sphere): the world rule is a state-based action — with two or more world permanents, all but the newest go to their owners' graveyards, and a tie for newest sends them all. Nothing else to author. `world-rule.test.ts`.

`blockableDespiteLandwalk: ["swampwalk"]` (a `StaticAbility`, rule 702.14 — Legends' Quagmire, Lord Magnus, Great Wall): "Creatures with swampwalk can be blocked as though they didn't have swampwalk" — every creature's landwalk of those kinds is ignored when blocks are declared (`whyCannotBlock`), whoever controls the static. One static per sentence; the scaffolder reads it. `blockable-despite-landwalk.test.ts`.

`blocksDespiteLandwalk: true` (a `StaticAbility`, rule 702.14 — Street Savvy) is the blocker's side: what its `affects` picks out "can block creatures with landwalk abilities as though they didn't have those abilities", every kind of landwalk, named or a filter, and no other blocker. `enchanted-permanent-statics.test.ts`.

`controlledBy: "monarch"` (a filter clause, rule 725) is controlled by the monarch, nobody's while there is none. Through `attachedTo` it's about an Aura's host's controller: Fall from Favor's "unless that player is the monarch" is a `not` of `{ kind: "source", filter: { attachedTo: { controlledBy: "monarch" } } }`.

**"Whenever one or more creatures an opponent controls attack you and aren't blocked"** is `{ on: "attacks-player", who: "opponent", defender: "you", unblocked: true }` (Coveted Jewel): once per player attacked directly, as blockers are declared; the attacker is the `"active-player"` scope.

**"Whenever ~ attacks and isn't blocked"** is the `{ on: "attacks-unblocked", who }` trigger (rule 509.3g — Fallen Empires' Farrel's Zealot, Necrite; Guiltfeeder, Cybermat): once per attacker with no creatures declared as blockers, as the last defending player declares (or is skipped with nothing to block with); the attacker is the trigger object and the defending player the `"trigger-player"` (Mindstab Thrull's "defending player discards three cards"). Its delayed form, "this turn, when target creature attacks and isn't blocked" (Delif's Cone, Delif's Cube), is a `delayed-trigger` at `{ attacksUnblocked: <slot> }`, firing in each combat this turn (603.7c). **"Assigns no combat damage this turn"** is the `assigns-no-combat-damage` effect (510.1a) — the usual "if you do" price is the `may`'s `then` (Floral Spuzzem). The scaffolder reads the trigger and "If you do, ~ assigns no combat damage this turn." `attacks-unblocked.test.ts`.

**"Remove X counters" / "remove any number of counters"** as a cost is `removeCounter: { kind, count: "x" }` (rules 601.2b, 602.2b — Fallen Empires' storage lands, the Mana Batteries, Arcbound Javelineer, Rasputin): X is announced as it's activated, up to the counters on the source (the offer's `xCost.maxX`), 0 allowed unless the ability's `minX` says otherwise ("one or more" — Rasputin's `minX: 1`), and the effect reads it as `"x"` ("add {B} for each storage counter removed this way", "deals that much damage"). With `{X}` in the mana cost too it's the same X (Chamber Sentry). A mana ability with it is activated by hand, never by the auto-payer. The scaffolder reads the cost and both Battery/storage-land mana sentences. `remove-x-counters.test.ts`.

**"Remove all [kind] counters from [this]"** as a cost is `removeCounter: { kind, count: "all" }` (Catti-brie of Mithral Hall, Molten Hydra, Relic Amulet): every counter of that kind on the source, none at all a legal payment (Catti-brie's ruling), and the number removed is the ability's X — "where X is the number of counters removed this way", "damage equal to the number of … removed this way", "that much damage" all read `"x"` (rule 601.2h via 602.2b; a copy keeps it, 707.10). Off the source only, of one kind. The scaffolder reads the cost and those three phrasings. `counters-this-way.test.ts`.

**Counters chosen as the cost is paid** — "Remove a +1/+1 counter from a creature you control" (Ghave, Guru of Spores), "Remove a counter from this creature" (Loch Mare: any kind it has), "Remove three counters from among creatures you control" (Tayam), "a +1/+1 counter or a charge counter from a permanent you control" (Ion Storm), "a time counter from a permanent you control or suspended card you own" (Rift Elemental) — is the same `removeCounter` with `kind: "any"` or `orKinds`, `from` (a filter over permanents you control; `excludeSource` for "another"), `among` and `orSuspended`. Which ones is the `remove-counters` decision, once the ability is on the stack and before anyone gets priority (rules 602.2b, 601.2h — as a blight is), asked only when there's a choice; gated on there being enough to remove (rule 118.3: `among` counts them all, otherwise the most any one has). `count: "x"` announces X up to that (Ooze Flux's "one or more" with `minX: 1`; Moxite Refinery's X counters from one permanent). Not on a mana ability, nor beside another cost that asks. The scaffolder reads these costs. `activation-choices.test.ts`.

**Cumulative upkeep** is `cumulativeUpkeep(cost)` (helpers.ts, rule 702.24 — Ice Age's Illusionary Wall, Polar Kraken, Illusions of Grandeur): `"{U}"`, `{ life: 2 }` or `{ sacrifice: { type: "land" }, text: "Sacrifice a land" }`. Each of your upkeeps, while it's on the battlefield, an age counter, then the cost once per age counter — all of it or none (no partial payments) — or it's sacrificed; each instance counts every age counter (702.24b). Underneath is the `unless` option's `times` (`UnlessTimes`): the mana repeated, the life multiplied, that many more to sacrifice, fixed as it applies. Not yet: a combined cost ("Pay {B} and 1 life"), or cumulative upkeep granted to other permanents. The scaffolder reads all three forms. `cumulative-upkeep.test.ts`.

**Echo** is `echo(cost)` (helpers.ts, rule 702.30 — Urza's Saga's Goblin Patrol, Karmic Guide, Rakdos Headliner): a mana cost (`"{4}{R}{R}"` — the Urza block's echo cost is its mana cost, 702.30b) or any `UnlessOption` (`{ discard: 1, text: "Discard a card" }`, `{ sacrifice: { type: "land" }, count: 2, text: "Sacrifice two lands" }`), whose `text` the keyword line shows. Its upkeep trigger's intervening if is the `source-came-under-control-since-last-upkeep` condition: the permanent's `controlSinceSeq` (stamped as it enters and as its control changes) against its controller's `previousUpkeepSeq` — so it asks once after it enters and once more after each change of control. The scaffolder reads all three forms. `echo.test.ts`.

**Recover** is `recover(cost)` (helpers.ts, rule 702.59 — Coldsnap's Grim Harvest, Icefall, Garza's Assassin): a `fromGraveyard` dies trigger on any creature you own, "you may pay [cost]" returning the card to your hand, its `else` exiling it — so unpaid or unpayable, it's exiled. `cost` is a mana cost or `"half-life"` ("Recover—Pay half your life, rounded up", a `costLife`). A card that reaches the graveyard in the same event (Garza's Assassin sacrificed for its own ability) doesn't see it. The scaffolder reads both forms. `ripple-recover.test.ts`.

**Ripple N** is `ripple(n, "Card Name")` (helpers.ts, rule 702.60 — Coldsnap's Surging Flame, Surging Sentinels): a `this-cast` trigger, a `may` reveal, then a `cast-now` from `{ libraryTop: n, reveal: true }` with `spell: { name }`, `free`, `repeat` (cast any number of them, each its own ripple trigger) and `rest: "bottom-any-order"` — the revealed cards not cast ordered onto the bottom by their owner (401.4; not asked when the order is no choice). `cast-now`'s `repeat` now goes with `libraryTop` and `rest`. The scaffolder reads the keyword line, the name the card's own. `ripple-recover.test.ts`.

**State triggers** are the `{ on: "state", state: <StaticCondition> }` trigger (rule 603.8 — Homarid, Tidal Influence, Dark Depths, Mana Vortex, Endrek Sahr, Goblins of the Flarg): "When you control no Islands", "Whenever there are four or more tide counters on ~", "When ~ has no ice counters on it". They trigger as soon as the state is true of the permanent (looked for at every state-based check and as zones, counters and control change), and not again while that instance waits or is on the stack; once it's gone, a state still true triggers again. Printed abilities only — a *granted* state trigger (Olivia, Crimson Bride's) isn't looked for. The scaffolder reads those three shapes. `state-triggers.test.ts`.

**"Exile … until ~ leaves the battlefield"** (Banishing Light) is rule 610.3:
the exile is a one-shot effect, and the return a second one created right after
the source leaves — no triggered ability, so nothing to respond to, and it
happens though the source has lost its abilities. Author only the exile —
`exile { untilSourceLeaves: true }` on the enters trigger (or the spell), or
`exile-all { untilSourceLeaves: true }` for "exile each …" (Temporary Lockdown); the
engine returns the card itself, under its owner's control, together with
anything else returning in the same event (610.3d; `GameObject.exiledUntil`,
the source's stint). **A card from a hand** is `discard-chosen { destination:
"exile", untilSourceLeaves: true }`: back to its owner's hand, rule 610.3's
"previous zone" (Kitesail Freebooter, Brain Maggot, `lookOnly` and `optional` for
Deep-Cavern Bat), and with the source gone the hand is still shown, no card chosen.
**Another end** is `exile`'s `until`: `{ targetLeaves: N }`, a second target whose
leaving ends it (Calix's −3, nothing exiled once that slot is illegal), or
`"opponent-becomes-monarch"` (Palace Jailer, any opponent of the effect's controller,
the next time one does, whatever became of the Jailer; `exile-until.test.ts`).
`moveObject` clears the link on any zone change: a card
that leaves exile some other way is no longer the one this permanent took, and
a token that was exiled ceased to exist (rule 111.7), so neither comes back. A
card printed with its *own* "When ~ leaves the battlefield, return the exiled
card" (Oblivion Ring) is two abilities, and its return is a real trigger:
`linked: true` on the exile, a `leaves-battlefield` trigger with
`return-exiled-by-source { linked: "battlefield" }`.

### Winning and losing

- **`win-game`** — "you win the game" (rule 104.2b): the game ends at once
  with the effect's controller the winner (104.1), in a multiplayer game too
  (nobody else "loses": the game is simply over, and the rest of the
  resolution doesn't happen). Nothing happens for a player who can't win (an
  opponent's Platinum Angel, a `player-effect`'s `cantWinGame`). Put the
  card's "if" on the trigger as an intervening-if — Felidar Sovereign's
  `step-begins` upkeep trigger with `condition: { kind: "life-total",
  atLeast: 40 }` — or in a `conditional` asked as it resolves (Thassa's
  Oracle's `library-size` `compare`, Jace's −8 `atMost: 0`). "Or" is
  `not(all(not …, not …))` (Twenty-Toed Toad).
- **`lose-game { who?, target? }`** — "you lose the game" (default `"you"`),
  "that player loses the game" (`who: "trigger-player"` — Vorpal Sword's
  granted trigger, Summon: Primal Odin), "target opponent loses the game"
  (`target: 0` — Mirrodin Besieged). The players lose and leave at once
  (104.5, 800.4a), all of a scope together, the last one left winning
  (104.2a) and nobody left a draw (104.4a). A player who can't lose doesn't.
  A pact is a `delayed-trigger` at `{ step: "upkeep", whose: "you" }` of an `unless` with
  `chooser: "you"`, a mana option and `otherwise: { kind: "lose-game" }`
  (Pact of Negation, Summoner's Pact).
- **What an opponent's search comes to** is a static: `controlsOpponentsSearching: true` ("You control your opponents
  while they're searching their libraries"), `exilesOpponentsFinds: { spendAs? }` (they exile each card they find, for
  you to play; Opposition Agent), `opponentsSearchTop: { top }` (Aven Mindcensor). Every `search-library` obeys them unwritten.
- **"Put the chosen cards onto the battlefield or into your hand"** — one choice of where, the same for every chosen card, made after
  they're chosen — is a `look-and-choose` with `destination: "stay"` (the rest still go where `leftover` says) and a `then` that's a
  `modal` of one mode, each mode a `for-each-target` (`from: 0`, `simultaneous: true`) over the chosen cards: `put-onto-battlefield`, or
  `return-to-hand` with `from: "library"`. Green Sun's Twilight, under a `conditional` on `{ kind: "x", compare }`.
- **"Each opponent who [did this] this turn can't …"** asks each player for themselves, through a `TurnDid` (`{ stat: TurnStat, atLeast? }`,
  1 by default): on a prohibition, `who: { who: "opponents", thisTurn: { stat: "attacked" } }` ("each opponent who attacked with a creature
  this turn can't cast spells"); on a filter, `controllerThisTurn: { stat: "spells-cast" }` ("each opponent who cast a spell this turn can't
  attack with creatures" is `cant-attack` on `{ type: "creature", controlledBy: "opponent", controllerThisTurn: … }`). Angelic Arbiter. What
  the player did before the permanent arrived counts (the journal).
- **"Controlled by a player who was dealt combat damage by three or more Pirates this turn"** is a filter clause over that controller's
  journal list, `controllerTurnHistory: { what: "combat-damaged-by", filter: { subtype: "Pirate" }, atLeast: 3 }` (any `JournalWhat`,
  `window?`; the `turn-history` condition's count, asked of the one player). Each source counts once for a player however often it dealt
  them combat damage (double strike), as it was when it did. Admiral Beckett Brass; the scaffolder reads the line.
- **"Players can't search libraries"** is a `prohibits` `search` act (Mindlock Orb, Stranglehold; `causedByThemselves`, Ashiok; `ignoreCost: "{2}"`, Leonin Arbiter, rule 116.2d); "this turn" is the `prohibit` effect's (Shadow of Doubt). Every `search-library` obeys it unwritten: it finds nothing and still shuffles, a `may` or `each-player-may` around it isn't asked, and an and/or `modal` loses that mode.
- **"Damage that would reduce your life total to less than N reduces it to N instead"** is a static,
  `damageLifeFloor: N` (Ali from Cairo; with a `condition`, Worship, Elderscale Wurm), or for a while a
  `player-effect`'s `damageLifeFloor` (Angel's Grace).
- **"You can't lose the game and your opponents can't win the game"** is a
  static (§10, the `lose-game` and `win-game` acts — Platinum Angel);
  "this turn" is the `prohibit` effect's (Angel's Grace). Either holds off every state-based loss (0 life, poison, a draw from
  an empty library, commander damage) and every `lose-game`, until it ends —
  the loss then comes at the next check if its cause is still there (a draw
  attempt belongs to the check after it, and is gone). Conceding still loses
  (rule 104.3a), and the last player left still wins (104.2a).
- "If you would draw a card while your library has no cards in it, you win the
  game instead" is a `would-draw` replacement (§10 — Laboratory Maniac).

### Combinators

- **Addendum** ("if you cast this spell during your main phase") is a
  `conditional` on `all` of `{ kind: "source", filter: { cast: true } }`,
  `{ kind: "your-turn" }` and `{ kind: "turn-structure", steps:
  ["precombat-main", "postcombat-main"] }`: a copy wasn't cast, so it gets no
  bonus (Unbreakable Formation, Sphinx's Insight).
- **`sequence { effects: [...] }`** — apply several effects in order, sharing
  the same `targets` and `x` (Blightning: damage a player *and* they discard).
  `simultaneous: true` marks the steps as **one instruction** written one step
  per target slot — Victimize's "return the chosen cards to the battlefield
  tapped" — so what they move moves at once: cards taken out of a graveyard
  leave together (one `leaves-graveyard` trigger, not one per card),
  permanents taken off the battlefield leave together (rule 603.10a), and
  damage its steps deal is one damage event — Chandra's Ignition's creature
  dealing it to each other creature and each opponent gains its lifelink
  controller life once (rule 702.15e). Leave
  it off a sequence of separate sentences, which really are separate events
  (rule 608.2c). A step that stops to ask someone something — a discard, an
  edict, a search, a `may`, a mode — is answered, by everyone it asks, before
  the next step happens: the rest of the sequence waits in
  `GameState.suspendedResolutions`, and the spell is still resolving
  meanwhile (no state-based actions, no triggers put on the stack). So
  "each player sacrifices six creatures. You create six Zombies" is just two
  steps, and the Zombies can't be sacrificed.
- - **Opus** (an ability word — Secrets of Strixhaven): "Whenever you cast an instant or sorcery
  spell, … If five or more mana was spent to cast that spell, … instead" is a `cast-spell` trigger
  (`filter: { typesAnyOf: ["instant", "sorcery"] }`) whose effect is a `conditional` on
  `{ kind: "trigger-object", filter: { manaSpent: { op: "gte", n: 5 } } }` — which reads what was
  spent on that spell even once it has left the stack (the ruling: it resolves "even if that spell
  is countered"; `GameObject.lastStackManaSpent`). Thunderdrum Soloist, Muse Seeker.
**`modal { minModes, maxModes, modes: ModeOption[] }`** — a choice made as
  the effect resolves (`maxModes` may be live — Riku of Many Paths' "choose up
  to X" is its trigger value): "add one mana of any color", "create a Food token or a
  Treasure token", fabricate's counters-or-Servos. Each `ModeOption` is
  `{ text, effect }`. Fabricate's choice sits inside a `conditional` on
  `source-on-battlefield`, its `else` the Servos: gone before it resolves, the
  counters can't go on it, so the tokens (rule 702.123a's ruling — Angel of
  Invention). **Not for a modal spell**: one printed "Choose one —"
  with bulleted modes chooses them as it's cast (rules 601.2b, 700.2a), so it
  uses the top-level `castModal` field even when no mode targets anything,
  and `pool.test.ts` fails a spell that doesn't. A modal *triggered* ability
  printed "Choose one —" with bullets uses this effect with **`announced:
  true`** as its whole effect: its modes are chosen as it goes on the stack,
  before its targets (rules 603.3c, 700.2b), carried on the ability
  (`chosenModes`) and applied as it resolves without asking again, and with
  none chosen it's removed from the stack. A trigger that fires for each of a
  token stack's members goes on the stack one copy at a time, each announcing
  its own. `maxModes` may be live, read as it triggers (Riku of Many Paths'
  "choose up to X"). Leave `announced` off for a choice the text makes on
  resolution ("create a Food token or a Treasure token", fabricate, "tap or
  untap") — those are asked as the effect applies, correctly. A modal
  *activated* ability ("{1}, Sacrifice this creature: Choose one —" — Cankerbloom, Umezawa's
  Jitte, Breya) is the same `announced: true` modal as its whole effect: its modes are chosen
  as it's activated (rules 602.2b, 700.2b), each choice offered as an `activate-ability` of
  its own (the offer's and action's `modes`, labelled with the cost and that mode's text), a
  mode whose targets can't be chosen left out; `notChosenBefore` / `notChosenThisTurn` work
  as for a trigger (Three Bowls of Porridge, Kargan Intimidator), the mode counting as chosen
  once activated. `activation-choices.test.ts`. **An announced
  mode may have targets of its own** (`ModeOption.targets`, as a `castModal` mode does —
  Aether Channeler's "return another target nonland permanent", Dread Presence's "deals 2
  damage to any target"): the chosen modes bring them as it goes on the stack, a mode
  needing a target it can't have isn't offered (rule 603.3c — Hullbreaker Horror with no
  opposing spell on the stack offers only its permanent mode), and each mode's effect reads
  just its own, as slots `0…`. A mode whose target has gone illegal still does whatever
  else it says; with every target illegal, nothing happens (rule 608.2b — Dread Presence
  gains no life). A resolution-time (not announced) `modal` or `may` **can't introduce a
  new target choice**, but its modes can reference the enclosing ability's own
  already-chosen targets (`target: 0`, same as anywhere else) — needed-cards P19;
  Retreat to Coralhelm's "you may tap or untap target creature" is one inside an announced
  mode, reading that mode's target. `notChosenThisTurn: true` is "choose
  one **that hasn't been chosen this turn**" (Galadriel, Light of Valinor;
  Breeches, Eager Pillager): only the modes this ability of this object hasn't
  had chosen yet this turn are offered, and with none left nothing happens (an
  announced one is removed from the stack). Announced, a mode counts as chosen
  as the ability goes on the stack, so creatures entering together each take a
  different one. Counted per ability, like
  `resolved-this-turn` (a permanent that leaves and returns starts again),
  and reset as each turn begins. `notChosenBefore: true` is "choose one **that
  hasn't been chosen**" with no "this turn" (Silent Hallcreeper): the same, never
  reset — only a permanent that leaves and returns, a new object, starts again
  (its ruling). `optional: true` is "you **may** choose
  two" (Shadrix Silverquill): choosing none removes the ability, and
  otherwise it's `minModes` to `maxModes` — never one of a "choose two" (its
  ruling); the client offers "Choose none". `eachTargetsDifferentPlayer:
  true` is "each mode must target a different player": each chosen mode's
  slots are built as an `other` relation on every earlier chosen mode's
  (`triggerTargetSpecs`), so every check of the targets refuses a repeat.
  Both only with `announced`. `announced` with `random: true` is a printed
  "Choose one at random —" on a triggered or chapter ability (Umaro, Raging
  Yeti; Cult of Skaro; Summon: Magus Sisters): picked as it goes on the stack,
  before its targets, among the modes it could have, so players respond knowing
  it (rules 603.3c, 700.2b); `chooseIf` (a `StaticCondition`) is "… you choose
  one instead", read then (Typhoid Mary, Fractured).
  `random-mode-announced.test.ts`. `random: true` alone is "choose one **at random**"
  as the effect applies (Crystalline Giant): nobody is asked — one mode is
  picked on the game's seeded random stream, each equally likely, among those
  whose `ModeOption.onlyIf` (a `StaticCondition`) holds; with none eligible,
  nothing happens. Crystalline Giant's "a kind of counter … that this creature
  doesn't have on it" is ten modes, each `onlyIf: { kind: "self-counters",
  counter, compare: { op: "eq", n: 0 } }`. Only with `minModes`/`maxModes` 1,
  and **not with `announced`**: a triggered ability that picks its mode at
  random as it goes on the stack, before its targets (Summon: Magus Sisters'
  chapters), isn't built. Logged as a `chosen-at-random` event.
- **`may { effect, prompt, cost?, costTimes?, costLife?, costEnergy?, costEnergyX?, costSacrifice?, then?, else?, oncePerTurn? }`** — "You may [effect]". One
  optional mode; same targeting rule as `modal`. `costTimes: true` is "you may pay {1}{G} any number of
  times" (`maxX: 3` for "up to three times"): how many times is asked from 1, it's paid all at once, and
  that number is `"x"` to `effect`, normally a `reflexive-trigger` ("when you pay this cost one or more
  times", once however many, rule 603.12a) whose `any-number` target `max: "x"` or announced `modal`'s
  `maxModes: "x"` reads it too (Intrepid Adversary, Primal Adversary, Tranquil Frillback). `cost` is a mana cost to say
  yes ("you may pay {B}. If you do, draw a card" — Nihil Spellbomb): the
  choice is only *offered* when it's payable, so being unable to pay and
  declining both land on `else`, and the mana is spent as the choice is
  answered (re-checked then, since the board can move in between).
  `costLife` / `costEnergy` are the rest of that cost, as amounts read when
  the `may` applies — Zoraline, Cosmos Caller's "you may pay {W}{B} and 2
  life", Tymna the Weaver's "you may pay X life", "you may pay {E}{E}": the
  choice is offered only when every part can be paid (life: at least that
  much, rule 119.4), and all of it is paid together as it's answered.
  `costSacrifice: { filter, count?, exceptSource? }` is a sacrifice in that
  cost — "you may pay {2} **and sacrifice a token**. If you do, …" (Killer
  Service): asked only when that many would be left to sacrifice once the
  mana is paid (the mana is planned around them, and a Treasure spent on it
  can't pay twice — rule 118.3); which is chosen as a `sacrifice` effect
  asks, before `effect`. `may-cost-sacrifice.test.ts`. Say
  the whole cost in `prompt`, which is what the player sees. `then`
  applies only when `effect` was chosen ("If you do, …" — Ob Nixilis, the
  Fallen); `else` only when it was declined ("If you didn't, …", or an
  "unless" cost framed as the decline branch — Springheart Nantuko, The
  Gitrog Monster's upkeep). needed-cards P19. `oncePerTurn: true` is "**Do
  this only once each turn.**" (Pantlaza, Sun-Favored): the ability still
  triggers every time, but once it has done it this turn it isn't offered
  again (`else` applies instead); a resolution where it was declined doesn't
  count. Same per-ability count as `modal`'s `notChosenThisTurn` — a `may` is
  a choice of one mode. Not "This ability triggers only once each turn", which
  is the trigger's own `oncePerTurn` (§9). `xColor: "R"` with `cost:
  "{X}"` is "you may pay **any amount of {R}**" (Leyline Tyrant): X is paid
  in that colour, each X one {R}, and the X offered goes only as high as the
  player's red mana does; a `reflexive-trigger` under it reads it as X.
  `maxX: EffectAmount` is "X can't be greater than …" (Shanna, Purifying
  Blade's "the amount of life you gained this turn"), read as the `may`
  applies: the X offered goes no higher.
  `costEnergyX` pays an X of energy the player chooses (rule 107.14), X
  what `effect` reads as `"x"` — the payment alone, never the spell's own
  X: `"one-or-more"` is "you may pay one or more {E}. If you do, put that
  many +1/+1 counters …" (not offered with no energy; Territorial
  Aetherkite's "when you do" a `reflexive-trigger` under it), `"any"` is
  "you may pay any amount of {E}. ~ deals that much damage …" (Harnessed
  Lightning, Die Young's `{ product: ["x", -1] }`, Wrath of the Skies'
  `manaValue: { op: "lte", n: "x" }`): X from 0, and `effect` applies
  whatever was paid — declining pays 0 — so no `then`/`else`.
- **`detain { target }`** — detain (rule 701.35): until the effect's
  controller's next turn, the permanent in `target` can't attack or block and
  its activated abilities, mana abilities included, can't be activated (one
  modifier, `abilitiesCantBeActivated`, ended as that turn begins). "Detain up
  to two target creatures your opponents control" is two optional slots, the
  second `other` than the first, and a `sequence` of two `detain`s (Azorius
  Justiciar). Not yet: "detain each …" with no target (Lavinia of the Tenth).
  `unleash-detain.test.ts`.
- **`goad { target | who | filter, forGame? }`** — goad (rule 701.15): until
  the effect's controller's next turn, each creature goaded attacks each
  combat if able and attacks a player other than them if able. `target` is a
  slot holding a **creature** ("goad target creature"; Killian, Decisive
  Mentor's "tap up to one target creature and goad it" is a `tap` then a
  `goad` of the same optional slot) or a **player**, every creature of whose
  is goaded (Geode Rager); `who` is every creature a `PlayerScope` controls
  (Marisi's `"trigger-player"`); `filter` is every creature matching it,
  whoever controls it (Nelly Borca's "goad all suspected creatures" — `{
  type: "creature", suspected: true }`). `forGame: true` is "it's goaded for
  the rest of the game" (Jon Irenicus). **`duration`** is a goad whose end is a
  condition, any `PermanentDuration`: `"while-source"` (Hot Pursuit; The War Games, its
  `filter` `{ thisWay: "created" }` after a `separate` `create-token`), `{
  whileCounter: "duty" }` (Immortal Obligation, `filter: { thisWay:
  "put-onto-battlefield" }`, beside a `restrict` with `cant-attack` and
  `cant-block` records and the same duration; `at: "you-and-planeswalkers"`
  is Promise of Loyalty's "you or planeswalkers you control", naming no battle,
  after a `vote` with `keep`, over `thisWay: "chosen"`), `"while-its-controller-controls-source"`
  (Vislor Turlough, after a `gain-control`): nothing if it couldn't begin (rule
  611.2b). `target` may be `"source"` or `"trigger-object"` (Kros, Defense
  Contractor). **`ungoad { filter }`** ends every one-shot goad on what matches
  (Serene Sleuth); a static goad goes on applying. A player goading a creature twice adds
  nothing (701.15d), so "for each creature goaded this way" counts first, with
  the filter `goadedByYou: false` (Kaima, the Fractured Calm — a creature under
  your goad Aura isn't goaded again). Which defenders a goaded creature may then be sent at is
  worked out as rule 508.1d says — the most requirements obeyed — so it
  attacks a *player* other than its goader rather than a planeswalker while it
  can, and one goaded by every opponent attacks one of them. A goad is a
  designation on the creature (`goadersOf` in `goad.ts` reads every kind), so
  "until your next turn, creatures your opponents control attack each combat
  if able and attack a player other than you if able" is **not** one — that's
  a `restrict` with `must-attack` records.
- **A goad's requirements as a rule of the game** — Kardur, Doomscourge's ETB is a `restrict` with `filter: { type: "creature", controlledBy: "opponent" }`, `restrictions: [{ kind: "must-attack", otherThan: "you" }]` and `duration: "until-your-next-turn"`: it reaches creatures an opponent gets later (rule 611.2c) and none of them is *goaded*. Narrowed: `target` binds that one creature (Alluring Siren's `at: "you"`); `controlledByTarget` a target player's creatures as attackers are declared (Taunt, Imaginary Threats); `at: "source"` is Gideon Jura's "attack Gideon Jura", `at: { target: 1 }` Dulcet Sirens' "attacks target opponent"; `duration: { duringTurnOf: { target: 0 } }` is Taunt's "during target player's next turn", `"during-its-controllers-next-combat"` Trench Behemoth's.
- **A direction to attack in, for a while** — Teyo, Geometric Tactician's "choose left or right. Until your next turn, each player may attack only the nearest opponent in the last chosen direction and planeswalkers controlled by that opponent" is a two-mode `modal` (chosen as it resolves), each mode a `restrict` with `filter: {}`, `restrictions: [{ kind: "attack-only-nearest", direction: "left" }]` (or `"right"`) and `duration: "until-your-next-turn"`. A rule for every player whatever the filter; left is the next player in turn order. Read beside Pramikon's static (`attackOnlyNearestOpponent`): of several one permanent made, its last choice counts, and two permanents that disagree leave nobody to attack. Never a battle.
- **`suspect { target }`** / **`unsuspect { target | filter }`** — suspect a
  creature (rule 701.60): a designation (`GameObject.suspectedAt`) that gives
  it menace and "can't block" until it leaves the battlefield or is no longer
  suspected. `target` is a slot, `"source"` or `"trigger-object"`; suspecting
  a suspect does nothing (701.60d). The menace and can't-block are abilities,
  added as it became suspected: an effect removing all its abilities
  afterwards takes them away without ending the designation, one from before
  doesn't. Not copiable. `unsuspect`'s `filter` is "all suspected creatures
  are no longer suspected".
- **`encore {}`** — Encore (rule 702.140 — Rakshasa Debaser, Kangee's
  Lieutenant): one hasty token copy per opponent, each with
  a `must-attack` record at *that* opponent, all sacrificed at the next end
  step. One effect because the loop, the per-opponent attack requirement and
  the sacrifice are one instruction — and it copies a card in **exile**, which
  the Encore cost put there (`zone: "graveyard"`).
- **`mayPlay` / `grant-play` / `impulse-exile` — every "you may play this card from there"** (rule 601.3), one set of terms, `PlayTerms` (`engine/src/play-permission.ts`), wherever the permission comes from. It answers only *from where*: timing, targets, a land drop and payment are still the cast's own.
  - **What it reaches:** `play: true` is "you may **play**" (a land too, with a land drop and a land's timing, rules 305.1-305.3); absent, "you may **cast**", and a land stays put (305.9). `filter`: which cards, read from the holder's side. `spell`: which spells, as the face cast (601.3e). Lands aren't spells, so `spell` and every cost below are ignored for one.
  - **Cost:** `free: true` is "without paying its mana cost", and only that way; `free: { filter? }` is "you may cast [those] without paying", beside paying. `byPaying` (mana) and `byPayingLife` (life equal to its mana value) are alternative costs (118.9), the only way under this permission; another permission reaching the card may still let it be paid for normally (601.3). Additional costs (601.2f, paid in full or not offered, 601.2h): `payLife`, `sacrifice: CardFilter`, `exileOthers: N` + `exileFilter`, `discard`, `removeCounters: N` (from among creatures you control, each one's choice as it's paid), `costIncreasePerOther: CardFilter`. `tax: { generic, opponentsOnly? }`, `reduce: N` (generic), `undaunted`, and `spendAs` (118.14: for spells cast this way and no others).
  - **How often:** `oncePerTurn` (one play a turn among everything this source gives it), `perType: CardType[]` (Muldrotha: once a turn per type, `"land"` is what lets it play a land; on a `grant-play` or `impulse-exile`, one play of each type shared among the cards for as long as the grant lasts — Aminatou's Augury's "for each nonland card type, you may cast a spell of that type from among the exiled cards", a multi-typed card offered once per type it could spend), `upTo: N` (this many plays in all, shared among the cards, "a spell from among those cards").
  - **When:** `yourTurnOnly`; `gate: StaticCondition` (live); `sourceDid: "attacked" | "lore-counter" | "attacked-with-a-token"` (only during a turn the holder did this with the source, in the stint it was in, whatever has become of it since); `flash: true` is "If you cast a spell this way, you may cast it as though it had flash" (Elsha of the Infinite's `{ from: "library-top", filter: { notTypes: ["creature"] }, flash: true }`): a cast under this permission may begin any time its caster has priority (rule 601.3c), and the same card under another permission (Bolas's Citadel's, for life) keeps its own timing.
  - **Afterwards:** `exileAfter` (if the spell would go to a graveyard, exile it), `gainsHaste`, `landsEnterTapped`, `entersWith: { kind, amount }` (a permanent or land played this way enters with counters).
  - **On a static:** `mayPlay: { from: "graveyard" | "exile" | "library-top", …terms, exiledByYou?, linked? }`. `linked`: only cards exiled with this permanent's present stint (rule 607.2a); a thief who gains control may use it. It ends the moment the permanent leaves. `affects` is ignored. Oracle of Mul Daya is `{ from: "library-top", play: true, filter: { type: "land" } }`; Future Sight `{ from: "library-top", play: true }`; "lands and creature spells" `{ from: "library-top", play: true, spell: { type: "creature" } }`.
  - **On a `player-effect`** (a rule for its duration, 611.2c, so it reaches cards that get there later): `mayPlay: { from, …terms, whose?, linked? }`; `from: "hand"` is another player's hand, `whose` a `PlayerScope` ("any graveyard" is `"each-player"`, Sen Triplets' `{ target: 0 }`, with `handRevealed`, a test insists on it). `linked` is "from among cards exiled with this artifact" (Idol of Endurance, usually `upTo: 1`): still that stint's after the source has gone.
  - **On named cards** (kept on the card, ended by any move: 400.7): `grant-play { cards, duration, byOwner?, whileSource?, fromNextTurn?, …terms }`. `cards`: an `ObjectRef` or a set (each member that's still the same object: `{ thisWay: "exiled" }`, `"exiled-with-source"`, `0`, `"source"`), or `{ filter }` (the controller's graveyard cards matching as it resolves, not one put there later). `exile`, `discard-chosen`, `look-and-choose` and `search-library` take the same as `mayPlay: { duration, …terms }`.
  - **`impulse-exile { amount, duration, whose?, whoseIf?, choose?, faceDown?, linked?, byOwner?, whileSource?, fromNextTurn?, …terms }`**: exile the top `amount` of `whose` library face up and give that. `choose` gives it to only that many, chosen (`choose-from-zone`, destination `"exile-playable"`); `faceDown` exiles them face down for the controller's eyes only (406.3); `whoseIf` keeps to the players it holds for. `byOwner`: each card's owner may play it. Otherwise the controller's, whoever owns the cards (601.2a, 608.3a). `duration` is `PermissionDuration`, read from the side of the player it's given to. `whileSource` is "from among cards exiled with [this]" as an ability of it: usable only while it stays the same object on the battlefield, on top of `duration`, and with it a `filter`'s `{ amount }` is counted live from the source's side (Maralen). Reckless Impulse is `{ amount: 2, duration: "until-end-of-your-next-turn", play: true }`; Narset, Enlightened Master `{ amount: 4, duration: "end-of-turn", filter: { notTypes: ["creature", "land"] }, free: true }`; Nahiri's "you may cast Equipment spells this way without paying" `free: { filter: { subtype: "Equipment" } }`.
  - **On the card's own text:** `mayPlaySelf: { from: ["graveyard", "exile"], if?, …terms }`, its owner's, functioning from there (113.6f), `if` read as it's cast and never again (Gravecrawler's ruling).
  - **`cast-now`** takes the same cost words (`free`, `byPaying`, `byPayingLife`, `byPayingEnergy`, `byDiscarding`, `alsoPaying`, `spendAs`, `gainsHaste`, `exileAfter`, `play`, `spell`) but is a decision during a resolution (608.2g), with no duration or limit.
  - **Hidden zones:** a permission shows nothing by itself. Another player's hand needs `handRevealed`; a library top needs a look (`looksAtOwnLibraryTop` or a reveal). A card exiled face down reaches only a player who may look at it (406.3, 601.3f).

- **`unless { chooser, options, otherwise }`** — a *punisher* clause, where
  **someone else** decides whether to pay and `otherwise` happens only if they
  don't (Demanding Dragon, Indulgent Tormentor, Kazuul). `chooser` is a
  target-slot index holding a player — or an object, whose controller
  decides: Spell Pierce's "counter target noncreature spell unless **its
  controller** pays {2}" is `chooser: 0` with `otherwise: { kind: "counter",
  target: 0 }` — `"trigger-controller"` (the
  controller of the permanent whose event fired the trigger),
  `"trigger-player"` (the player that event names), `"active-player"`, any
  other `PlayerRef` — `"that-player"` in a `for-each-player` (Sivriss,
  Lim-Dûl's Hex, whose "{B} or {3}" is one `unless` nested in the other's
  `otherwise`), `"chosen-player"` (Energy Vortex), `{ controllerOf }`
  (Torment of Venom) — `{ anyOf: <scope> }`, each of them in turn order until
  one takes it ("**any other player** may pay": Ice Cave, whose `otherwise` is
  empty and whose counter is the option's `ifPaid`), or
  `"you"` — The Gitrog Monster's "sacrifice ~ unless **you** sacrifice a
  land" (`otherwise: { kind: "sacrifice-source" }`), which unlike a `may`
  with an `else` isn't offered without a land to sacrifice. Each
  `UnlessOption` is `{ pay }` (mana), `{ payGeneric }` (that much generic mana,
  read as the effect applies — Esper Sentinel's "pays {X}, where X is this
  creature's power" is `{ payGeneric: { powerOf: "source" }, text: "Pay {X}." }`,
  `{X}` in the text showing the amount), `{ payLife }`, `{ sacrifice }` (with
  `exceptSource: true` for "sacrifice **another** creature", and `count` for
  "sacrifice **two** nonland, nontoken permanents" — Rakdos, Patron of Chaos;
  Strefan, Maurer Progenitor's "you may sacrifice two Blood tokens. If you
  do" is an `each-player-may` of `who: "you"` with that option and an `ifDid`),
  `{ discard }` (a count — Tergrid's Lantern's "…unless they sacrifice a
  nonland permanent **or discard a card**") or `{ putFromHand }` (a filter —
  "put a land card from your hand onto the battlefield") plus a `text` label;
  a mana option has to be the only one, since that payment rides on the
  decision itself and would be owed whichever option was taken. Options the
  chooser can't take in full aren't offered (rule 118.3; life needs at least
  that much, rule 119.4), so "couldn't" and "wouldn't" both land on
  `otherwise` — which is what the printed cards do too. This is the difference from `may`: the decision is
  raised for the chooser, not the effect's controller. What happens when they
  don't pay is still the **controller's** effect — an opponent who declines
  Rhystic Study's {1} lets *you* draw, and Smothering Tithe's Treasure is
  yours — so an `otherwise` that is itself a `may` asks the controller.
- **`each-player-may { who, prompt?, effect?, options?, choices?, ifDid?, ifDidnt?, resultsFor? }`**
  — a choice that belongs to other players, or to several: "each player
  may …", "each opponent may …", "its controller may …" (`who:
  "trigger-controller"` — Selvala, Heart of the Wilds), "the player whose
  turn it is may …" (`"active-player"` — Obeka). Everyone in `who` is asked
  **in turn**, from the active player (rule 101.4), with a `choose-modes`
  decision of their own — and then what they chose happens **at once**
  (101.4): a discard or a sacrifice a player chooses is held
  (`GameState.heldChoices`), the discarded card hidden in their hand while
  the rest choose (101.4a), until the last player has chosen; then every
  held discard and sacrifice happens together, before `ifDid` / `ifDidnt`
  (Perforating Artist, Tomb of Annihilation's Sandfall Cell, Acererak's
  attack). Anything else a player chose (a draw, a whole-hand discard, a
  search) is still done before the next is asked. They may do `effect` (asked with `prompt` — Kwain, Itinerant
  Meddler's "each player may draw a card"), or one of `options`
  (`UnlessOption`s, as for `unless`, each offered only to a player who can
  take it — Kynaios and Tiro's `{ putFromHand: { type: "land" } }`; a
  punisher asked of each opponent, "each opponent loses 3 life unless that
  player sacrifices a nonland permanent or discards a card", is `options`
  and an `ifDidnt`). Either way it's **their own** effect: "you" in it is
  them. Then `ifDid` / `ifDidnt` apply once for each player who did /
  didn't, in turn order, as the **effect's controller's** effect, with
  `"that-player"` naming that player — Kwain's "each player who drew a card
  this way gains 1 life" (`ifDid: { kind: "gain-life", amount: 1, who:
  "that-player" }`), Wernog, Rider's Chaplain's "each opponent who doesn't
  loses 1 life. You investigate for each opponent who investigated this
  way" (an `ifDidnt` `lose-life` of `"that-player"`, an `ifDid`
  investigate), a tempting offer's "for each opponent who does, you …"
  (Tempt with Bunnies: the same draw-and-Rabbit `sequence` as yours, the
  opponents' `effect` and the `ifDid`; an offer that can be taken and not
  done, as Tempt with Immortality's return, checks it in `ifDid` with a
  `this-way` condition of `"that-player"`).
  `resultsFor` keeps the follow-ups to a scope: Kynaios and Tiro's "then each
  **opponent** who didn't draws a card" asks `"each-player"` with
  `resultsFor: "each-opponent"`. A player with nothing they could take isn't
  asked, and didn't. A permanent a player **sacrificed** in answer (a
  `sacrifice` option) is their follow-up's `"sacrificed"`, so
  `sharesCardTypeWith: "sacrificed"` inside `ifDid` reads it: Braids, Arisen
  Nightmare's "you may sacrifice an artifact, creature, …. If you do, each
  opponent may sacrifice a permanent of their choice that shares a card type
  with it. For each opponent who doesn't, …" is a `who: "you"` sacrifice
  option whose `ifDid` is the opponents' `each-player-may`. (The follow-ups'
  dynamic filters are bound as they apply, not when the question is asked.)
  "You may sacrifice … **When you do**, …" is the same with a
  `reflexive-trigger` as the `ifDid`, so the follow-up goes on the stack and
  targets then (Ziatora, the Incinerator: `value: { powerOf: "sacrificed" }`
  carries the creature's last-known power; Felothar, Dawn of the Abzan).
  `who: { controllerOf: n }` asks whoever controls what slot `n` points
  at, as it last existed if it has left (rule 608.2h): Chain of Vapor's "then
  that permanent's controller may sacrifice a land of their choice. If the
  player does, they may copy this spell" is a sacrifice option whose `ifDid`
  is a `"that-player"` `each-player-may` of a `copy-spell` of `"source"` —
  their effect, so the copy is theirs.
  `choices` (two or more `{ text, effect }`) is a
  **villainous choice** (rule 701.56 — "each opponent faces a villainous
  choice — …, or …"): each of them must pick one, and the one picked is the
  **controller's** effect about them ("you draw a card"; "that player
  discards a card" is `who: "that-player"`). A vote is its own effect,
  `vote` (below), not a `choices`.
- **`vote { for, secret? }`** — (a `choose`'s `who` may be a target slot's player, `{ target: 0 }`: Imperial Edict's "**target opponent** chooses a creature they control. Destroy that creature", then a `for-each-voted`; `target-player-chooser.test.ts`) a vote (rule 701.38): each player still in
  the game votes, in turn order from the effect's controller ("will of the
  council", "council's dilemma" — "starting with you, each player votes …"),
  each seeing the votes before theirs; `secret: true` is secret council
  ("each player secretly votes …, then those votes are revealed"): no vote
  shows until all are revealed together. `for` is `{ options: ["time",
  "knowledge"] }`, `{ permanent: <filter read from your side>, upTo?, count?, own?, keep? }`
  (Council's Judgment's "a nonland permanent you don't control" — not a
  target, so hexproof doesn't stop it; Vault 11's "up to one creature" is
  `upTo: 1`; with `choose`, `count: 3` is "chooses three", one vote a permanent;
  `keep: true` says what's chosen is spared, for how it's asked: "each player
  chooses a creature they control. Destroy the rest" (Divine Reckoning) is this
  and a `destroy-all` of `{ type: "creature", notThisWay: "chosen" }`) or
  `{ player: "any" | "another" }`. A player with a "while voting, you may
  vote an additional time" (`static: [{ votesAdditionalTime: true }]` — Tivit)
  may cast one more vote per such permanent (701.38d). The steps after it
  read the votes:
  - `{ votesFor: i }` — option `i`'s votes (Selvala's Stampede's "for each
    wild vote" with `reveal-until-count`);
  - condition `{ kind: "vote-won", option: i }` — "if time gets **more
    votes**", more than each other option; "or the vote is tied" is its
    `else` (Plea for Power, Sail into the West); `{ kind: "votes-cast" }` —
    any vote at all (Vault 11's "if no creature got votes" under a `not`);
  - `for-each-vote { option?, effect }` — "for each evidence vote,
    investigate" (Tivit), once per vote, voters in turn order from the
    active player, `"that-player"` the voter;
  - `for-each-voted { which: "most" | "voted" | "unvoted", effect,
    simultaneous? }` — "exile each permanent with the most votes or tied"
    (Council's Judgment — target slot 0 is the permanent), "for each creature
    with one or more votes, put that many stun counters on it" (Trap the
    Trespassers, with `{ votesReceived: 0 }`), "each player draws a card for
    each vote they received … each player who received no votes may …"
    (Círdan the Shipwright — `"that-player"`, `{ votesReceived:
    "that-player" }`).
  **"Each player chooses …"** (rule 101.4 — not a vote) is the same effect
  with `choose: true`: the same questions, one player at a time, each
  knowing the choices before theirs, but no additional votes and nothing
  that triggers on voting sees it. `who` narrows who chooses ("each opponent
  chooses money, friends, or secrets" — Master of Ceremonies); `startingWith`
  is `"active-player"` by default (101.4), `"you"`, or `"next-opponent"`
  (Sadistic Shell Game's "starting with the next opponent in turn order").
  With `choose`, `for` may also be `{ number: { min?, max? } }`: "each player
  [secretly] chooses a number" (Wheel of Misfortune, Menacing Ogre), "target
  opponent chooses a number" (Choice of Damnations), asked as the
  `choose-number` decision. Later steps read them as the amount `{ votedNumber:
  "highest" | "lowest" | "that-player" | <target slot> }` and the condition `{
  kind: "voted-number", who: "you" | "that-player", is: "highest" | "lowest" }`.
  `for` may also be `{ creatureType: true }` (Harsh Mercy), and a
  permanent's filter `own: true` reads it from the chooser's side (Agitator
  Ant's "a creature **they** control"). The steps after it read the choices
  as they read votes: `for-each-voted { which: "voted" }` for each permanent
  chosen (Eye of Doom's doom counters, Sadistic Shell Game's destroy —
  `simultaneous: true`), `for-each-vote { option }` for each player who
  chose an option. **`with-choices { effect }`** substitutes what was chosen
  into `effect`: `CHOSEN_THIS_WAY` in a list is every option chosen, once
  each (Harsh Mercy's `notSubtypes: [CHOSEN_THIS_WAY]`, Patriarch's
  Bidding's `subtypes: [CHOSEN_THIS_WAY]` — its "each player returns all
  creature cards … from their graveyard to the battlefield" is
  `return-from-graveyard`'s `from: "each-graveyard"`, `count: "all"`: every
  graveyard at once, each card under its owner's control, also Open the Vaults'
  "return all … from all graveyards … under their owners' control", Planar Birth's
  `enterTapped` and Pyrrhic Revival's `withCounters`; `from: "all-graveyards"` with
  `destination: "battlefield"` is Rise of the Dark Realms' "under your control", with
  `destination: "hand"` Infernal Caretaker's "to their owners' hands"; "that
  weren't put there this way" is the filter's `notThisWay`, Bringer of the Last
  Gift's); inside `for-each-vote` it is that
  voter's own choice (Grave Sifter's "cards of that type"). Not yet: a
  choice kept on a permanent for its statics (Archangel of Strife's "players
  who chose war"), or chosen among another player's permanents (Grenzo's
  Rebuttal's "the player to their left").

  "Each player discards a card" (`discard` with a scope of several players)
  follows rule 101.4 too: each chooses in turn from the active player, the
  chosen cards staying face down in hand (101.4a), then all are discarded at
  once — Stronghold Rats, Smallpox. So does a card each player chooses to
  put from their hand onto the battlefield in an `each-player-may`'s
  `putFromHand` (Show and Tell): every one enters together once all have
  chosen, after each has made its "as this enters" choices.

  "Whenever players finish voting" is the `{ on: "event", event: "voting-finishes" }` trigger,
  whose ability reads that vote: the `"opponents-who-voted-with-you"` and
  `"you-and-opponents-who-voted-with-you"` scopes and `{
  opponentsVotedOtherwise: true }` (Erestor of the Council, Model of Unity).
  Not yet: a voter's own choice after the vote ("the voter chooses a
  creature they control" — Elrond of the White Council), "a permanent owned
  by the voter" (Expropriate).
- **`choose-creature-type { then }`** — "Choose a creature type. [then …]"
  as a spell resolves (rule 205.3m — Crippling Fear, Distant Melody). The
  controller picks from the full catalog (`engine/src/creature-types.ts`,
  regenerated from Scryfall by `npm run gen:creature-types -w engine`), and
  every string exactly equal to `CHOSEN_CREATURE_TYPE` (from `helpers.ts`)
  anywhere inside `then` is replaced by the chosen type before `then` applies
  with the spell's own targets and `x` — so write
  `filter: { type: "creature", notSubtypes: [CHOSEN_CREATURE_TYPE] }` or
  `count: { countOf: { controlledBy: "you", subtype: CHOSEN_CREATURE_TYPE } }`.
  The decision carries `catalog: true`, which the client renders as a search
  popup with the chooser's most common creature types as suggestions. A
  *permanent* that remembers its type is `chooseCreatureTypeOnEnter` instead
  (Urza's Incubator), not this. `options` and `prompt` choose among a fixed
  list as buttons. `sentinel: FIRST_CHOSEN_TYPE` puts the answer in that
  placeholder instead, so a second choice can nest inside `then`: Vision
  Charm's "choose a land type and a basic land type. Each land of the first
  chosen type becomes the second chosen type".
- **`choose-value { value, then, on?, among?, min?, max? }`** — "Choose a
  color / a card type / a number / a counter on …" as a spell or ability
  **resolves**, then do `then` with it (nobody can respond knowing it —
  Sudden Demise's ruling). Put everything after the choice in `then`:
  - `value: "color"`: every `CHOSEN_COLOR` (from `effects.ts`) in `then`
    becomes the colour — Persecute's `discard-hand { who: 0, filter: {
    colors: [CHOSEN_COLOR] }, reveal: true }`, Sudden Demise's `damage-all`
    (its own `"x"` still the spell's X).
  - `value: "card-type"`: rule 205.2a's nine, `CHOSEN_CARD_TYPE` — Blood
    Oath's `{ thisWay: "revealed", filter: { type: CHOSEN_CARD_TYPE } }`
    after a **`reveal-hand { who }`** ("target opponent reveals their hand":
    shown to all, left in the hand, counted as revealed this way).
  - `value: "counter-kind"`: a kind of counter on the object in target slot
    `on` ("choose a counter on target permanent" — Ichormoon Gauntlet), or
    on a permanent matching `among`; `CHOSEN_COUNTER` is the kind (`add-counter
    { counter: CHOSEN_COUNTER }`). None there: nothing is chosen and `then`
    doesn't happen. "Remove a counter from …" of the player's choice is
    `remove-counters { counter: "any" }`, not this (Medicine Runner).
  - `value: "number"`: any whole number from `min` (0), up to `max` if the
    card bounds it — the `choose-number` decision. `then` reads it as
    **`"x"`** (Void's `manaValue: { op: "eq", n: "x" }`), so a card can't
    also read its own {X} there. `max` is an amount, read before the answer
    replaces X: "put **up to X** counters, total no more than four" is `max: {
    leastOf: ["x", { difference: [4, { countersOn: "source", counter }] }] }`.
    `who` names another chooser (Diminishing Returns' "each player draws up
    to seven cards" is a `for-each-player` of this with `"that-player"`, each
    drawing before the next is asked). `remember: true` keeps the answer as
    the number the source chose (`{ chosenNumber }`, and the
    `setBasePtFromCount` count `"chosen-number"`), the last replacing the one
    before: Shapeshifter's upkeep.
  A choice "as this enters" is `chooseOnEnter` instead, with
  `chooseOnEnterLook: "opponent-hand"` for "look at an opponent's hand, then
  choose" (Arachne, Psionic Weaver: the opponent asked first among two or more,
  the hand shown to the chooser alone beside the options; what the word does is
  one static per word with `condition: { kind: "chosen-on-enter", value }`,
  Archon of Valor's Reach's shape). A colour or number
  that does the same thing per value with no state is still fine as a
  resolution-time `modal` (Addle, By Invitation Only). The scaffolder reads
  Persecute's, Sudden Demise's, Blood Oath's and Ichormoon Gauntlet's lines.
- **`players-pay-any-amount { resource, startingWithYou?, untilNoOnePays?, then?, each? }`** —
  "each player may pay any amount of mana" as it resolves, one at a time, each
  knowing what those before them paid, from the active player, or from you with
  `startingWithYou` (join forces). Mana is a `choose-modes` with an `{X}`, life
  a `choose-number` up to what they can pay, paid at once. Nobody who can pay
  nothing is asked. `then` reads the total as `"x"`: Minds Aglow's `draw { amount:
  "x", who: "each-player" }`, Mana-Charged Dragon's `modify-pt`. `each`, all at
  once, for each player who paid, reads what they alone paid as `"x"`, about
  them: Liege of the Hollows' `create-token { count: "x", who: "that-player" }`.
  `untilNoOnePays` is Plague of Vermin's "repeat this process until no one pays
  life". It asks every player: a `may` with `cost: "{X}"` is one player's.
- **`bid-life { who, opening, then?, ifYouWin? }`** — "each player may bid life":
  you open at `opening` (a number, or `"any"` for Pain's Reward's "a bid of any
  number"), then in turn order each other bidder may top it, a yes or no and then
  how much, until the turn comes back to the high bidder. A bid isn't a payment,
  so nothing bounds it (the rulings) and nothing is lost until the end. `who` is
  `"each-player"` or `{ youAndControllerOfTarget: 0 }` (Mages' Contest). `then`
  has the high bidder as `"that-player"` and the bid as `"x"`, so "loses life
  equal to the high bid" is written out in it (Illicit Auction's `lose-life` and
  `gain-control { who: "that-player" }`); `ifYouWin` follows if that's you.
- **Choosing a card name** (rule 201.4 — `card-names.ts`; the
  `choose-card-name` decision, a search popup over every card name the
  registry holds, tokens and split cards' wholes aside, the suggestions picked
  by an `aim`). Three shapes:
  - **As it enters**: the card field `chooseCardNameOnEnter: { filter?, aim?,
    look?, reveal? }` (Pithing Needle, Meddling Mage). `filter` is a
    `CardNameFilter` — `{ notTypes: ["land"] }` "a nonland card name", `{
    types: ["creature"] }`, `{ notBasicLand: true }`, `{ types: ["land"],
    nonbasic: true }`. `look: "opponent-hand"` is "look at an opponent's hand,
    then choose" (Sorcerous Spyglass: the opponent asked first among two or
    more, the hand seen by the chooser alone); `reveal: "each-opponent-hand"`
    is Alhammarret's "each opponent reveals their hand. You choose the name of
    a nonland card revealed this way" (only those; none, and no name). `aim`:
    `"opponent-spells"` (default), `"opponent-permanents"` (ability locks and
    taxes), `"own-hand"`, `"own-library"`, `"opponent-library"`.
  - **Its statics and triggers** read the name through the `CardFilter` clause
    **`chosenName: true`** (any name chosen for the permanent applying it):
    `prohibits` `cast` with `filter: { chosenName: true }`; `activate` with `of: {
    chosenName: true }, anyZone: true, except?: ["mana"]` — "of
    sources" reaches cards in every zone (cycling, a graveyard ability);
    `play-land` for "lands with the chosen name can't be played";
    `costModification { applies: { chosenName: true } }` with `caster: "you" |
    "opponent" | "enchanted-player"`; `abilityCostModification { …, anyZone:
    true }`; a `cast-spell` trigger's `filter` (`who: "attached"` is a Curse's
    enchanted player); a damage replacement's `source`; a target's filter;
    `goad`'s `filter`.
  - **As it resolves**: **`choose-card-name { filter?, aim?, chooser?,
    remember?, then }`** (Brain Pry, Conjurer's Ban). Every string exactly
    `CHOSEN_CARD_NAME` (from `effects.ts`) inside `then` becomes the name —
    **`{ hasName: CHOSEN_CARD_NAME }`** is "a card with the chosen name" (either
    half of a split card, rule 709.4a). Put everything after the choice in
    `then`. `chooser: <slot>` is "target player chooses a card name";
    `remember: true` keeps the name on the source permanent for its
    `chosenName` statics (Petrified Hamlet's enters trigger, Day of the
    Moon's chapters). "Until your next turn, your opponents can't cast spells
    with the chosen name" is a `prohibit` effect with `cast` and `play-land` acts; "spells with the chosen name cost {1} less this turn"
    (anyone's) is `reduceSpells { …, allCasters: true }`. Cabal Therapy's
    "Choose a nonland card name. Target player reveals their hand and
    discards all cards with that name" is a `discard-hand` (`reveal: true`,
    `filter: { hasName: CHOSEN_CARD_NAME }`) in `then`; Predict's "choose a
    card name, then target player mills a card. If a card with the chosen
    name was milled this way, you draw two cards" a `sequence` of the mill
    and a `this-way` `"milled"` conditional with that filter.
  - **With a player, as it enters**: `choosePlayerOnEnter` beside
    `chooseCardNameOnEnter` (Booby Trap: "choose an opponent and a card name
    other than a basic land card name" — `filter: { notBasicLand: true }`,
    `aim: "opponent-library"`). Its "the chosen player reveals each card they
    draw" is the static `revealsDraws: "chosen-player"`, and "when the chosen
    player draws a card with the chosen name" a `draws` trigger with `who:
    "chosen-player"`, `filter: { chosenName: true }` (a `draws` filter reads
    the permanent's chosen name); "sacrifice this artifact. If you do, it
    deals 10 damage to that player" a `sacrifice-source` whose `then` is the
    damage to `"trigger-controller"` (`name-a-card.test.ts`).
  The scaffolder reads "As ~ enters, choose a … card name." and the lock, tax
  and can't-cast lines after it, Cabal Therapy's and Predict's spells, and
  Booby Trap whole.
- **Choosing a player** ("the chosen player"), kept on the permanent as
  `GameObject.chosenPlayer`. Two ways to choose:
  - **As it enters**: the card field `choosePlayerOnEnter: "player" |
    "opponent"` (rule 614.1c — Saskia the Unyielding, Black Vise, Cursed
    Rack), asked through the `choose-creature-type` decision with the players
    as options, opponents first in turn order from the next (the client
    names them). With one to choose nobody is asked.
  - **As an ability resolves**: `choose-opponent { remember: true }`, the
    one chosen replacing the last — Triarch Stalker's "at the beginning of
    combat on your turn, choose an opponent. Creatures attacking **the last
    chosen player** have menace" (`then` may be an empty `sequence`).
  - **Under the one chosen**: `entersUnderChosenPlayer: true` beside `choosePlayerOnEnter: "opponent"`: "enters under the control of an opponent of your choice" (Xantcha, Captive Audience, Pendant of Prosperity), a replacement (rule 614.1d) asked of whoever it would enter under, which outranks an effect's "under your control"; their default control, so it's exiled if they leave (800.4a). `flicker`'s `under: PlayerRef` is the same for a return (`choose-opponent` of it with `"that-player"`: Sol'Kanar the Tainted, Zuko, Conflicted).
  - **Secretly**: `secretChoiceOnEnter: true` beside `choosePlayerOnEnter`
    (Guardian Archon's "as this creature enters, secretly choose an
    opponent"), `choose-opponent { remember: true, secret: true }` as an
    ability resolves (Stalking Leonin), and `choose-creature-type { options,
    remember: true, secret: true }` for a word from a short list (A Killer
    Among Us, read back by `ofChosenType`). Kept as `GameObject.secretChoice`:
    no other seat's view has the answer and no event names it, until the
    cost `revealChosen: true` ("reveal the player you chose", "reveal the
    creature type you chose") shows it. Only the player who chose can pay
    that, so a new controller can't activate it. Each player's own secret
    *number* is a `vote { choose: true, secret: true, for: { number } }`
    (Goblin Game), with nothing kept on a permanent.
  - **Read back** by the `"chosen-player"` `PlayerScope` (effects and
    amounts: `damage { who: "chosen-player" }`, `{ cardsInHand:
    "chosen-player" }` — as the source last existed once it has left), the
    trigger subject `who: "chosen-player"` on a `step-begins` ("at the
    beginning of the chosen player's upkeep" — that player is then
    `"active-player"`), `maxHandSize { who: "chosen-player" }`, and the
    `CardFilter` clause `attackingChosenPlayer: true`. A CDA or count-scaled
    bonus counted for the chosen player takes `forChosenPlayer: true` on
    `setBasePtFromCount` (Lost Order of Jarkeld's creatures, Entropic
    Specter's `"cards-in-your-hand"`) or `grantPtPerCount` (Nyxathid's
    `{ cardsInHand: true, forChosenPlayer: true, pt: [-1, -1] }`): every
    "you" in the count is that player, and nobody chosen (off the
    battlefield) or one who has left the game counts 0. Two chosen players
    (Bitter Feud, Sower of Discord) aren't built.
  The scaffolder reads "As ~ enters, choose a player / an opponent.", "At the
  beginning of the chosen player's upkeep" and "The chosen player's maximum
  hand size is N."
- **Choosing a permanent as it enters** ("the chosen creature"): the card
  field `choosePermanentOnEnter: { filter, prompt, optional?, attach?,
  counter? }` (rule 614.1c — Tyrannical Pitlord, Dauntless Bodyguard), asked
  through `choose-permanents` among the permanents matching `filter` from its
  controller's side, never itself ("another"); a forced choice of the only one
  isn't asked. Kept as `GameObject.chosenPermanent` with the stint it was
  chosen in, and read back by the `"chosen"` `ObjectRef`
  (`sacrifice-target`, `grant-keyword`, … `target: "chosen"`) and a static's
  `affects: { scope: "chosen" }` — only while it's still that object (rule
  400.7), as the source last existed once it has left (Bodyguard sacrificed
  for its own cost). `attach: true` enters an Equipment attached to it
  (Grifter's Blade — unattached if it can't equip it, rule 301.5e);
  `counter: "phylactery"` puts one such counter on it (Phylactery Lich). The
  scaffolder reads "As ~ enters, choose another creature you control.", "The
  chosen creature gets +N/+N and has K." and "sacrifice the chosen creature" /
  "the chosen creature gains K until end of turn".
- **Choosing a permanent as an ability resolves, kept for later**: `choose-permanents
  { …, upTo: 1, remember: true }` — Zenos yae Galvus's "When Zenos enters,
  **choose a creature an opponent controls**." The one chosen becomes the
  source's `chosenPermanent` (as `choosePermanentOnEnter` keeps it), read back
  the same ways, and by the trigger subject **`who: "chosen"`** — "When **the
  chosen creature** leaves the battlefield, transform Zenos" (`on:
  "leaves-battlefield"`): only in the stint it was chosen in (rule 400.7), as
  the source last existed if it has left. The choice is announced as a
  `cards-chosen-from-zone`, so a later step of the same resolution spares it
  with `{ not: { thisWay: "chosen" } }` ("creatures other than Zenos and the
  chosen creature get -2/-2", Zenos still there or not); nothing is kept once
  the source has left the battlefield.
- **Choosing a player as it transforms**: the card field
  `choosePlayerOnTransform: "opponent" | "player"` on the face named — "As this
  creature transforms into Shinryu, choose an opponent" (rule 712.20). Its
  controller chooses as the `transform` effect resolves (a `choose-modes`,
  asked only among two or more), kept as `chosenPlayer` and read back as
  `"chosen-player"` is. Not when it enters showing that face (it didn't
  transform).
- **A choice by another player**: `choose-permanents { chooser }` — "at the
  beginning of each player's upkeep, **that player** returns a creature they
  control" (`chooser: "active-player"` — Sunken Hope), "**defending player**
  chooses an untapped creature they control" (`"trigger-player"` — Crashing
  Boars). The filter is read from the chooser's side and `then` applies with
  them as its controller. `min` is an amount: Tangle Wire's "taps … for each
  fade counter" is `min` and `upTo` both `{ countersOn: "source", counter:
  "fade" }`. `exceptTriggerObject: true` is "**another** permanent" beside
  the one the trigger is about (Cloudstone Curio, Saw's "other than that
  creature"), with `CardFilter.sharesPermanentTypeWith: "trigger-object"` for
  "that shares a permanent type with it" (rule 110.4 — kindred doesn't
  count). Several players each choosing is a `vote` with `choose`. The
  scaffolder reads "that player / defending player returns, untaps or taps a
  … they control" in an each-player upkeep or attack trigger.
- **`conditional { condition: StaticCondition, then, else? }`** — apply `then`
  if `condition` holds at resolution (evaluated from the source's controller's
  view — same `{ controls, your-turn, threshold, metalcraft }` union as a
  static's `condition`), otherwise `else`. Scute Swarm ("if you control six or
  more lands …").

A `CardFilter` numeric clause may be written `{ op: "eq", n: "x" }` to compare
against the `{X}` of the spell or ability applying it (Steel Hellkite: "each
nonland permanent with mana value X"; Chord of Calling's `search-library`: "a creature card
with mana value X or less"). An **activated ability's target** filter may read
it too (Rydia, Summoner of Mist: "target Saga card with mana value X"): such an
ability is offered once per X that has a legal set of targets, each offer with
that X fixed (`xCost: { minX, maxX }` equal). A **spell's** target filter may
read it the same way (Stolen by the Fae: "return target creature with mana value
X"): X is announced before targets (rule 601.2b–c), so the spell is offered once
per X that is payable and has a legal set of targets, its `targetOptions` at
that X, and the target is checked at that X as it's cast and as it resolves.
Mana alone pays such an offer (no convoke or delve). `destroy-all` also takes
`onlyControllersDamagedBySource`, narrowing to permanents whose *controller*
this effect's source dealt combat damage to this turn — a fact about the
source, so it isn't a `CardFilter` clause.

**Odd and even** are the filter clauses `manaValueParity` and `powerParity`
(zero is even), each `"odd"` or `"even"` as printed (Void Winnower's `prohibits`
and its `cant-block`; Kianne's `source` condition on `powerParity`). "Choose odd
or even" as it resolves is `choose-creature-type { options: ODD_OR_EVEN, prompt:
"Choose odd or even", then }`, with the clause `CHOSEN_CREATURE_TYPE` in `then`
(Extinction Event, Zimone's Hypothesis). As it enters it's `chooseOnEnter:
ODD_OR_EVEN`, with the clause `"chosen"` in its statics and triggers (Gollum,
Riddle Master), and "without mana value of the chosen quality" a `not` of it
(Ashling's Prerogative). No new decision: both ask through
`choose-creature-type`'s short menu.

`CardFilter` (used by the mass / tutor effects) is a predicate over an object's
*computed* characteristics — `{ type, types, notTypes, typesAnyOf, subtype,
subtypes, supertype, notSupertype, name, notName, colors, notColors, colorless,
manaValue, manaValueParity, power, powerParity, toughness, basePower, baseToughness, counters, controlledBy,
ownedBy, keyword, notKeyword, tapped, token, isCommander, equipped, enchanted,
modified, anyOf, manaSpent, putIntoGraveyardFromLibraryThisTurn, putIntoGraveyardThisTurn, blockedThisTurn,
discardedThisTurn, drawnThisTurn, enteredThisTurn, turnedFaceUpThisTurn, controlledContinuously, controlledSinceTurnBegan, controlledByAsSetUp, attackedThisTurn, attackedThisCombat, attackedYouThisTurn, attackedDuringControllersLastTurn, attackedBattleThisTurn, damagedThisTurnBy, excessDamageThisTurn,
dealtDamageToCreatureThisTurn, dealtDamageThisTurn, cast, castBy, castFrom, castVia, enteredFrom,
putThereBySource, sharesCardTypeWith, sharesPermanentTypeWith, sharesCreatureTypeWith, sharesLandTypeWith, sameNameWith, sameNameAsAnother, thisWay, attacking, blocking, blockingRelation, goaded, suspected, saddled, saddledSource, crewedSource, crewedBySource, enlistedThisCombat, monstrous, renowned, hasManaAbility, hasAbilities,
xInManaCost, manaCost, coloredManaSymbols, cardTypeCount, nameDiffersFromEach,
nameUnlike, sameNameWith, sameNameAsTriggerObject, sharesColorWith, ofChosenType, targets, greatestAmongItsController, greatestInZone }`,
every present clause ANDed. `greatestInZone: { of, among }` is one comparison over
everything in the object's zone that matches `among`, ties all counted (`strictly`: none,
Selvala, Heart of the Wilds' "greater than each other creature's power"): over every
permanent, whoever controls it, on the battlefield — Topple's "target creature with the
greatest power among creatures on the battlefield", Getaway Glamer's "if no other creature
has greater power" (a `target` condition), Strength-Testing Hammer's (`trigger-object`),
Historian's Wisdom's (`source`, through `attachedTo`), Might Makes Right's "you control each
creature with the greatest power" (`not` of `opponent-controls` matching it) — and over
that graveyard in a graveyard (Desecrator Hag's `return-from-graveyard`, a tie the
controller's). The object needn't match `among`, so say what it is beside it; another zone
never matches. Inside the layer fold only mana value and counters compare (Favor of the
Mighty's static scope): `power` and `toughness` don't match there. `greatestAmongItsController: { of, among }` is "with
the greatest power among creatures **that player** controls" — a maximum per
controller, read live of each permanent against its own controller's others
matching `among` (ties all match, the controller choosing): Crackling Doom's
and Will of the Abzan's edict, Soul Shatter's "greatest mana value among
creatures and planeswalkers they control" (`of: "mana-value"`). Never inside
the layer fold. `targets: { only?, single?, permanent?, source?, player? }`
asks what a **spell** on the stack targets (anything else has no targets and never
matches): a target that is a player (`player: "you" | "opponent" | "any"` — Dawn Charm's
"counter target spell that targets you", Danitha, Spear of Agony's "a spell that targets an
opponent"), or a permanent on the battlefield (rule 109.2) matching
`permanent` from the filter's side and being (`source: true`) or not being (`false`) the
permanent applying the filter. One such target is enough — Feather, the Redeemed's "a spell
that targets a creature you control" is `{ permanent: { type: "creature", controlledBy:
"you" } }`, the spell free to target other things too; `only: true` needs every target to
be one — Zada, Hedron Grinder's "targets only Zada" is `{ only: true, source: true }` (two
slots on Zada still count) — and `single: true` that they're all one and the same — Ivy,
Gleeful Spellthief's "targets only a single creature other than Ivy" is `{ only: true,
single: true, permanent: { type: "creature" }, source: false }`. A target that has changed
zones since it was targeted is a new object the spell no longer targets (rule 400.7 — the
Rebuff the Wicked ruling). It works in a cast trigger's `filter`, a `deals-damage`
trigger's source `filter` (Imodane, the Pyrohammer: an instant or sorcery spell "that
targets only a single creature" dealing damage `toItsTarget`), and a `spell` target spec
(Rebuff the Wicked: `{ kind: "spell", filter: { targets: { permanent: { controlledBy: "you"
} } } }`). `manaCost: ["{0}", "{1}"]` is an exact printed
mana cost (Urza's Saga's "an artifact card with mana cost {0} or {1}" — not
{U}, {X} or none). `nameUnlike: { others?, graveyard? }` is Guardian
Project's "if it doesn't have the same name as another creature you control
or a creature card in your graveyard": no *other* battlefield permanent
matching `others`, and no graveyard card matching `graveyard`, shares its
name — asked as it last existed, whatever now has its id is another object.
`sameNameWith: n` is "target X **and all other** X **with the same name as
that** X" (rule 201.2a): the object in target slot `n` itself, or one sharing
its name — an effect's filter only (bound as the effect applies; anywhere else
it matches nothing). Write the whole line as one `-all` effect so the target
and its namesakes go in one event: Maelstrom Pulse is `destroy-all` of `{
sameNameWith: 0 }`, Echoing Decay `modify-pt-all` of `{ type: "creature",
sameNameWith: 0 }`, Homing Lightning `damage-all`, Deputy of Detention an
`exile-all` with `controlledBy: "you"` and `controlledByTarget: 0` ("that player
controls"). The namesakes aren't targeted (hexproof doesn't save them); a
face-down target has no name and goes alone.
It reads whatever zone the effect does: `return-from-graveyard` (Echoing Return's
`{ sameNameWith: 0 }`, `count: "all"`), `search-library` (Secret Salvage, Mask of the
Mimic), `exile-graveyard` (Moratorium Stone; with `fromHand`, Legion's End).
`sameNameTokensOnly: true` beside it has the namesakes be tokens, the target needn't
be: Legions to Ashes' "and all tokens that player controls with the same name".
`doubleFaced: true` is a double-faced card or token (rule 712.1, all three kinds; a meld
card's two fronts carry `meldCard: true`), whichever face is up: Overgrown Pest's `anyOf`
with a land. "If it's a double-faced card, you may transform it" after a put is a step of its
own, not "enters transformed": a `choose-permanents` over `{ thisWay: "put-onto-battlefield",
doubleFaced: true }`, `upTo: 1`, `then: { kind: "transform", target: 0 }` (Nick Fury, Agent of
S.H.I.E.L.D.).
`sameNameAsTriggerObject: true` is the same for the trigger object — the
Shrines' "where X is the number of cards in all graveyards **with the same name
as that spell**" (Aven Shrine): `{ countInGraveyard: { sameNameAsTriggerObject:
true } }` on a `cast-spell` trigger, bound to the spell's name as the effect
applies (a spell countered in response still has its name, and counts itself
from the graveyard).
**`sameNameWith: <ShareReference>`** is "with the same name as" any object a
reference names (see "shares a type with it" below for the references),
itself included: Cylian Sunsinger's "this creature and each other creature
with the same name as it get +3/+3" is `modify-pt-all` of `{ type:
"creature", sameNameWith: "source" }`; Exclusion Ritual's "players can't cast
spells with the same name as the exiled card" is a `prohibits` `cast` with `filter: {
sameNameWith: "exiled-with-source" }` over its own linked exile (`exile {
linked: true }`) — Ixalan's Binding's over an `untilSourceLeaves` exile, which
counts as "the exiled card" too; Cornered Market's "a nontoken permanent" is
`{ permanents: { token: false } }` (spells, and `lands` with `notSupertype:
"basic"`); Mitotic Manipulation's look-and-choose `{ sameNameWith: {
permanents: {} } }`; Pattern Matcher's "another creature you control" `{
controlled: { type: "creature", isSource: false } }`. In an effect it's bound
to the names as the effect applies; in a static or a trigger's filter the
source, exiled-with-source, controlled and permanents references are read
live, the others match nothing. Prefer it to `sameNameAsSource` in an effect:
an effect's matching has no source, so `sameNameAsSource` there matches
nothing.
A reference can be a graveyard too, `{ graveyard: <filter> }`: Pyromancer
Ascension's "a spell that has the same name as a card in your graveyard" is
`{ sameNameWith: { graveyard: { ownedBy: "you" } } }` in a `cast-spell` trigger's
filter, Bazaar of Wonders's "a card in a graveyard" `{ graveyard: {} }` in a
`trigger-object` condition asked as it resolves, and Dragonlord Kolaghan's "a card
in **their** graveyard" `{ graveyard: {}, itsController: true }`, the graveyard of
the controller of the object asked about (a live read only: in an effect's bound
filter it matches nothing). Lands and other permanents named like an imprinted
card read `"exiled-with-source"` in a trigger's filter (Invader Parasite,
Extraplanar Lens's `tapped-for-mana`) or a static's count (Strata Scythe's
`grantPtPerCount`, which isn't inside the layer fold).
**`sameNameAsAnother: <filter>`** is "with the same name as **another** permanent"
matching the filter (`{}` for any), asked of the whole battlefield: Eye of
Singularity's `destroy-all` of `{ sameNameAsAnother: {}, notSupertype: "basic" }`.
The tokens of a stack count as one another's namesakes, and a nameless permanent
has none.
`sharesColorWith: n` is radiance's "target X **and each other** X **that
shares a color with it**" (rule 105.2; Ravnica: City of Guilds' ability word),
the same way: the target itself, or one sharing any of its colors as the
effect applies — an effect's filter only, one `-all` effect for the line.
Leave No Trace is `destroy-all` of `{ type: "enchantment",
sharesColorWith: 0 }`, Brightflame `damage-all` then `gain-life` of
`{ damageDealtThisWay: true }`, Rally the Righteous `untap-all` then
`modify-pt-all` over the same filter ("those creatures"). A colorless target
goes alone; the others aren't targeted.
`goaded` is goaded by anyone, however (a one-shot
goad, one for the rest of the game, a static one), `suspected` rule
701.60's designation, `saddled` rule 702.171b's and `monstrous` rule 701.37b's ("as long as this
creature is monstrous, it has trample" — a static's `condition: { kind: "source", filter: {
monstrous: true } }`, Domesticated Hydra); one that has left the battlefield is asked as it last
was — Baeloth Barrityl's "whenever a goaded attacking or blocking creature
dies" is a `dies` trigger's `{ type: "creature", goaded: true, anyOf: [{
attacking: true }, { blocking: true }] }`. `saddledSource: true` is "a creature
that saddled it this turn" (rule 702.171c): tapped for the cost of the saddle
ability of the permanent applying the filter (as it is, or as it last was if it
has left) this turn, and still the same object — read against the source in a
target or trigger filter, bound to it in an effect's (`saddledBy`, never
authored). `crewedSource: true` is "a creature that crewed it this turn" (rule
702.122b-c), read the same way (`GameObject.crewedThisTurn`; bound to `crewedBy`
in an effect's filter) — Subterranean Schooner, Getaway Car. `crewedBySource:
true` is the other way round, "a Vehicle crewed by ~ this turn" (Balthier and
Fran's attack trigger filter): the source, on the battlefield, crewed this
very permanent this turn. `enlistedThisCombat: true` is a creature that enlisted another this
combat (rule 702.154c — Aradesh, the Founder's intervening "if it enlisted a
creature this combat", a `trigger-object` condition; true as its attack
trigger triggers, since enlist is paid before the attack is announced).
`blockingRelation: { relation, of? }` is a creature in a blocking
relation (as a board condition too — Sting, the Glinting Dagger's "as long as
it's blocking or blocked by a Goblin or Orc" is `controls`, `anyController`,
over `subtypes` and `{ relation: "either", of: "host" }`, a `controls` filter
being read with its source) with the permanent applying the filter — or, `of: "host"`, with the
creature it's attached to, or, `of: "trigger-object"` in an effect's filter,
with the object the trigger names (Trailblazer's Torch's and Ib Halfheart's
"each creature blocking it", Labyrinth Raptor's "a creature of their choice
that's blocking it"; a target slot has no trigger object to read and matches
nothing). `blockerCount: { op, n }` is how many creatures are blocking it now —
Rampaging Cyclops's "as long as two or more creatures are blocking it", Grizzled
Wolverine's "only if at least one creature is blocking this creature", both as
`{ kind: "source", filter }`; the amount `{ blockersOf: "source" | "trigger-object" }`
is the same count ("for each creature blocking it"), and "for each creature it's
blocking" is `{ countOf: { type: "creature", blockingRelation: { relation:
"blocked-by" } } }` (Guardian of the Gateless). `"blocking"` is "creature blocking it" (Goblin
Javelineer's target, Battle-Scarred Goblin's "each creature blocking it", Plasma
Caster's "target creature that's blocking equipped creature"), `"blocked-by"`
is "creature it's blocking" / "creatures blocked by this creature" (Tinder
Wall, Wall of Nets), `"either"` both (Kjeldoran Frostbeast). A source that has
left — Tinder Wall sacrificed to its own ability — is read as it last was
(608.2b); a creature removed from combat is in no relation (506.4). Its `with`
is bound at resolution, never authored. `controlledBy` is `"you"`, `"opponent"` or
`"active-player"` (whoever's turn it is, whoever is asking). `anyOf: CardFilter[]` is the "or": at least one of
them has to match as well (historic is `anyOf: [{ type: "artifact" },
{ supertype: "legendary" }, { subtype: "Saga" }]`; Dogmeat's "enchanted or
equipped" is two). `attachedTo: CardFilter` is what an Aura or Equipment is attached
to — Conqueror's Flail's "as long as this Equipment is attached to a creature" is a
`source` condition of `{ attachedTo: { type: "creature" } }`. **`attachments: { filter?, atLeast?, otherThanSource? }`** asks what's attached to it, whoever controls that: Daybreak Coronet's and Face of Divinity's "another Aura attached" (`otherThanSource`), Bride's Gown's `controls` of a creature with a named Equipment. **`sharesColorWithHost`** and **`sharesCreatureTypeWithHost`** are a static's live read of what the source is attached to (Konda's Banner). **`hostOfSource: false`** is "other than enchanted creature" on a target; an edict's is `sacrifice`'s `exceptHost`. The `of-player` condition's `player: "host-controller"` is "its controller" for a static (So Tiny), and `controls`' `excludeHost` "another creature" beside the host (Favorable Destiny). **`attachedToObject: n`** (an effect's filter only) is "attached to **that creature** / to **target** …": the object or player in slot `n` as the effect applies — Hubris's "return target creature and all Auras attached to it" is a simultaneous `sequence` of `return-to-hand-all` over `{ subtype: "Aura", attachedToObject: 0 }` then `return-to-hand` of slot 0 (the attachments' step first, while they're still attached), Blastfire Bolt's "destroy all Equipment attached to that creature" a `destroy-all` after the damage; the slot illegal as it resolves, it matches nothing (608.2b). **`attachedToPlayer: "you" | "opponent"`** is an Aura on a player (rule 303.4) — Witchbane Orb's "destroy all Curses attached to you". "Up to one target Equipment **attached to that creature**" (Fiery Annihilation) is a target relation instead: `attachedToThan: true` on an `other` slot (§7). `isSource: true` is the source itself, so "**for each** Equipment attached to it" counts `{ subtype: "Equipment", attachedTo: { isSource: true } }` (Goblin Gaveleer's `grantPtPerCount`, Kemba, Kha Regent's `countOf`) and "attached to equipped creature" `attachedTo: { hostOfSource: true }`. `equipmentAttached: NumCompare` counts the Equipment on it, whoever controls them — Balan's "as long as two or more Equipment are attached to it" is a `source` condition of `{ equipmentAttached: { op: "gte", n: 2 } }` (on the battlefield only). `equipped` / `enchanted` ask whether an Equipment / Aura is
attached, whoever controls it (`enchantedBy: "you"` — an Aura *you* control); `modified` is rule 700.9 — a counter, an
Equipment, or an Aura controlled by the permanent's *own* controller.
`manaSpent` is the one read of what was spent to cast it, a list of clauses that must all hold, each a `ManaSpentQuery` (`type`, `from`, `count`, `per`) and an `amount` (default "at least one"). `[{ amount: { op: "gte", n: 4 } }]` is The Emperor of Palamecia's "at least four mana". `from` is where it came from: `{ type: "artifact" }` is "if mana from an artifact
was spent to cast it", `{ subtype: "Treasure" }` "…from a Treasure",
`{ fromSource: true }` "using mana produced by [this]" (Barracks of the
Thousand), and `amount` how many units ("two or more mana from creatures" is `{ from: { type:
"creature" }, amount: { op: "gte", n: 2 } }`). `type` names a mana type: `[{ type: "C", amount: { op: "eq", n: 0 } }]` is "if {C} wasn't spent" (Wumpus Aberration). Each unit is read off its source as it made
the mana — a Treasure sacrificed for it was still a Treasure — and extra mana a
triggered mana ability added is that ability's permanent's, not the one tapped.
Kept by the permanent the spell becomes. **Adamant** and its kin are one clause a colour:
"if at least three white mana was spent to cast this spell" is `[{ type: "W", amount: { op: "gte", n: 3 } }]` (Silverflame Ritual's resolving `source` condition; a Paladin's
"enters with a +1/+1 counter" is an enters replacement gated on it), "if
{U}{B} was spent" a clause for each; `count: "most-of-one-color"` is "three mana
of the same color" (Henge Walker). What paid for an **activated ability** is the `ability-mana-spent` condition (`clauses`, the same clauses: Jetmir's Fixer) and `{ manaSpentOf: "this-ability" }` (rule 602.2b). A copy of a spell had no mana spent
(`adamant.test.ts`). `putIntoGraveyardFromLibraryThisTurn` is a
graveyard card that got there from a library this turn — milled, surveilled,
or any other library-to-graveyard move, never discarded or destroyed (Captain
N'ghathrod's end-step target is `{ kind: "card-in-graveyard", whose:
"opponent", filter: { typesAnyOf: ["artifact", "creature"],
putIntoGraveyardFromLibraryThisTurn: true } }`). A card that leaves the
graveyard and returns loses it (rule 400.7). `putIntoGraveyardThisTurn` is
any graveyard card put there this turn from one of `from`'s zones, or from
anywhere without it: "a creature card in a graveyard that was put there from
the battlefield this turn" (Grim Return, Thrilling Encore, Wreck Hunter's
count) is `{ type: "creature", putIntoGraveyardThisTurn: { from:
["battlefield"] } }`, "put there from anywhere this turn" (Night Nurse)
`putIntoGraveyardThisTurn: {}`; it reads a card still in that graveyard as
the same object (400.7). The sweep is `return-from-graveyard` over it,
`count: "all"`: "return to the battlefield all permanent cards in your
graveyard that were put there from the battlefield this turn" (Faith's
Reward), `destination: "hand"` (Gleancrawler), `from: "each-graveyard"` for
"each player returns …" (Second Sunrise). `blockedThisTurn` looks back at the
turn's declared blocks (`blockingRelation` is what's in combat now): `{ relation:
"blocked" | "blocked-by" | "either", partner?, of?, thisCombat? }`. "That blocked
or was blocked by a legendary creature this turn" (You Cannot Pass!, Sea Troll's
`condition: { kind: "source", filter }`) has `partner`, read as the other creature
was at the block; "all creatures that blocked or were blocked by it" (Venomous
Breath) has `of: 0`, `"each-target"` (Triton Tactics) or `"source"` (Joven's
Ferrets); "this combat" (Ride Down) `thisCombat: true`; "a creature that blocked
this turn" (Sizzling Barrage) neither. Each side is the object it was then (rule
400.7), and one put onto the battlefield blocking never "blocked" (509.4). "If a land you controlled was put into a graveyard
from the battlefield this turn", once it may have left, is the `turn-history`
condition instead (`what: "to-graveyard"`, `from: ["battlefield"]`, filter
`controlledBy: "you"`, matched as it last existed — The Lady of Otaria).
`discardedThisTurn` is a card
discarded this turn that hasn't moved since — a madness card its owner didn't
cast still is, in the graveyard it went on to (Shadow of the Grave's "all
cards in your graveyard that you cycled or discarded this turn" is
`return-from-graveyard` with `filter: { discardedThisTurn: true }`; cycling is
discarding, rule 702.29a). `drawnThisTurn` is a card drawn this turn that hasn't
moved since — only a real draw, so not a tutor's card nor a dredged one (Sylvan
Library's "cards in your hand drawn this turn"). **"Shares a type with it"** is one clause per
kind of type — `sharesCardTypeWith`, `sharesPermanentTypeWith` (rule 110.4,
kindred left out), `sharesCreatureTypeWith`, `sharesLandTypeWith` — each
taking a **`ShareReference`**, the object compared with:
`"sacrificed"` (the permanent the spell or ability sacrificed, as it last
existed — Braids, Arisen Nightmare; Endemic Plague's `destroy-all` of
`{ type: "creature", sharesCreatureTypeWith: "sacrificed" }`; Pyre of
Heroes), `"trigger-object"` (Baral and Kari Zev's spell, Heirloom Blade's dead
creature), `"source"` (kinship's "this creature"), `"attached"` (the Crowns'
"enchanted creature and other creatures that share a creature type with it",
the host read as the Aura was sacrificed), `"chosen"`, a **target slot**
(Killer's "target creature and each other creature that shares a creature
type with it" is one `damage-all` of `{ type: "creature",
sharesCreatureTypeWith: 0 }`; Counterlash's `cast-now` `spell: {
sharesCardTypeWith: 0 }`; Reality Scramble's `reveal-until` after the target
went to the library, read as it last existed; Wild Magic Surge's and Reweave's
"a permanent card that shares a card type with that permanent", destroyed or
sacrificed, `typesAnyOf` the permanent types beside it, in `whose: {
controllerOf: 0 }`'s library), `"exiled-with-source"` (the
cards exiled with it, rule 607.2a, or until it leaves), `{ permanents:
<filter> }` — every permanent matching it — or `{ controlled: <filter> }`
— every permanent you control matching it (Hiveheart Shaman's "a basic land
card that **doesn't** share a land type with a land you control" is `not: {
sharesLandTypeWith: { controlled: { type: "land" } } }`). The reference
objects themselves always match — "X **and each other** creature that
shares…" needs no `anyOf`; write `exceptTarget`/`exceptSource` for a bare
"each other". An effect's filter is bound as the effect applies; a changeling
on either side shares a creature type with anything that has one, a creature
with none shares nothing, and with no reference (gone, an illegal target)
nothing shares. Unbound — a static's or a trigger's filter — it matches
nothing. `controlledContinuously` is rule 302.6's test on a permanent of any
type, haste or no haste: its controller has had it since their most recent turn
began — Rocket Launcher's `{ kind: "source", filter: {
controlledContinuously: true } }` on an activated ability's `condition`, Nettling
Imp's target with `controlledBy: "active-player"` ("the active player has
controlled continuously since the beginning of the turn"), Keldon Twilight's
sacrifice. `enteredThisTurn` /
`attackedThisTurn` are a permanent's history this turn — "creatures that
entered this turn", Kratos, God of War's "creatures that player controls that
**didn't attack** this turn" (`attackedThisTurn: false`);
`attackedThisCombat` is this combat phase's declaration, standing though it has left combat since (rule 506.4), never one put onto the battlefield attacking: "if this creature attacked or blocked this combat" is the helper `ATTACKED_OR_BLOCKED_THIS_COMBAT`, an `anyOf` with `blockedThisTurn`'s `thisCombat`;
`attackedYouThisTurn` is the filtering player, not a planeswalker of theirs (Jabari's Influence), and "a creature is attacking you" as a condition is `controls` with `anyController` over `attackingYou` (Heroic Return's cost, Swat Away's);
`attackedDuringControllersLastTurn` is its present controller's last finished turn (`controllersLastTurn`; Halls of Mist, Tangle Kelp through `attachedTo`);
`attackedBattleThisTurn` is "attacked **a battle** this turn" (War Historian,
rule 506.3), true from the declaration on whatever becomes of the battle. A permanent that
changes zones is a new object that did neither; one that has left is asked as
it last was — as is `monstrous`, the designation monstrosity gives (rule 701.37b; "as long as this creature is monstrous" is a static's `condition: { kind: "source", filter: { monstrous: true } }` — Domesticated Hydra), and `renowned`, the one renown gives (702.112b). So are `damagedThisTurnBy: { subtype?, type?, controlledBy?, source? }` (`source: "this"` is "dealt damage by **this creature** this turn" — Sengir Vampire's dies trigger, Kumano's Pupils' "would die, exile it instead"; `"host"` is "… by **enchanted/equipped** creature" — Vampiric Embrace; either matched by the source's battlefield stint, rule 400.7, so damage from before it last left doesn't count, while one leaving in the same event still does, 603.10a; `damaged-by-this-source.test.ts`) —
"dealt damage this turn by a Spider **you controlled**" (Shelob, Child of
Ungoliant), matched against each source as it was when it dealt the damage
(`GameObject.damageThisTurn`) — `excessDamageThisTurn` (rule 120.4a: more
than the lethal damage it needed then — toughness less damage already marked,
1 from a deathtouch source, none once it had lethal damage; a planeswalker's
loyalty — Maarika, Brutal Gladiator's `toFilter`) and
`dealtDamageToCreatureThisTurn` (it dealt damage to another creature). `dealtDamageThisTurn: true` is
"that dealt damage this turn", to anything (Restore the Peace); `{ to: "you" }` "that dealt damage to you this
turn" (Spear of Heliod), with `combat: true` for combat damage (Witch-king of Angmar: a sacrifice keeps "you" as
the effect's controller, not the player choosing). The condition `{ kind: "self-hasnt-dealt-damage", combat? }`
is "as long as it hasn't dealt [combat] damage yet" (Karakyk Guardian, Ruric Thar). `cast` / `castBy: "you"` / `castFrom` / `enteredFrom` /
`played` / `putThereBySource` read how a permanent came onto the battlefield,
this stint (`GameObject.entry`): played as a land (rule 305.1 — Deep Gnome
Terramancer's "lands enter … without being played" is `played: false`), as a spell that was cast and resolved ("if you cast it"
— Anti-Venom's enters trigger is `{ on: "enters-battlefield", who: "self",
filter: { cast: true, castBy: "you" } }`, since whether it was cast never
changes; a copy of a spell was never cast), cast from which zone (asked of a
spell still on the stack, where it's being cast from — Delayed Blast
Fireball's "if this spell was cast from exile" is a `conditional` on `{ kind:
"source", filter: { castFrom: "exile" } }`), under which permission (`castVia`
— Uro's "sacrifice it unless it escaped" is a `conditional` on `{ kind: "not",
of: { kind: "source", filter: { castVia: "escape" } } }`; Spiders-Man, Heroic
Horde's "When Spiders-Man enters, if they were cast using web-slinging" is
the trigger's `condition: { kind: "source", filter: { castVia:
"web-slinging" } }` — the permanent keeps how its spell was cast), from which
zone it entered (Fire Lord Zuko's "whenever a permanent you control enters
from exile" — a spell comes from the stack, so a creature cast from exile
doesn't), and whether an ability of the permanent applying the filter put it
there — Kodama of the East Tree's "if it wasn't put onto the battlefield
with this ability" is `putThereBySource: false` on its enters trigger, which
is what keeps it from triggering off its own lands. A permanent that has left
is asked as it last was. `thisWay` (a `ThisWayKind` — see "This way" above) matches only what the
spell or ability now resolving has done that to — choosing among the cards
just moved: "mill three cards; you may put a creature card milled this way into
your hand" is a `mill` then a `look-and-choose` over `zone: "graveyard"` with
`filter: { type: "creature", thisWay: "milled" }`, `min: 0, max: 1,
destination: "hand"` (Ripples of Undeath); a card already in the graveyard
doesn't qualify. That `look-and-choose` also finds the milled cards a
replacement sent to exile instead (Rest in Peace — rule 701.17c: a milled
card is found in whatever public zone it went to); `return-from-graveyard`
doesn't, so use `look-and-choose`. Between resolutions it
matches nothing. `notThisWay` is its opposite — everything *but* what was done
that to: Martial Coup's "create X Soldier tokens … destroy all other
creatures" is `{ type: "creature", notThisWay: "created" }` (with the tokens
made `separate`). `thisWayBy: "you"` narrows either to what *you* did that
way: Rise of the Witch-king's "another permanent card" after "each player
sacrifices" is `{ notThisWay: "sacrificed", thisWayBy: "you" }`, so a card you
own that an opponent sacrificed may still come back. `attacking` asks whether the permanent is currently attacking
(Kangee's Lieutenant); `unblocked` whether it's an unblocked attacker (rule
509.1h: attacking, with blockers declared and none for it, or put onto the
battlefield attacking since — 508.4d) — from the declare blockers step on,
never before; `blocked` whether it's a blocked one (attacking and blocked
this combat, though its blockers have left — Outmaneuver's "target blocked
creatures"), also never before blockers are declared. `subtypes`/`typesAnyOf` are an OR
within themselves (Farseek: "a Plains, Island, Swamp, or Mountain card";
Takenuma's Channel: "a creature or planeswalker card"). A changeling matches
every creature-type clause, `notSubtypes` included (it *is* a Zombie).
`ofChosenType: true` is "of the chosen type": the creature type chosen for the
permanent applying the filter (`chooseCreatureTypeOnEnter`) — Morophon's "other
creatures you control of the chosen type". It's answered where the filter
knows its source, a static's `filter` scope, a trigger's filter and a
`look-and-choose`'s `filter` (Herald's Horn: "if it's a creature card of the
chosen type"); with nothing chosen, nothing matches. A source that has left
the battlefield before its ability resolves is read for the type it had
(rule 608.2h). `ofChosenColor: true` is "of the chosen color" the same way:
the colour chosen for that permanent as it entered (`chooseOnEnter` over the
five, its `chosenOnEnter`) — Pentarch Paladin's "target permanent of the
chosen color", Curse of Wizardry's "a spell of the chosen color" — and in a
`prevent-damage-from-chosen-source`'s filter ("a source of your choice of the
chosen color", Story Circle), the shield keeping the colour chosen as it
resolved. Prefer it to one conditional copy per colour. Numeric fields take
`{ op: "eq"|"ne"|"lt"|"lte"|"gt"|"gte", n }`.

Clauses about the card's own properties:

- `basePower` / `baseToughness` — base P/T (rule 613.4b): printed, or set by a
  CDA or a "becomes an N/N" / "has base power and toughness N/N", before
  counters and "+N/+N" (Duskana, the Rage Mother's "base power and toughness
  2/2" is both `{ op: "eq", n: 2 }`).
- `hasManaAbility` — an activated or triggered mana ability (rule 605.1), its
  own or granted (Raggadragga, Goreguts Boss's "each creature you control
  with a mana ability"); gone when it loses its abilities.
- `hasAbilities` — any ability at all (rule 113); `false` is "with no
  abilities". Its own (every `CardDefinition` field is classified, in
  `define.ts`'s `PRINTED_ABILITY`) unless lost, plus anything granted: a
  keyword or protection, an activated or triggered ability, split second or a
  trigger on a spell, flashback or escape on a graveyard card. Not seen: a
  grant to spells whose filter reads a live amount (Abaddon the Despoiler's
  "mana value X or less" cascade), which only `Game` can evaluate.
- `xInManaCost` — `{X}` in its mana cost (Zaxara's "a spell with {X} in its
  mana cost"). `coloredManaSymbols` — how many coloured symbols the mana
  cost has, a hybrid or Phyrexian one counting once (Omnath, Locus of All's
  "three or more"). Both read the face that's up: a transformed back face has
  no mana cost (rule 712.8e), though its mana value is its front's.
- `cardTypeCount` — how many card types it has now (Rendmaw's "a card with two
  or more card types" is `{ op: "gte", n: 2 }`).
- `nameDiffersFromEach: CardFilter` — a different name from every battlefield
  permanent the inner filter finds (rule 201.2c — Light-Paws' "with a different
  name than each Aura you control" is `{ subtype: "Aura", controlledBy: "you"
  }`); true when it finds none.

A static *scoped* by `basePower` / `baseToughness`, `hasAbilities` or
`nameDiffersFromEach` can't be answered from inside the layer fold and fails
closed, like `power`; `hasManaAbility` can, and waits for the keyword pass
like `keyword` does.

#### A number read off the game (`DynamicOperand`)

`n` needn't be printed. Two object shapes read it when the filter is
evaluated (with `forItsController: true`, an `{ amount }`'s `"each"` is the
matched object's controller: Drown in the Loch's "mana value less than or equal
to the number of cards in its controller's graveyard" is `manaValue: { op:
"lte", n: { amount: { graveyardSize: "each" }, forItsController: true } }`):

- `n: { amount: EffectAmount }` — any `EffectAmount` (§6), evaluated in the
  context of whatever applies the filter: its source, controller, `{X}`,
  targets, and for a triggered ability the trigger object and value. Clement,
  the Worrywort's "return up to one target creature you control **with lesser
  mana value**" (lesser than the creature that entered) is

  ```ts
  { kind: "permanent", whose: "you", filter: {
      type: "creature",
      manaValue: { op: "lt", n: { amount: { manaValueOf: "trigger-object" } } } } }
  ```

  "Power less than this creature's" is `{ amount: { powerOf: "source" } }`.
  There is no "plus one" amount yet, so "mana value equal to 1 plus the
  sacrificed creature's" can't be written.
- `n: { own: "power" | "toughness" | "basePower" | "baseToughness" | "manaValue" }` — a
  characteristic of the object being matched itself: "each creature spell with
  toughness greater than its power" is `toughness: { op: "gt", n: { own:
  "power" } }`, Kutzil, Malamet Exemplar's "each with power greater than its
  base power" `power: { op: "gt", n: { own: "basePower" } }`. Needs no
  context, so it works everywhere a filter does.

Where `{ amount }` is answered, and when:

- **Target filters** (a `{ kind: "permanent" }` / `card-in-graveyard` slot):
  when the targets are offered, when the answer is validated, and **again on
  resolution** (rule 608.2b) — nothing is frozen, so a triggering creature
  that has changed by then changes the answer, and a target that no longer
  qualifies is illegal.
- **Trigger filters** (`TriggerSpec.filter`): as the event happens, with the
  would-be trigger object as `"trigger-object"` and this permanent as
  `"source"`.
- **An effect's own filters** (a sweep's, a search's, a count's, a
  `conditional`'s): bound to plain numbers as that effect applies, step by
  step through a `sequence`, so a later step sees what an earlier one did.
  A nested effect (`then`, `else`, a delayed trigger's `effect`, a mode) is
  bound when *it* applies.
- **Anywhere else** — a static ability's `condition`, a mana restriction, an
  imperative `resolve` building its own filter — nothing can answer it and the
  comparison **fails closed** (the object doesn't match). Use `{ own }` or a
  printed number there. The one exception is a static goad's scope (`goads`,
  §10), which answers the source's own `powerOf` / `toughnessOf` /
  `manaValueOf: "source"`, read live.

#### Last-known information (rule 608.2h)

An object an amount reads that was a **permanent** when the spell or ability
referred to it, and has left the battlefield since, is read **as it last
existed there** — its computed power and toughness (counters, anthems,
pumps), mana value (what a copy effect made it), controller, types, colours
and keywords (`GameObject.lastKnown`, taken as it left). "When Juri dies, it
deals damage equal to its power to any target" is just `{ powerOf: "source" }`
(Juri, Master of the Revue; Elenda's `create-token` count), and it counts the
counters Juri died with even if Juri has been exiled from the graveyard — or
returned to the battlefield — in response. A token that has ceased to exist
is read the same way for the rest of the turn (`GameState.ceasedTokens`).
Which objects qualify:

- `"source"` and `"trigger-object"` — when the ability triggered or was
  activated while they were on the battlefield, or for a permanent's own
  leaves-the-battlefield ability (`GameObject.lastKnownRefs`).
- a target slot — when the target was on the battlefield as it was targeted
  (`targetZones`). A card targeted in a graveyard is read as it is now.
- `"sacrificed"` — the permanent sacrificed to pay the spell's or ability's
  cost (Dina, Soul Steeper's "{1}, Sacrifice another creature: Dina gets +X/+0
  until end of turn, where X is the sacrificed creature's power" is a
  `modify-pt` on `"source"` with `power: { powerOf: "sacrificed" }`), or by a
  `sacrifice-source` step before the one reading it ("Sacrifice ~. If you
  do, …"). Nothing sacrificed reads 0. A sacrifice *chosen* by an earlier
  step isn't this yet, optional ("you may sacrifice a creature. When you do,
  …") or not (Minsc & Boo's "Sacrifice a creature. When you do, …"): a
  `sacrifice` step only queues its decision, so a step after it runs before
  anything is sacrificed (`effect:may-sacrifice-then` in the gaps JSON).

The same references answer "**that creature's** controller" (`controllerOf`
— `toControllerOfTarget`, `create-token`'s `who: "target-controller"`, the
`"trigger-controller"` scope), a `trigger-object` / `target` condition's
filter, and the damage a departed source deals: its colours for
protection, its lifelink and deathtouch, and its controller for the life.

One gap: a permanent that left, came back and left *again* before an ability
referring to its first departure resolved keeps only the later snapshot, and
the earlier reference reads the card as it now is.

**Reading isn't acting** (rule 400.7 — an object that changes zones is a new
object). A spell's or ability's own targets remember which object each was
(`GameObject.targetStints`): one that has changed zones since — a creature
flickered in response, a graveyard card that left and came back — is gone,
and a spell whose every target went that way fizzles. Its `"source"` is the
same (`sourceZoneChangeCount`, `ResolutionContext.sourceLost`): "put a +1/+1
counter on ~" on a creature flickered in response puts none, and a delayed
trigger's "return it to its owner's hand" (The Locust God) finds nothing once
the card has left its graveyard and come back. An *amount* reading any of them
still reads it, as it last existed — Juri's power above, Mana Drain's "that
spell's mana value" — since information comes from last-known information
whatever became of the object. And an O-Ring whose source has already left
as its exile resolves exiles nothing at all (rule 610.3b; 610.3a for a spell
or an activated ability).

---

## 7. Targets (`targets`)

`targets: [...]` on a card is the spell's target slots, chosen when it's cast.
Abilities (`activated` / `triggered`) carry their own `targets`. `TargetSpec`
values (`target.ts`):

`"any-target"`, `"creature"`, `"nonblack-creature"`, `"creature-you-control"`,
`"creature-an-opponent-controls"`, `"player"`, `"opponent"` (a player other
than the chooser), `"opponent-whose-turn-it-is"` (The Beamtown Bullies — none on
your own turn, so an ability with it can only be activated on an opponent's),
`{ kind: "opponent-compared", stat, by }` ("target opponent who has more life
than you do **as you activate this ability**" — the Keepers: `stat` is
`"life"`, `"creatures"`, `"lands"`, `"cards-in-hand"` or
`"creature-cards-in-graveyard"`, and the opponent's must be at least `by` more
— `2` for "at least two more", negative for "fewer"; judged only as the target
is chosen, so as it resolves any opponent will do),
`"creature-or-player"`, `"opponent-or-planeswalker"`,
`"permanent"`, `"nonland-permanent"`, `"nonland-permanent-an-opponent-controls"`,
`"land"`, `"artifact"`, `"artifact-an-opponent-controls"`, `"artifact-or-enchantment"`,
`"artifact-enchantment-or-nonbasic-land-an-opponent-controls"`,
`"creature-or-enchantment"`, `"enchantment"`,
`"creature-or-enchantment-an-opponent-controls"`, `"attacking-or-blocking-creature"`, `"creature-defending-player-controls"`,
`"spell"`,
`"creature-spell"`, `"noncreature-spell"`, `"instant-or-sorcery-spell"`,
`"activated-or-triggered-ability"` (an ability on the stack — Sublime Epiphany; `counter` removes it; the
narrowed form is `{ kind: "ability" }`, below),
`"instant-or-sorcery-spell-or-triggered-ability"` (one slot for "target instant spell, sorcery spell, or
triggered ability" — Spider-Sense; a Saga chapter is a triggered ability, an activated one isn't),
`"instant-or-sorcery-in-your-graveyard"`, `"player-or-planeswalker"`,
`"permanent-or-player"` (any permanent or any player, yourself included — Ardenn, Intrepid
Archaeologist), `"creature-attacking-you"`.

`"creature-attacking-you"` is "attacking **you** or a planeswalker you control"
(Soul Snare) — narrower than `"attacking-or-blocking-creature"`, and the
difference only shows at a 3-4 player table, where someone else's attacker
isn't your problem.

`"player-or-planeswalker"` reaches **any** player, yourself included (Clan
Defiance); `"opponent-or-planeswalker"` is the narrower printed wording
(Theater of Horrors). They are not synonyms — don't reach for the opponent-only
one just because it's there.

A slot may be made **optional** by wrapping it:
`{ kind: "optional", of: TargetSpec }` — "up to one target creature" (Ajani,
Caller of the Pride), "up to two target creatures you don't control" (Hate
Mirage). "Up to N" is spelled as N optional slots rather than a variable
count, so `targets` always mirrors the spec list and each effect's `target:`
index stays a fixed position. A skipped slot travels as `null` in the
dispatched action and arrives at resolution as a hole, which every effect
already guards for (that's how an out-of-range index reads). Only *required*
slots gate castability (rule 601.2c), and the client offers a **Skip** button
for an optional one. An optional slot is never "forced": even with exactly one
legal option the player is asked, since leaving it empty is the other choice
(Displacer Kitten needn't blink itself).

"**Another** target …" wraps a slot the same way: `{ kind: "other", of:
TargetSpec, than? }` accepts what `of` does, less one thing. `than` is
`"source"` by default — the spell's or ability's own source (Ezuri, Claw of
Progress's "another target creature you control"; Manifold Key's "untap
another target artifact") — or `"trigger-object"` ("target creature other
than that creature" — the one whose event fired the trigger),
`"trigger-player"` (The Lord of Pain's "another target player" — other than
the player the event names), `"trigger-object-controller"` (Lucy MacLean,
Positively Armed's "target player **other than its controller**": the
controller of the object whose event fired it, as it last existed if it has
left), `"host"` (Pain for All's "any **other** target"
of its enchanted creature's damage), or `{ slot: n }` ("target creature you control
fights **another** target creature": different from what slot `n` took). The
first five narrow the slot's own options; `{ slot }` relates two slots, so
each still lists everything and the pair is checked together (the client and
the bots narrow a later slot by what they picked — `slotOptions`). It nests
either way round with `optional` ("up to one other target creature"). An
"other" slot is never filled in by the triggering event the way a saboteur's
"that player" is, and `{ slot }` isn't for a trigger whose slots the event
fills.

**"Two target …" needs two different things.** "Untap two target lands",
"up to two target creatures" is one instance of the word "target" spread
over two slots, and the same object or player can be chosen for only one of
them (rule 601.2c). Build the slots with the `distinctTargets` helper
(`helpers.ts`) rather than listing the spec twice: `distinctTargets(2,
"land")` (Garruk Wildspeaker), `distinctTargets(2, "creature", { optional:
true })` (Rishkar). Each slot after the first is `{ kind: "other", of, than:
{ slots: [...] } }`, other than every slot of the group before it. `from` is
the group's first slot when other slots come before it, and `otherThan`
names earlier slots outside the group that it must differ from too —
Drakuseth's "4 damage to any target and 3 damage to each of up to two other
targets" is `["any-target", ...distinctTargets(2, "any-target", { optional:
true, from: 1, otherThan: [0] })]`. Separate instances of the word ("target
creature … target creature" in two sentences) are separate slots with no
relation, and may point at the same thing.

**"Any number of target …"** is a *group*: `{ kind: "any-number", of:
TargetSpec }` — Eerie Interlude's "exile any number of target creatures you
control" is `targets: [{ kind: "any-number", of: "creature-you-control" }]`.
`max: N` caps it — Magma Opus's four damage among at most four targets,
Baldin, Century Herdmaster's "up to one hundred target creatures" — and
`min: N` floors it (Inferno Titan's "one, two, or three targets" is `min: 1,
max: 3`). On a spell an amount is read as it's cast, the kicks announced:
Comet Storm's "choose any target, then choose another target for each time
this spell was kicked" is `min` and `max` both `{ sum: [{ timesKicked: "source"
}, 1] }`, Aether Burst's "up to X … as you cast this spell" a `max`.
`maxTotalPower: N` is "with total power N or less" (Reunion of the
House): the members' powers where they're targeted add up to at most N, as
they're chosen (the offer's choosers narrow by it through `TargetFacts`) and
again as it resolves, when a total gone over makes every member illegal (its
ruling). `maxTotalManaValue` is the same over mana values ("with total mana
value 3 or less" — Patch Up, March from the Tomb; `"x"` or an amount on an
ability, read with its bounds below — Orcus, Prince of Undeath), and
`differentManaValues: true` is "that each have a different mana value"
(Agadeem's Awakening). `equalToughness: true` is "any number of target
creatures **with equal toughness**" (V.A.T.S.): as it resolves, the members
still legal no longer all equal makes every one illegal (a lone one never
breaks it); `differentNames: true` is "up to six target creature cards **with
different names**" (Behold the Sinister Six!); `differentControllers: true`
is "any number of target tapped creatures **with different controllers**"
(Cloud's Limit Break): each member past the first an `other` slot with
`differentController`, so two one player controls as it resolves are both
illegal.

**"…that share a card type" / "a creature type" / "share no creature
types"** is `shares` on an `other` slot with a slot relation — a
`TargetShare` of `kind: "card"` (rule 205.2a) or `"creature"` (205.3m, a
changeling sharing one with anything that has one, one with none sharing
none), `among` narrowing the card types that count, `none: true` the
negation. Shifting Loyalties is `["permanent", { kind: "other", of:
"permanent", than: { slot: 0 }, shares: { kind: "card" } }]`, Legerdemain's
"another target permanent that shares **one of those types** with it" the
same after `"artifact-or-creature"` with `among: ["artifact", "creature"]`,
Rivals' Duel's "two target creatures that share no creature types" `shares:
{ kind: "creature", none: true }`, Secret Tunnel's pair of creatures you
control `{ kind: "creature" }`. The engine's choosers narrow by it
(`TargetFacts.shareTypes` — the client's facts don't have it yet, so a human
picks freely and the engine refuses a broken pair); as it resolves, a pair
no longer keeping it are both illegal, one already illegal read as it last
existed (Secret Tunnel's and Unbury's rulings).

**"…target Equipment attached to that creature"** is `attachedToThan: true`
on an `other` slot: the slot is attached to the permanent of the slots
`than` names — Fiery Annihilation is `["creature", { kind: "optional", of: {
kind: "other", of: { kind: "permanent", filter: { subtype: "Equipment" } },
than: { slot: 0 }, attachedToThan: true } }]`. As it resolves, the slot is
illegal if it's no longer attached to it or if that slot is illegal (its
rulings); the creature stays legal either way.

**"…controlled by different players"** is `differentController: true` on an
`other` slot with a slot relation: Run Away Together is `["creature", { kind:
"other", of: "creature", than: { slot: 0 }, differentController: true }]`,
Protector of the Wastes the same over two `optional` slots. As it resolves,
two such targets one player controls are both illegal; one gone illegal still
lends its controller (as it last existed) to that check (the Run Away
Together rulings).

**"…that player controls" / "from a single graveyard"** is `sameController:
true`: on an `other` slot with a slot relation, the slot's player is that of
the slots it names (with `sameObjectAllowed: true` where the sentence isn't
"another": Searing Blaze's "target player or planeswalker and … target creature
that player or that planeswalker's controller controls" says "target" twice, so
one creature planeswalker may be both, rule 115.3) — Mutiny is `["creature-an-opponent-controls", { kind:
"other", of: "creature", than: { slot: 0 }, sameController: true }]`,
Incriminate's "two target creatures controlled by the same player" the same
over `"creature"`, Goblin Welder's "target artifact card in that player's
graveyard" a `card-in-graveyard` slot tied to the artifact's. A slot's player
is a player target itself, a permanent's controller, and a card's owner
anywhere else (whose graveyard it's in). On an `any-number` group,
`sameController: true` is "up to three target cards **from a single
graveyard**" (Decompose) — and "two target cards from **an opponent's**
graveyard" (Nullmage Advocate) is that over `whose: "opponent"`, one
opponent's — while `sameController: { slot: n }` ties every member to slot
`n`'s player: "target player shuffles up to four target cards **from their
graveyard**" (Witness the Future: `["player", { kind: "any-number", of: {
kind: "card-in-graveyard" }, max: 4, sameController: { slot: 0 } }]`). The
choosers narrow by it; as it resolves, a slot whose player is no longer the
other's is illegal (rule 608.2b). A group must be the list's last slot, so
two cards from one graveyard *before* another target (the Advocates' "…
Destroy target artifact or enchantment") are two fixed slots, the second
`other` with `sameController`. "Target player shuffles … into their library"
is `put-on-library` for each card then `shuffle-library` with `target: 0`
(the player's library, not yours), under a `conditional` on `{ kind:
"target-legal", index: 0 }` — the player gone illegal does nothing and the
cards stay (Witness the Future's ruling); `target-legal` is "slot `index`'s
target is still legal as it resolves", a player or an object. `{ kind:
"target-is-you", index }` is "**if that player is you**" of a player slot, as
it resolves (The Ghoul, Gunslinger's Treasure). `{ kind:
"host-now", filter }` asks the same of the permanent the source is, or last
was, attached to (Consuming Ferocity's "if that creature has three or more
+1/+0 counters on it").
On a spell with `{X}`, `max: "x"` is "up to X target …" (Pest Infestation) and
`min: "x", max: "x"` is "X target …" (Curse of the Swine): X is announced
before the targets (rule 601.2b–c), so a choice is judged at the X cast
(`specsAtX`), and the offer's `targetCount` with `xCost.minXByTargetCount` /
`maxXByTargetCount` say which X each number of targets allows. A whole
multiple of X is `max: { product: ["x", 2] }` — "exile **up to twice X** target
cards from graveyards" (Erebos's Intervention), judged the same way, a count of
targets needing an X of half of it, rounded up (`twice-x-target-count.test.ts`).
Only for a
spell whose group is its only slot — or an activated ability's: Shigeki,
Jukai Visionary's channel "{X}{X}{G}{G}, Discard this card: Return X target
nonlegendary cards from your graveyard to your hand" is offered once per X,
the group that big at each, and checked at the X activated with.
**On a triggered or activated ability `max` and `min` take any amount**
(`variable-target-count.test.ts`): "up to X target artifacts, where X is the
number of Vampires you control" is `max: { countOf: … }`, "choose up to that
many target creatures" (Heroic Feast, a reflexive ability's count) `max: {
triggerValue: true }`, "up to X target …, where X is the number of verse
counters on this enchantment" (Serra's Liturgy) `max: { countersOn: "source",
counter: "verse" }`, and `"x"` on a permanent's enters ability is the X it
was cast with (Lost in the Maze's "tap X target creatures": `min: "x", max:
"x"`). The amount is read once, as the targets are chosen — a trigger as
it's put on the stack (rule 603.3d), an activation before its costs are paid
(601.2c, 602.2b: Serra's Liturgy counts its counters before it's
sacrificed) — and the offer and the `choose-targets` prompt carry the
number. Too few legal targets for its `min` removes a trigger (603.3d).
In a **`castModal` mode** a group works too (Heliod's Intervention's "destroy
X target artifacts and/or enchantments", Reality Spasm), where no later mode
that can be chosen with it has targets: a modal spell's targets are its
chosen modes', in order (rule 700.2), so the group is still last. X is asked
after the modes (601.2b), and the bots fit their picks to it with
`fitModalXGroup`.
It is always the **last** slot of its list (one per list;
`any-number-targets.test.ts` walks the pool for this),
and the player fills it with none, one or as many distinct targets as there
are (rule 601.2c): the chosen targets are one flat list, the slots before the
group keeping their indexes and every member taking the next one on. The
offer lists the group as a single slot with its `of` options; every check of
a choice — the cast, an activation, a trigger's answer, and the resolution —
judges it against `concreteTargetSpecs(specs, chosen.length)`, one slot per
member, each distinct from the ones before it, so a spell goes on the stack
with its shape fixed and never re-derives it from the board. With none
chosen it has no targets at all and resolves; with some chosen and every one
illegal it fizzles (608.2b — Singularity Rupture's ruling). Effects reach the
members two ways:

- "Each opponent discards a card. **Each opponent who can't** loses 3 life" is a `for-each-player` with `whoIf` (who can't, found first) and `before` (the discard or sacrifice, done next), then `effect` for each found: Cruel Grimnarch, Plaguecrafter (a player who gives up their last one could).
- `{ kind: "for-each-player", who: PlayerScope | ChosenPlayerRef, effect }` (a `ChosenPlayerRef` — `{ target }`, `{ controllerOf }`, `{ ownerOf }` — is one player: Skullcap Snail's "**target opponent** exiles a card from their hand" is a `look-and-choose` with `player: "that-player"` inside, so the choice is theirs) — `effect` once for
  each player in `who`, in turn order, as this effect's controller, with
  `"that-player"` naming that player: Adeline's "for each opponent, create a
  … token that's tapped and attacking that player". A player's step that
  stops to ask something (a `may`) is answered before the next player's.
  `who: "owners-of-exiled-with-source"` is each owner of a card in exile
  linked to this source (rule 607.2a, `exile`'s `linked`) — Skyclave
  Apparition's "the exiled card's owner creates an X/X … token, where X is
  the mana value of the exiled card", with the aggregate `{ aggregate: "sum",
  of: "mana-value", filter: {}, in: "exiled-with-source" }` (their total, per
  its ruling) as the token's `basePt`; `of: "power"` is their power (Redemptor
  Dreadnought).
- `{ kind: "for-each-target", from: n, effect, simultaneous? }` — `effect`
  once per member, each bound in turn to slot `n`, where `effect` is written
  for a single target: Mindbreak Trap's "exile any number of target spells"
  is `{ kind: "for-each-target", from: 0, effect: { kind: "exile", target: 0 },
  simultaneous: true }`. A member found illegal is skipped. `simultaneous`
  makes them one instruction ("any number of target players **each** mill two
  cards" mills them at once — Riverchurn Monument). A group of *players* goes
  in APNAP order whatever order they were targeted in (rule 101.4), so "any
  number of target players each … sacrifice a creature" (Priest of Forgotten
  Gods) asks the active player first, then the rest in turn order.
- a `flicker`'s `target: { from: n }` — every member exiled together and
  returned together (Eerie Interlude, Brago, King Eternal).

A group isn't the same as "up to N": "up to two target creatures" still has a
count printed on it and is two optional slots (`distinctTargets`).

Two specs are **structured** rather than strings, for the shapes the literals
stopped covering:

- `{ kind: "permanent", whose?: "any" | "you" | "opponent" | "trigger-player" | "defending-player", filter: CardFilter }`
  — a battlefield permanent matching an arbitrary filter. "Target creature
  with flying" / "without flying" (Clan Defiance), "target Dragon you
  control", "target creature with power 4 or greater". `whose: "trigger-player"`
  is "target creature **that player** controls" on a triggered ability: the
  player its event names (Alela, Cunning Conqueror's player dealt combat
  damage), whose permanents alone are legal — and on an attack trigger whose
  source isn't the attacker, "target creature **defending player** controls":
  the player the triggering creature attacks ("whenever equipped creature
  attacks" — Thunder Lasso, Captain America's Shield; "whenever a creature you
  control … attacks" — Elite Scaleguard). `whose: "defending-player"` is
  the player the ability's source is attacking (Kogla, the Titan Ape's
  "destroy target artifact or enchantment defending player controls").
  `attacking: "trigger-player"` is "target creature **that's attacking that
  player**" (Echoing Assault, on an `attacks-player` trigger): attacking that
  player itself — a creature attacking a planeswalker they control isn't
  (rules 506.3, 509.1a). `whose: { seat: n }` binds the slot to one player —
  the one `n` places after you in turn order (0 is you; `playerAtSeat`):
  "**for each opponent**, destroy up to one target artifact or enchantment
  **that player** controls" (Dismantling Wave) is three `optional` slots,
  seats 1–3, since a game seats at most four. Exactly the printed card: a
  target that has come under anyone else's control is illegal as it
  resolves, as "that player's" would be (unlike `differentController`, which
  only asks the targets' controllers to differ). `whose` and `filter` are only
  the permanent's, so with `orPlayer` each part has its own: "any target that
  isn't a Dragon" is `typesAnyOf: ["creature", "planeswalker", "battle"]` with
  `notSubtypes` and `orPlayer: "any"` (rule 115.4; `isCommander: false` for
  Lozhan), "target creature token, player, or planeswalker" a `filter.anyOf`
  (Coalborn Entity, Cautery Sliver), "target opponent, creature an opponent
  controls, or planeswalker an opponent controls" `whose: "opponent"` with
  `orPlayer: "opponent"`. The player part's own condition is `playerWith: {
  turnStat }` (that stat of theirs this turn above 0): "any target **that was
  dealt damage this turn**" (Needle Drop) is the three types with
  `damagedThisTurnBy: {}`, `orPlayer: "any"` and `playerWith: { turnStat:
  "damage-taken" }`. `orPlayer: "opponent"`
  (or `"any"`) lets a player fill the slot too — "target artifact,
  creature, planeswalker, **or opponent**" (Price of Betrayal), "another
  target permanent or opponent" (Etched Slith); `whose` and `filter` are
  the permanent's only. **Prefer a string
  literal when one fits** — it reads better and most of the pool uses them;
  reach for this when spelling the shape as a literal wouldn't be reused.
- `{ kind: "spell", whose?: "any" | "you" | "opponent", filter: CardFilter }` — a spell
  on the stack matching a filter (and, with `whose`, by its controller — "target
  instant or sorcery spell **you control**"): Red Elemental Blast's "target **blue** spell" (`{ colors: ["U"] }`),
  Mental Misstep's "target spell **with mana value 1**". Read as the spell is
  on the stack — printed colours and types, and a mana value that counts its
  chosen {X} (rule 202.3e). The unfiltered shapes stay string literals
  (`"spell"`, `"creature-spell"`, …).
- `{ kind: "ability", whose?: "any" | "you", abilityKind?: "activated" | "triggered", sourceTypes?: CardType[] }` — an
  activated or triggered ability on the stack (never a mana ability, rule
  605.3b), by its controller — "target activated or triggered ability **you
  control**" (Lithoform Engine, Vantress Visions) — by its kind: "target
  **triggered** ability you control" (Strionic Resonator: `abilityKind:
  "triggered"`, which takes a Saga's chapter ability, a delayed or reflexive
  trigger and a ward trigger too — rule 714.2b) — and by its source's card
  types: "… **from an enchantment source**" (Weaver of Harmony:
  `sourceTypes: ["enchantment"]`), the source as it is while it's still the
  object it was as the ability went on the stack, else as it last existed on
  the battlefield (rule 113.7a); an enchantment card's channel ability counts
  (Weaver's ruling). `loyalty: true` is only a loyalty ability, one
  activated for a loyalty cost (rule 606.2): "target loyalty ability of a
  planeswalker" (Verdant Command) is `{ kind: "ability", loyalty: true,
  sourceTypes: ["planeswalker"] }`. `copy-ability` copies one (§6).
- `{ kind: "stack", spells: "any" | "instant-or-sorcery" | "none", abilities: boolean, singleTarget?: true }` —
  a spell or an ability on the stack in one slot: "target spell or ability"
  (Deflecting Swat, Spellskite), "target instant spell, sorcery spell,
  activated ability, or triggered ability" (Return the Favor: `spells:
  "instant-or-sorcery", abilities: true`), "target spell **with a single
  target**" (Imp's Mischief: `abilities: false, singleTarget: true` — one
  target chosen as it went on the stack, the same one twice counting as two,
  however many are still legal: rule 115.9a; a slot its own rules filled
  isn't a target). Never a mana ability. `copy-spell` copies an ability in
  such a slot as `copy-ability` does; `change-targets` (§6) changes its
  targets.
- `{ kind: "card-in-graveyard", whose?: "any" | "you" | "opponent" | "defending-player" | "trigger-player", filter?: CardFilter }`
  (`"trigger-player"`: "that player's graveyard" of a trigger naming a player — Skullsnatcher, Ink-Eyes)
  — a card in a graveyard (Withered Wretch, Cemetery Reaper, Return to
  Nature's third mode). Graveyard targeting varies on both *whose* graveyard
  and an arbitrary card filter, which wouldn't converge as literals. `whose:
  { seat: n }` is one player's graveyard, as for `permanent` — Afterlife
  from the Loam's "**for each player**, choose up to one target creature card
  in **that player's** graveyard" is four `optional` slots, seats 0–3. `whose` defaults to `"any"`, and
`filter` matches printed characteristics (layer effects don't reach a
graveyard). `describeTargetSpec(spec)` renders any spec as a UI label.
- `{ kind: "one-of", of: TargetSpec[] }` — one slot over several kinds of
  object, each part with its own filter and zone, legal when any part accepts:
  Unsubstantiate's "target spell or creature" (`of: ["spell", "creature"]`),
  Tale's End's "target activated ability, triggered ability, or legendary spell"
  (`{ kind: "ability" }` and `{ kind: "spell", filter: { supertype: "legendary" } }`),
  Sorceress's Schemes's "target instant or sorcery card from your graveyard or
  exiled card with flashback you own". The effect says what happens in each zone:
  a `sequence` of a `return-to-hand` from each, of which only the one from the
  zone the target is in does anything. `optional` wraps the whole slot.
- `{ kind: "card-in-exile", whose?: "any" | "you" | "opponent" | "trigger-player", linked?: true, faceUp?: true, filter?: CardFilter, thisWay?: "exiled" }`
  — `"trigger-player"` is "target face-up card **they own** in exile" of a trigger
  naming a player (Time Reaper). `thisWay` on a `reflexive-trigger`'s slot is
  "when you do, choose up to one target creature card **exiled this way**"
  (Espers to Magicite): fixed to what the resolution exiled as it triggers.
  A card in exile (rule 406), `whose` its owner: Pull from Eternity's
  "target **face-up** exiled card" (`faceUp`), Runic Repetition's "target
  exiled card with flashback you own" (`whose: "you"`, `filter: { hasFlashback:
  true }`), Gelatinous Cube's "target creature card with mana value X **exiled
  with this creature**" (`linked`: the cards linked to the source's
  battlefield stint, rule 607.2a, or exiled until it leaves; `manaValue: { op:
  "eq", n: "x" }`). A face-down exiled card has no characteristics (406.3a): no
  `filter` matches it, and `faceUp` leaves it out with none. Pair it with
  `put-into-graveyard`, or `return-to-hand { from: "exile" }`. The scaffolder
  reads these phrases.

Legality is checked at cast **and** again on resolution; a spell whose targets
have all become illegal is countered by the game (fizzles).

**A static over the player an Aura enchants** (Curses): `affects: { scope: "filter", filter: { type: "creature", controlledBy: "enchanted-player" } }` for what they control, with any grant (Curse of Death's Hold's `grantPt`, Curse of the Nightly Hunt's `restrictions`, Curse of Conformity's `setBasePt` and `loseCreatureTypes`); `replacement: { event: "would-gain-life", who: "enchanted-player", prevent: true }` (Grievous Wound); `{ event: "would-deal-damage", multiplier: 2, to: "enchanted-player" }` (Curse of Bloodletting); the trigger `{ on: "deals-damage-batch", who: "any", to: "enchanted-player" }` (Grievous Wound, its player `who: "trigger-player"`); `prohibits: { who: "enchanted-player" }` (Curse of Exhaustion). Platinum Angel's pair the other way round is `cantWinGame` and `opponentsCantLoseGame` (Abyssal Persecutor).

An Aura uses `targets: ["creature"]` (or whatever it enchants) — it attaches to
its target on resolution automatically because it has the `"Aura"` subtype.
**"Enchant creature card in a graveyard"** (Animate Dead, Dance of the Dead) is
`targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }]`:
it enters attached to that card (put onto the battlefield another way, its
controller chooses one, 303.4f), stays legal while the card is there, is
unattached the moment the card leaves, and its statics don't reach it there.
Its enters ability is `conditional` on `source-on-battlefield` around
`put-onto-battlefield { target: "attached" }`, then **`swap-enchant { enchant:
"put-this-way" }`** ("loses 'enchant creature card in a graveyard' and gains
'enchant creature put onto the battlefield with this Aura'" — `GameObject.enchantSwap`),
then `attach { target: "put-this-way" }`, then the "leaves" ability as a
`delayed-trigger` at `{ leaves: "source" }` with `about: "put-onto-battlefield"`
(the ruling: it's keyed to the creature returned). `swap-enchant`'s
`becomeAura: true` is an enchantment that "becomes an Aura with …" (Necromancy;
Cloudform's `enchant: "creature"` after a `manifest`). Pool:
`pool/animate-dead.ts`, `pool/necromancy.ts`, `pool/cloudform.ts`.
"Enchant player" / "Enchant opponent" (a Curse, rule 303.4) is `targets:
["player"]` / `["opponent"]`: it resolves attached to that player
(`GameObject.attachedToPlayer`, never with `attachedTo`), entering any other way
its controller picks a player (303.4f, the `choose-enchant` decision's
`players`), and it's put into the graveyard once that player has left the game
(704.5m). "Enchanted player" in a trigger is `"attached"` about a player
(`attacks-player`'s `defender: "attached"` — `curseWhenAttacked` in `helpers.ts`
builds the Curse of Opulence family's whole trigger), and "a creature
enchanted player controls" is `"enchanted-player-controls"` (Trespasser's
Curse). Not yet: attaching an Aura to a player by an effect (Ardenn).

---

## 8. Activated abilities

```ts
activated: [
  {
    cost: { mana: "{2}", tap: true },
    targets: ["any-target"],
    effect: { kind: "damage", amount: 1, target: 0 },
    resolve: null,
    text: "{2}, {T}: deal 1 damage to any target.",
  },
]
```

**`AbilityCost`** (`abilities.ts`): `{ mana?, tap?, sacrifice?, payLife?,
removeCounter?, addCounter?, payEnergy?, discard?, tapOthers?, untap?, do? }`.

- `tapOthers: { count: 1, filter: { hostOfSource: true } }` — **"Tap enchanted
  creature"** (Krovikan Plague, Earthlore): the one permanent the Aura is on,
  so no choice. Not the {T} of rule 302.6, so a creature that just arrived may
  be tapped; "activate only if enchanted creature is untapped" is what the cost
  asks already (rule 118.3), so it isn't written. `"tapped"` names the one
  permanent a cost tapped, as an `ObjectRef` too: an additional cost's
  `also.tapUntapped` of one, "the creature tapped to pay this spell's additional
  cost" (Swallow Whole), a copy's the original's (rule 707.10).
- **A mana ability may work from another zone or exile from a graveyard** (rule
  605.1a, Molt Tender's `exileFromGraveyard`, Cryptex's `collectEvidence`,
  Jack-o'-Lantern's `zone: "graveyard"`, Simian Spirit Guide's `zone: "hand"`
  with `exilesFromHand: true`, the exile instead of channel's discard). It never
  uses the stack; a choice waits and the mana comes with its answer (605.3b). The
  auto-payer doesn't spend any of them: the player activates by hand, first.
- `untap: true` — **{Q}**, the untap symbol (rule 107.6 — Patrol Signaler,
  Hateflayer): payable only while the source is tapped, and a creature's
  only past summoning sickness (302.6); refused while it has a stun counter.
  Not on a mana ability (refused: the mana payer never untaps). "Untap two
  tapped blue creatures you control" as a cost (Crackleburr) isn't built
  (`cost:untap-others`). The scaffolder reads `{Q}`.

- `addCounter: { kind, count }` — "Put a -0/-1 counter on this creature: Add
  {G}" (Wall of Roots), "Put a -1/-1 counter on this creature: Untap this
  creature" (Devoted Druid). Paid as it's activated, with no decision; the
  counters go straight on, so a creature it takes to 0 toughness dies before
  its ability resolves (Devoted Druid's ruling). A replacement worded "if an
  effect would put counters" (Doubling Season) never applies — a cost isn't
  an effect — but one that isn't would (Vizier of Remedies' -1/-1, Branching
  Evolution's +1/+1), and "counters can't be put on it" (Solemnity) would
  make the cost unpayable (Devoted Druid's rulings). None in the pool reaches
  a kind such a cost puts today, and `putCostCounters` applies neither:
  authoring one, or a cost of a kind one already reaches, needs them first. Any "+X/+Y" or "-X/-Y"
  counter kind changes P/T (rule 122.1a). A mana ability with it and no
  `{T}` takes `oncePerTurn` (Wall of Roots' "Activate only once each turn" —
  each turn, anyone's) and is one the auto-payer uses, last, like a
  Treasure.

- `mill: N` — "Mill a card" as a cost (Millikin's "{T}, Mill a card: Add
  {C}"): paid automatically as it's activated, never with fewer than N cards
  in the library (rule 701.17b). A cost that moves a card from a library makes
  an ability that adds mana an ordinary one (rule 605.1a; Millikin's ruling):
  it goes on the stack, and the mana arrives as it resolves.

- `exileTop: N` — "Exile the top card (top N cards) of your library" as a
  cost (Royal Herbalist, Whirling Catapult, Seasoned Tactician): paid the
  same way as `mill`, face up, never with fewer than N cards there (rule
  118.3), never a mana ability (605.1a). Nothing reads *which* card it
  exiled yet — Storm Elemental's "if the exiled card is a snow land" and
  Phyrexian Devourer's "the exiled card's mana value" wait on
  `cost:exiled-card-ref`.

- `mana`: a cost string (`"{2}"`) or `null`. May contain `{X}`.
- `tap: true` adds `{T}`.
- `sacrifice: "granter"` in an ability a static grants ("Equipped creature
  has '{1}, {T}, Sacrifice Ninja's Kunai: …'"): the granting permanent — rule
  201.5a, the name means only that object — payable only while the
  activating player controls it. No choice to offer. The same ability names
  the granter elsewhere as the `"granter"` `ObjectRef` ("Return Trusty
  Boomerang to its owner's hand" is `return-to-hand` of `target: "granter"`;
  "the number of arrow counters on Archery Training" is `{ countersOn:
  "granter", counter: "arrow" }`, read as it last existed once it's gone),
  and a `damage` it deals as `from: "granter"` (Ninja's Kunai, dealt as the
  sacrificed Equipment last existed). A granted *trigger* names it the same
  way: Spare Dagger's "you may sacrifice Spare Dagger" is `sacrifice-target`
  of `"granter"`. The granter is fixed as the ability is activated or
  triggered, and acted on only while it's still that permanent (400.7).
- `sacrifice: "self"` ("Sacrifice this: …"), `"creature-you-control"`, or
  `{ filter: CardFilter }` (Zuran Orb — "Sacrifice a land"). The last two make
  the player pick (a `sacrifice` choice on the `activate-ability` LegalAction).
  The effect reads what was sacrificed as `"sacrificed"` — "where X is the
  sacrificed creature's power" is `{ powerOf: "sacrificed" }` (§6,
  "Last-known information"). A spell's `additionalCost.sacrifice` works the
  same way. **A `{ filter }` that reads X** — "Sacrifice a creature you
  control with mana value X other than Sidisi" is `{ filter: { type:
  "creature", manaValue: { op: "eq", n: "x" } } }` with `otherOnly` — makes X
  announced though the mana cost has none (rules 602.2b, 601.2b): the ability
  is offered once per X that has a permanent to sacrifice and legal targets,
  each offer's `sacrifice.choices` the ones matching at its X. A target "with
  mana value X plus 1" is `manaValue: { op: "eq", n: { amount: { sum: ["x",
  1] } } }` (Sidisi, Regent of the Mire). An activated ability's cost only.
- **A sacrifice of several** — `{ filter, count }`: "Sacrifice two artifacts"
  (Sai, Master Thopterist) is `count: 2`; "Sacrifice X Treasures" (Grim
  Hireling) is `count: "x"`, an X announced with the activation though the
  mana cost has none (rule 107.3a), which the effect reads as `"x"` and the
  offer caps (`xCost.maxX`) at what there is to sacrifice. `minX: 1` on the
  ability is "X can't be 0" (Ruthless Technomancer); `xIs: { manaValueOf:
  "exiled-with-source" }` on the ability is an X its own text defines
  (rule 107.3c — Prototype Portal's "{X}, {T}: … X is the mana value of that
  card"): offered at that one X, any other refused, and not activatable
  while the ref reads nothing; a target filter reading
  X is offered once per X, as for an `{X}` in the mana cost. `{ each:
  [filterA, filterB] }` is one of each, every one a different permanent —
  Jarad, Golgari Lich Lord's "Sacrifice a Swamp and a Forest" (a land that is
  both pays only one). Nothing is named on the action: once the ability is on
  the stack and its mana paid, the player chooses with the ordinary
  `sacrifice` decision (rules 601.2h, 602.2b — one per `each` filter, each
  offering only what leaves the rest payable), no decision when exactly
  enough is there, and they all go at once. A token stack counts as every
  token in it and gives up only the tokens named. The mana is paid from
  everything else first, and a Treasure the mana has to come from doesn't
  count towards the sacrifice (601.2g); `otherOnly` keeps the source out
  ("two **other** creatures"). "Any number of" is `count: "x"` too, "one or
  more" with `minX: 1`. On a mana ability it's activated by hand only, the
  mana added as the last one is chosen and never on the stack (Springjack
  Pasture's "Sacrifice X Goats: Add X mana of any one color. You gain X life",
  `add-mana` with `also`). `{ parts: [{ filter, count }, …] }` is several kinds
  each with a number, one of which may be `"x"`: Glass-Cast Heart's "this
  artifact and thirteen Blood tokens", Emrakul's Evangel's "this creature and
  any number of other non-Eldrazi creatures". `differentNames: true` beside a
  `count` is Transmutation Font's "three artifact tokens with different names",
  asked one at a time. A spell's equivalents are
  `additionalCost.sacrificeCount` and `flashback.sacrifice` (§3).
  `sacrifice-cost-parts.test.ts`.
- **A sacrifice cost's filters are matched against the source** (the
  `filter`, and each of an `each`'s), so a clause about the source reads it:
  "Sacrifice this creature and another green creature" (Magus of the Order)
  is `{ each: [{ isSource: true }, { type: "creature", colors: ["G"] }] }`,
  "two lands and this artifact" (Sandstone Deadfall) `{ each: [land, land,
  { isSource: true }] }`; "another creature or an artifact" (Mold Folk,
  Malevolent Noble, Skophos Warleader) is an `anyOf` with `isSource: false`
  on the creature branch alone — `otherOnly` would keep the source out of
  the other branch too; "Sacrifice enchanted creature" (Betrothed of Fire,
  Bloodfire Infusion) is `{ filter: { hostOfSource: true } }`, payable only
  while you control that creature (701.21a); "a creature of the chosen type"
  (Doom Cannon, Etchings of the Chosen) `ofChosenType`. The scaffolder reads
  all four. `sacrifice-cost-source.test.ts`.
- `payLife: "commander-identity-colors"` is War Room's "Pay life equal to the
  number of colors in your commanders' color identity" (`AbilityLifeCost`, read
  off `PlayerState.commanderIdentity` as it's activated): 0 for a colourless
  commander, and not activatable at all without a commander (the rulings).
  `"half-rounded-up"` is "Pay half your life, rounded up" (Lurking Evil, Murderous
  Betrayal), nothing at 0 or less. `"x"` is "Pay X life" (Krumar Initiate), its X
  capped by the life there is. `{ each: 3, per: { countersOnSource: "velocity" } }`
  is Tornado's, `{ each: 1, per: "card-in-hand" }` Hand of Vecna's equip.
- `unattach`: an unattach as a cost (rule 701.3d), unpayable with nothing
  attached. `"self"` is Sunforger's "Unattach this Equipment"; `"granter"` a
  granted "{T}, Unattach Leonin Bola", whoever controls it, its effects reading
  `"granter"` (`from: "granter"`, `return-to-hand`); `{ filter }` the player's
  choice of what's attached to the source, read back as `"sacrificed"` (Captain
  America's `divided: { total: { manaValueOf: "sacrificed" }, slot: 0 }`).
- `payLife: 2`, `payEnergy: 3`, `removeCounter: { kind: "+1/+1", count: 1 }` — all
  paid automatically (no decision).
- `do: EffectSpec` — **an action as a cost**, any step with a row in `COST_ACTS`
  (`cost-acts.ts`): `{ kind: "exile", target: "source" }` (Hanged Executioner: not a
  sacrifice, so nothing watching for a death sees one), `{ kind: "exert", target:
  "source" }` (rule 701.43, an `exerted` trigger sees it), `{ kind: "return-to-hand",
  target: "source" }` (Shigeki), `{ kind: "discard-hand", who: "you" }` (Slate of
  Ancestry: an empty hand is a legal payment), `{ kind: "mill", target: "you", amount: 1
  }` (Millikin), `{ kind: "exile-from-library", amount: 1 }`, `{ kind: "put-on-library",
  target: "source", position: "bottom" }`, `{ kind: "pay-energy", amount: "x" }` (X
  announced, capped by the energy there is), a `look-and-choose` from the hand, or
  `forageCost()` (only the ways that can be paid are offered). Several steps are a
  `sequence`. A step moving a card to or from a library keeps the ability from being a
  mana ability (605.1a). What it took reads back as `{ paid: … }`. Add a `COST_ACTS` row
  rather than a new `AbilityCost` field. A mana ability with a `do` is activated by hand.
- `discard: { count, filter?, random? }` — `random: true` is "Discard a card at
  random" (Mage il-Vec, Ogre Shaman): picked at random as it's paid, nothing
  asked; a spell's "As an additional cost to cast this spell, discard a card at
  random" is `additionalCost: { discard: 1, discardAtRandom: true }` (Sonic
  Burst).
- `discard: { count, filter? }` — "Discard a card" (Yawgmoth, Thran
  Physician), "Discard two cards" (Solphim), "Discard a creature card"
  (Fauna Shaman: `filter: { type: "creature" }`), "Discard a card with mana
  value X" (Kozilek, the Great Distortion: `manaValueX: true`, X announced with
  no `{X}` needed, the ability offered once per X with such a card, and a target
  or an `{X}` in the mana reading the same X). The player picks which, with
  the ordinary `discard` decision, as the ability goes on the stack; with a
  filter only the matching cards are offered (`eligible`, which only that
  player sees). It gates activation on having `count` such cards besides the
  source, and a hand with no more than that discards without asking. `count:
  "x"` is Gix, Yawgmoth Praetor's "Discard X cards": X is announced as it's
  activated though the mana has no `{X}`, capped by the cards there are to
  discard (`xCost.maxX`).
  The player gets priority back once it's paid (rule 117.3c — the
  decision's `priorityTo`), on another player's turn too.
- `reveal: { count, filter, text }` — "Reveal X white cards from your hand"
  (the Coldsnap Martyrs, rule 701.20a): `{ count: "x", filter: { colors:
  ["W"] }, text: "white cards" }`. X is announced as it's activated, capped
  by the matching cards in hand; which ones is a `choose-from-zone` with
  `destination: "reveal"` once the ability is on the stack (unasked when every
  match is needed). The cards stay in hand; the effect reads X as `"x"`
  (Martyr of Sands' `{ product: [3, "x"] }`). Not on a mana ability, nor
  beside another cost that asks. `reveal-as-cost.test.ts`. `shareColor: true`
  (a fixed `count`) is "Reveal two cards from your hand **that share a
  color**" (Illuminated Folio: `{ count: 2, filter: {}, text: "cards",
  shareColor: true }`): only cards with a colour enough of them have are
  offered (colourless shares none), the choice's `together` rule "share"
  over their colours. `revealed-card-cost.test.ts`.
- **"The revealed card"** — the one card a cost revealed from the hand (a
  spell's `additionalCost.behold` with `fromHand`, a cost option's, a
  kicker's `keyword: "reveal"`, an ability's `reveal` of one) is the
  `"revealed"` `AmountRef`: Induce Despair's "-X/-X, where X is the revealed
  card's mana value" is `{ product: [{ manaValueOf: "revealed" }, -1] }`,
  Charge of the Forever-Beast's damage `{ powerOf: "revealed" }`, Titan's
  Presence's "if its power is less than or equal to the revealed card's
  power" a `conditional` on `{ power: { op: "lte", n: { amount: { powerOf:
  "revealed" } } } }`. Read in the hand while it's still there, and as it
  last existed there once it has left (the rulings —
  `LastKnownRefs.revealed`). A mandatory "As an additional cost to cast this
  spell, reveal a creature card from your hand" is `additionalCost: {
  behold: { filter: { type: "creature" }, text: "a creature card",
  fromHand: true } }`. A copy of the spell reads nothing (as a copy's
  "sacrificed" and "discarded" don't: engine gap). The scaffolder reads the
  mandatory line and these sentences. `revealed-card-cost.test.ts`.
- `exileFromGraveyard: { count: 1, filter?, fromTop: true }` — "Exile **the top**
  [creature] card of your graveyard" (Alms, Necratog; rule 404.2): no choice, the
  first match down from the top of the pile.
- `sacrifice: { filter }, exilesSacrifice: true` — "Exile a creature you control" (Food Chain, City of
  Shadows; `otherOnly` for "another"): offered and named as a sacrifice is, read back as
  `"sacrificed"` (`manaValueOf`, the `sacrificed` condition), but exiled: no sacrifice event, and
  what can't be sacrificed still pays. On a spell, `additionalCost: { sacrifice, exilesSacrifice: true }`
  (Necrotic Fumes). `exile-chosen-costs.test.ts`. "Exile a **face-down permanent** you control face
  up: You may play that card this turn" (Primordial Mist) is the same cost over `{ faceDown: true }`
  with `grant-play` of `cards: { paid: "sacrificed" }` — the card where it lies in exile, a land as
  the land play, nothing for a token (`exile-face-down-to-play.test.ts`).
- `exileFromHand: { count, filter? }` — "Exile a card from your hand" (Cadaverous Bloom), asked with
  a `choose-from-zone`; a mana ability adds its mana with the answer (rule 605.3b).
- `exileSpell: { filter? }` — "Exile an instant or sorcery spell you control" (Nivmagus Elemental):
  a spell or copy of yours off the stack, exiled and not countered. Not on a mana ability.
- `exileFromGraveyard: { count, filter?, singleGraveyard: true }` — "Exile two creature cards from a
  single graveyard" (Night Soil): any player's holding enough, all from one.
- `exileFromGraveyard: { count: "opponents" }` — "Exile cards from your graveyard
  equal to the number of opponents you have" (Araumi of the Dead Tide): read as
  it's activated, opponents still in the game.
- `exileFromGraveyard: { count, filter? }` — "Exile two cards from your
  graveyard" (Varina, Lich Queen; Mines of Moria), "Exile a creature card
  from your graveyard" (Moorland Haunt: `filter: { type: "creature" }`). The
  player picks which as the ability goes on the stack — a `choose-from-zone`
  over their graveyard with `destination: "exile"`, only the matching cards
  pickable — and gets priority back once it's paid (rule 117.3c), whoever's
  turn it is; no more matching cards than that are exiled without asking.
  Either way they leave the graveyard as one move. Gates activation on having
  `count` such cards besides the source. Not beside a
  `discard`, a `returnToHand` or a sacrifice of several (each asks; one at a
  time isn't built). `count: "x"` is Necropolis Fiend's "{X}, {T}, Exile X
  cards from your graveyard": the same X as the mana's, capped by the cards
  there (`xCost.maxX`). `graveyard-exile-cost.test.ts`.
- `putFromExile: N` — a processor's "Put a card an opponent owns from exile
  into that player's graveyard" (Void Attendant, Cryptic Cruiser, Oracle of
  Dust): which, chosen as the cost is paid once the ability is on the stack
  (a `choose-from-zone`, `destination: "graveyard"`, each to its owner's;
  cards of different opponents allowed; a face-down one by its group, at
  random — the rulings). Gates activation on there being N. Not on a mana
  ability, nor beside another cost that asks. A spell's "as an additional
  cost" is `additionalCost.putFromExile` (Processor Assault).
  `put-exiled-into-graveyard.test.ts`. An ability's also takes `{ count,
  linked: true, filter? }`: the cards **exiled with this permanent** in its
  current stint (rule 607.2a), whoever owns them — Shelob, Dread Weaver's
  "Put a creature card exiled with Shelob into its owner's graveyard"
  (`put-linked-exiled-cost.test.ts`).
- `tapOthers: { count, filter, includeSelf?, shareCreatureType? }` — tap *other*
  permanents you control (Gravespawn Sovereign's "Tap five untapped Zombies you
  control"), as opposed to `tap`, which taps the source. `includeSelf` lets the
  source be one of them, which it can be when the ability has no `{T}` of its
  own. The player picks which (`tapCost` on the offer, `tap` on the action), a
  token stack paying token by token; one creature never pays both this and the
  mana half of the same cost. `count: "x"` is "Tap X untapped artifacts you
  control" (Secluded Starforge, Aryel, Necron Overlord): X announced as it's
  activated and read by the effect and a target's filter, offered once per X.
  `shareCreatureType` is "that share a creature type" (Weight of Conscience).
  `tap-cost-counted.test.ts`. As an effect, "you may tap five…; if you do" is a
  `may` over a `choose-permanents` with `min`, behind a `controls` condition
  (Thousand Moons Smithy); "tap any number…; when you do" a `reflexive-trigger`
  with `value: { thisWay: "tapped" }`. `totalPower: N` (with `count: 0`) is crew's
  form instead: any number of them whose powers add up to N or more, the
  offer carrying each one's power (`TapCostOffer.totalPower` / `power`) —
  write it with the `crew(n)` helper.
- `returnToHand: { count, filter }` — return permanents you control to their
  owner's hand (Quirion Ranger's "Return a Forest you control to its owner's
  hand", Mina and Denn's "Return a land you control", Multani's "Return two
  lands you control" from the graveyard). Chosen as the cost is paid, once
  the ability is on the stack, with the `choose-permanents` decision — asked
  only when more could pay it than it takes — and then its activator gets
  priority (rule 117.3c). A land tapped for the same ability's mana may be one
  of them. Gates activation on controlling `count`. Not on a mana ability, and
  not beside a `sacrifice` of several or a `discard` (each asks its own
  question).
- `untapOthers: { count, filter }` — untap tapped permanents you control (Halo
  Fountain's "Untap two tapped creatures you control", Crackleburr's with `{Q}`
  beside it). Chosen as the cost is paid, as `returnToHand` is, so a creature
  tapped for the same ability's mana may be one of them; activation gates on
  the tapped permanents there are then (its own `{T}` counted, its own `{Q}`
  not), so a creature to be tapped for mana is tapped first, the mana floating.
  A permanent with a stun counter can't pay (rule 122.1d), as for `{Q}`. Not on
  a mana ability, and not beside another cost that asks a question.
- `blight: N` — "Blight N" (rule 701.68a — Gristle Glutton's "{T}, Blight 1:
  …"): put N -1/-1 counters on a creature you control, chosen as the cost is
  paid, once the ability is on the stack, with the `choose-permanents`
  decision (asked only with more than one creature; the source itself may be
  it, and it needn't survive — the rulings). Then its activator gets priority
  (rule 117.3c). Activatable only while you control a creature (701.68b). Not
  on a mana ability, nor beside a `discard`, `returnToHand`,
  `exileFromGraveyard` or sacrifice of several. `blight.test.ts`.
- `waterbend: true` — the cost's `mana` is a **waterbend** cost (rule
  701.67a — Geyser Leaper's "Waterbend {4}: …" is `{ mana: "{4}", tap:
  false, waterbend: true }`; Katara, Water Tribe's Hope's "Waterbend {X}" is
  `mana: "{X}"` with `minX: 1` for "X can't be 0"): for each generic mana in
  it the activator may tap an untapped artifact or creature they control
  instead — summoning sick or not, the source too unless the cost also has
  `{T}` (North Pole Patrol's "Waterbend {3}, {T}" leaves it out). Only that
  much generic may be paid by tapping, whatever raises or lowers the total
  (701.67b). Which ones is the `activate-ability` action's `waterbend`,
  offered as the offer's `waterbend` (`WaterbendOffer`: `choices`, `max`, the
  fewest that work as `proof`, `byX` for an `{X}`); omitted, the engine taps
  the fewest that leave the rest payable. One tapped for it can't tap for
  mana too. "Exhaust — Waterbend {3}" is `exhaust: true` beside it. Not on a
  mana ability, nor beside `tapOthers`. `waterbend.test.ts`.

**Two mana of different colors**: `add-mana`'s `mana: { oneOf: [...], different: 1 }`
with `amount: 2` (Firemind Vessel, Interplanar Beacon); `different: 2` with
`amount: 4` is "two mana of any one color and two mana of any other color" (Open
the Omenpaths). `amount` is a number. `mana-different-colors.test.ts`.

**What a tapped permanent makes instead** (rules 106.12b, 614.1a): `StaticAbility.manaProduction`,
a list of `{ filter?, produces?, tapper, colorsOnly?, one?, atLeast?, times? }`, or the same one entry as
a `player-effect`'s `manaProduction` for a while. `filter` absent is any permanent; a land rule says `{ type: "land" }`. `atLeast` is "for two or more mana" (Damping Sphere). `produces` is a mana type or `"any-color"`, the
tapper's pick (Pulse of Llanowar); `one` is "and amount" (Contamination, Harvest
Mage); `colorsOnly` is "any other color", leaving {C} alone (Hall of Gemstone). In a
filter, "you" is the permanent's controller or the effect's. What triggered mana
abilities add isn't changed. `land-mana-instead.test.ts`, `mana-reads.test.ts`.

**Unspent mana** (rule 106.4): the `{ unspentMana: PlayerRef, type? }` amount, `grantPtPerCount`'s `unspentMana: { type? }` (Omnath, Locus of the Void) and the `unspent-mana` condition (Ozai). The `lose-unspent-mana` effect (`who` or `target`) is the same loss a step's end causes: "if you would lose unspent mana" replaces it and "you don't lose … as steps and phases end" doesn't stop it. `add-mana`'s `{ sacrificedCouldProduce: filter }` is "any type the sacrificed land could produce" (Squandered Resources, rule 106.7), read just before the cost takes it; the offer names the land with the colour.

**Mana abilities** (`isManaAbility`, rule 605.1a): an ability with no
targets, no `resolve`, and an `add-mana` effect (or a `sequence` of them),
activated from the battlefield and not a loyalty ability — **whatever it
costs**. These resolve immediately without using the stack. Use the
`manaTapAbility(color)` / `addManaAbility({...})` helpers from
`cards/helpers.js`. A cost the auto-payer can't pay by itself — a chosen
sacrifice (Orcish Lumberjack's "{T}, Sacrifice a Forest: Add …", Ashnod's
Altar, Phyrexian Tower), counters, energy — keeps the
ability out of `manaSources()`, so it's activated by hand, its mana floating
for what comes next; it still never uses the stack. needed-cards P20.

`add-mana`'s `mana` field: a fixed `ManaType` (`"W"`/`"U"`/`"B"`/`"R"`/`"G"`/
`"C"`), `"any-color"` (one of the five, the payer's choice — Treasure),
`"commander-identity"` ("one mana of any color in your commander's color
identity" — Command Tower, Arcane Signet: one of `PlayerState.commanderIdentity`'s
colours, and no mana at all for a player with no commander or a colourless
one), or
`{ oneOf: ManaType[] }` (`amount` mana in any combination of the listed
colours, each unit independently chosen — Orcish Lumberjack: `{ oneOf: ["R",
"G"] }`, `amount: 3`, needed-cards P20). Who picks the colour depends on where
the mana is made: paying a cost, the auto-payer makes what fits; a mana
ability activated by hand is offered once per outcome (the action's
`manaColors`); and **a spell or an ability on the stack asks as it resolves**
(rule 608.2d) — "one mana of any color" as a `choose-modes` over the five, "N
mana in any combination of" as one choice of split while there are at most 35
of them (Culling Ritual's "{B} or {G} for each", Burnt Offering), otherwise
each unit's colour in turn (Klauth's X over five colours). By hand, past what a
list holds (a live X, or Cascading Cataracts' five over five colours), it's all of
one colour each and one offer whose split the player picks (`manaSplit`: Selvala,
Heart of the Wilds). On a `tapped-for-mana` trigger each unit is its own pick
(Market Festival's "two mana in any combination of colors"). So a triggered or
targeted ability that adds "one mana of any color" is just that `add-mana`
(Deathrite Shaman, Klauth) — no hand-built `modal` over the colours needed.
"Add {W}{U}" (a Signet, a Karoo land) is `{ all: ["W", "U"] }` with
`amount: 1`: one of each, `amount` times over (Ramos's
"{W}{W}{U}{U}{B}{B}{R}{R}{G}{G}" is all five with `amount: 2`). **Not**
`{ oneOf }` × 2, which could make {W}{W}. `{ oneOf, same: true }` is all
`amount` of **one** listed type, never a mix — Brigid, Doun's Mind's "Add X
{G} or X {W}" — as `"any-color"` with an `amount` above 1 is over all five
(Gilded Lotus's "three mana of any one color"; Helga, Skittish Seer's live "X
mana of any one color"): the payer and a hand activation are offered one
option per type, and a hand activation makes every unit its first pick.

**Lists read off the board** (`BoardManaList`) — what they name shrinks and
grows with the board, and one naming nothing makes no mana (rule 106.5; the
ability can still be activated, for nothing):

- `{ producedBy: "opponents-lands" | "your-lands", filter?, anyType?, same? }`
  — "any color that a land an opponent controls could produce" (Exotic
  Orchard), "…a land **you** control" (Reflecting Pool), "…a **Gate** you
  control" (Gond Gate: `filter: { subtype: "Gate" }`). `anyType` is "any
  **type**" — colorless too (Reflecting Pool, Horizon of Progress). "Could
  produce" is rule 106.7: every type a land's mana abilities (printed,
  intrinsic or granted) would make if they resolved now, costs and legality
  ignored (a tapped land counts), read through other such lands without
  looping (two Reflecting Pools alone make nothing — the ruling). `same` is
  "`amount` mana of that one type" (Incubation Druid's "three mana of that
  type").
- `{ colorAmong: CardFilter, zone?: "graveyard" | "exiled-with-source", same? }`
  — "one mana of any color among legendary creatures and planeswalkers you
  control" (Mox Amber: put `controlledBy: "you"` in the filter), "…among
  legendary creature cards in your graveyard" (The Grey Havens), "…of the
  exiled card's colors" (Chrome Mox — the cards linked to this permanent,
  rule 607.2a). Colours only, never {C}.
- `{ eachColorAmong: CardFilter }` — "for each color among permanents you
  control, add one mana of that color" (Bloom Tender, Faeburrow Elder): one
  of each, at most five.
- `{ ifCondition: StaticCondition, thenOneOf: ManaType[], elseOneOf: ManaType[] }`
  — "Add {C}. If this has a luck counter on it, instead add one mana of any
  color" (Gemstone Caverns): a `oneOf` over the list the condition picks, read
  off the source as the mana is made.

**"Choose a color. Add an amount of mana of that color equal to your devotion
to that color"** (Nykthos, Shrine to Nyx; Nyx Lotus) is `mana: "any-color"`
with `amount: { devotionTo: "that-color" }` — the amount read for the colour
being made. By hand, one offer per colour with what it makes (every colour
that makes none is one offer); the auto-payer gets an option per colour.
Three Tree City's "…equal to the number of creatures you control of the
chosen type" is plain `"any-color"` with a `countOf` whose filter has
`ofChosenType` — a count reads its source's chosen type now.

**A mana ability's `amount` may be a live `EffectAmount`** (Marwyn, the
Nurturer: `{ powerOf: "source" }`; Kydele: `{ turnStat: "cards-drawn" }`).
`manaSources()` sizes it against the board as it stands, through an ordinary
resolution context, so it means exactly what it will when the ability
resolves; `"x"` and `triggerValue` read 0 there, and 0 or less makes the
permanent no source at all. `{ oneOf }` with a live amount is planned as one
compressed option — X units, each any of the listed types (`ManaOption.
anyColorOf`) — rather than X+1 enumerated splits, so a huge X costs nothing;
by hand, every split is offered while all of them together come to at most
`MAX_STANDALONE_UNITS` (512) units — for two colours, X up to 22 — and past
that one "all of this type" option per type. A mana ability **without `{T}`** is an auto-payer source only
with `oncePerTurn: true` (Vivi Ornitier's "{0}: Add … Activate only once each
turn"): the planner uses each source at most once per payment, which is only
true of an untapped ability that can't be activated again. Such a source
works while tapped or summoning sick, isn't tapped by a payment, survives
being tapped to convoke, and has its once-a-turn use recorded when a payment
draws on it. A `{0}` cost is written `mana: "{0}"`. **Still can't produce a genuine mix in one activation from a fixed
list of *different* amounts per colour**, and an ability whose activation
*cost* itself contains mana (a filter land's `{G/U}, {T}: …`) is excluded from
`manaSources()`'s auto-payment scan entirely, to avoid circular payment
planning — see §15.

**Any cost makes a mana ability** (rule 605.1a is about what it does, not what
it costs): Kykar, Wind's Fury's "Sacrifice a Spirit: Add {R}" (`sacrifice: {
filter: { subtype: "Spirit" } }`), Ramos, Dragon Engine's "Remove five +1/+1
counters: Add {W}{W}{U}{U}{B}{B}{R}{R}{G}{G}" (`removeCounter`, and a
`sequence` of `add-mana` steps, which counts as one mana ability), an energy
cost, a coloured one (Loot, the Pathfinder's `{G}, {T}`). They never use the
stack, and a driver sees `manaAbility: true` on the offer. The auto-payer only
uses what it can pay by itself — `{T}`, a self-sacrifice, life, generic mana
— so these are activated by hand, their mana floating for what comes next.

**A mana ability that does more** (rule 605.1a again) puts the rest on
`add-mana`'s `also`: Kibo, Uktabi Prince's Banana, "{T}, Sacrifice this
artifact: Add {R} or {G}. You gain 2 life.", is `{ kind: "add-mana", mana: {
oneOf: ["R", "G"] }, amount: 1, also: { kind: "gain-life", amount: 2 } }`.
Applied right after the mana, off the stack, whether it's activated by hand or
the auto-payer uses it to pay a cost.

What it does **before** the mana goes on `add-mana`'s `first`, and the amount
is read after it: Empowered Autogenerator's "{T}: Put a charge counter on this
artifact. Add X mana of any one color, where X is the number of charge
counters on this artifact" is `{ kind: "add-mana", mana: "any-color", amount:
{ countersOn: "source", counter: "charge" }, first: { kind: "add-counter",
target: "source", counter: "charge", amount: 1 } }` — the new counter counts,
doubled under Doubling Season (never `{ sum: [1, …] }`). The auto-payer sizes
it the same way when `first` is a fixed number of counters on `"source"`; any
other `first` is activated by hand. Activated mana abilities only. The
scaffolder reads "[sentence]. Add …" this way.

`add-mana`'s `who` (a `PlayerScope`) is "**each player** adds {B}{R}{G}"
(Yurlok of Scorch Thrash) — for mana with no choice in it. In a mana ability,
keep the controller's own part unscoped (that is what the auto-payer counts)
and put the others' on `also` with `who: "each-opponent"`; an ability whose
own `add-mana` is scoped to someone else is never an auto-payer source.

`add-mana`'s `target` (a player target slot) is "**target player** adds one
mana of any color" (The Warring Triad: `targets: ["player"]`, `effect: { kind:
"add-mana", mana: "any-color", amount: 1, target: 0 }`). A target makes it no
mana ability (rule 605.5a): it uses the stack, and its controller picks the
colour as it resolves (608.2d) — Radiant Lotus's "Choose a color. Target
player adds three mana of the chosen color for each artifact sacrificed this
way" is `mana: "any-color", amount: { product: [3, "x"] }` with a `count: "x"`
sacrifice and `minX: 1`. A card where the other player picks says "they
choose" (Spectral Searchlight), which this doesn't cover.

**Triggered mana abilities** (rule 605.1b) are the `tapped-for-mana` trigger
(§9) with an `add-mana` effect: Crypt Ghast's "whenever you tap a Swamp for
mana, add an additional {B}" is `trigger: { on: "tapped-for-mana", who:
"you-control", filter: { subtype: "Swamp" } }`, `effect: { kind: "add-mana",
mana: "B", amount: 1 }`; a `delayed-trigger`'s `at: { whenever }` with that
trigger and that effect is one for the turn (High Tide, Bubbling Muck, Molten
Tide); Roxanne, Starfall Savant's "…add one mana of any type
that artifact token produced" is `mana: "produced"` (meaningless anywhere
else). They never go on the stack: the extra mana is made with the rest, and
the auto-payer counts it — a Swamp under Crypt Ghast is a `{B}{B}` source. Its
`anyAbility: true` is "whenever a land's **ability causes you to add** mana"
(Caged Sun, with `producing: "chosen"`), whichever ability did it: one with no
`{T}` in its cost (a storage land's) or a trigger on the stack (Crumbling
Vestige's), tapped or not.
Everything else the ability does is part of it too (rule 605.4a), so it's the
`add-mana`'s `also`, never a `sequence` (that would use the stack, and
`pool.test` refuses it), with `"trigger-object"` the tapped permanent,
`"trigger-player"` who tapped it and no decision in it: Overabundance's "and
this enchantment deals 1 damage to the player", Barbflare Gremlin's "that land
deals 1 damage" (`from: "trigger-object"`, read as it last was if it was
sacrificed for the mana), Winter's Night's "that land doesn't untap" (`tap` with
`onlyDoesntUntap`). The ability's `condition` is read as the mana's made: Regal
Behemoth's "while you're the monarch", Barbflare's "if this creature is tapped".
A trigger that adds mana on anything else isn't a mana ability, whatever it does
(rule 605.5a): Crime Novelist's "whenever you sacrifice an artifact, put a +1/+1
counter on this creature and add {R}" is a plain `sequence`, on the stack.
The `add-mana` can carry its own `spendOnly`, and `mayAdd: true` for a fixed type
is "may add" (Snowfall): tapped by hand, one offer with the mana and one without;
paying a cost, it's taken when that payment can spend it and declined when not.
The extra mana is the trigger's source's and carries **none** of the tapped
permanent's restrictions or riders (the Mirari's Wake, Kinnan and Mana Flare
rulings) — the auto-payer included. A choice in it is the player's: "any type
that land produced" off a land that made two types (a Karoo under Mirari's
Wake), "an additional one mana of any color" (Fertile Ground), tapped by hand,
is one more pick in the activation's `manaColors` — each outcome its own
offer; "…of the chosen color" (Utopia Sprawl) reads the colour the Aura named
as it entered (`chooseOnEnter`). "Whenever a player taps a land" is `who:
"any"`, and the mana goes to whoever tapped it (Mana Flare). A counted amount
is read as the mana is made — Elvish Guidance's "an additional {G} for each
Elf on the battlefield" is `amount: { countOf: { subtype: "Elf" } }` — but
never one reading `"x"` or a trigger value (a mana ability has neither), and
the effect is a single `add-mana`: `pool.test` holds every card to both.

**"If you tap a permanent for mana, it produces twice as much of that mana
instead"** (Mana Reflection; three times — Nyxbloom Ancient) is the static
rule `manaProduction: [{ tapper: "you", times }]` (rule 106.12b): only a
`{T}` mana ability its controller activates, only its own mana (never a
triggered mana ability's extra — the ruling), every unit with what it
carries; several compound. An "any colour" unit becomes `multiplier` of
**one** colour.

- `sorcerySpeed: true` — the ability works only when you could cast a sorcery
  (Equip). An Equipment is `types: ["artifact"], subtypes: ["Equipment"]` with
  an `activated` ability `{ effect: { kind: "attach", target: 0 }, targets:
  ["creature-you-control"], sorcerySpeed: true }`.
- `anyPlayer: true` — "**Any player may activate this ability**" (rule 602.2:
  only an object's controller may, "unless the object specifically says
  otherwise" — Glittering Lion, Excavation, Ribbon Snake, Feral Hydra). It's
  offered to every player with priority. Whoever activates it controls the
  ability (602.2a): they pay its costs (Excavation's "Sacrifice a land" is one
  of **their** lands, Oona's Prowler's discard from **their** hand), "you" in
  its effect is them, and so is "your" in its `condition` — Well of
  Knowledge's "only during their draw step" is `your-turn` with
  `turn-structure` `["draw"]` (Volrath's Dungeon's "only during their turn" would be
  `your-turn`). "…but only as a sorcery" adds `sorcerySpeed` (the activator's
  main phase). Battlefield abilities only, and only printed ones (none is ever
  granted). The scaffolder reads the sentence. `any-player-rhystic.test.ts`.
- `loyaltyCost: 1` (or `-3`) — marks a **loyalty ability**: `cost.mana` /
  `cost.tap` are ignored, it's sorcery-speed, once per planeswalker per turn,
  and paid by adding/removing loyalty counters. Requires `loyalty` on the card.
  `loyaltyCost: "-x"` is a **"−X"** cost (Chandra Nalaar, Tezzeret the Seeker):
  X is announced as it's activated, 0 up to the loyalty it has (rules 107.3a,
  606.6), and that many counters are removed; the effect reads it as
  `amount: "x"` or a filter's `n: "x"`, as an `{X}` ability's. There is no
  "+X" yet. The scaffolder reads "−X:" lines. `loyalty-x.test.ts`.
- `otherOnly: true` — "Sacrifice **another** …": keeps the source out of its
  own sacrifice cost (Ayara, First of Locthwain; Dina, Soul Steeper). It says
  nothing about targets any more — "untap **another** target artifact"
  (Manifold Key) is an `other` slot (§7), which works for triggered
  abilities and spells too. Without it, a self-referential ability like an
  untap could target itself and become a repeatable no-net-cost loop —
  needed-cards P17 caught exactly this in the fuzzer.
- `boast: true` — **Boast** (rule 702.142 — Dragonkin Berserker): activatable
  only if this creature attacked this turn (`GameObject.attackedThisTurn`),
  and only once each turn (twice on your own turn with a static's
  `boastsEachOfYourTurns: 2` — Birgi, God of Storytelling). Implies `oncePerTurn`.
- `oncePerTurn: true` — "Activate only once each turn" (rule 602.5g — Steel
  Hellkite). Recorded per ability index on `GameObject.abilitiesUsedThisTurn`,
  so a permanent with two such abilities limits each separately, and reset in
  the controller's untap step — and by any zone change, since the permanent
  that comes back is a new object (rule 400.7).
- `timesEachTurn: n | EffectAmount` — "Activate no more than **twice**
  each turn" (Pit Imp: `2`; Sewer Rats' "three times": `3`), or a count read
  as it would be activated — Withering Wisps' "no more times each turn than
  the number of snow Swamps you control" is `{ countOf: { subtype: "Swamp",
  supertype: "snow", controlledBy: "you" } }`. Rule 602.5b: counted on the
  object like `oncePerTurn`, activations still on the stack included, through
  a change of control. A mana ability with it is activated by hand (the
  auto-payer leaves it alone).
- `exhaust: true` — **Exhaust**, "activate each exhaust ability only once":
  once for as long as the object exists, rather than once a turn (Loot, the
  Pathfinder). Recorded on `GameObject.exhaustedAbilities`; a zone change
  clears it.
- `onlyOnce: true` — a plain "Activate only once" on an ability without the
  Exhaust label (Stalking Leonin, Duggan, Private Detective): the same limit,
  tracked the same way, but "exhaust abilities" (Boom Scholar's cost reduction,
  rule 702.177b) don't count it.
- `condition: StaticCondition` — "Activate only if …" (rule 602.5, Fanatic of
  Rhonas's Ferocious: "{T}: Add {G}{G}{G}{G}. Activate only if you control a
  creature with power 4 or greater"). Mirrors `StaticAbility`/
  `TriggeredAbility`'s `condition`, checked live from the source's
  controller's perspective. A gated *mana* ability is also excluded from
  `manaSources()`'s auto-payment scan while the condition is false, not just
  from manual activation. needed-cards P19.
- `zone: "hand" | "graveyard" | "command"` — activatable only from that zone,
  never as a permanent's ability, and only by the card's **owner**. The
  ability still goes on the stack like any other (a zone ability is never a
  mana ability — those stay battlefield-only). `legalActions` scans those
  zones the same way it scans the battlefield (the shared command zone for
  the cards the player owns).
  - `"hand"` is **Channel** (rule 702.51a — Boseiju, Who Endures), and
    **discards** the source as an implicit, unconditional part of the cost.
  - `"graveyard"` is "Exile this card from your graveyard: …" (Runehorn
    Hellkite), and **exiles** it. Because it's a cost, the exile happens on
    activation and stands even if the ability is countered. Add
    **`staysInZone: true`** for a graveyard ability whose cost doesn't move
    the card (Reassembling Skeleton: "{1}{B}: Return this card from your
    graveyard to the battlefield tapped." — `put-onto-battlefield` on
    `"source"` with `enterTapped`).
  - `"command"` has no zone-change cost (Derevi, Empyrial Tactician:
    "{1}{G}{W}{U}: Put Derevi onto the battlefield from the command zone." —
    `put-onto-battlefield` on `"source"`). Putting a commander onto the
    battlefield this way isn't casting it: no commander tax, no cast
    triggers, but its enters triggers fire.

  When the source stays put (`"command"`, or `staysInZone`), the ability
  remembers *which object* it was activated from: if the card changes zones
  before the ability resolves — cast in response, or returned and killed
  again — it's a new object (rule 400.7) and `"source"` names nothing, so
  the effect does nothing (`GameObject.zoneChangeCount`). That check is made
  as the ability starts resolving; an effect that pauses for a decision and
  names `"source"` afterwards isn't re-checked.
- `costReduction: { reduceGeneric }` — a live-count discount printed on the
  ability itself (mirrors `CardDefinition.selfCostReduction`, but for an
  activated ability's own cost) — the Kamigawa Channel lands' "This ability
  costs {1} less to activate for each legendary creature you control."
  `condition` gates it, read as it's activated from the source's side: "… if
  you're the monarch" (Crown of Gondor, on an `equip()`), "during your turn"
  (Hylda's Crown of Winter), and from the graveyard (Razorlash Transmogrant).
  `reduceColored` is the coloured part: Flying Drone's "{1}{U} less" is
  `reduceGeneric: 1, reduceColored: "{U}"` (rule 118.7).
- `targetCostReduction: { filter, reduceGeneric, count? }` — "This ability
  costs {N} less to activate if it targets [`count`, default one, objects
  matching `filter`]" (the spell's `targetCostReduction`, for an ability):
  Raft Security Officer's "a creature with power 3 or less", Wayta, Trainer
  Prodigy's "two creatures you control" (`count: 2`). The cost is fixed as
  the targets are chosen (rule 601.2f): keep the printed targets as printed
  — never split the ability by target case, which would make a target that
  stops matching in response illegal. An offer only affordable with it
  offers only the targets that earn it. `reduceGeneric` may read the target
  instead, with `filter: {}`: `"target-colors"` is "{1} less for each color
  of the creature it targets" (Dragonfire Blade), `"target-power"` "{X}
  less, where X is the power of the creature it targets" (Belt of Giant
  Strength; a power below 0 takes nothing off) — offered for the targets
  it's affordable on.

---

## 9. Triggered abilities

```ts
triggered: [
  {
    trigger: { on: "enters-battlefield", who: "self" },
    targets: [],
    effect: { kind: "draw", amount: 1 },
    resolve: null,
    text: "When ~ enters the battlefield, draw a card.",
  },
]
```

**`TriggerSpec.on`** values (`abilities.ts`):

Every trigger also takes the **timing wrapper** (`TriggerTiming`): `firstTimeEachTurn: true` ("… for the first time each turn") or `nthEachTurn: N` ("your second … each turn"), the Nth time this turn the trigger's event, as the trigger reads it, happened for the same subject (the same player, or the same object in its stint), before the permanent arrived too, counted from the journal. It works on the kinds `timingCountable` (`trigger-events.ts`) lists — `gains-life`, `loses-life`, `draws`, `cast-spell`, `attacks`, `attack-with`, `becomes-target`, `becomes-tapped`, `becomes-saddled`, `counters-put`, `put-into-graveyard`, `discards` — and a pool test refuses it anywhere else. "This ability triggers only once each turn" is `TriggeredAbility.oncePerTurn`; "… Do this only once each turn" is the `may`'s `oncePerTurn`, which also stops the ability triggering once done that turn (rule 603.2h).

A trigger event with nothing of its own but a subject is **`{ on: "event", event, who?, filter?, by?, batched? }`**, `event` a word of `TRIGGER_EVENTS` (`trigger-events.ts`): `attack-triggers-own-ability` (Firebender Ascension's "whenever a creature you control attacking causes a triggered ability of that creature to trigger": the subject is that ability as it goes on the stack, `who: "you-control"`, and `copy-ability` of `"trigger-ability"` copies it), `forages`, `rolls-dice` (value: the sum), `takes-initiative`, `ventures`, `completes-dungeon`, `loses-game`, `surveils`, `searches-library` (their own), `collects-evidence`, `discovers` (value: N), `foretells`, `commits-crime`, `becomes-renowned`, `becomes-monstrous` (value: N), `fights`, `wins-coin-flip`, `becomes-untapped`, `voting-finishes` (Erestor's votes), `enlists`, `proliferates`, `becomes-monarch`, `phases-in` (one occurrence per permanent), `connives` ("that creature" is the conniver), `becomes-crewed` (value: how many crewed it), `damage-to-player-prevented` (Selfless Squire's "whenever damage that would be dealt to you is prevented" — any prevention, protection's too; value: how much), `bends` (Avatar Aang). `who` is about the event's object where it has one (`"self"`, `"you-control"`, `"opponent"`), otherwise its player (`"you"`, `"opponent"`); absent is anyone. A new one is a row there, not a new kind.

| `on` | extra fields | fires when |
| --- | --- | --- |
| `enters-battlefield` | `who`, `filter?`, `otherOnly?`, `batched?`, `firstCreationEachTurn?` | a permanent enters; `batched` is "whenever **one or more** … enter": once per simultaneous entry, `{ triggerValue: true }` how many matched (Marneus Calgar, Ingenious Artillerist). **"Whenever you create a token"** is `who: "you-control"`, `filter: { token: true }` (rule 111.2; Mirkwood Bats), `batched` for "one or more", and `firstCreationEachTurn` for "for the first time each turn" (Akim, the Soaring Wind). **"Whenever this creature or another X enters / dies / leaves"** is `thisOrAnother(ability)` from `helpers.ts` (`ability` the "another X" trigger): a `who: "self"` trigger and an `otherOnly` one, so the source's own event counts whatever it is by then — a copy of another colour or type, a token copy of a "nontoken" one. Never one trigger filtered to X: it misses the source when the source isn't one (Ayara, Bloomvine Regent, Millicent) |
| `dies` | `who`, `filter?`, `otherOnly?`, `batched?`, `batchValue?` | `batched` is "whenever **one or more** creatures die" (Vengeful Townsfolk, Seer of Stolen Sight): once per simultaneous event however many matched, `{ triggerValue: true }` how many, or with `batchValue: "total-power"` their total power as they last existed (The Skullspore Nexus) (a token stack as each token), once the whole wrath or state-based sweep is done, and `put-arrived-onto-battlefield` takes "one of them" (Rinoa, Angel Wing); with "this ability triggers only once each turn" write a plain `dies` with `oncePerTurn` instead. A permanent → graveyard from the battlefield, **however it got there** (rule 700.4) — destroyed, sacrificed, the legend rule, a Saga completing. A commander dies like anything else: its owner is offered the command zone only once it's in the graveyard (903.9a). It fires for any permanent — "is put into a graveyard from the battlefield" (Disciple of the Vault) is this trigger as written — so a card that says **dies** names a creature in its `filter` (`{ type: "creature", subtype: "Human" }`, never `subtype` alone): only a creature dies (700.4), and a noncreature changeling such as Firdoch Core is every creature type. |
| `becomes-target` | `who`, `filter?`, `otherOnly?`, `orSpell?`, `byOpponentOnly?`, `byControllerOnly?`, `spellOnly?`, `abilityOnly?`, `targeterNotTarget?`, `player?`, `playerOnly?` | a permanent was chosen as a target of a spell or ability (rule 115.7 — Thunderbreak Regent); `trigger-object` is the permanent targeted (Monk Gyatso's "you may airbend that creature"), `otherOnly` leaves out the source itself ("another creature you control"); `orSpell` counts spells on the stack too, by the same `who` and `filter` ("a creature you control **or a creature spell you control**" — Surrak, Elusive Hunter: an opponent's Counterspell at your creature spell; without it only permanents count); `spellOnly` narrows it to "becomes the target of a **spell**" (Gargos, Vicious Watcher; Tectonic Giant). Fires as the spell/ability goes on the stack, so it triggers even if that spell is countered or later fizzles, and once per targeted object — a spell naming the same creature in two slots triggers it once, one naming two of your creatures triggers a `you-control` watcher twice. The *player* who targeted it auto-fills the first target slot when that slot can hold a player ("deals 3 damage to that player"), unless `targeterNotTarget` says the slot is a real choice (Venerated Rotpriest's "target opponent gets a poison counter" may name any opponent). Players count with `player`: `"you"` is "whenever **you** or a permanent you control becomes the target" (Unsettled Mariner — once for you, once per permanent), `"any"` is "a **player** or permanent" (Loki, God of Mischief); `playerOnly` leaves permanents out ("whenever you become the target of a spell" — Dormant Gomazoa, Amulet of Safekeeping). `abilityOnly` is "of an **ability** you control" (Loki, with `byControllerOnly`); `abilityOnly: "activated"` is "of an **activated** ability", never a triggered one (Professor Hojo's "whenever one or more creatures you control become the target of an activated ability … only once each turn": `who: "you-control"` with `oncePerTurn`). The timing wrapper's `firstTimeEachTurn` counts the targetings this trigger reads: valiant's (`byControllerOnly`) its controller's, Angelic Cub's everyone's. A ward effect (`{ kind: "ward", cost }`) counters the targeting spell or ability for a player target too. |
| `tapped-for-mana` | `who`, `filter?`, `producing?: "C" \| "chosen"` | a permanent was tapped for mana (its mana ability with `{T}` in the cost); `producing: "C"` is "whenever you tap a land **for {C}**" (Ultima, Origin of Oblivion) — only when it made colorless mana, once however much; `"chosen"` is "**of the chosen color**" (Gauntlet of Power, `chooseOnEnter`). A **triggered mana ability** (rule 605.1b): never on the stack, its `add-mana` is made with the tapped permanent's mana and counted by the auto-payer — see "Triggered mana abilities" in §8. **Any other effect, or a target, and it isn't a mana ability**: it triggers as the mana ability resolves and makes mana (rule 106.12a) and uses the stack, above a spell the mana paid for — Burning Earth's "whenever a player taps a nonbasic land for mana, this enchantment deals 1 damage to that player" (`who: "any"`, `who: "trigger-player"` on the `damage`), Zhur-Taa Druid (`who: "self"`), Forbidden Orchard (`targets: ["opponent"]`), Storm Cauldron's "return it" (`target: "trigger-object"`), Sanctimony (`who: "opponent"`). The tapped permanent is the trigger object, read as it last existed if the cost sacrificed it. |
| `becomes-tapped` | `who`, `filter?`, `batched?`, `by?`, `notAttacking?` | a permanent became tapped (rule 701.26a — City of Brass). Fires for every tapping: a mana ability, a cost that taps it, an opponent's tap effect. Not the same as `add-mana`'s `painToController`, which only charges the mana-ability path. `batched` is "whenever one or more … become tapped", once per tapping at the same time: a whole attack, a `tap-all`, one spell's taps (Deeproot Pilgrimage). `by` is who tapped it ("whenever **you** tap an untapped creature an opponent controls" — Solitary Sanctuary: `who: "opponent", by: "you"`), the controller of the effect or cost; the timing wrapper's `firstTimeEachTurn` only the first time that object became tapped this turn, whenever it was (Tale of Katara and Toph, with a `your-turn` condition for "during each of your turns"). `notAttacking` not by being declared as an attacker (Verity Circle). |
| `loses-control` | `who: "self"` | "when you lose control of this permanent" (Khârn the Betrayer): another player gains control of it, or it leaves the battlefield (the ruling). Looks back (rule 603.10d): "you" is who had it just before, and the ability is theirs |
| `gains-control` | `who: "self"` | "when you gain control of this enchantment from another player" (Risky Move): "you" is who has it now; entering under your control isn't it |
| `control-taken` | `filter?` | "whenever an opponent gains control of a permanent from you" (Zidane, Tantalus Thief). Looks back too: this permanent going sees itself go, the ability its former controller's, and with others at once sees each (`withControlBatch`). A stack handed over whole is a permanent per token |
| `becomes-attached` | `who: "self"`, `filter?` | "whenever this Equipment becomes attached to a creature" (Blade of Shared Souls): moved from one to another counts, on the one it's moved to; its trigger object is what it's attached to. |
| `becomes-unattached` | `who: "self"` | "whenever this Equipment becomes unattached from a permanent" (Grafted Exoskeleton, Captain's Hook): attached to something else, unattached by an effect or a state-based action (704.5n), what it was on leaving, or this leaving while attached (read as it last existed, 603.10a — one trigger when both go at once). Its trigger object is what it was attached to: "sacrifice that permanent" is `sacrifice-target` of `"trigger-object"` (only while you control it, 701.21a), "destroy that permanent" a `destroy`. |
| `leaves-battlefield`'s `batched` | as below | "whenever **one or more** … leave the battlefield" (Dour Port-Mage, Nefarious Imp): once per simultaneous event, a permanent that left in it seeing it too and a commander's deferred move (903.9b) part of it, `{ triggerValue: true }` how many. With "triggers only once each turn" it's a plain `leaves-battlefield` with `oncePerTurn` (Sally Sparrow). |
| `leaves-battlefield` | `who`, `filter?`, `otherOnly?`, `to?` | a permanent leaves for **any** zone — or only the destinations `to` lists (Reyhan, Last of the Abzan's "dies or is put into the command zone" is `to: ["graveyard", "command"]`). `filter` is matched against it as it last existed on the battlefield, so "if it had one or more +1/+1 counters on it" is a `counters` clause there; it's the trigger object, so "that many" is `{ countersOn: "trigger-object", counter: "+1/+1" }`. |
| `gains-life` / `loses-life` | `who`, `duringTheirTurn?` (`loses-life` only) | a player's life changes (`who` = whose). "Loses life **for the first time during each of their turns**" (Valgavoth, Harrower of Souls) is `duringTheirTurn` (only while that player is active) with the timing wrapper's `firstTimeEachTurn` — a loss earlier in the turn, even before this permanent arrived, uses it up (Vengeful Warchief). `{ triggerValue: true }` is how much ("loses that much life" — Sanguine Bond). Once per life-gain *event*, which is once per source (rule 119.9): lifelink damage one source deals to several things at once is **one** gain, so it triggers once; two lifelinkers dealing combat damage together are two (Oloro, Blech). |
| `attacks` | `who`, `filter?`, `otherOnly?`, `attackingYou?`, `youDefend?`, `defender?`, `attackedPlayer?`, `attackedPlayerOrPlaneswalker?`, `attackedMonarch?`, `aloneAgainstDefender?`, `defenderLife?`, `firstTimeEachTurn?` | `attackedPlayerOrPlaneswalker: "opponent"`: "attacks one of your opponents or a planeswalker an opponent controls" (Gahiji); `attackedMonarch`: "attacks the monarch" (The Spear of Bashenga), the player as it's declared, its "that player" the `"trigger-player"`. "One of your opponents" alone is the filter's `attackingOpponent` (Genestealer Locus), and "if that player is the monarch" `of-player`'s `"that-player"` (M'Baku). a creature is declared as an attacker, once per attacker (`attackedPlayer` names the player it must be attacking — Curse of Predation's "enchanted player" is `"attached"`; `filter` narrows which one — Utvara Hellkite / Atarka, World Render: "a Dragon you control"; `otherOnly` is Arahbo's "whenever **another** Cat you control attacks"). The attacker is the trigger object ("it gets +X/+X" — `target: "trigger-object"`) and the player it attacks, or the controller of the planeswalker it attacks, is the `"trigger-player"` ("defending player"); the player or planeswalker itself is what `damage.toTriggerRecipient` hits (Mage Slayer's "the player or planeswalker it's attacking" — a planeswalker gone by then is dealt nothing). `attackingYou` fires only when the attack is aimed at this permanent's controller or a planeswalker they control (Isperia's "Whenever a creature attacks you or a planeswalker you control"); "attacks **one of your opponents**" is `filter: { attackingOpponent: true }` with `who: "any"` (Skyboon Evangelist, Soulblade Corrupter: the player, whoever's creature) — never a battle they protect; with `defender: "player"` it's "attacks **you**" alone (MacCready). `youDefend` is Kazuul's "if you're the defending player": that and a battle they protect too (rule 508.5) — which also covers "a creature an opponent controls", since nobody can attack themselves. `defender: "player"` is "attacks **a player**" / "attacks **an opponent**" (Kaalia of the Vast): a creature attacking a planeswalker attacks the planeswalker, not its controller (rule 508.3a), so it doesn't count. `aloneAgainstDefender` is "…, **if no other creatures are attacking that player**": an intervening-if, checked against the whole declaration and again on resolution. `defenderLife` is how the attacked player's life ranks (a `DefenderLife`; a planeswalker never ranks): `"most"` is dethrone's "attacks the player with the most life or tied for most life" — every player in the game compared, you included, asked once as it triggers (use `dethrone()` for the keyword itself) — and `"more-than-another-opponent"` is "if that opponent has more life than another of your opponents", an intervening-if asked again on resolution; `"most-still-attacking"` is Scourge of the Throne's "**if it's attacking** the player with the most life or tied for most life" — `"most"` as an intervening-if, asked again on resolution of the player it attacks then (as it last existed, if it has left the battlefield; nobody, if it's been removed from combat). `firstTimeEachTurn` is "whenever this creature attacks **for the first time each turn**" (Scourge of the Throne): a creature declared an attacker in an earlier combat this turn doesn't fire it again. Every attacker is attacking before the first of these fires, so a trigger always sees the complete declaration. A creature put onto the battlefield attacking was never declared and fires none of this. |
| `attacks-player` | `who`, `defender`, `filter?`, `atLeast?`, `defenderLife?`, `defenderHasInitiative?` | `filter` narrows the attackers that count, still once per player (Attuma, Atlantean Warlord's "one or more Merfolk you control attack a player"). `atLeast` is "**two or more** creatures you control attack a player" (Landroval, Horn of the Mark), each player judged alone, a creature at their planeswalker not counted. "whenever a player attacks one of your opponents" (Breena, the Demagogue: `{ who: "any", defender: "opponent" }`, and her "if that opponent has more life than another of your opponents" is `defenderLife: "more-than-another-opponent"` — see `attacks`), "whenever an opponent attacks you" (`{ who: "opponent", defender: "you" }`). Once **per player attacked**, however many creatures attack them; creatures attacking only a planeswalker attack nobody here. The attacked player is the `"trigger-player"` ("that opponent"), the attacking player is always the active player (`"active-player"` — "that attacking player draws a card"), and `{ triggerValue: true }` is how many creatures attack that player. |
| `attacks-alone` | `who`, `filter?`, `defender?` | `defender: "player"`: "attacks **a player** alone" (Yuriko, Jiang Yanggu; a lone attack on a planeswalker or a battle doesn't fire it, rule 508.3a). Exalted (needed-cards P15) — a creature you control attacked alone this combat; the lone attacker isn't a target, read it via `ResolutionContext.triggerObject` / `ObjectRef: "trigger-object"`. `filter` narrows the lone attacker: Neon Dynasty's "whenever a Samurai or Warrior you control attacks alone" is `who: "you-control"`, `filter: { subtypes: ["Samurai", "Warrior"] }`; Ironsoul Enforcer's "this creature or a commander you control" is two entries (`who: "self"` with `isCommander: false`, `"you-control"` with `isCommander: true`, `sameAbilityAs: 0`) so a commander Enforcer triggers once |
| `sacrifice` | `who`, `filter?`, `otherOnly?`, `selfOnly?`, `batched?` | a player sacrifices a permanent (Korvold, Mayhem Devil — `who` = who sacrificed: its controller, not its owner, rule 701.21a, so a stolen permanent counts for the thief). `filter` is matched against the permanent as it last existed on the battlefield ("a **nontoken** permanent" is `{ token: false }`; a sacrificed token is still a token), `otherOnly` is "another", and the sacrificed permanent is the trigger object ("its power" — `{ powerOf: "trigger-object" }`, its power as it left). `selfOnly` is "when you sacrifice **this** Aura" (the Theros Ordeals): only its own source, however it was sacrificed (their ruling), seen by looking back to it as it left (603.10a). `batched` is "whenever you sacrifice **one or more** Foods" (Camellia, the Seedmiser): once per simultaneous event. |
| `destroyed` | `who`, `filter?`, `otherOnly?` | a permanent is destroyed (rule 701.8): by a "destroy" effect, or by the state-based actions for lethal damage and deathtouch damage (701.8b, 704.5g-h) — never a sacrifice, 0 toughness, the legend rule or another way into a graveyard, and not a destroy indestructible or regeneration stopped. `who` is the permanent's controller as it left (`"any"`, `"you-control"`, `"opponent"`, `"self"`), `filter` is matched against it as it last existed, and it's the trigger object. Looks back in time (603.10a): a source destroyed alongside still fires. "Whenever a noncreature artifact is **sacrificed or destroyed**" (Jaws, Relentless Predator) is two triggers with one effect, a `sacrifice` and a `destroyed` — a permanent is never both. |
| `transforms` | `who`, `intoFront?`, `filter?` | a DFC turns over |
| `chapter-resolves` | `who`, `finalOnly?`, `filter?` | a Saga's chapter ability resolved (not one removed for illegal targets); `finalOnly` is "whenever **the final chapter ability** of a Saga you control resolves" (Tom Bombadil, Narci, Fable Singer) — one whose chapter numbers include the Saga's highest. The Saga is the trigger object: "that Saga's mana value" is `{ manaValueOf: "trigger-object" }`, read as it last existed once the final chapter has sacrificed it. |
| `step-begins` | `step`, `who` | the start of a step (`"upkeep"` etc.) |
| `faces-dilemma` | `who` | "whenever you face a dilemma" (Star Trek — Elim Garak, Simple Tailor; "you face a dilemma as you choose one or more modes for a spell or ability"): once per choice of a modal spell's or ability's modes (rule 700.2) by that player — cast, activated or put on the stack as a trigger — however many modes. Not a "you may", a vote, modes chosen at random, a copy's modes, or a choice made as an effect resolves (an unannounced `modal`). Reads the `modes-chosen` event's `modal` flag. The scaffolder reads the line. |
| `scries` | `who`, `orSurveil?` | "whenever you scry"; `orSurveil: true` is "whenever you scry or surveil" (Denzilore Fatehold, Saheeli, Consul of Oversight with `oncePerTurn`). Once per scry, after it's done — a scry of one or more into an empty library still counts (rule 701.22d), a scry 0 doesn't (701.22b). `{ triggerValue: true }` is the number of cards looked at. |
| `clashes` | `who`, `won?` | "whenever you clash" (Rebellion of the Flamekin, Entangling Trap — `who: "you"`), "whenever you clash and win" (`won: true`, Sylvan Echoes): once per player who clashed (rule 701.30), whoever started it; the trigger value is 1 if they won, else 0 (the `trigger-value` condition reads it). |
| `put-into-exile` | `who`, `filter?`, `from?: ZoneType[]` | **batched** — "whenever one or more cards are put into exile from graveyards and/or the battlefield" (Ketramose, the New Dawn: `from: ["graveyard", "battlefield"]`, with a `your-turn` condition for "during your turn"): once per simultaneous move (a whole graveyard exiled is one), `{ triggerValue: true }` being how many counted. `who` is whose cards, `filter` is asked of them in exile. Tokens aren't cards. |
| `put-into-graveyard` | `who`, `filter?`, `from?`, `notFrom?`, `batched?`, `firstTimeEachTurn?` | cards put into a graveyard, from anywhere — dying, milled, discarded, surveilled, a spell resolving or countered. `batched` is "whenever **one or more** land cards are put into your graveyard" (The Gitrog Monster; Sidisi, Brood Tyrant with `from: "library"`): once per simultaneous move — a wrath or state-based sweep, one mill, discard or surveil — `{ triggerValue: true }` being how many counted. Without it, once per card, that card the trigger object: Syr Konrad's "a creature card is put into a graveyard from anywhere other than the battlefield" (`notFrom: "battlefield"`, `who: "any"`), Disa the Restless's "…put it onto the battlefield" (`put-onto-battlefield` with `"trigger-object"`, which finds the card only in that graveyard). `who` is whose graveyard, `filter` is matched against the card as it is there, `from` / `notFrom` the zone it came from. Tokens aren't cards and never count.. `firstTimeEachTurn` is "… for the first time each turn" (Crawling Sensation): only when no matching card reached that graveyard earlier this turn, before this permanent was there too — not `oncePerTurn`, which counts only its own triggers; read off the turn's `descended` history, so its filter names permanent cards. |
| `discards` | `who`, `filter?`, `perCard?`, `firstTimeEachTurn?` | "whenever you discard one or more cards" — once per discard event (`firstTimeEachTurn`: only the turn's first one with matching cards, read off the turn's history, so a discard before the permanent arrived counts — Rielle, the Everwise), `{ triggerValue: true }` how many matched `filter` (the cards as they are in the graveyard). `perCard` is "whenever an opponent discards a card" (Sangromancer) — once per card, the card its trigger object, followed to the graveyard and no further: Tergrid, God of Fright's "…discards a permanent card, you may put that card onto the battlefield under your control" is a `filter` of the permanent types and a `put-onto-battlefield` of `"trigger-object"` with `underYourControl`. `byOpponent` is "whenever a spell or ability an opponent controls causes you to discard a card" (Spiritual Focus, with `perCard`). |
| `leaves-graveyard` | `who`, `filter?`, `perCard?` | **batched** — "whenever one or more cards leave your graveyard" (Teval, the Balanced Scale; Insidious Roots: `filter: { type: "creature" }`). Fires **once per simultaneous move**, however many cards: a whole graveyard exiled, a "return all", the cards one choice takes, an escape cost's exile, a `simultaneous` sequence. A move of its own — a card cast or played from the graveyard, one card returned, a graveyard ability exiling its card as a cost — is its own trigger, so an escape cast is two (the card to the stack, then the cost). `who` is whose graveyard; `filter` is matched against each card as it was **in the graveyard** (rule 603.10a) — a multi-face card by its front face, even when it left as its back (rule 712.8a) — and a move with nothing matching doesn't fire. `{ triggerValue: true }` is how many cards counted. A permanent that was itself one of the cards (a reanimated Teval) doesn't see them leave. Tokens aren't cards and never count. `perCard: true` is the per-card form — "whenever a creature card leaves your graveyard" (Syr Konrad, the Grim): once per matching card, however many left together, each card the trigger object. |
| `deals-damage-batch` | `who`, `filter?`, `to?`, `combat?`, `once?` | **batched** — "whenever one or more creatures you control deal combat damage to a player" (Goro-Goro and Satoru, Alela, Anowon): **once per player** dealt damage by at least one matching source in one simultaneous damage event, however many dealt it, settled with that event like enrage. First-strike and regular damage are two events. `who` / `filter` are about the sources (Goro-Goro's "creatures you control that entered this turn" is `{ who: "you-control", filter: { enteredThisTurn: true } }`), `to: "opponent"` narrows the players, `combat: true` is "combat damage" (leave it off for any damage). The player is the `"trigger-player"` ("that player") and `{ triggerValue: true }` the total those sources dealt them. `once: "per-event"` fires once for the whole event instead, `{ triggerValue: true }` then being how many players were dealt damage and there being no trigger player — Malcolm, Keen-Eyed Navigator's "you create a Treasure token for each opponent dealt damage". The per-creature form is `deals-combat-damage-to-player`. |
| `blocked-by` | `who`, `filter?`, `blocker?` | an attacking creature became blocked **by a creature** — once per blocker, the blocker the trigger object, `blocker` a filter on it asked as the block is declared. Flanking (rule 702.25a) is this — use the `flanking()` helper, and put `"flanking"` in `keywords` too: the keyword is what another creature's "without flanking" asks. |
| `counters-put`'s `orPlayer` | `byYou?`, `counter?` | "whenever you put one or more counters on a permanent **or player**" (All Will Be One): a player's counters and energy fire it too, once per player for a simultaneous placement (two toxic creatures at once), `{ triggerValue: true }` how many. No trigger object for a player's. |
| `counters-spell` | `who` | "whenever a spell or ability you control counters a spell" (Baral, Lullmage Mentor — `who: "you"`, who controls what countered it, ward included): once per spell countered, never for an ability countered or a spell that merely fails to resolve. |
| `spell-countered` | `who` | "whenever a spell you've cast is countered" (Multani's Presence — `who: "you"`, who cast it): never for a copy, which isn't cast. |
| `becomes-saddled` | `who`, `filter?`, `firstTimeEachTurn?` | a permanent became saddled (rule 702.171b — the `become-saddled` effect, a saddle ability's or another's) — "whenever this creature becomes saddled" is `who: "self"`, the permanent the trigger object. It fires again for one saddled again; `firstTimeEachTurn` (Stubborn Burrowfiend) only when it wasn't saddled already. |
| `crews-or-saddles` | `who`, `as` | a creature crewed a Vehicle or saddled a Mount (rules 702.122b, 702.171c): it was tapped for that permanent's crew or saddle cost, as the cost was paid, whether or not the ability resolves. `as: ["crew"]` is "whenever this creature crews a Vehicle" (Speedway Fanatic), `["crew", "saddle"]` "saddles a Mount or crews a Vehicle" (Reckless Velocitaur). `who` is asked of the creature tapped; the trigger object is the Vehicle or Mount ("that Vehicle"). "During your main phase" is a `condition` of `your-turn` and `turn-structure` `steps: ["precombat-main", "postcombat-main"]`. |
| `exerted` | `who`, `asItAttacks?` | a permanent was exerted (rule 701.43). `asItAttacks: true` is the "when you do" linked to its own "you may exert this creature as it attacks" (rule 607.2h — Glorybringer, Combat Celebrant), which no other exert fires. |
| `become-blocked-batch` | `who`, `filter?` | "whenever **one or more** creatures you control become blocked" (Hezrou): once a combat, as the last defending player's declaration completes, if any matching creature became blocked (rule 603.2c). |
| `blocks` | `who`, `filter?`, `otherOnly?`, `object?`, `blocking?` | `blocking`: "blocks **one or more black creatures**" (Serra Inquisitors), once however many, if any matches (rule 509.3a). The mirror of `attacks` (Kangee, Sky Warden), once per blocker, which is the trigger object — Doran, Besieged by Time's "whenever a creature you control attacks or blocks, **it** gets +X/+X" is an `attacks` and a `blocks` trigger reading `"trigger-object"`. `object: "blocked"` makes the creature it blocks the trigger object — "whenever this creature blocks a creature, … that creature" (Wall of Frost, Wall of Tears's end-of-combat `delayed-trigger`, Meglonoth's `"trigger-controller"`). "Blocks **a creature with flying**" is `object: "blocked"` with `whileCondition: { kind: "trigger-object", filter: { keyword: "flying" } }`, part of the trigger condition, read as the block is declared and not again (509.3f — High-Rise Sawjack, whose effect reads `"source"`). "Blocks or becomes blocked by a creature" is this and a `blocked-by`, each reading `"trigger-object"`, printed (Barrow-Blade) or in `grantsTriggered` (Mirror Shield). |
| `becomes-blocked` | `who`, `filter?`, `otherOnly?`, `blockers?`, `attackedPlayer?` | `blockers: { atLeast?, filter? }`: "by two or more creatures" (Seifer), "by one or more black creatures" (Serra Inquisitors); `attackedPlayer`: "a creature attacking one of your opponents", the player and not a planeswalker of theirs. An attacking creature became blocked (rules 509.1h, 509.3c — Anzrag, the Quake-Mole). **Once per attacker**, however many creatures block it, as its defending player's blocks are declared; an unblocked attacker never fires it. The attacker is the trigger object and its defending player (who blocked it) the `"trigger-player"`. |
| `dealt-damage` | `who`, `filter?`, `combat?`, `atLeast?`, `excess?`, `batched?` | the receiving end — "whenever this creature **is dealt damage**" (Brash Taunter, Hornet Nest, enrage). `atLeast: 3`: "is dealt 3 or more damage", all it's dealt in one simultaneous event and never a total over separate ones (Innocent Bystander). `excess: true`: only excess damage (rule 120.4a), and `{ triggerValue: true }` is the excess, not all that was dealt (Fall of Cair Andros; Aegar, the Freezing Flame's "if … dealt damage to it this turn" is `anyOf` over `damagedThisTurnBy` in its `filter`, whose `spell: true` is "a spell you controlled"). `batched: true`: "**one or more** creatures … are dealt", once for the event (Magmatic Galleon). Combat and non-combat alike unless `combat` says which; `filter` narrows the permanent dealt damage (Sonic the Hedgehog: "a creature you control **with flash or haste**" — read as the damage is dealt, before SBAs). `{ triggerValue: true }` is how much; the permanent is the trigger object and the `"trigger-player"` is its controller. Damage dealt all at once is one event however many sources dealt it — a creature blocked by two is dealt its combat damage once — so it triggers once, for the total; a token stack dealt damage is that many permanents, so a watcher of *other* permanents fires once per token. |
| `deals-damage` | `who`, `filter?`, `otherOnly?`, `to?`, `toFilter?`, `combat?`, `exactly?`, `atLeast?`, `toItsTarget?` | (`atLeast: 6`: "deals 6 or more damage", one source at once, never added up over events: to the named recipient, Deus of Calamity and Pain Magnification's "by a single source", or with none named the event's total, Spinneret and Spiderling.) The dealing end, for any recipient — Niv-Mizzet, Visionary's "whenever a source you control deals noncombat damage to an opponent" (`{ who: "you-control", to: "opponent", combat: false }`), Ghyrson Starn's "another source you control deals **exactly 1** damage to a permanent or player" (`otherOnly`, `exactly: 1`), Kediss's "a commander you control deals combat damage to an opponent" (`filter: { isCommander: true }`). `who` / `filter` are about the **source** — a spell, a permanent, an ability's source — judged as it last existed on the battlefield if it had left; `to` is `"player" \| "opponent" \| "you" \| "permanent" \| "creature" \| "planeswalker"` (`"you"` is this permanent's controller — Mikaeus, the Unhallowed's "whenever a Human deals damage to you") and `toFilter` narrows a permanent recipient; `toItsTarget` is "a spell deals damage to a permanent or player **it targets**". Once **per recipient** per damage event (a `damage-all` for 1 fires it once per creature, and a token stack counts once per token — each firing that hits "that permanent" peels one token off it), for the amount actually **dealt** — after doubling and prevention, so fully prevented damage fires nothing and 2 prevented to 1 is "exactly 1". `{ triggerValue: true }` is the amount, the source is the trigger object (`damage.from: "trigger-object"`), the recipient is `damage.toTriggerRecipient`, and a player recipient (or a permanent's controller) is the `"trigger-player"`. |
| `attack-with` | `who`, `atLeast?`, `exactly?`, `totalPower?`, `includingThis?`, `filter?`, `attackingYou?`, `attackingYouDirectly?`, `eachOf?`, `stillAttacking?`, `notAttackingYou?`, `thisOrYourCommander?` | `eachOf`: the declaration holds at least one matching each filter, the same creature allowed (Fearless Swashbuckler's "if a Pirate and a Vehicle attacked this combat"); `attackingYouDirectly`: counts only attackers aimed at you, the player (Everett K. Ross's "attacks you with two or more creatures"). `"trigger-player"` is the attacking player (Firemane Commando's "they draw a card"), and the condition `{ kind: "those-attackers-at-you" }` asks of that declaration as it resolves ("if none of those creatures attacked you", under a `not`; an earlier combat's attack doesn't count). "whenever you attack with three or more creatures" (Overwhelming Instinct, Tide Skimmer). `atLeast` is 1 when absent. `exactly` is "exactly two creatures" (Alluring Suitor); `totalPower: { atLeast }` with the wrapper's `firstTimeEachTurn` is "creatures with total power 12 or greater for the first time each turn" (Desert Were-Worm), the whole declaration's power as declared, and an earlier big enough declaration this turn counts even if this permanent wasn't there; `includingThis` needs this permanent among those counted (Creepy Puppeteer's "whenever this creature attacks, if you attacked with exactly one other creature": `exactly: 2`). `thisOrYourCommander` counts only this permanent and commanders you own — Ainok Strike Leader's "whenever you attack with this creature and/or your commander" (`atLeast: 1`). Fires once per declaration, off the whole attacker list — an `attacks` trigger fires per attacker and can't count them. `stillAttacking` makes the count an intervening if asked again on resolution — Mangara, the Diplomat's "if two or more of those creatures **are** attacking you": one removed from combat no longer counts, one that left the battlefield counts by what it was attacking. `notAttackingYou` is Mirkwood Trapper's "whenever a player attacks, **if they aren't attacking you**": no attacker of the declaration attacks this permanent's controller (a planeswalker or battle of theirs doesn't count), asked again on resolution. |
| `deals-combat-damage-to-player` | `who`, `filter?`, `otherOnly?`, `toPlayerControlsMore?`, `toOpponent?` | `filter` narrows on the *damaging creature* — Sharding Sphinx's "whenever an **artifact** creature you control deals combat damage to a player"; `otherOnly` is "**another** creature you control". `toOpponent` is "…to **one of your opponents**" (Gix, Yawgmoth Praetor, with `who: "any"` — any creature's damage, its controller the `"trigger-controller"`). `toPlayerControlsMore: CardFilter` is "…to a player **who controls more lands than you**" (Cartographer's Hawk: `{ type: "land" }`) — part of the event, counted as the damage is dealt, and not asked again as it resolves (an intervening-if would be). Its target slots are the controller's choice — Mindscour Dragon's "target player mills four cards" may name anyone; "that player" is the `"trigger-player"` scope, never a target (Xyris's `draw` `who`, Captain N'ghathrod's `mill` `target`). The creature is the trigger object — Ikra Shidiqi's "you gain life equal to **that creature's** toughness" is `{ toughnessOf: "trigger-object" }`, read as it last existed on the battlefield if the same combat damage killed it — the damaged player is the `"trigger-player"`, and `{ triggerValue: true }` is the damage dealt. "…to a player **for the first time each turn**" (Raphael, Tag Team Tough) is the timing wrapper's `firstTimeEachTurn`, counted per creature (in its stint) over its combat damage to players this turn; with `toPlayerIf`, `toPlayerControlsMore` or `orBattle` it can't be counted and never fires. |
| `cast-spell` | `who`, `noncreatureOnly?`, `filter?`, `from?`, `notFrom?` | a spell is cast. `who: "opponent"` is anyone but this permanent's controller (Kaervek the Merciless); `filter` narrows on the *spell* — `{ typesAnyOf: ["instant", "sorcery"] }` for Guttersnipe. `noncreatureOnly` predates `filter` and stays, because prowess is printed as its own word. `withTargets: true` narrows to a spell with one or more targets, `{ triggerValue: true }` then how many (Voracious Bibliophile's "draw that many cards"); `spellHas: "cascade"` to a spell with cascade as it's cast, printed or granted (Aurora Phoenix's "whenever you cast a spell with cascade"); `countCastBefore: CardFilter` makes `{ triggerValue: true }` how many matching spells the caster cast this turn **before** this one, each read as it was cast and fixed as it triggers, so a spell cast in response doesn't change it (Thousand-Year Storm's "for each other instant and sorcery spell you've cast before it this turn", countered ones included); `modal: true` narrows to a modal spell (one cast with modes chosen — a `castModal` card), with `{ triggerValue: true }` then the number of times a mode was chosen for it (Riku of Many Paths); `sharesNoCreatureType: true` to a spell sharing no creature type with a creature its caster controls or a creature card in their graveyard, changeling on either side sharing every one (Volo, Guide to Monsters); `offTurn: true` to a spell cast by anyone but the active player — "if it isn't that player's turn" (Vision, Synthezoid Avenger), an intervening "if" that can't change before it resolves. `trigger-object` is the spell, so `{ manaValueOf: "trigger-object" }` reads its mana value, and `"x"` is its X, read as it was cast (Zaxara, the Exemplary's "put X +1/+1 counters" — a spell countered before the trigger resolves still gave its X). `firstEachTurn` / `nthEachTurn: N` is the caster's first / Nth spell this turn — and **with a `filter`, their first / Nth *matching* spell** (Tuvasa's "your first enchantment spell each turn", which can be your third spell). `from` / `notFrom` are the **zone it was cast from** (the `spell-cast` event records it before the spell moves to the stack): `from: "exile"` is "whenever you cast a spell from exile", `notFrom: "hand"` is "from anywhere other than your hand". A spell cast via foretell, suspend, cascade, an adventure, airbend or an impulse exile comes from `"exile"`; flashback / escape from `"graveyard"`; a commander from `"command"`. A `filter` with a `targets` clause asks what the spell targets as it's cast (the `CardFilter` list in §6): Season of Growth's "a spell that targets a creature you control", Zada's "that targets only Zada", Ivy's "that targets only a single creature other than Ivy". |
| `cast-spell` + `orCopy: true` | | Magecraft — "whenever you cast **or copy** an instant or sorcery spell" (Archmage Emeritus). A copy isn't cast (rule 707.10), so plain `cast-spell` never sees one; with `orCopy` a `spell-copied` event matches too, `who` being the copy's controller, `filter` asking about the copy, the copy the trigger object. The cast-only narrowings (`from`, `firstEachTurn`, …) never match a copy. `copyOnly: true` matches **only** the copies — Kalamax, the Stormsire's "whenever you copy an instant spell". |
| `counters-put` | `who`, `counter?`, `filter?`, `byYou?`, `nth?`, `perCounter?`, `batched?`, `otherOnly?` | `perCounter: true`: "whenever **a** +1/+1 counter is put on", once per counter, each its own trigger (Fathom Mage, Flourishing Defenses, Bloodcrazed Hoplite). `batched: true`: "**one or more** … on **one or more** …", once for a simultaneous placement with `{ triggerValue: true }` the total (Bioessence Hydra, Invisible Woman, Sue Storm): an `add-counter-all`, a proliferate, `counters-divided`, a `sequence` marked `together: true` (its consecutive `add-counter`s are one instruction: "on **each of** up to two target creatures", support, "distribute", "… on target creature **and** … on another", never two sentences like Common Bond's), counters permanents enter with together, wither's or infect's counters with their damage. One or more counters were put on a permanent — including the ones it **entered with** (rule 122.6). Once per permanent per event, so two creatures at once is two triggers; `{ triggerValue: true }` is how many, and the permanent is the trigger object. `who` / `filter` are about the permanent; `byYou` is "whenever **you** put …" (Hapatra); a loyalty ability's plus cost puts loyalty counters too (rule 606.4 — Inspired Tethermage), though no counter replacement applies to a cost. Shalai and Hallar: `{ who: "you-control", counter: "+1/+1", filter: { type: "creature" } }`.. `nth: N` is "when the Nth [`counter`] counter is put on this" (the Marvel Plans, Midnight Clock, Shang-Chi and the Ten Rings): only the placement that takes that kind from fewer than N to N or more — several at once past N fire it once — read off the event's `after`. A Plan's "sacrifice it. When you do, …" is `sacrifice-source` with a `reflexive-trigger` `then`; "sacrifice it, draw …, and …" is a plain `sequence`. |
| `draws` | `who`, `nthEachTurn?`, `exceptFirstInDrawStep?`, `filter?` | a player draws a card, once per card (Nekusar). `nthEachTurn: 2` is "your second card each turn"; `exceptFirstInDrawStep` is Xyris's "except the first one they draw in each of their draw steps" (only their own draw step's first card is exempt). `filter` narrows on the card drawn, as it is in hand: Keranos, God of Storms' "whenever you reveal a land card this way" (the first card of each of your turns, which its `revealsFirstDrawEachTurn` static reveals) is `nthEachTurn: 1, filter: { type: "land" }` with a `your-turn` `whileCondition`. The filter reads the permanent too: Booby Trap's "when the chosen player draws a card with the chosen name" is `who: "chosen-player", filter: { chosenName: true }`. |
| `plays-land` | `who`, `otherOnly?` | a player **plays** a land — the special action (rule 305.1; Burgeoning, Fastbond), not a land put onto the battlefield (that's an `enters-battlefield` filtered to lands). `otherOnly` is City of Traitors' "when you play **another** land": its own play doesn't count, though it's on the battlefield by the time that play is announced. |
| `plays-card` | `who`, `from?`, `filter?` | a player **plays a card** — plays a land *or* casts a spell, since "play" covers both (Prosper, Tome-Bound's "whenever you play a card **from exile**" is `{ on: "plays-card", who: "you", from: "exile" }`, which a land played off an impulse exile fires as well as a foretold card cast from there). `from` is the zone recorded on the `land-played` / `spell-cast` event. `filter` asks about the card played, as the land on the battlefield or the spell on the stack (Rendmaw, Creaking Nest's "a card with two or more card types" is `{ cardTypeCount: { op: "gte", n: 2 } }`). For lands alone, `plays-land`. |
| `counters-removed` | `who`, `counter?`, `filter?`, `last?` | one or more counters were removed from a permanent, by anything — a cost, an effect, an upkeep trigger, time travel (Regenerations Restored's "whenever one or more time counters are removed from this enchantment"). `{ triggerValue: true }` is how many. `last` is "when the **last** [counter] is removed": only a removal leaving none of that kind (vanishing's sacrifice — the `vanishing` helper). |
| `this-cast` | `notFrom?` | the spell carrying this ability is cast (cascade, storm); `notFrom` — "when you cast this spell from anywhere other than exile" (Rory Williams). Cascade's free cast is a whole cast, offered as a `cast-now` (modes, kicker, targets, or decline), the spell needing a lesser mana value than the cascade spell's (rule 702.85a). |
| `activates-ability` | `who: "attached"` | an ability of the Equipment's or Aura's host is activated onto the stack — never a mana ability, which doesn't use it (rule 605.3b) — the host still attached once the costs are paid, so one sacrificed to pay them isn't (Illusionist's Bracers' rulings). The trigger object is the ability on the stack: `copy-ability`'s `"trigger-ability"` copies it, as it last was there if it's been countered (Battlemage's Bracers puts that in a `may` with `cost: "{1}"`). |
| `activates-ability` | `who: "you" \| "opponent"`, `ninjutsu?`, `loyalty?`, `exhaust?`, `powerUp?`, `source?` | (`exhaust: true`: "whenever you activate an exhaust ability", Rangers' Refueler; `powerUp: true`: a power-up ability, Marvel Boy, Noh-Varr.) An ability its controller (or an opponent) activates onto the stack, from any zone — cycling's too; a mana ability only with `orMana: true` (Elrond, Moon-Reader's "whenever you activate an ability of a creature", one activated to pay a cost included — every card that doesn't say "if it isn't a mana ability"); `removedAtLeast: N` with `loyalty` is "if you removed N or more loyalty counters to activate it" (Way of the Mind Sculptor). `"trigger-player"` is that player, and the trigger object the ability. `ninjutsu: true` is a ninjutsu ability, a granted one included (Satoru Umezawa); `loyalty: true` a loyalty ability (Ajani Unrelenting's Cadet, which enters before the loyalty ability resolves; Gideon the Oathless); `source` a permanent's ability whose source matches as it's activated — Harsh Mentor's "an ability of an artifact, creature, or land on the battlefield" is `{ typesAnyOf: ["artifact", "creature", "land"] }`, which leaves out a card's in a hand or graveyard and a Vehicle being crewed (not a creature yet). Rings of Brighthearth: `who: "you"`, a `may` with `cost: "{2}"` over `copy-ability` of `"trigger-ability"`. A trigger counting **mana** abilities (Elrond, Moon-Reader) can't be written: one activated while paying a cost isn't announced. `xInCost: true` is "if that ability's activation cost contains {X}" — the mana symbol, not a loyalty [-X] or an X elsewhere (Unbound Flourishing). |
| `this-plotted` | — | "When this card becomes plotted" (rule 702.170 — Aloe Alchemist, Longhorn Sharpshooter): triggers from exile, for this card only, whether its plot special action or an effect made it plotted. Its controller is the card's owner; `"source"` is the card in exile. |
| `this-discarded` | `byOpponent?` | "When you discard this card" (Titanbones, Bartered Cow): triggers from wherever the discard put the card — its graveyard, or exile for madness (rule 113.6k) — for this card only. `byOpponent` is "when a spell or ability an opponent controls causes you to discard this card" (Psychic Purge, Metrognome, Guerrilla Tactics): the discard's cause (`cards-discarded` `cause`, the controller of the spell or ability whose effect or cost discarded it) is an opponent — never the cleanup step's discard (rule 514.1) or your own. `"trigger-player"` is that opponent ("that player loses 5 life"). Quagnoth's "return it to your hand" is `return-to-hand { target: "source", from: "where-discarded" }`: from that graveyard or exile, not once it has moved on. |
| `this-cycled` | — | "When you cycle this card" (rule 702.29c: "when you discard this card to pay an activation cost of a cycling ability") — Dismantling Wave's "destroy all artifacts and enchantments". Triggers from wherever the card ended up, for this card only, and goes on the stack above the cycling ability, so it resolves before the draw (the rulings). |
| `cycles` | `who: "you" \| "opponent" \| "any"`, `otherOnly?` | "Whenever you cycle a card" (rule 702.29 — Snare Tactician), "another card" with `otherOnly` (Drannith Healer). On the stack above the cycling ability, so it resolves before the draw. "A card with a cycling ability" is the filter `hasCycling: true` (typecycling included — Zenith Flare). Not built: "for the first time each turn" (Valiant Rescuer). |

**`who: TriggerWho`** = `"self"` (this permanent) / `"you-control"` / `"you"`
(this permanent's controller did it) / `"opponent"` / `"any"`. `"opponent"`
about a *player* is that player being an opponent — a `step-begins`
trigger's "each opponent's end step" (Archfiend of Depravity), which fires
once per opponent's **turn**, not once per opponent; about an *object* it is
"… an opponent controls" ("whenever a creature an opponent controls dies"),
read as it last existed on the battlefield once it has left. `"enchanted-player-controls"`
is "a creature **enchanted player** controls" — a Curse's; `"attached"` about a
*player* is the player a Curse is attached to. `"chosen"` is "**the chosen
creature**" (this permanent's `chosenPermanent`, in the stint it was chosen
in — Zenos yae Galvus); `"chosen-player"` the chosen player. `"attached"` is the
permanent this one is attached to — "whenever **equipped** creature dies"
(Skullclamp), "whenever **enchanted** land is tapped for mana" (Wild Growth),
"whenever **enchanted** creature deals damage to an opponent" (Curiosity):
the host as the event happened, whoever controls it, while the ability stays
the Equipment's or Aura's and its controller's ("you", "an opponent").
A host that died is still the attachment's until the next state-based check
(rule 704.5n), and an attachment destroyed alongside it remembers the host
it had (rule 603.10a), so Skullclamp draws under a wrath too. A granted
ability (Sticky Fingers' "Whenever **this** creature deals combat damage")
is the creature's own instead — `grantsTriggered` with `who: "self"`. The
`equip(cost)` helper (`cards/helpers.ts`) is the standard Equip ability.

`otherOnly: true` — "another …", i.e. the source permanent doesn't count.

`filter` is a `CardFilter` narrowing which permanent counts (Soul Warden:
`{ type: "creature" }`; landfall: `{ type: "land" }`).

**Leaving together.** `dies`, `leaves-battlefield` and `sacrifice` are
leaves-the-battlefield abilities, which look back in time (rule 603.10a):
permanents that leave in one event — a wrath, one sweep of state-based
actions, an edict once every player has chosen, an overloaded bounce — each
see every other one leave, their own source included. Zulaport Cutthroat and
two Bears under one Wrath of God drain three times, and nothing about the card
has to say so. A permanent that left is matched as it last existed on the
battlefield (its `GameObject.lastKnown` snapshot, rule 603.10a): `who:
"you-control"`, the whole `filter` (types and subtypes an effect gave it — an
animated land dying is a creature dying — counters, keywords, power, token,
controller) and whose ability it is. A stolen creature dying is the thief's.
Its own abilities are the ones it had then: none if it had lost them (Turn to
Frog), a copied card's rather than the Clone's, and a dies trigger an Aura, a
lord or a one-shot `grant-triggered` gave it, even though that grant ended
with the move. The victims of one event are all snapshotted before the first
of them moves, so a creature and the lord it dies beside keep each other's
bonuses.

If the ability has `targets`, the controller chooses them via a dispatched
`choose-targets` decision when the trigger goes on the stack. A slot the event
determines (`becomes-target`'s targeting player) is auto-filled; a player the
event names but that isn't targeted ("that player") is the `"trigger-player"`
scope.

**`oncePerTurn: true`** is "This ability triggers only once each turn"
(Morbid Opportunist, Welcoming Vampire): after it has triggered once this
turn, further events don't trigger it — which also makes "whenever **one or
more** …" exact on a per-object trigger, since the first of a batch triggers
it and the rest can't. Per ability of one object: a permanent that leaves
and returns may trigger again. A "one or more … enter" with no once-a-turn
limit is `batched: true` on the `enters-battlefield` trigger instead.

**`condition?`** (`StaticCondition`, the same union section 10 documents) is an
**intervening-if** clause — rule 603.4, "When ~ enters, **if** you control a
creature with power 4 or greater, draw a card":

```ts
{
  trigger: { on: "enters-battlefield", who: "self" },
  condition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 },
  ...
}
```

It's checked **twice** — as the event happens (false ⇒ it never triggers at
all) and again as the ability resolves (false by then ⇒ it leaves the stack and
does nothing, logged as a fizzle). Unlike a static's condition it counts the
source permanent itself. Put the "if" clause here, never inside the effect: a
`conditional` effect would still trigger and still resolve, which is a
different (and wrong) thing.

**`targetsAtRandom?: true`** (triggered and activated) — "target opponent **chosen at random**" (Witch Hunt, Knight Rampager, Scab-Clan Giant, Goblin Test Pilot): the game picks each slot from its legal targets as the ability goes on the stack, or before an activation's costs, with no question asked and no target on the activation. They're real targets: hexproof keeps one out of the running, ward answers one, and each token of a stack is as likely as any other permanent. An untargeted "a creature an opponent controls chosen at random" is `choose-permanents`' `random`; "choose an opponent at random" is `choose-opponent`'s; "choose … targets. Destroy one of them at random" is chosen targets with a random `modal` (Wild Swing, Capricious Efreet).

**`resolvesDespiteIllegalTargets?: true`** (triggered) — "this ability still resolves if its target becomes illegal" (Gilded Drake): rule 608.2b doesn't take it off the stack with every target illegal; it resolves, doing nothing to an illegal target (the exchange fails and `exchange-control`'s `otherwise` sacrifices the Drake).

**`targetsChosenBy?: "trigger-player" | "active-player" | "trigger-object-controller"`** — another player chooses its targets as it goes on the stack (rule 603.3d, as 700.2e has another player choose a mode): "put a +1/+1 counter on target creature **of defending player's choice**" (Erithizon, `"trigger-player"`), "destroy target nonland permanent **of that player's choice** that one of your opponents controls" (Bladegriff Prototype). The targets stay its controller's, legal as they would choose them ("your opponents" are the controller's); the chooser gets the `choose-targets` decision, its banner naming another player's ability. "Target … of **an opponent's** choice" (the controller picks which opponent) and a spell's or activated ability's other-player targets aren't built (`decision:opponent-chooses-target`). The scaffolder reads "of defending player's / that player's choice". `targets-chosen-by-other-player.test.ts`.

**`whileCondition?`** (the same union) is a condition that's part of the
**trigger condition** — "whenever you cast a spell **while Fire Lord Azula is
attacking**" (rule 603.1). It's checked only as the event happens: only an "if"
right after the trigger event is an intervening "if" (603.4), so it isn't asked
again as the ability resolves, and Azula being removed from combat in response
doesn't stop the copy. On a cast trigger, `condition` can also ask about the
spell's place in the turn: `{ kind: "trigger-spell-first", anyOf: [{ filter,
otherThanSource? }] }` is "if it's the first [filter] spell you've cast this
turn" for any of them — Alania, Divergent Storm's first instant, first sorcery,
or first Otter spell other than Alania (`otherThanSource` leaves Alania's own
card out of the count). Each spell is read as it was cast, so one cast in
response doesn't change it on resolution.

**`fromGraveyard: true`** is an ability that works while its card is in a
graveyard, and only there (rule 113.6k: an ability that moves its own card out
of a zone functions only in that zone) — Bloodghast's "Landfall — … you may
return this card from your graveyard to the battlefield" (`put-onto-battlefield`
of `"source"`), Spit Flame's "… return this card from your graveyard to your
hand" (`return-to-hand` of `"source"`, `from: "graveyard"`). Its controller is
the card's owner; a card that reached the graveyard in the event being checked
(it died alongside the creature whose death fires it) wasn't there to see it;
and `"source"` finds the card only if it's the same object when the ability
resolves (rule 400.7), a "you may" included. Never filter a return on the
card's own name: that reaches another copy of it.

**`whileSuspended: true`** is a triggered ability that works while its card is
suspended (rule 702.62b — in exile, with suspend and a time counter), and only
then: Deep-Sea Kraken's "whenever an opponent casts a spell, if this card is
suspended, remove a time counter from it" (`remove-counter` of `"source"`,
`counter: "time"`), Nihilith's (in a `may`). "When the last time counter is
removed from this card while it's exiled" is `{ on: "counters-removed", who:
"self", counter: "time", last: true }` with it (Riftmarked Knight); without
`last`, each removal (Dinosaurs on a Spaceship). The last counter's removal is
seen though the card then has none; any other trigger needs a time counter on
it. Its controller is the owner. The activated form is **`zone: "suspended"`**
on an `activated` entry — "Activate only if this card is suspended" (Greater
Gargadon): its owner activates it from exile, the cost doesn't move the card,
and the client offers it from the exile viewer. `while-suspended.test.ts`.

---

**"Counter that spell or ability"**, nothing to pay (rule 701.6a) — the same
effect with `cost: null` on a `becomes-target` trigger written out: Shimmering
Glasskite's "Whenever this creature becomes the target of a spell or ability
for the first time each turn, counter that spell or ability" is
`{ trigger: { on: "becomes-target", who: "self", firstTimeEachTurn: true },
targets: [], effect: { kind: "ward", cost: null } }` (anyone's spell or
ability, its controller's too), and Kira, Great Glass-Spinner grants that to
"creatures you control" through `grantsTriggered`. Nobody is asked.

**Ward** (rule 702.21) — `ward(cost)` from `helpers.ts` builds the whole
triggered ability: a `becomes-target` trigger (`who: "self"`,
`byOpponentOnly`) whose effect is `{ kind: "ward", cost }`. Put it in
`triggered` (and the printed line in `text`); each instance is its own
ability, so two `ward(...)`s trigger twice (702.21b), and a static grants it
to others with `grantsTriggered: [ward(...)]`. `cost` is a `WardCost` —
**one** compound cost, every part paid together:
`{ mana: "{2}" }` (Ward {2}), `{ payLife: 2 }` (Ward—Pay 2 life.),
`{ mana: "{2}", payLife: 2 }` (Ward—{2}, Pay 2 life.),
`{ sacrifice: { filter, count?, text: "Sacrifice a Food" } }`,
`{ discard: 1 }`, `{ discard: 1, discardAtRandom: true }` (Ward—Discard a card
at random: Alpharael, Stonechosen — nobody picks which), `{ blight: 2 }` (Ward—Blight 2: the payer puts two -1/-1
counters on a creature they control, rule 701.68a — payable only with one,
701.68b), `{ mana: "{4}", waterbend: true }` (Ward—Waterbend {4}, The Unagi of Kyoshi Island: the payer
may tap their untapped artifacts and creatures for its generic mana, rule 701.67a). A part whose size is read as the ward ability resolves (rule
608.2h) is `payGeneric` or `payLifeAmount`, an `EffectAmount` each, with
`text` the cost as printed after "Ward": `{ payGeneric: { playerCounters:
"experience" }, text: "{X}, where X is the number of experience counters you
have" }` (Minthara, Merciless Soul), `{ payLifeAmount: { powerOf: "source" },
text: "Pay life equal to Raubahn's power" }` (Raubahn, Bull of Ala Mhigo — its
power as it last existed if it has left). When the trigger resolves, the player whose spell or
ability targeted the permanent (`GameObject.targetedBy`) is asked a
`choose-modes` "pay or not" — offered only if they can pay all of it; a
sacrifice, discard or blight part then asks which. Declining or being unable to pay
counters that spell or ability (a spell that can't be countered still
resolves). Triggered abilities announce their targets too, so ward sees
them.

## 10. Static abilities

```ts
static: [
  {
    affects: { scope: "creatures-you-control" },
    grantPt: [1, 1],
    text: "Creatures you control get +1/+1.",
  },
]
```

**`affects.scope`**:

- `"self"` — this permanent (CDAs, "~ has …", enters-tapped replacements).
- `"creatures-you-control"` — `+ excludeSelf?`, `+ subtype?` (a lord clause),
  `+ withCounter?: { kind? }` (Rishkar: "each creature you control **with a
  counter on it**"), `+ tokenOnly?` (Eternal Skylord: "Zombie **tokens** you
  control").
- `"lands-you-control"` — Chromatic Lantern.
- `"all-creatures"` — **every** creature on the battlefield, whoever controls
  it (Gravitational Shift). Takes `excludeSelf`, `subtype`, `withKeyword` and
  `withoutKeyword`.
- `"filter"` — `{ scope: "filter", filter: CardFilter, excludeSelf? }`: every
  battlefield permanent matching the filter, from the source's controller's
  perspective. The general form of the fixed scopes, for anything they can't
  say: "artifacts you control" (`{ type: "artifact", controlledBy: "you" }`),
  "other outlaws you control" (`subtypes: [...]`), "commander creatures you
  own" (`{ type: "creature", isCommander: true, ownedBy: "you" }`), "each
  creature you control but don't own" (`controlledBy: "you", ownedBy:
  "opponent"`), "non-Equipment artifact and non-Aura enchantment" (`anyOf`),
  "creatures you don't control", counters on any permanent. Type and subtype
  clauses read current (layer-4) types; a `keyword` clause waits for layer 6
  like `withKeyword`, and so does `hasManaAbility` (Raggadragga, Goreguts
  Boss's "each creature you control with a mana ability gets +2/+2");
  `ofChosenType` reads this permanent's own chosen creature type (Morophon's
  "other creatures you control of the chosen type"). A `power` / `toughness`
  clause — or `basePower`, `baseToughness`, `hasAbilities`,
  `nameDiffersFromEach` — can't be answered from inside the layer fold that
  computes it and **fails closed** — don't author a scope that needs one.
  Prefer this over adding another flag to the fixed scopes.

`withKeyword` (either creature scope) and `withoutKeyword` read the target's
**current** keywords (rule 613.8a — the anthem depends on whatever grants or
removes the keyword): a creature flying because of an Aura, Equipment, an
anthem or a `grant-keyword` spell counts, and one whose flying a later loss
of all abilities took away (Turn to Frog — rule 613.7) doesn't. `collectStaticEffects` gets there without recursing:
it applies every other static first, then matches the keyword-scoped ones
against the keywords that produced (Alela, Artful Provocateur; Empyrean
Eagle; Gravitational Shift).
- `"attached"` — the permanent this Aura/Equipment is attached to (how Auras
  grant their effect).

The creature scopes ask whether a permanent is a creature *now* (its layer-4
types), so an animated land or an artifact that became a creature gets the
anthem, the keyword grant and the granted trigger like any other creature.
`lands-you-control` reads current types the same way.

**Continuous-effect fields:**

`attackLimit: { most: N, covers }` is "no more than N creatures can attack …" each combat
(rule 508.1c): `covers: "all"` every attack (Silent Arbiter), `"you"` this permanent's controller
and not their planeswalkers (Crawlspace), `"self"` this planeswalker (The Eternal Wanderer; a
`grantsStatic` for Tomik's quoted one). `blockLimit: { most: N }` is "no more than N creatures can
block each combat" (509.1b), counted over every defending player. A `condition` turns either on
and off (Mirri: `{ kind: "source", filter: { tapped: true } }`). Each is read only as the
declaration is made. For one combat, "each opponent can't block with more than one creature this
combat" is the effect `limit-blockers { who, most }`.

`attackTax: { generic: N }` is "creatures can't attack you unless their controller pays {N}
for each creature they control that's attacking you" (Ghostly Prison, Propaganda, Windborn
Muse): a cost to attack this permanent's controller (rule 508.1h), not their planeswalkers (the
ruling). Several add up. It's paid after the attackers tap (508.1f), so an attacker can't tap
for its own tax, and a creature that must attack isn't obliged to pay it (508.1d). The
`declare-attackers` offer carries the rates and a sure-to-pay `budget`; bots and the fuzzer cut
their declarations to it (`withinAttackTax`), and the client shows the running cost. `generic`
may be a live `CountSpec` from the controller's side (Sphere of Safety's `{ countOf: … }`,
Collective Restraint's `{ basicLandTypes: "you" }`); `life: N` is N life a creature, as well or
instead (rule 119.4; Sivitri). `covers: "you-and-planeswalkers"` is "you or planeswalkers you
control" (Baird), `"planeswalkers"` the planeswalkers alone (Onakke Oathkeeper); a `condition`
turns it on and off. For a while: the `player-effect` effect's `attackTax` (`generic` and `life`
as `EffectAmount`s, fixed as it resolves), with `covers: "all"` for "creatures can't attack
unless …" with no "you" (War Tax: every attack by anyone, its controller's too). `phyrexian:
"W"` is one {W/P} a creature as well (Norn's Annex; two Annexes two pips): each pip {W} or 2
life (rule 107.4f), the attacker's choice for each, which the declaration's `phyrexianLife`
carries (how many in life; the client asks as it does a spell's); omitted, mana pays what it
can. The offer names the pips (`attackTax.phyrexianPerCreature`), and `withinAttackTax` counts
each as 2 life against the life budget. A tax for a while has no `phyrexian` yet.

`combatTax: { on, generic, life, perCounter, covers, attacker }` is the same cost on the creatures
the static's `affects` reaches, where `attackTax` is on attacking a player whatever attacks:
`on: ["attack"]`, `["block"]` or both is "this / enchanted creature can't attack or block unless
its controller pays" (Qal Sisma Behemoth, Brainwash; rules 508.1h, 509.1d), and `["be-blocked"]`
"can't be blocked unless defending player pays {3} for each creature they control that's blocking
it" (Awesome Presence). A blocker pays once however many attackers it blocks. `generic` may be a
`CountSpec` from this permanent's controller's side (Cowed by Wisdom's `"cards-in-your-hand"`);
`perCounter` makes it per counter on the taxed creature, `"any"` or a kind (Nils, Phyrexian
Marauder); `covers` narrows an attack to "you", as above (Nils); `attacker` narrows a block to the
attackers matching a filter, "you" being this permanent's controller (Hipparion). A `condition`
turns it on and off (Archangel of Tithes). No requirement obliges paying (508.1d, 509.1c: the
offers' `mustAttack` and `lurePlan` leave a taxed creature out); bots and the fuzzer cut to the
budget (`withinAttackTax`, `withinBlockTax`). For a turn: the `player-effect` effect's `blockTax`
(War Cadence), every block by anyone. `permanents: { do, filter, count, noun }`, on an attack, is
a cost in the attacker's controller's own permanents, for each creature reached: `do: "sacrifice"`
is "can't attack unless you sacrifice a land" (Exalted Dragon; `count: 2` Leviathan; Reclamation's
"a land of their choice for each black creature"), `do: "return"` "… return an enchantment you
control to its owner's hand" (Floodtide Serpent); `noun` names one in the prompts ("land"). The
declaration is refused without enough of them, one permanent never paying two. Which ones is asked
once it's made (a `sacrifice` or `choose-permanents` decision, none if there's no choice), after
the mana is paid, so a land can tap for that first, and what paid with itself doesn't attack (rule
508.1k). Tapping another creature (Hollow Warrior) isn't here yet.

"Creatures can't attack you" is a `{ kind: "cant-attack", at: "you" }` record (see *Combat rules*). For a while, it's a `restrict` over a `filter`, a rule that binds creatures arriving later (611.2c): Chronomantic Escape's `{ kind: "restrict", filter: { type: "creature" }, restrictions: [{ kind: "cant-attack", at: "you" }], duration: "until-your-next-turn" }`; one player's creatures take `filter: { type: "creature", controlledBy: "you" }` with `sideOf: "active-player"` (Champions of Minas Tirith) or `controlledByTarget`.

- `grantPt: [p, t]` — layer 7d P/T bonus.
- `grantPtPerCount`, each affected permanent by its own: `relativeToAffected`
  asks `filter` of it, so `attachedTo: { isSource: true }` is "attached to it"
  (Thran Power Suit), `excludeSelf` is "other than it" (Sliver Legion) and
  `sameNameAsSource` is "with the same name as that creature" (Mirror Box);
  `sharesCreatureTypeWithAffected` is "that shares a creature type with it"
  (Coat of Arms); `ofAffected: "mana-value" | "colors" | "creature-types"` is what
  it has (Hedron Matrix, Civic Saber), `"times-attacked-this-turn"` how many times
  it has been declared an attacker (Moraug, Fury of Akoum); `countersOnAffected`, below. Other amounts:
  `countersAmong: { counter, filter }` (Gleam of Authority), `playerCounters` with
  `playerCountersOf: "opponents"` (Mycosynth Fiend), `anyCountersOnSource` (Kyler),
  `anyCountersOnAffected` (Luxior's "for each counter on it"),
  `turnStat` (Knowledge Is Power), `turnHistory: { what, filter? }` (a this-turn
  journal list, each as it was — Kinbinding's "creatures that entered the
  battlefield under your control this turn"), `basicLandTypes` (domain — Manaforce Mace),
  `opponents`; `fromAffectedController` counts from the affected permanent's
  controller's side (Disturbing Conversion); `step` divides the count, rounded
  down (Dark Matter Manipulator's "for every seven"), and `max` caps it.
- `grantPtPerCount: { filter?, commanderCasts?, playerCounters?, countersOnAffected?, countersOnSource?, exiled?, inGraveyard?, colorsAmong?, commanderManaValue?, cardsInHand?, lifeTotal?, pt, excludeSelf? }` — a layer 7d bonus that
  *scales* with a live count (Skycat Sovereign's "+1/+1 for each **other**
  creature you control with flying"). Distinct from `setBasePtFromCount`,
  which is a CDA in layer 7b that *replaces* the printed P/T; this adds on
  top, so counters and other anthems stack with it normally. `commanderCasts:
  true` counts the times its controller has cast a commander from the command
  zone this game instead of a battlefield filter (Commander's Insignia), summed
  across a Partner pair; `playerCounters: "experience"` counts the counters of
  that kind its controller has ("gets +1/+1 for each experience counter you
  have" — Kalemne, Disciple of Iroas); `countersOnAffected: "slime"` counts
  the counters on **each affected permanent itself** (Toxrill, the
  Corrosive's "creatures your opponents control get -1/-1 for each slime
  counter on them"); `countersOnSource: "charge"` counts the counters on **the
  permanent with this static** (Banner of Kinship, whose "enters with" counts with
  `ofChosenType`, the type already chosen; Door of Destinies' "+1/+1 for each charge
  counter on this artifact"); `exiled: CardFilter` counts cards in exile (Umbris, Fear
  Manifest's "each card your opponents own in exile" is `{ ownedBy:
  "opponent" }`); `inGraveyard: CardFilter` counts cards in graveyards (Wight of
  the Reliquary's "each creature card in your graveyard" is `{ type:
  "creature", ownedBy: "you" }`); `colorsAmong: CardFilter` counts the colours among matching
  battlefield permanents, each once (Sisay, Weatherlight Captain, with
  `excludeSelf` for "other"); `commanderManaValue: "greatest"` is the greatest
  mana value among its controller's commanders, wherever they are (Tangleweave
  Armor's "+X/+X, where X is the greatest mana value among your commanders" —
  `pt: [1, 1]` on an `attached` scope), a commander on the stack with its {X};
  `cardsInHand: true` counts the cards in its controller's hand (Grim
  Strider's "this creature gets -1/-1 for each card in your hand" is `pt: [-1,
  -1]`; Meishin, the Mind Cage's "all creatures get -X/-0, where X is the
  number of cards in your hand" is `pt: [-1, 0]` on `all-creatures`),
  `cardsInHand: "opponents"` every opponent's hand together (Enemy of
  Enlightenment), `cardsInHand: "affected-controller"` the hand of **each
  affected creature's** controller (Righteous Authority's "+1/+1 for each card
  in its controller's hand"); `lifeTotal: true` is its controller's life
  total, unclamped (rule 107.1b — Death's Shadow's "-X/-X, where X is your
  life total" is `pt: [-1, -1]`, a bonus at negative life). A CDA equal to a
  life total is `setBasePtFromCount`'s `"your-life-total"` (Serra Avatar).
- `maxHandSize: { who, set?, minus?, adjust? }` — a maximum hand size, read
  at cleanup: "your maximum hand size is eleven" is `{ who: "you", set: 11 }`;
  Winter, Misanthropic Guide's "each opponent's maximum hand size is equal to
  seven minus the number of those card types" is `{ who: "opponents", set: 7,
  minus: { cardTypesInGraveyard: { ownedBy: "you" } } }` (a `CountSpec`)
  behind its delirium `condition`; `adjust` adds to it. Never below 0.
- `noMaxHandSize: true` — "You have no maximum hand size" (Thought Vessel).
- `surveilAdditional: N` — "You may look at an additional two cards each time
  you surveil" (Enhanced Surveillance: `2`): its controller's surveils of one
  or more look at N more cards, each of which may go to the graveyard or stay
  on top in any order (rule 701.25b). Not a replacement; a surveil of 0 isn't
  one (701.25c); several add up. The "may" is always taken — every card
  looked at may stay where it was. `surveil-additional.test.ts`.
- `keepsUnspentMana: ["R"]` — "You don't lose unspent red mana as steps and
  phases end" (Leyline Tyrant): mana of those types stays in its
  controller's pool through every step, cleanup included, so into later turns
  while it's on the battlefield; gone, the mana goes as the current step ends
  (the rulings). Savage Ventmaw's mana for the turn is `add-mana`'s
  `persists` instead. A resolving spell's "**until end of turn**, you don't
  lose unspent red mana" — all of it, whenever made — is a `player-effect`
  with `duration: "end-of-turn"` and the same `keepsUnspentMana: ["R"]` (The
  Last Agni Kai); it ends with cleanup, and the mana empties as that step
  ends.
- `unspentManaBecomesColorless: true` — Kruphix, God of Horizons' "If you
  would lose unspent mana, that mana becomes colorless instead": every unit
  that would empty stays as `{C}`, its restrictions and riders kept (the
  rulings).
- `unspentManaBecomes: "B"` — Omnath, Locus of All's "that mana becomes black
  instead" (Ozai's red): the same replacement to another type. Where several
  would apply, one does (rule 616.1; the engine takes the newest).
- `keepsUnspentManaEachPlayer: true` beside `keepsUnspentMana` — Upwelling's
  "Players don't lose unspent mana as steps and phases end" (every type,
  every player).
- `manaLossCausesLifeLoss: true` — Yurlok of Scorch Thrash's "A player losing
  unspent mana causes that player to lose that much life": as each step and
  phase ends, every player loses 1 life per mana actually emptied (none for
  what a keep or a "becomes" saved). Not damage.
- `revealsFirstDrawEachTurn: true` — Keranos, God of Storms' "Reveal the first
  card you draw on each of your turns" (rule 701.16): shown to every player
  as it's drawn. Its "whenever you reveal a land card this way" is a `draws`
  trigger (§7: `nthEachTurn: 1`, a drawn-card `filter`, a `your-turn`
  `whileCondition`).
- `revealsDraws: "chosen-player"` — Booby Trap's "The chosen player reveals
  each card they draw" (rule 701.20a): every card the permanent's
  `chosenPlayer` draws is shown to every player as it's drawn, whoever
  controls the permanent.
- `devotionBonus: 1` — Altar of the Pantheon's "Your devotion to each color
  and each combination of colors is increased by one" (rule 700.5a): counted
  by every devotion its controller has, even once it has lost its abilities
  (its ruling — devotion is read before other effects).
  A fact about the *controller* rather than about anything the ability
  affects, so it's read straight off the battlefield at cleanup instead of
  going through the layer system; pair it with `affects: { scope: "self" }`.
  It and every `maxHandSize` apply in timestamp order (rule 613.11 — each
  its permanent's timestamp): a Twenty-Toed Toad newer than a Reliquary
  Tower makes it twenty, an older one leaves no maximum.
- `prohibits: [{ act: "lose-game", who: "you" }, { act: "win-game", who: "opponents" }]` — "You can't lose the game and your opponents can't win the game" (Platinum Angel). `only: "zero-life"` is "you don't lose the game for having 0 or less life" (Lich's Tomb), which stops rule 704.5a's loss alone. See §6 *Winning and losing*.
- `playerKeywords: ["hexproof" | "shroud"]` — "**You** have hexproof" (Shalai, Voice of Plenty; rule 702.11d) or "you have shroud" (Ivory Mask, 702.18), read as a target is checked (`playerHasKeyword`). In a `timed-static` it's "you gain shroud until end of turn" (Gilded Light). `targetsIgnoringHexproof: { object?, players?: "opponents", anyController? }` is "as though they didn't have hexproof" (Glaring Spotlight).
- `playerProtection: { colors?, types?, filter?, chosenColor?, chosenCardType?, fromPlayers? }` —
  "**You** have protection from …" (rule 702.16b, c, e): its controller can't
  be targeted by a spell with the quality or an ability from a source with it,
  can't be enchanted by an Aura with it (a Curse already on them falls off),
  and damage from a source with it is prevented (`playerProtectionBlocks`).
  The filter reads this permanent as its source — Runed Halo's "the chosen
  card name" is `{ filter: { chosenName: true } }`; Serra's Emissary's "you and
  creatures you control" is this beside a `protection: { chosenCardType: true }`
  over `creatures-you-control`. `affects` is ignored.
- `doesntUntap: true` — "This artifact doesn't untap during your untap step"
  (Mana Vault, Basalt Monolith). Only its controller's own untap step. On
  anything else — "enchanted creature", "nonbasic lands" — it's the
  `"doesnt-untap"` restriction.
- `loyaltyAtInstantSpeed: true` — "You may activate loyalty abilities of [this]
  on any player's turn any time you could cast an instant" (Teferi, Master of
  Time): its loyalty abilities skip sorcery timing (rule 606.3), still one per
  turn — each turn, anyone's. Always about its own permanent.
- `exertAsItAttacks: { unlessExertedThisTurn? }` — "You may exert this
  creature as it attacks" (rule 701.43d, an optional cost to attack — 508.1g;
  Glorybringer). Asked of each such attacker once the attack is declared and
  before anything that triggered on it goes on the stack, as a `choose-modes`
  of one mode (exert it) or none (`GameState.pendingExerts`). A creature put
  onto the battlefield attacking is never asked. The linked "When you do, …"
  (607.2h) is a triggered ability on `{ on: "exerted", who: "self",
  asItAttacks: true }` (§9) — its targets are chosen then, and with none it's
  just removed (the ruling). `unlessExertedThisTurn` is Combat Celebrant's "if
  this creature hasn't been exerted this turn".
- `enlist: true` — Enlist (rule 702.154a): write `static: [enlist()]` and
  `ENLIST_TEXT` from `helpers.ts`. An optional cost to attack (702.154b,
  508.1g): once the attackers have tapped and before the attack is announced
  (so before anything triggers on it — `GameState.pendingEnlist`), each such
  attacker's controller may tap one untapped creature they control that
  isn't attacking, isn't the attacker, and has haste or isn't summoning sick
  (a `choose-permanents` of up to one). The linked "when you do, this
  creature gets +X/+0 until end of turn" is the engine's own reflexive
  trigger, X the tapped creature's power as it resolves (last known if it
  has left) — author nothing for it. A creature put onto the battlefield
  attacking never enlists. One instance per creature (702.154d's several
  aren't asked separately). "Whenever this creature enlists a creature" is
  an `enlists` trigger (§9); "if it enlisted a creature this combat" the
  `enlistedThisCombat` filter clause.
- `targetedBySpellsCost: { payLife }` — "Spells your opponents cast that
  target this creature cost an additional 3 life to cast" (Terror of the
  Peaks): paid as part of the spell's cost (rule 601.2f), once per spell
  however many slots name it, never for an ability or a copy. An opponent
  with too little life can't target it with a spell (119.4), so it's left
  out of their offers. Not ward — ward counters after the cast and reaches
  abilities too. `{ payGeneric }` is the same in mana: "cost {2} more to
  cast" (Boreal Elemental), a cost increase added before any reduction, a
  target too dear for its caster left out of their offers. It can be granted
  (`grantsStatic`, Jubilant Skybonder): each permanent named pays once, so two
  such creatures cost {2} each. `targeting: CardFilter` reads the spell's
  targets instead of this permanent, from this static's controller's side —
  "that target a Merfolk you control" (Kopala: `{ subtype: "Merfolk",
  controlledBy: "you" }`), "one or more commanders you control" (Esior:
  `{ isCommander: true, controlledBy: "you" }`) — once per spell however many
  match. Abilities have their own: `abilityCostModification`'s `targeting`.
- A player named as an **owner**: `{ ownerOf: n }` is "its owner" on
  `gain-life`/`lose-life`/`damage`'s `who`, `draw`'s `who`, `discard`/`mill`'s
  `target` and `exile-graveyard`'s `target` (Path of Peace, Recoil, Geth,
  Nurgle's Conscription) — never the controller, so it survives a change of
  control and a zone change. The `{ ownerOf: "trigger-object" }` scope is "that player" of a
  `leaves-battlefield` trigger whose `to` is a player's hand or graveyard
  (Warped Devotion, Liability). `damage`'s `who: "attached-owner"` with `from:
  "attached"` is "enchanted creature deals 1 damage to its owner" (Enslave).
- `untapsDuringOthersUntap: "self" | CardFilter` — untap during each **other**
  player's untap step too: `"self"` is Bender's Waterskin, a filter is every
  permanent you control matching it (Seedborn Muse `{}`, Unwinding Clock
  `{ type: "artifact" }`).
- `mayPlay: { from: "graveyard", … }` — see **`mayPlay` / `grant-play` / `impulse-exile`** in §6. Each permission that applies is offered as its own `via: "graveyard-permission"` variant carrying a `graveyardGrant: { source, asType? }` the driver echoes back, so which one is spent is the player's choice (601.3). A land face is only offered under a permission that spends something (Muldrotha's `perType` with `"land"`); one that doesn't has nothing to name (Ramunap Excavator).

- `grantsToGraveyard: { filter, flashback?: { cost }, escape?: { cost,
  exileCount } }` — cards in your graveyard matching `filter` **have**
  flashback or escape (rule 604.1): Iroh, Grand Lotus's "during your turn,
  each instant and sorcery card in your graveyard has flashback. The
  flashback cost is equal to its mana cost" is `{ filter: { typesAnyOf:
  ["instant", "sorcery"] }, flashback: { cost: "mana-cost" } }` with a
  `your-turn` `condition`; The Master of Keys's "each enchantment card in
  your graveyard has escape. The escape cost is equal to the card's mana cost
  plus exile three other cards from your graveyard" is `{ filter: { type:
  "enchantment" }, escape: { cost: "mana-cost", exileCount: 3 } }`. `cost`
  is a mana string or `"mana-cost"` (the card's own — a card with none gets
  nothing). Offered exactly like a printed flashback or escape (`via`); a
  card that has its own may use either, each offered and named by
  `graveyardGrant.source` (the Underworld Breach ruling). The grant ends when this permanent leaves;
  a spell already cast with it is still exiled as it leaves the stack. `mayhem: { cost }` is Green
  Goblin's "each nonland card in your graveyard has mayhem. The mayhem cost is equal to its mana
  cost" (`{ filter: { notTypes: ["land"] }, mayhem: { cost: "mana-cost" } }`), cast the turn it
  was discarded; `dredge: N` is The Necrobloom's "land cards in your graveyard have dredge 2". A card
  with its own mayhem or dredge uses its own.
  `keywords: [{ keyword, cost? }]` is any of unearth, encore, embalm, harmonize, retrace or sneak,
  each working as a printed one does: "each creature card in your graveyard has unearth {2}{B}"
  (Sedris), "… has encore. Its encore cost is equal to its mana cost" (Wire Surgeons — `cost` left
  out is the card's mana cost, a card with none getting nothing), "… encore {X}, where X is its mana
  value" (Graywater's Fixer, `cost: "mana-value"`), "Merfolk and Druid cards in your graveyard have
  retrace" (Deeproot Historian; retrace has no cost of its own). A card with its own has both. An
  emblem's static holds one too (Wrenn and Six). The same in a one-shot is `grant-graveyard-keyword`.
- `castWithSneakFromGraveyard: { filter }` — Ninja Teen's "you may cast creature spells from your
  graveyard using their sneak abilities": a sneak of their own, or one `grantsToGraveyard` gives.
- `selfOutsideBattlefield: { addTypes, addSubtypes, power, toughness }` — "as long as ~ isn't on the
  battlefield, it's a 1/1 Insect creature in addition to its other types" (Grist, the Hunger Tide):
  this card's own, everywhere but the battlefield, on the stack too (rule 113.6c).
- `typesOutsideBattlefield: { ofType, zones?, addTypes?, addSubtypes?, addsChosenCreatureType?,
  setsChosenCreatureType? }` — layer 4 off the battlefield: cards of the type `ofType` you own that
  aren't on the battlefield and such spells you control, every filter reading it. "The same is true
  for creature spells you control and creature cards you own that aren't on the battlefield" is
  `{ ofType: "creature", addsChosenCreatureType: true }` beside the battlefield half's own field
  (Arcane Adaptation, Maskwood Nexus, Conspiracy); `zones: ["graveyard"]` under `affects: { scope:
  "self" }` is Ashes of the Fallen's.
- `grantsToSpells: { filter?, castFrom?, keywords?, triggered?, splitSecond?, cantBeCountered?,
  freerunning?, webSlinging?, convoke?, improvise?, prowl? }` — `convoke: true` / `improvise:
  true` give the spells that way of paying (rules 702.51, 702.126): Chief Engineer's "artifact
  spells you cast have convoke" (`{ filter: { type: "artifact" }, convoke: true }`), Inspiring
  Statuary's "nonartifact spells you cast have improvise" (`{ filter: { notTypes: ["artifact"] },
  improvise: true }`), Hoarding Broodlord's "spells you cast from exile have convoke"
  (`castFrom: ["exile"]`), judged where the card is as it's cast; a spell with both (one printed)
  taps creatures to convoke and artifacts to improvise in one payment (the offer's
  `alsoImprovise`). `prowl: "{2}{R}"` is Hunting Velociraptor's "Dinosaur spells you cast have
  prowl {2}{R}" — an alternative cost under the printed prowl's condition, answering
  `self-prowl-paid`. `firstEachTurn` reaches these as the spell is cast too (Peri Brown's "the
  first historic spell you cast each turn has convoke"); a `filter` with `castFrom` or `manaSpent` asks each earlier spell as it was cast (Wild-Magic Sorcerer's "the first spell you cast from exile each turn has cascade" is `{ filter: { castFrom: "exile" }, firstEachTurn: true }`, Rain of Riches' "… that mana from a Treasure was spent to cast" `{ manaFrom: { subtype: "Treasure" } }`). `freerunning` / `webSlinging` (a cost) give the spells that
  alternative cost: Ezio Auditore da Firenze's "Assassin spells you cast have freerunning {B}{B}"
  (`{ filter: { subtype: "Assassin" }, freerunning: "{B}{B}" }`), Amazing Spider-Man's "each
  legendary spell you cast that's one or more colors has web-slinging {G}{W}{U}" ("one or more
  colors" is an `anyOf` over the five) — offered as a printed one is, the card judged where it is
  as it's cast. Keywords
  and abilities the spells you cast have on the stack (rule 113.6): "spells you
  cast have lifelink" is `{ keywords: ["lifelink"] }`; Abaddon the Despoiler's
  "during your turn, spells you cast from your hand with mana value X or less
  have cascade, where X is the total amount of life your opponents have lost
  this turn" is a `your-turn` `condition` with `{ castFrom: ["hand"], filter:
  { manaValue: { op: "lte", n: { amount: { turnStat: "life-lost", who:
  "each-opponent" } } } }, triggered: [<a "this-cast" cascade trigger>] }` — a
  granted `this-cast` trigger fires as the spell is cast, like a printed one.
  `cantBeCountered: true` is "[filter] spells you control can't be countered"
  (Prowling Serpopard: `{ filter: { type: "creature" }, cantBeCountered: true }`;
  Hexing Squelcher's "spells you control" has no filter; `allSpells: true` reaches every
  player's spells — Lier, Disciple of the Drowned's "Spells can't be countered"): read as the counter
  would happen, for every spell its controller controls — a copy, or one cast
  from anywhere — while the permanent is there. A countering spell's other
  effects still happen (Strix Serenade's Bird).
  `filter` is matched against the spell from your side; an `{ amount }`
  operand works for a granted trigger but fails closed for granted keywords.
  `splitSecond: true` gives them split second — Shadow the Hedgehog's "each
  spell you cast has split second if mana from an artifact was spent to cast
  it" is `{ filter: { manaSpent: [{ from: { type: "artifact" } }] }, splitSecond: true }`.
  `casualty: N` gives them casualty N (rule 702.153 — see `casualty` in §3):
  Silverquill, the Disputant's "each instant and sorcery spell you cast has
  casualty 1" is `{ filter: { typesAnyOf: ["instant", "sorcery"] }, casualty:
  1 }`, an instance beside any other the spell has. `firstEachTurn: true` is
  "**the first** [filter] spell you cast each turn" (Anhelo, the Painter's
  casualty 2): of the spells you've cast this turn that matched as they were
  cast, those before this permanent arrived included, only the first.
  `conspire: true` gives them conspire (rule 702.78 — see `conspire` in §3):
  Wort, the Raidmother's "each red or green instant or sorcery spell you cast
  has conspire" is `{ filter: { typesAnyOf: ["instant", "sorcery"], anyOf:
  [{ colors: ["R"] }, { colors: ["G"] }] }, conspire: true }`, an instance
  beside a printed one, each asked and copying separately (702.78b).
- `grantsToSpells: { filter, castFrom?, keywordValues: [{ keyword, cost }] }` — the spells you cast that
  match `filter` have a keyword with a cost (rule 113.6, `keyword-values.ts`). `keyword` is `"replicate"`
  ("each instant and sorcery spell you cast has replicate. The replicate cost is equal to its mana cost",
  Djinn Illuminatus, `cost: "mana-cost"`; `"{2}{U}"` for Hugh), `"emerge"`, `"blitz"`, `"evoke"`,
  `"offspring"`, `"prowl"`, `"freerunning"` or `"web-slinging"`. Judged as the card would be cast, and
  each is beside any printed one. `cost` is a mana string, `"mana-cost"`, or `{ manaCostLess: N }`.
- `grantsToHand: { filter, keywordValues, eachPlayer? }` — cards in your hand have a keyword with a cost:
  `"warp"`, `"ninjutsu"`, `"cycling"` (with `search` for typecycling), `"foretell"`, `"miracle"`,
  `"madness"` (read in the hand, so "each card you own that isn't on the battlefield has madness" says this,
  Falkenrath Gorger). `eachPlayer` reaches every hand (Homing Sliver). A foretold card keeps the cost it
  was given once the grant is gone.
- `equipAtInstantSpeed: true` — "you may activate equip abilities any time you could
  cast an instant" (Leonin Shikari; a `your-turn` `condition` for Forge Anew's "during
  your turn"). `alternativeAbilityCost: { kind: "equip", mana, firstEachTurn? }` (or `kind: "cycling"`, `"power-up"`) — "you may pay {0}
  rather than pay the equip cost of the first equip ability you activate" (Forge Anew):
  each equip ability you control has a second one at `mana`, beside the first.
  "Equip—Pay {3} or discard a card" is two entries in `activated`, one per cost, each
  with a text starting `Equip` (Bloodthorn Flail, Gavel of the Righteous).
- `alternativeAbilityCost: { kind: "cycling", mana, firstEachTurn? }` — "you may pay `mana` rather
  than pay cycling costs" (rule 702.29f has a typecycling cost one too): the cards
  in your hand with any cycling ability, printed or granted, have a second one at
  `mana`, beside the first, X 0 in it. The static's `condition` is New Perspectives'
  "as long as you have seven or more cards in hand" (`{ kind: "hand-size", atLeast:
  7 }`); `firstEachTurn` is Gavi, Nest Warden's "the first card you cycle each turn",
  counting what was cycled before she arrived.
- `blitzCostReductionPerCommanderCast: true` — every blitz cost you pay,
  printed or granted, costs {1} less for each time you've cast a commander
  from the command zone this game (Henzie). Only the cost's generic number
  moves; an `{X}` in it doesn't.
- `alternativeCostForSpells: { mana, filter?, energy?, flash?, payLifeManaValue?, oncePerTurn?, yourTurnOnly?, fromHand?, fromZones?, anyPlayer? }` — an alternative cost (rule
  118.9) for the spells you cast: Jodah, Archmage Eternal's "you may pay
  {W}{U}{B}{R}{G} rather than pay the mana cost for spells you cast" is `{
  mana: "{W}{U}{B}{R}{G}" }`. Offered as the `altCost` variant of any spell
  cast for its mana cost — from hand, the command zone (commander tax still
  applies), exile or a graveyard permission — but never of one cast for
  another alternative cost (flashback, escape, foretell, disturb, a free
  cast: rule 118.9a allows one). A card with its own alternative cost
  (Sephara) offers both, a variant each (`altCostIndex`, rules 118.9a, 601.2b).
  An X spell cast this way has X = 0.
  `payLifeManaValue` makes it life equal to the spell's mana value, with
  `mana: "{0}"`; "once during each of your turns" (Demon of Fate's Design) is
  `oncePerTurn` + `yourTurnOnly`, "cast a spell from your hand" `fromHand`.
  "Without paying its mana cost" is `mana: "{0}"`: Omniscience's `{ mana: "{0}",
  fromHand: true }`, Zaffai and the Tempests' with `oncePerTurn`, `yourTurnOnly`
  and a `filter`. `fromZones: ["exile"]` is "a creature spell you cast from exile"
  (Tlincalli Hunter), and beside `fromHand`, `["library"]` "from your hand or the
  top of your library" (One with the Multiverse): the top card, under a permission
  to cast it (`mayPlay`). Every grant also reaches a paid "you may cast
  it" as something resolves (`cast-now`, Chandra, Torch of Defiance), never a free
  one or one that names its own cost. `anyPlayer: true` is "any player may cast …"
  (Aluren, with `flash`). `filter` is judged as the spell it would be (rule 601.3e:
  an Adventure's sorcery from a creature card), against the permanent: `manaValue:
  { op: "lte", n: { amount } }` reads it, with `{ countersOn: "source", counter:
  "time" }` (As Foretold) or `{ countOf: { type: "creature", controlledBy: "you" }
  }` (Omnipresence). The offer says `altCostText: "without paying its mana cost"`
  (or `"pay {W}{U}{B}{R}{G}"` for Jodah's).
  `energy: n` makes it energy (with `mana: "{0}"` when there's no mana):
  Nissa, Worldsoul Speaker's "you may pay eight {E} rather than pay the mana
  cost for permanent spells you cast" is `{ mana: "{0}", energy: 8, filter:
  { notTypes: ["instant", "sorcery"] } }`, offered only while the caster has
  eight. `flash: true` is "if you cast a spell this way, you may cast it as
  though it had flash" (Primal Prayers, rule 601.3c).
- **Combat rules** — `restrictions: [...]` (rules 508.1c, 508.1d, 509.1b, 509.1c; `combat/rules.ts`). Each entry is a **word** where the rule has no parameters, and a **record** where it has any; a word is the only spelling of a rule that says no more than its kind (a pool test refuses `{ kind: "cant-attack" }`). `affects` says which creatures, `condition` when; a record reads "you" as this permanent's controller, and is read as attackers or blockers are declared, so a scope may ask about power and toughness.

  | Record | Fields | Says |
  | --- | --- | --- |
  | `{ kind: "cant-attack", at?, unlessDefender?, ifDefender? }` | | "Can't attack" narrowed. `at`: `"you"` (the player only, so a planeswalker they control is still attackable, rule 508.1b: Reverence, Blazing Archon, Teferi's Moat), `"you-and-planeswalkers"` (Vow of Duty), `"you-and-permanents"` (a battle too), `"owner"`, `"owner-planeswalkers"` (Xantcha), `"attacked-this-turn"` (Port Razer), `{ planeswalkers: filter }` ("Jaces you control"). `unlessDefender` / `ifDefender`: a `PlayerTest` (`controls`, `holds`, `youControlMore`) of the player this attack would defend against (rules 506.2, 508.1c: a planeswalker's controller), so at a table of four it may attack one opponent and not another: Sea Serpent's `unlessDefender: { controls: { subtype: "Island" } }`, Crown-Hunter Hireling's `{ holds: { kind: "monarch", who: "you" } }`, Orgg's `ifDefender`, Mogg Toady's `{ youControlMore: { type: "creature" } }`. The same asked of **you** is the static's own `condition` (Branded Brawlers). |
  | `{ kind: "must-attack", at?, otherThan?, ifAttacks? }` | | "Attacks if able" narrowed. `at`: obeyed only by attacking one of them, so it binds only while one can be attacked (rule 508.1d), one requirement however many it names: `"you"`, `"source"`, any `PlayerRef`, `{ controllerOf: "attached" }` on a static (Public Enemy), `{ defender: PlayerTest }` ("an opponent with the most life among your opponents": Galactus, `{ mostLifeAmongYourOpponents: true }`). `otherThan: "you"`: "attacks a player other than you if able", which carries "attacks if able" too (goad's requirement as a rule of the game). `ifAttacks: filter`: "if a creature matching it attacks, this attacks if able" (Ekundu Cyclops; Viashino Bey's `{ isSource: true }`), the offer's `attackIf`; a limit on attackers bends it, and it never obliges paying a cost. |
  | `{ kind: "cant-block", attacker?, attackers?, unlessAttacking? }` | | Every field given must hold. `attacker`: this one creature (`"source"`, a slot). `attackers`: a filter, read from `you`'s side: "can block only creatures with flying" is `{ not: { keyword: "flying" } }`; "can't block creatures you control" is `{ controlledBy: "you" }` (Immortal Obligation). `unlessAttacking`: a `PlayerTest` of the attacker's controller (Mogg Toady). |
  | `{ kind: "must-block", attacker? }` | | "Blocks [this attacker] if able" (rule 509.1c): a slot or `"source"`. |
  | `{ kind: "cant-be-blocked", by?, byMoreThan?, byFewerThan?, unlessAllBlock? }` | | `by`: no creature matching it can block (Delney; "except by" is `{ not: … }`; `{}` is "can't be blocked"). It may compare against this permanent's own power: Champion of Lambholt's `{ power: { op: "lt", n: { amount: { powerOf: "source" } } } }`, read as blockers are declared. `byMoreThan: 1` (Challenger Troll); `byFewerThan: N` is menace with a larger N (Troll of Khazad-dûm's 3); `unlessAllBlock: true` (Tromokratis). |
  | `{ kind: "must-be-blocked", by }` | | "All [filter] able to block this creature do so" (Marble Priest): each its own requirement. Word form: Lure, every creature. |
  | `{ kind: "must-be-blocked-if-able", by?, exactlyOne? }` | | One blocker's enough, if one's able: `by` a filter (Slayer's Cleaver's Eldrazi), `exactlyOne: true` (Nacatl War-Pride: one obeys it, none or two don't, menace makes it ask nothing). Word form: Anzrag, any creature. |

  Scoped to whichever creatures a static reaches: Eriette of the Charmed Apple's "each creature that's enchanted by an Aura you control" is a `filter` scope with `{ type: "creature", enchantedBy: "you" }`. The blockers offer lists these as it always did (`singleBlockerAttackers`, `minBlockers`, `blockedByAll`, `mustBeBlockedByOneOf`).
- `restrictions: ["cant-attack-alone"]`, `"cant-block-alone"`,
  `"can-only-attack-alone"`, `"cant-attack-unless-two-others"`,
  `"cant-block-unless-two-others"` — a restriction keyed to the other creatures
  declared with it (rules 508.1c, 509.1b, `combat/company.ts`): "This creature
  can't attack or block alone" (Mogg Flunkies), "can only attack alone"
  (Errantry's `affects: { scope: "attached" }`, Master of Cruelties), "unless at
  least two other creatures attack" (Orcish Conscripts). The others may attack or
  block anything, a stack's tokens count singly, and one that can't be in any
  legal group isn't offered at all. The offers' `company` / `blockCompany`,
  `attackCompanyViolations` / `blockCompanyViolations` in the validators (and
  the requirements' maximum, 508.1d, 509.1c), `withinAttackCompany` /
  `withinBlockCompany` for bots and the fuzzer. The scaffolder reads these.
  `combat-company.test.ts`.
- `prohibits: [{ act: "become-suspected", object }]` — the creature can't become suspected (Airtight Alibi).
- `goads: true` — the affected creatures **are goaded** (rule 701.15b), with
  this permanent's controller as the goader, for exactly as long as the
  static applies, also as a copy exception's `static` (Mocking Doppelganger's
  `{ sameNameAsSource: true, isSource: false }`): Baeloth Barrityl, Entertainer's "creatures your opponents
  control with power less than Baeloth Barrityl's power are goaded" (a
  `filter` scope with `controlledBy: "opponent"` and `power: { op: "lt", n: {
  amount: { powerOf: "source" } } }`), an Aura's "enchanted creature … is
  goaded" (`scope: "attached"`). Not "until your next turn" — read live
  (`goadersOf` in `goad.ts`), so it ends the moment the source leaves, loses
  the ability, or its scope stops reaching the creature. The one static whose
  scope answers an `{ amount }` operand, and only the source's own `powerOf`,
  `toughnessOf` or `manaValueOf`.
- "Can't be blocked **as long as defending player** controls an artifact /
  has a rad counter" is `grantKeywords: ["unblockable"]` on an `of-player`
  condition with `player: "defending-player"` (Bouncing Beebles, Neurok Spy,
  Hazy Homunculus' `controls { type: "land", tapped: false }`); "unless" puts
  a `not` *inside* the `of-player` (Graxiplon), so it's false while the
  creature isn't attacking.
- `attackOnlyNearestOpponent: true` — with `chooseOnEnter: ["left",
  "right"]`, Pramikon, Sky Rampart's "each player may attack only the nearest
  opponent in the chosen direction and planeswalkers controlled by that
  opponent": a rule for every player (whatever `affects` says), left being
  onward in turn order and right back, skipping players who have lost. Every
  such permanent's direction applies at once, so two that disagree with three
  or more players left leave nobody to attack (the Pramikon ruling).
- `prohibits: [Prohibition]` — a "can't" (rule 101.2: it beats any "can"), one record per act (`prohibitions.ts`). Acts by a player take `who` (`"you"`, `"opponents"`, `"each-player"`, `"enchanted-player"`, `"enchanted-controller"`, `"defending-player"`):
  - `{ act: "cast", who, filter?, from?, notFrom?, limit?, unless? }` — `limit: 1` binds only once the player has cast that many matching spells this turn, each read as it was cast (Rule of Law; Ethersworn Canonist). `from`/`notFrom`: where the card is as the cast begins (Grafdigger's Cage; Drannith Magistrate). `unless: "sorcery-timing"` (Teferi, Time Raveler) and `"own-turn"` (Dosan).
  - `{ act: "play-land", who, filter?, from?, notFrom? }`, rule 305.2.
  - `{ act: "activate", who, of?, except?: ["mana", "loyalty"], only?: "loyalty" | "tap", anyZone?, unless? }` — `of` reaches permanents alone unless `anyZone` (Pithing Needle's "of sources"); no `of` is every permanent.
  - `{ act: "draw", who, perTurn }` — `0` is "can't draw cards"; it stops the draw before anything could replace it.
  - `{ act: "search", who, causedByThemselves?, ignoreCost? }`; `{ act: "lose-game", who, only?: "zero-life" }`; `{ act: "win-game", who }`; `{ act: "lose-life", who, from?: "damage" }` (`from: "damage"` is "damage doesn't cause you to lose life", rule 120.3a's result alone: the damage is dealt, and an effect's loss or a life payment goes through — Archon of Coronation); `{ act: "change-life", who }` (Platinum Emperion); `{ act: "become-monarch", who }`.
  - `{ act: "pay-life", who, except? }` and `{ act: "sacrifice-for-cost", who, filter?, except? }` — costs to cast or activate only: a shock land's life is still paid (Angel of Jubilation; `except: ["mana"]`, Karn's Sylex).
  - `{ act: "be-caused", who, what: "discard" | "sacrifice" }` — `who` is protected from their opponents' spells and abilities (Sigarda).

  Acts that happen to an object take `object`, a `CardFilter` from this permanent's controller's side (`hostOfSource` for "enchanted creature", `isSource`, `inZone`): `untap`, `transform`, `phase-in`, `phase-out`, `enter` (Grafdigger's Cage: the card stays where it is), `become-suspected`, `be-attached` (`attachment: "aura" | "equipment"`, `other`). `be-targeted` (`by: "opponents"`, `sourceFilter`, `only: "spells"`) and `get-counters` (`kind`) take `object` or `who`. `be-targeted` isn't hexproof, so `targetsIgnoringHexproof` doesn't reach it. Time any of them with the static's `condition`; `affects` is irrelevant.

  The `prohibit` effect says the same for a while: `{ kind: "prohibit", prohibits: [...], duration? }` (this turn when omitted, or any `PlayerDuration`). `who` is a `PlayerScope` (`{ target: 0 }`, `"each-opponent"`), an object act's `target` an `ObjectRef` in place of `object`, a `filter`/`object` stays a filter so "creatures you control" reaches later arrivals (rule 611.2c), and `cast`'s `more: 1` is "only one more spell this turn" (Irencrag Feat). "Target creature can't be regenerated this turn" is `cant-regenerate`.
- `castAsThoughFlash: true | CardFilter` — "you may cast spells as though
  they had flash" (Heliod, the Warped Eclipse), for this permanent's
  controller; a filter narrows it to matching spells (read from the
  controller's side). `castAsThoughFlashAnyPlayer: true` makes it every
  player's — "**any player** may cast creature and enchantment spells as
  though they had flash" (Vernal Equinox, Quick Sliver, Tidal Barracuda);
  `castAsThoughFlashFirstEachTurn: true` limits it to the first matching
  spell its caster casts each turn, spells cast before this arrived counting
  (Radagast of Rhosgobel, The Blue Spirit — pair it with
  `costModification.firstEachTurn` for Radagast's discount). A one-shot "this
  turn" or "the next spell" permission is a `player-effect`'s
  `castAsThoughFlash` instead. The scaffolder reads all three static lines.
- `addTypes: CardType[]` / `addSubtypes: string[]` — layer 4: the affected
  permanents have these "in addition to their other types" (Kudo: "are Bears";
  Ragost: "Artifacts you control are Foods"; Bello: "is a … creature"). Every
  type read sees them — filters, targeting, sacrifice costs, other statics'
  scopes — and they apply in timestamp order with the permanent's own
  type-changing modifiers (an `become`, Turn to Frog), except that a grant
  whose scope depends on another effect's added types applies after it (rule
  613.8: Kudo's "other creatures" reaches a land animated after Kudo arrived). A static with a
  layer-4 part fixes its reach there (rule 613.6): its keywords, granted
  abilities and P/T go to exactly the permanents it gave the type to. It
  also outlives its source losing its abilities: that loss is layer 6, so the
  static applied in layer 4 first and keeps applying in 7b and 7d — its
  layer-6 grants go against the loss in timestamp order, like any (Goddric,
  Cloaked Reveler's ruling: "still a Dragon creature with base power and
  toughness 4/4").
- `addSupertypes: Supertype[]` — layer 4 (rule 613.1d): supertypes in addition
  to their others. "Enchanted creature is legendary" (On Serra's Wings, beside
  its `grantPt` and `grantKeywords` on one static), "all nonland permanents are
  legendary" (Leyline of Singularity), "permanents with ice counters on them are
  snow" (Rimefeather Owl). `outsideBattlefield` takes it too (Rootpath
  Purifier's "land cards in your library are basic").
- `setSubtypes: string[]` — layer 4: the affected permanents' subtypes of the
  same kind are **replaced** by these (rule 205.1a), the rest staying —
  Goddric, Cloaked Reveler's "is a Dragon … (He loses all other creature
  types.)" is `setSubtypes: ["Dragon"]`. The static form of `become`'s
  `setSubtypes`; a layer-4 part like `addTypes`, in timestamp order with the
  rest. **Setting a land's type to a basic one** (Blood Moon's "nonbasic lands
  are Mountains", Spreading Seas's `["Island"]` over `"attached"`) is rule
  305.7: the land also loses every ability its rules text gave it — granted
  ones stay — gains the new type's intrinsic mana ability, and enters with
  none of its own entering abilities (614.12: no "enters tapped"); a land's
  own type-setting static (Urborg) doesn't exist under it (613.8a). The same
  holds for an effect's `become`/`become` `setSubtypes` of a basic type.
  "In addition to its other types" is `addSubtypes`, which isn't 305.7.
  `land-type-setting.test.ts`.
- `setsChosenLandType: true` — layer 4: the affected permanents' land types
  are the basic land type this static's own permanent chose as it entered
  (`chooseOnEnter: BASIC_LAND_TYPE_CHOICES`, from `helpers.js`) — Convincing
  Mirage's "enchanted land is the chosen type", Multiversal Passage's "this
  land is the chosen type" — with 305.7's loss as above. Nothing changes
  before a choice.
- `removeTypes: CardType[]` — layer 4: the affected permanents **aren't**
  these, and lose the subtypes that went only with them (rule 205.1a);
  supertypes stay. A Theros God's "As long as your devotion to white is less
  than five, Heliod isn't a creature" is the `godDevotion(colors, lessThan,
  text)` helper — `affects: { scope: "self" }`, a `devotion` condition,
  `removeTypes: ["creature"]`: a legendary enchantment and no God below it,
  its own pips counting (but not while it's entering — rule 614.12, the
  rulings), still not a creature once it has lost its abilities (layer 6 is
  later), and a later effect that makes it a creature wins (timestamp). An
  attacker or blocker that stops being a creature is removed from combat
  (rule 506.4), and a noncreature permanent's power and toughness read 0
  (rule 208.3 — Phenax's "X is this creature's toughness").
- `setTypes: CardType[]` — layer 4: the affected permanents' card types are
  **replaced** by these, and the subtypes that went only with the old ones go
  (rule 205.1a); supertypes stay. Arixmethes, Slumbering Isle's "as long as
  Arixmethes has a slumber counter on it, it's a land" (`self-counters`
  condition); Swift Reconfiguration's "Enchanted permanent is a Vehicle
  artifact with crew 5 and it loses all other card types" is `affects: {
  scope: "attached" }, setTypes: ["artifact"], setSubtypes: ["Vehicle"],
  grantsActivated: [crew(5)]` — crewing it, a later effect, makes it a
  creature again. Applied before the same static's `addTypes`.
- `addsChosenCreatureType: true` — layer 4: the creature type this static's
  own permanent chose as it entered (`chooseCreatureTypeOnEnter`) is added —
  Titan of Littjara's "This creature is the chosen type in addition to its
  other types", from the moment it's chosen. `setsChosenCreatureType: true` is
  the same with no "in addition" (Conspiracy): other creature types go.
- `setColors: [...]` — layer 5: the affected permanents' colours become
  exactly these (rule 105.3) — a Zendikon's "enchanted land is a 3/3 black
  Ooze creature" (Corrupted Zendikon) beside its `addTypes`, `addSubtypes` and
  `setBasePt`. In timestamp order with the permanents' own colour changes
  (`become`, `become`'s `setColors`); filters and protection read it.
- `addColors: [...]` — layer 5: colours **in addition to** their others (Deep
  Freeze's "is a blue Wall in addition to its other colors and types").
  `setsChosenColor: true` — layer 5: exactly the colour this static's own
  permanent chose as it entered (`chooseOnEnter` over the five colours — Alloy
  Golem's "this creature is the chosen color", Shimmerwilds Growth's
  "enchanted land is the chosen color").
- `loseLandTypes: true` — layer 4: the affected permanents lose all land types
  (and with them their intrinsic mana abilities, 305.7) — Lithoform Blight,
  Alpine Moon.
- `loseAllAbilities: true` — layer 6 (rule 613.1f): the affected permanents
  lose all abilities — Humility, Dress Down ("Creatures lose all
  abilities"), the Auras (Lignify, Frogify, Kenrith's Transformation, beside
  `setTypes` / `setSubtypes` / `setColors` / `setBasePt` on the same static),
  Toxicrene's lands. What the **same static** grants stays ("loses all other
  abilities and has defender", Imprisoned in the Moon's "{T}: Add {C}" — put
  the grant on that static); what was granted earlier goes, what is granted
  later stays (613.7). A loss that reaches another such static's permanent
  takes that static away first (613.8a — Lignify on a Toxicrene gives the
  lands their abilities back), and a static whose loss reaches its own
  permanent still applies (Humility made a creature). Every "has it lost its
  abilities" read sees it (`hasLostAbilities(state, registry, object)`).
  The scaffolder reads "Enchanted creature [gets -N/-0 and] loses all
  abilities [and has base power and toughness N/N]" and "[All] creatures lose
  all abilities". `static-lose-all-abilities.test.ts`.
- `blockAdditional: 1 | N | "any"` — the affected creatures "can block an
  additional creature each combat" (Two-Headed Giant of Foriys, Brave the
  Sands' "each creature you control", Echo Circlet's "equipped creature"),
  "an additional seven creatures" (Watcher in the Web), "any number of
  creatures" (Palace Guard): rule 509.1a's one block and this many more. Several
  add up; an ability, lost with the rest. The blockers offer says each
  creature's `maxBlocks`; it's declared once per attacker; it divides its
  combat damage among them (510.1d); "whenever ~ blocks" triggers once
  (509.3a). The scaffolder reads the line. `block-additional.test.ts`.
- `setBasePt: { power?, toughness? }` — layer 7b: the affected permanents
  *have base* power and/or toughness N ("have base power and toughness 10/10";
  a lone `toughness` is "have base toughness 1"). In timestamp order with
  `become`'s set P/T, under counters (7c) and bonuses (7d). Distinct from the
  `"self"`-only `setBasePtFromCount` CDA, which applies first.
- `setBasePtFromAffectedCounters: "<kind>"` — layer 7b, each affected permanent
  by its own count of those counters: Spark Rupture's "a creature with power
  and toughness each equal to the number of loyalty counters on it".
- `setBasePtFromSourceCount: <CountSpec>` — layer 7b, both base power and
  toughness a live count from **this** permanent's side: Aettir and Priwen's
  "equipped creature has base power and toughness X/X, where X is your life
  total" is `"your-life-total"`.
- **A static making a planeswalker a creature**: `addTypes: ["creature"]` for
  "that's still a planeswalker" (rule 205.1b, Gideon Blackblade); `setTypes:
  ["creature"]` for "he's a 3/4 Ninja creature" with no such words (205.1a,
  Kaito, Grand Master of Flowers, Spark Rupture: not a planeswalker, so damage
  marks it and takes no loyalty, it can't be attacked, and it isn't put away at
  0 loyalty), with `setBasePt` and any `condition`; `removeTypes:
  ["planeswalker"]` for "isn't a planeswalker" (Luxior). Its loyalty abilities
  still work (606.3 says "a permanent"). An attacker at a planeswalker that
  stops being one attacks nothing (506.4c, `attackingNothing`).
  `planeswalker-becomes-creature.test.ts`.
- `grantKeywords: [...]` — layer 6 keyword grant.
- `grantToxic: N` — layer 6: one more instance of toxic N on each affected
  creature, added to its total toxic value (Karumonix's "Other Rats you
  control have toxic 1" — see §5).
- `grantsActivated: [...]` — give the affected permanents these activated
  abilities (Chromatic Lantern, Cryptolith Rite).
- `grantsActivatedOf: { zone, filter, except?, only?, withTriggered?, onceEach? }` — "has all activated
  abilities of …" (rule 613.1f), read live: `zone: "graveyard"` (Necrotic
  Ooze's "all creature cards in all graveyards"; Thranduil's "Elf cards in
  your graveyard" is `ownedBy: "you"`), `"library-top"` (Skill Borrower: the
  top card of your library while it matches), `"exile"` (Rex's "all cards in
  exile with brain counters on them", a `counters` filter), `"exiled-with"` (the
  cards exiled with this permanent's stint, by an `exile { linked }` or
  `untilSourceLeaves`, rule 607.2a: Steward of the Harvest, Hazel's Brewmaster
  with `affects` over its Foods; a Forest card gives "{T}: Add {G}"),
  `"chosen-exiled"` (Koh's "the last chosen card", from `choose-exiled-card`) or
  `"battlefield"` (Experiment
  Kraj's "each other creature with a +1/+1 counter on it"; Marvin's "creatures
  you control that don't have the same name as this creature" uses the
  filter's `sameNameAsSource: false`) — a permanent with everything it has,
  granted abilities included; several such statics apply in dependency order
  (rule 613.8). The source itself is never read, nor abilities with a `zone`.
  `withTriggered` takes the cards' triggered abilities too, without those working
  only from another zone (Idris, Koh); `onceEach` is "you may activate each of
  those abilities only once each turn", kept per card (Mairsil).
  `except: "mana"` (Sharkey), `except: "loyalty"`, `only: "loyalty"` (Nicol
  Bolas, Dragon-God). Pair with `spendManaAs: { …, activating: "this" }` for
  "mana of any type can be spent to activate ~'s abilities" or `activating:
  "granted"` for Drana and Linvala's "to activate **those** abilities";
  `activatingOf: <filter>` for any permanent's (Agatha's Soul Cauldron's "abilities
  of creatures you control"). `grantPtPerCount: { aggregate: { aggregate: "sum",
  of: "mana-value", filter: {}, in: "exiled-with-source" }, pt }` is Idris's "+X/+X, where X is the exiled card's mana value".
- `grantsTriggered: [...]` — the same in layer 6 for *triggered* abilities
  (Tyrant's Familiar's Lieutenant clause). Appended after the permanent's
  printed `triggered`, so a printed ability's index — which the pending
  trigger and the stack object both carry — never shifts. The one-shot
  "gains '[trigger]' until end of turn" equivalent is the `grant-triggered`
  *effect* (§6).
- `grantsStatic: [StaticAbility, ...]` — the same in layer 6 for **static**
  abilities (rule 613.1f): Inspiring Leader's "commander creatures you own
  have 'Creature tokens you control get +2/+2'", Rune of Might's "as long as
  enchanted permanent is an Equipment, it has 'Equipped creature gets +1/+1
  and has trample'", Sedge Sliver, Cloudsteel Kirin, Criminal Past. Each
  granted static works from the object that has it (rule 113.10): its
  `affects` and `condition` read from there — `"self"` is that object, "you"
  its controller, `"attached"` what it's attached to — and two granting
  sources grant two instances. Its effects take the later of the two
  timestamps; a later loss of all abilities takes it away (613.7). Read
  through `grantedStatics`, so it reaches the layer fold (P/T, keywords,
  restrictions), "can't lose the game", untap restrictions and block rules —
  not a cost modification (Acolyte of Bahamut), a layer-4 part, or another
  `grantsStatic`. Each granted static needs its own `text` (the quoted line).
  The scaffolder reads "Equipped creature / Commander creatures you own / All
  Sliver creatures / Creatures you control has|have [keyword and] '<static>'"
  when it can read the quoted line. `granted-statics.test.ts`.
- `setBasePtFromCount: { countOf, plusPower, plusToughness, only?, toughnessMinusCount? }` — a layer-7b CDA
  (`"self"` only). `only: "power"` defines just the power, the toughness
  staying as printed (Eluge, the Shoreless Sea's "*/5"); `"toughness"` the
  reverse. `countOf` is a `CountSpec`:
  - `{ countOf: CardFilter }` — battlefield permanents matching the filter, a
    token stack counting as every token in it. "The number of lands you
    control" (Beanstalk Giant, Lumra, Bellow of the Woods) is `{ countOf: {
    type: "land", controlledBy: "you" } }`; the CDA's own object counts when
    it matches ("creatures you control" includes itself).
  - `{ countInGraveyard: CardFilter }` — cards in **all** graveyards matching
    the filter (Mortivore: `{ type: "creature" }`); add `ownedBy: "you"` for
    "in your graveyard".
  - `"cards-in-largest-opponent-hand"` (Adamaro, First to Desire), `"cards-in-all-graveyards"` (Lord of Extinction), `"cards-in-all-hands"` (Werewolf of Ancient Hunger), `"cards-in-your-hand"`
    (Psychosis Crawler), `"your-life-total"` (Serra Avatar's "power and
    toughness are each equal to your life total" — negative at negative life,
    rule 107.1b).
  - `{ playerCounters: "experience" }` — the counters of that kind its
    controller has (Daxos the Returned's Spirit: "power and toughness are each
    equal to the number of experience counters you have").
  - `{ cardTypesInGraveyard: CardFilter }` — card types among cards in
    graveyards, each once (Tarmogoyf: `{ cardTypesInGraveyard: {} }` with
    `plusToughness: 1`).
  - `{ greatestManaValueOf: CardFilter }` — the greatest mana value among
    battlefield permanents matching the filter, itself included when it
    matches, 0 with none (Karn, Legacy Reforged: `{ type: "artifact",
    controlledBy: "you" }`). Mana value only: a greatest *power* or
    *toughness* of other permanents in a CDA is still out (§15).
  - `{ devotionTo: Color[] }` — its controller's devotion (rule 700.5), its
    own pips included: Anax, Hardened in the Forge's and Renata, Called to
    the Hunt's "power is equal to your devotion to red / green" (`only:
    "power"`, printed power 0).
  - `{ basicLandTypes: "you" }` — domain: the basic land types among lands
    its controller controls (Nishoba Brawler, `only: "power"`).
  - `{ partySize: "you" }` — party: the creatures in its controller's party,
    0 to 4 (rule 700.8 — Archpriest of Iona, `only: "power"`).

  It applies in every zone (rule 604.3), so the card has that size in a
  library, hand, graveyard or the command zone too; "you" is its controller,
  i.e. its owner off the battlefield. A filter may read computed
  characteristics (a `keyword`, `power`); if that asks about the CDA's own
  object, the nested read uses its printed P/T rather than recursing.
- `restrictions: [...]` — `"cant-attack" \| "cant-block" \| "cant-be-blocked" \|
  "must-attack" \| "must-block" \| "must-be-blocked" \| "must-be-blocked-if-able"` and records (see *Combat rules*), Pacifism, Juggernaut, Lure. `"cant-be-attacked"` goes on a
  planeswalker or battle: The Aetherspark's, with `affects: { scope: "self" }` and a
  `source` condition. A restriction on declaring attackers (rule 508.1c), so an
  attacker already at it stays, and one put onto the battlefield attacking may
  choose it (rule 508.4c). `"must-block"` is "blocks
  each combat if able" (Razorgrass Screen, Grand Melee), a requirement joined
  to the blockers offer's `blockRequirements` (rule 509.1c); Iron Golem's
  "attacks or blocks each combat if able" is `["must-attack", "must-block"]`. `"cant-be-blocked"` is
  the `unblockable` keyword's rule as a restriction: for a one-shot "creatures
  you control can't be blocked this turn", a `restrict` over a `filter` —
  which, changing no characteristic, covers creatures that match later that
  turn too (rule 611.2c — Jace, Arcane Strategist's −7); a `grant-keyword-all`
  would reach only those there as it resolved. `"must-attack"` is "attacks each combat if
  able": the attack declaration has to include the creature whenever it can
  attack, at a defender its controller picks (rule 508.1d — the offer's
  `mustAttack`, checked by `combat/attacking.ts`). `"must-be-blocked"` is Lure's "all creatures
  able to block it do so"; on an attacker with menace it forces blocks only in
  pairs, as many as can be made (rule 509.1c — `combat/blocking.ts`'s
  `lurePlan`). `"must-be-blocked-if-able"` asks only for **one** blocker (two
  with menace) whenever the defender has one to spare — also a rule 509.1c
  requirement, weighed as the declaration is checked (`ifAblePlan`; the
  creatures Lure needs stay with Lure). `at: "owner"` keeps a stolen creature off its owner — the player only, so it may still attack their planeswalkers (Alexios, Deimos of Kosmos's ruling).
  `"doesnt-untap"` is "doesn't untap during its controller's untap step" on
  what the static reaches (rule 502.3) — Tractor Beam's `"attached"` scope,
  Back to Basics' `"filter"` (`doesnt-untap-restriction.test.ts`); only that
  untap step, so an effect or Seedborn Muse still untaps it. A `power` clause
  in the scope's filter can't be answered inside the fold and fails closed
  (Meekstone's "creatures with power 3 or greater" stays out).
  `"cant-turn-face-up"` refuses every turn-face-up special action (rules 701.40b, 702.37e,
  702.168d), and the `turn-face-up` effect does nothing, for what the static reaches — Unable to Scream's "as long as enchanted
  creature is face down, it can't be turned face up" (`"attached"`), Karlov Watchdog's
  "permanents your opponents control … during your turn" (`"filter"` + `condition`).
  `"cant-crew"` is "can't crew Vehicles" (rule 702.122d — Revoke Privileges'
  "can't attack, block, or crew Vehicles"): never offered for, or accepted
  in, a crew cost; a saddle cost or any other tap cost still takes it.
  The same list, until end of turn, is what the `restrict` effect imposes
  (§6).
- `combatDamageByToughness: "always" | "if-toughness-greater"` — the affected
  creatures assign combat damage equal to their **toughness** rather than
  their power (Doran, the Siege Tower with `affects: { scope: "all-creatures"
  }`; Felothar the Steadfast and High Alert over `creatures-you-control`;
  Arcades, the Strategist narrowed by `withKeyword: "defender"`).
  `"if-toughness-greater"` is the "with toughness greater than its power"
  form (Ancient Lumberknot), judged on the creature's computed P/T when its
  damage is sized; an `"always"` from any source wins over it. It changes no
  creature's power — every card's ruling says so — and the engine resizes
  combat damage alone: unblocked, blocking, split across blockers, trampling
  over, and the `assign-combat-damage` offer (`combatDamageOf` in
  `characteristics.ts`). A fight, "damage equal to its power" and a power
  condition all still read the real power.
- `crewsAs: { plus?, toughness?, saddles? }` with `affects: { scope: "self" }`
  — what the creature pays a **crew** cost with (rule 702.122a — an
  activated ability marked `crew: true`, which `crew(n)` writes): "This
  creature crews Vehicles **as though its power were 2 greater**" is `{
  plus: 2 }` (Hotshot Mechanic, the `"Pilot Token (Crews Vehicles)"` of
  Shorikai and the other Kamigawa: Neon Dynasty cards), "…**using its
  toughness rather than its power**" `{ toughness: true }` (Giant Ox).
  `saddles: true` is "saddles Mounts and crews Vehicles …" — a **saddle**
  cost (702.171a, `saddle: true`) too (Dynamite Diver, Interface Ace, the
  Aetherdrift `"Pilot Token"`); without it, saddle reads the real power.
  Teamwork (702.194a) and every other total-power cost always read the real
  power. The modified value is what the offer's `tapCost.power` shows and
  sums (`Game.tapCostPower`), so a 0-power Pilot still crews a Crew 2 alone;
  the creature's power changes for nothing else (the rulings), and the
  bonus is gone once it loses its abilities. Only the creature's own static
  — a permanent granting it to others isn't built (no card does).
- `fromGraveyard: true` — "**as long as this card is in your graveyard**, …"
  (Wonder: "… and you control an Island, creatures you control have flying";
  Anger, Brawn, Filth): the static functions only while its card is in its
  owner's graveyard (rule 113.6b) — never from the battlefield — "you" being
  the owner, and ordered by the timestamp the card got entering the
  graveyard (rule 613.7d; Anger's ruling). The rest of the "as long as" is
  an ordinary `condition`. Only what folds into characteristics reaches that
  far (a keyword, a P/T bonus, a restriction): a granted ability from the
  graveyard (Riftstone Portal's mana ability for lands) doesn't yet, and
  any other part — a replacement, a type change — would work from the
  battlefield instead, so `pool.test.ts` refuses one.
- `attackAsThoughHaste: true` — the affected creatures "can attack as though
  they had haste" (Instill Energy on `"attached"`): they may be declared as
  attackers though summoning sick (rules 302.6, 702.10b). It gives no haste:
  a `keyword: "haste"` read misses them and their {T} abilities stay shut
  (702.10c — that half is `activateAsThoughHaste`). `"your-opponents"` lifts
  it only against an opponent of this permanent's controller or a
  planeswalker one controls, whoever controls the attacker (Frenzied
  Saddlebrute, on `"all-creatures"`).
- `canAttackAsThoughNoDefender: true` — the affected creatures "can attack as
  though they didn't have defender" (Arcades, Felothar, High Alert). Lifts
  defender's "can't attack" and nothing else: summoning sickness and
  `"cant-attack"` still apply, and the creature still *has* defender. Only
  asked when attackers are declared, so a defender already attacking stays
  attacking if the permission goes away mid-combat (Arcades' ruling). The
  one-shot form is the `attack-despite-defender` effect (§6).
  `"players-who-attacked-you"` lifts it against those defenders only —
  Weathered Sentinels' "can attack players who attacked you during their
  last turn as though it didn't have defender": a player (never a
  planeswalker) who declared a creature attacking its controller during
  their own most recent turn — not one who only attacked a planeswalker, nor
  one whose creature was put onto the battlefield attacking (the O-Kagachi
  ruling on "attacked you"; `attackedYouDuringTheirLastTurn`).
- `assignAsThoughUnblocked: true` — "you may have [the affected creature] assign its
  combat damage as though it weren't blocked" (Thorn Elemental on `"self"`, Indomitable
  Might's `"attached"` — "enchanted creature's controller may have it …" — Siege Behemoth's
  creatures you control under a `source` `attacking` condition). Asked of a blocked one's
  controller as combat damage is assigned, even with a lone blocker or none left: all of it
  to what it's attacking, or the usual division — never split between them. A rule about
  how it assigns damage, not an ability it has. The one-shot form is the
  `assign-as-though-unblocked` effect (§6).
- `spellsHaveDelve: true` — "spells you cast have delve" (Teval, Arbiter of Virtue): every
  spell this permanent's controller casts, from anywhere, has delve as it's cast, read wherever
  a printed `delve` is (§3).
- `attachOnlyTo: CardFilter` (with `affects: { scope: "self" }`) — "This
  Equipment can be attached only to a creature with power 3 or greater"
  (O-Naginata, Gate Smasher): any other is a permanent it can't legally
  equip (rule 301.5c), so an equip on one resolves without moving it (701.3b)
  and it falls off a creature that stops matching (704.5n). The scaffolder
  reads the line.
- `cantBeSacrificed: true` — the affected permanents can't be sacrificed
  (rule 701.21a): Alexios, Deimos of Kosmos's own (`"self"`), or "during your
  end step, Warrior tokens you control have 'This token can't be
  sacrificed'" (a `filter` scope and a condition). Every sacrifice the engine
  makes or offers asks it (`cantBeSacrificed` in `characteristics.ts`): an
  edict or a "sacrifice a creature" cost never offers it, so another must go;
  a cost naming it ("Sacrifice ~", a Treasure's mana) can't be paid; "sacrifice
  ~" and "sacrifice that creature" leave it be (and a `sacrifice-source`'s
  "if you do" fails); a completed Saga stays; an end-step sacrifice (encore,
  "sacrifice them at the beginning of the next end step") is spent without
  taking it. The effect form, "it gains 'This creature can't be
  sacrificed'", is the `cant-be-sacrificed` effect (§6).
- `legendRuleOff: true` — "the 'legend rule' doesn't apply to [the affected
  permanents]" (rule 704.5j): Sakashima of a Thousand Faces' "to permanents
  you control" is `affects: { scope: "filter", filter: { controlledBy: "you"
  } }`, "to creature tokens you control" adds `type` and `token`, Mirror
  Gallery's "doesn't apply" an empty filter. A permanent it reaches isn't one
  of the legends the rule counts. Read live (`exemptFromLegendRule` in
  `characteristics.ts`): when the source leaves or loses its abilities the
  rule applies again at once. The copy-exception form, a copy that *has* the
  ability (Sakashima's "it has Sakashima's other abilities"), is
  `CopyExceptions.legendRuleOff` with the same `affects`.
- `notLegendaryIfToken: true` — "[this] isn't legendary if it's a token"
  (Aeve, Progenitor Ooze): no legendary supertype while it's a token on the
  battlefield — for the legend rule and for every "legendary" filter
  (`supertypesOf`). A storm copy is a token once it resolves (rule 707.10f).
  `affects` is irrelevant.
- `sharesKeywords: { from: "exiled-with-source", filter?, keywords, protection? }` — "This
  creature has flying as long as an exiled card used to craft it has flying. The same is true
  for first strike, …" (Wretched Bonemass; "a card exiled with it" is the same set): each of
  `keywords` some card exiled with the static's source has now, for as long as one does (rules
  607.2a, 702.167c). `"hexproof"` in the list brings each "hexproof from [quality]" those cards
  have too (rule 702.11d-e), and `protection: true` is "protection" in the list — every
  protection ability of theirs (rule 702.16a). `affects` says who gets them.
- `protection: { outsideCommanderIdentity? }` — Commander's Plate's "each color that's not in your commander's color identity", the static's controller's as it is now: nothing with no commander (rule 903.4f), every colour with a colourless one. Beside the rest of the shape:
- `protection: { colors?, types?, filter?, chosenColor?, chosenCardType?, exiledCardTypes?, colorsAmong?, fromPlayers?, doesntRemoveSource?, doesntRemoveAuras? }` — rule 702.16 (White Knight: `{ colors:
  ["B"] }`; a `filter` for what neither names — Basri's Lieutenant's
  multicolored, Baneslayer Angel's `{ anyOf: [{ subtype: "Demon" }, { subtype:
  "Dragon" }] }`, `{}` for everything, 702.16j — Vexilus Praetor over `scope:
  "filter"`). A filter reads the static's source as its own: Riders of Gavony's
  "creatures of the chosen type" is `{ type: "creature", ofChosenType: true }`.
  **`isSpell`** is a spell, not a card: Emrakul, the Aeons Torn's "spells that
  are one or more colors" is `{ isSpell: true, colorless: false }`, Emrakul, the
  World Anew's `{ anyOf: [{ isSpell: true }, { isSpell: false, cast: true,
  enteredThisTurn: true }] }`; a permanent and an ability aren't spells, nor is
  an Aura put onto the battlefield. **`fromPlayers`** is a player as the quality
  (702.16k): `"opponents"`, "each of your opponents" (Absolute Virtue on
  `playerProtection`), or `"chosen"`, the player chosen as it entered (True-Name
  Nemesis, `choosePlayerOnEnter`): what they control, or own with no controller
  (a card in a graveyard), and a spell or ability they control. `exiledCardTypes`
  is "each of the exiled card's card types" (Mirror Golem, `exile`'s `linked`).
  `chosenColor` is "protection from **the
  chosen color**", the colour the source named as it entered (`chooseOnEnter`
  over the five — Flickering Ward), `chosenCardType` "from the chosen card
  type" (`chooseOnEnter: [...CARD_TYPE_CHOICES]` — Serra's Emissary);
  `colorsAmong` is "each color among permanents you control" (a filter, Pledge of Loyalty); `doesntRemoveAuras` is "This effect doesn't remove Auras", every one of them (Spectra Ward); `doesntRemoveAttached` is "This effect doesn't remove Auras and Equipment you control that are already attached to it" (rule 702.16p — Benevolent Blessing: its controller's attachments on the creature no later than the Aura itself, by timestamp, rule 613.7e; nothing of the quality can become attached afterwards); `doesntRemoveSource` is "This effect
  doesn't remove this Aura" (rule 702.16n): that instance doesn't make its own
  Aura fall off, though it stops everything else and another instance of the
  same colour or card type removes the Aura as normal (Tattoo Ward). Granting
  protection for a while is the `grant-protection` effect, whose `from` takes
  `fromPlayers: "opponents"` too, fixed as it resolves (Cliffside Rescuer).
- `hexproofFrom: { colors?, types?, filter? }` — hexproof from a quality (rule
  702.11d): an opponent's matching spell, or an ability from a matching source
  they control, can't target it. Sporeweb Weaver's "hexproof from blue" is
  `{ colors: ["U"] }`, "hexproof from each color" all five (Breaker of
  Creation), Nevinyrral's "from artifacts, creatures, and enchantments"
  `{ types: [...] }`, Thrun's "can't be the target of nongreen spells your
  opponents control or abilities from nongreen sources" `{ filter: {
  notColors: ["G"] } }`. Targeting only — not blocking, damage or enchanting.
  "Hexproof from **each of its colors**" (Tam, Mindful First-Year's "each
  other creature you control has …") is `{ ownColors: true }`: each affected
  permanent's own colours as they are now, none for a colourless one.
  Granting it until end of turn (Skrelv's chosen color) isn't built.
  The printed "can't be the target of …" lines that aren't the keyword take
  qualifiers (rules 601.2c, 602.2b): `spellsOnly` ("… of black or red spells
  your opponents control" — Fiendslayer Paladin; Tetsuo's "Aura spells" is
  `{ filter: { subtype: "Aura" }, spellsOnly: true, anyController: true }`),
  `abilitiesOnly` ("… of abilities from artifact sources" — `types:
  ["artifact"]`), `anyController` (no "your opponents control" — Mercenary
  Informer's "black spells or abilities from black sources" stops its own
  controller too). No colour, type or filter names every spell or ability:
  Dense Foliage's "Creatures can't be the targets of spells" is `affects: {
  scope: "all-creatures" }, hexproofFrom: { spellsOnly: true, anyController:
  true }`; Shielding Plax's "spells or abilities your opponents control" is
  `{}`. Each of these prose forms also takes `notHexproof: true`: it isn't a
  hexproof ability, so an effect that makes a permanent lose hexproof
  (Shadowspear) leaves it (Shanna, Sisay's Legacy's "can't be the target of
  abilities your opponents control" is `{ abilitiesOnly: true, notHexproof:
  true }`). The keyword "hexproof from activated and triggered abilities"
  (Volatile Stormdrake) is `{ abilitiesOnly: true }` alone — static abilities
  never target — and a loss of hexproof takes it (702.11e). A one-shot "…
  this turn" form isn't built.
- `prohibits: [{ act: "be-targeted", object: { inZone: "graveyard" }, by? }]` — "Cards in graveyards can't be the targets of spells or abilities" (Ground Seal; Tomik's `{ inZone: "graveyard", type: "land" }`, `by: "opponents"`).
- `bandsWithOther: CardFilter` — "bands with other [quality]" (rule 702.22b),
  the quality as a filter: the Legends lands grant "bands with other legendary
  creatures" `{ type: "creature", supertype: "legendary" }` to a colour's
  legends (`affects: { scope: "filter", … }` — Cathedral of Serra); a token
  prints it on itself (Wolves of the Hunt, `{ type: "creature", name: "Wolves
  of the Hunt" }`). Adds the `bands-with-other` keyword; see **Banding**.
- `landwalk: CardFilter | "chosen-land-type"` — landwalk of a kind no keyword
  names (rule 702.14), the land as a filter; see **Landwalk**.
- Ward is **not** a static — it's a triggered ability; see `ward(...)` in §9.
- `costModification: { applies: CardFilter, reduceGeneric?, increaseGeneric? }`
  — Foundry Inspector, Thalia. `affects` is ignored — `applies` says what it
  hits. Optional refinements:
  - `increaseColored: "{B}"` — "Black spells you cast cost {B} more to cast"
    (Derelor, the Leeches): coloured pips added before any reduction (rule
    601.2f), to an alternative cost as well (118.9d). The mirror of
    `reduceColored`.
  - `minimumMana: 3` — "each spell that would cost less than three mana to
    cast costs three mana to cast" (Trinisphere: `{ applies: {}, minimumMana:
    3 }` under `condition: { kind: "source", filter: { tapped: false } }`): a
    floor on the total cost once it's determined (rule 601.2f), after every
    increase and reduction and on a free or alternative cost too, the
    difference added as generic mana; delve and convoke can pay it.
  - `caster: "you" | "opponent"` — "spells you cast" / "spells your
    opponents cast", judged against whoever is actually casting it (not the
    card's controller, so a card cast out of someone else's graveyard is the
    caster's spell). Prefer this over `applies.controlledBy` for new cards.
  - `exceptOnCastersTurn: true` — "except during its controller's turn"
    (Defense Grid): nothing during the turn of the player casting the spell.
  - `castFrom: ZoneType` — only spells cast from that zone: Green Goblin's
    "spells you cast from your graveyard cost {2} less to cast" is `{ applies:
    {}, caster: "you", castFrom: "graveyard", reduceGeneric: 2 }`.
  - `perTarget: true` — the amounts are "for each target" (Hinata,
    Dawn-Crowned): multiplied by the number of *distinct* players and objects
    the spell is cast targeting (the card's ruling — one creature named by two
    "target creature"s counts once). The cost is worked out from the targets
    actually chosen; `legalActions` offers such a spell with a `targetCount`
    range it's affordable at.
  - `firstEachTurn: true` — "the first creature spell you cast each turn
    costs {1} less": skipped once the caster has cast any spell matching
    `applies` this turn.
  - `targeting: CardFilter` / `targetingSource: true` — only a spell with a
    target matching that (Killian, Ink Duelist's "spells you cast that target
    a creature cost {2} less") or with this permanent among its targets
    (Spellwild Ouphe). With `perTarget`, per matching target (Battlefield
    Thaumaturge's "for each creature it targets"). Read off the chosen targets
    (601.2c, 601.2f); a spell only affordable with it is offered with only the
    targets that earn it. For "cost more", `targetedBySpellsCost`, which also
    takes `targetingYou: true` (Monastery Siege's "target you or a permanent
    you control").
  - `castFrom` may be a list, and `castFromAnyones: true` reads any player's
    graveyard (Aven Interrupter's "from graveyards or from exile").
- Casting and activation rules on a static: `activateAsThoughHaste: CardFilter`
  ("as though those creatures had haste" — Thousand-Year Elixir, rule 302.6: {T}
  and {Q} costs only, mana abilities too); `loyaltyActivationsEachTurn: 2` (Oath
  of Teferi, rule 606.3; `{ times: 2, of: "self" }` for the permanent's own
  alone — Urza, Planeswalker's "the loyalty abilities of Urza"); `boastsEachOfYourTurns: 2` (Birgi, God of Storytelling,
  rule 702.142b); `activate`'s `only: "loyalty"` (The Immortal Sun),
  its `except: ["loyalty"]` (Overwhelming Splendor) and
  `cast`'s `unless: "sorcery-timing"` ("each opponent can cast spells only any time
  they could cast a sorcery" — Teferi, Time Raveler). On an activated ability,
  `onlyOpponents: true` with `anyPlayer: true` ("only your opponents may
  activate this ability" — Detention Vortex). A legendary instant or sorcery
  needs nothing: rule 205.4e is the engine's own check. "As though it had flash
  if you pay {2} more to cast it" is `kicker: { cost: "{2}", keyword: "flash",
  flash: true }` (Rout; rule 601.3c), never a kicked spell to anything else. A
  `player-effect`'s `duration` may be `"until-end-of-your-next-turn"` (Single
  Combat); a `prohibit` effect's `who` takes `{ ownerOf: 0 }` and its filter
  `sameNameWith` (Reflector Mage, the ban before the return, so a token's
  name is still read).
  - `reduceColored: "{W}{B}"` (+ `coloredOnly?`) — takes coloured pips off
    (Edgewalker's "Cleric spells you cast cost {W}{B} less"): each symbol
    takes a pip of its colour, else a hybrid pip containing it (rule 118.7e),
    else one generic (118.7b/c) — unless `coloredOnly: true`, the printed
    "this effect reduces only the amount of colored mana you pay".
    `reduceColoredTimes` (an `EffectAmount`) applies it that many
    times: Eluge, the Shoreless Sea's "{U} (or {1}) less to cast for each
    land you control with a flood counter on it".
  - `optionalLife: 2` — the Defilers' "As an additional cost to cast green
    permanent spells, you may pay 2 life. Those spells cost {G} less to cast
    if you paid life this way. This effect reduces only the amount of green
    mana you pay" (Defiler of Vigor, Defiler of Dreams: `applies: { colors:
    ["G"], typesAnyOf: [the five permanent types] }`, `reduceColored: "{G}"`,
    `coloredOnly: true`): an optional additional cost the caster announces
    (rule 601.2b), once a spell for each such permanent (the rulings), the
    reduction only with it paid. Every set of them is a `cast-spell` offer of
    its own, naming the permanents in `optionalLife` (`optionalLifeText`
    "paying 2 life for Defiler of Vigor"); not offered without the life
    (119.4) or on a face-down cast. A spell cast by an effect as it resolves
    (`cast-now`) is never offered it.

  A generic reduction bigger than the generic part carries on to the `{2}`
  half of twobrid pips (`{2/W}`), but only the ones actually paid with
  generic mana — the Spectral Procession ruling. Reaper King under Foundry
  Inspector is `{W}{U}{B}{R}` plus one mana without a Forest.
- `abilityCostModification: { applies: CardFilter, reduceGeneric?, increaseGeneric?, leavesOneMana?, exceptManaAbilities?, ninjutsu?, byOpponents?, targeting? }` — `byOpponents` and `targeting: CardFilter` with `increaseGeneric` are "abilities your opponents activate that target a Merfolk you control cost {2} more to activate" (Kopala, with `anyZone`): once per activation, the filter read from this static's controller's side, a target too dear left out of the offers. `targeting` with `reduceGeneric` is the reduction ("…that targets a creature you control costs {2} less"), an activation only it pays for offered with just the targets that earn it; `firstEachTurn: true` with it is "**the first** activated ability you activate during your turn that targets a creature you control" (Professor Hojo: `byYou`, `anyZone`, the static's `condition: { kind: "your-turn" }`) — used up by any earlier activation of that player's this turn with such a target, read from the journal as the target was then.
  (`ninjutsu: true`: only ninjutsu abilities its controller activates, the
  card in a hand or the command zone — Silver-Fur Master, `applies: {}`)
  — the same for *activation* costs (rule 602.2b): "Activated abilities of
  Foods you control cost {1} less to activate" (Sam, Loyal Attendant) is
  `{ applies: { subtype: "Food", controlledBy: "you" }, reduceGeneric: 1 }`,
  matched against the ability's source from this static's controller's view,
  and only while that source is a permanent — "activated abilities of
  artifacts you control" never reaches cycling, unearth or any other ability
  of a card in a hand or graveyard (the Forensic Gadgeteer and Training
  Grounds rulings). Generic only, increases first, never below `{0}`, and an
  increase puts a cost on an ability with no mana in it (Suppression Field's
  shape, `applies: {}`). `leavesOneMana` is "this effect can't reduce the mana
  in that cost to less than one mana" (Training Grounds, Forensic Gadgeteer):
  every symbol left counts, so `{2}{G}` less 2 is `{G}` and `{2}` is `{1}`, a
  cost with no mana is left alone, and these reductions go before any
  unlimited one (the order that leaves least to pay). Mana abilities are
  modified too — a Signet's `{1}` by hand, and a converter as the payment
  planner prices it — unless `exceptManaAbilities` ("…unless they're mana
  abilities": Suppression Field, Zirda). `legalActions`, activation and the
  `{X}` ceiling all read the modified cost.
  **One kind of ability** (2026-10-31): `abilityKind: "equip" | "exhaust" |
  "cycling" | "loyalty"` beside `applies` (which still filters the source).
  `byYou: true` is "…you activate"; `targetingSource: true` is "…that target
  this creature" (only an activation that chose the static's source as a
  target — offered with only those targets when the full price is out of
  reach); `increaseLoyalty: N` (with `"loyalty"`) is "cost an additional
  [+N]", combined into the loyalty cost by rule 606.5 ([+1] → [+2], [−4] →
  [−3], [−X] removes X−1; 606.6 reads the combined cost). An equip ability
  is one whose text starts "Equip" (`isEquipAbility` — the `equip()` helper
  and every hand-written one); cycling is `CardDefinition.cycling`'s, reached
  in the hand. Bureau Headmaster `{ applies: {}, abilityKind: "equip", byYou:
  true, reduceGeneric: 1 }`; Bladehold War-Whip's "of other Equipment"
  `applies: { subtype: "Equipment", isSource: false }`; Dwarven Mauler adds
  `targetingSource: true`; Boom Scholar's "exhaust abilities of other
  permanents you control" `applies: { controlledBy: "you", isSource: false }`
  without `byYou`; Fluctuator `abilityKind: "cycling", byYou: true`; Eidolon
  of Obstruction `applies: { type: "planeswalker", controlledBy: "opponent"
  }, abilityKind: "loyalty", increaseGeneric: 1`; Carth the Lion `applies: {
  type: "planeswalker" }, abilityKind: "loyalty", byYou: true,
  increaseLoyalty: 1`.
- `mayPlay` — see **`mayPlay` / `grant-play` / `impulse-exile`** in §6: a permission to play cards from a graveyard, exile or the top of your library.

- `replacement: { event: "would-proliferate", times }` — "If you would
  proliferate, proliferate twice instead" (Tekuthal, Inquiry Dominus): this
  permanent's controller, each time its own question (rule 701.34a); several
  multiply (rule 614.5).
- `replacement: { event: "would-explore", filter, instead: { modify: { times: 2 } } }` — "If a creature you
  control would explore, instead it explores, then it explores again" (Topography Tracker; `filter: { type:
  "creature", controlledBy: "you" }`, the explorer as it last was if it has left): each instruction to explore
  becomes that many whole explorations (rule 701.44a), and several multiply (rule 614.5). The scaffolder reads it.
- `replacement: { event: "would-copy-spell", additional }` — "If you would copy
  a spell one or more times, instead copy it that many times plus an additional
  time. You may choose new targets for the additional copy" (Twinning Staff):
  this permanent's controller, once per instruction to copy, with new targets
  always offered on the additional copy. Spells only: not an ability's copy,
  and not a copy of a card.
- `payLifeForPips: Color` — "For each {B} in a cost, you may pay 2 life rather
  than pay that mana" (K'rrik, Son of Yawgmoth): every mana cost this permanent's
  controller pays — a spell's, an activation's, a special action's, a "you may
  pay" — a hybrid pip counting if it may be paid as that colour, generic never.
  The player says how many (`phyrexianPips` / `phyrexianLife`, as for Phyrexian
  mana); life pays no Phyrexian symbol (compleated, rule 702.150a).
- `spendManaAs: { as: "any-color" | "any-type" | { unit, as }, spell? }` — how this
  permanent's controller may spend mana (rules 118.14, 609.4b):
  `"any-color"` is "you may spend mana as though it were mana of any
  color" (Chromatic Orrery) — any unit pays a coloured pip, but a `{C}` pip
  still wants colourless mana; `"any-type"` is "mana of any type can be
  spent", `{C}` included; `{ unit: "W", as: "R" }` is one type of mana only
  (Sunglasses of Urza's "white mana as though it were red mana", and
  `{ unit: "C", as: "any-color" }` on an exile's `mayPlay`, Abstruse
  Appropriation). Without `spell` it covers every mana cost they
  pay (Orrery); with it, only casting a spell that matches (Vizier of the
  Menagerie's "creature spells", from anywhere — its ruling). It changes how
  a cost may be paid, never the cost: the spell's mana value, converge's
  colours spent and "mana from a Treasure" all read the mana actually
  spent. A *permission's* own spending rule rides on it instead —
  `spendAs` on any permission (`mayPlay`, `impulse-exile`) — and
  applies only to a spell cast under that permission (rule 118.14).
  `mana-spending-rules.test.ts`.
- `extraLandsPerTurn: number` — additional land drops per turn for this
  permanent's controller (Oracle of Mul Daya, Azusa, Lost but Seeking — needed-cards
  P16). `affects` is ignored. With `extraLandsForEachPlayer: true` it reaches
  every player instead (Rites of Flourishing: "each player may play an
  additional land on each of their turns").
- `doubleEntryTriggers: { filter? }` — Panharmonicon-style doubling (needed-cards
  P15 — Starfield Vocalist): if a permanent entering causes a triggered ability
  of this permanent's controller to trigger, it triggers an additional time.
  `filter`, when present, narrows which *entering* permanent counts. `affects`
  is ignored — this only ever doubles its own controller's triggers.
- `suppressEntryTriggers` — "permanents entering don't cause abilities of
  permanents your opponents control to trigger" (`"opponents"`, Elesh Norn,
  Mother of Machines) or anyone's (`"everyone"`). The object form `{ who,
  entering: CardFilter }` narrows what is entering: Torpor Orb's "creatures
  entering don't cause abilities to trigger" is `{ who: "everyone",
  entering: { type: "creature" } }` — a land's landfall still triggers.
- `suppressWardTriggers: CardFilter` — "ward abilities of [these] don't trigger" (Nowhere to Run,
  `{ type: "creature", controlledBy: "opponent" }`): a matching permanent's ward (the `ward`
  helper's ability, printed or granted) doesn't trigger as it becomes a target.
- `doubleTriggers: { cause, filter? }` — "if [something] causes a triggered
  ability of a permanent you control to trigger, that ability triggers an
  additional time", for **any** trigger that event causes. `cause` is
  `"enters"` (Elesh Norn, Mother of Machines), `"attacks"` (Isshin — a
  per-attacker or a whole-declaration trigger; leave `filter` off for it),
  `"combat-damage-to-player"` (Felix Five-Boots), `"cast-or-copy"` (Veyran,
  Voice of Duality: `filter: { typesAnyOf: ["instant", "sorcery"],
  controlledBy: "you" }` is "you casting or copying an instant or sorcery
  spell"), `"dealt-damage"` ("a creature you control being dealt damage" —
  either end of that damage's triggers), `"dies"` (Teysa Karlov: "a
  creature dying" — dies and leaves-the-battlefield triggers, `filter`
  matched as it last existed) or `"draws"` (Krang, the All-Powerful: "a
  player drawing a card"). `filter` narrows the permanent, spell, copy or
  card the event is about: Traveling Chocobo's "a land or Bird you control
  entering" is `{ anyOf: [{ type: "land" }, { subtype: "Bird" }], controlledBy:
  "you" }`.
- `doubleTriggersOf: { filter?, selfAndEquipment?, others?, spells?, host? }` — the same, keyed on
  **whose** ability it is: "if a triggered ability of an Ally you control
  triggers" (Katara, the Fearless: `filter: { subtype: "Ally", controlledBy:
  "you" }`), "…of a creature you control with power 2 or less" (Delney).
  `selfAndEquipment` is "…of ~ or an Equipment attached to it" (Cloud, Midgar
  Mercenary, with `condition: { kind: "source", filter: { equipped: true } }`
  for "as long as ~ is equipped"). Only permanents' abilities — a spell's
  "when you cast this" only with `spells: true` (Echoes of Eternity), a
  command-zone card's never — and a
  leaves-the-battlefield ability's source is matched as it last existed. The
  filter reads this permanent as its source: Roaming Throne's "another
  creature you control of the chosen type" is `{ filter: { type: "creature",
  controlledBy: "you", ofChosenType: true }, others: true }`. `host: true` is
  "a triggered ability of **equipped creature**" (Wizard's Staff): the
  permanent this one is attached to, whoever controls it, its granted
  abilities too (the Staff's prowess) and its dies trigger. All
  the doublers add up: an Ally's attack trigger under Katara and Isshin fires
  three times.

**`condition?`** (`StaticCondition`) gates the *whole* static — when false it
contributes nothing. The same union is a triggered ability's intervening-if
clause (section 9):

- `{ kind: "controls", filter: CardFilter, atLeast: number, excludeSelf?,
  excludeTarget? }` — Kird Ape. A **static**'s condition never counts its own
  permanent (the scan would recurse into the characteristics being computed),
  but a triggered ability's intervening-if and a `conditional` effect's
  condition do (resolution is outside the layer fold): `excludeSelf` is "if
  you control **another** Wizard" there. `excludeTarget: i` leaves out target
  slot `i` ("a creature other than that creature") and only means anything
  inside a `conditional` effect, where there are targets. `distinctNames: true`
  counts names, not permanents — The Necrobloom's "seven or more lands with
  different names" (`{ filter: { type: "land" }, atLeast: 7, distinctNames:
  true }`), Field of the Dead's as an intervening if (with `countsSelf`, since it's
  one of the lands), Maze's End's ten Gates; a face-down permanent has no name, and a Room
  has one for each unlocked door (Promising Stairs). `sharingAName: true` counts
  only the most of them with one name in common (rule 201.2a) — Endless Atlas's
  "three or more lands with the same name", Chrome Replicator's "two or more
  nonland, nontoken permanents with the same name as one another" (a trigger's
  count, its own permanent in it), Mechanized Production's eight artifacts, a
  `conditional` step after its token. `sharingACreatureType: true`
  counts only the most of them with one creature type in common —
  Graxiplon's "three or more creatures that share a creature type", a
  changeling counting toward every type. The opposite switch,
  `countsSelf: true`, puts a static's own permanent back into the count when the
  printed count includes it — Jetmir, Nexus of Revels: "as long as you control
  three or more creatures", Jetmir being one — and keep that `filter` to
  type/subtype/colour clauses, which are answered without a characteristics
  fold. `excludeTriggerObject: true` leaves out the permanent whose entering
  fired the trigger — Valakut, the Molten Pinnacle's "if you control at least
  five **other** Mountains", asked as it triggers and as it resolves.
- `{ kind: "aggregate", value: AggregateSpec, compare: NumCompare }` — a sum
  or maximum compared against a number (Finneas, Ace Archer: "if creatures
  you control have **total power 10 or greater**" is `{ value: { aggregate:
  "sum", of: "power", filter: { type: "creature", controlledBy: "you" } },
  compare: { op: "gte", n: 10 } }`). A token stack counts once per token.
  Same self rule as `controls`: a static leaves its own permanent out of the
  total; a trigger or `conditional` counts it unless `value.excludeSelf`; on a
  static, the condition's `countsSelf: true` puts it back (Hundred-Battle
  Veteran's "three or more different kinds of counters among creatures you
  control", `aggregate: "distinct"`, `of: "counter-kind"`). A `distinct` read is a
  threshold too: Omnivorous Flytrap's "six or more card types among cards in your
  graveyard" is `of: "card-type"`, `filter: { ownedBy: "you" }`, `in:
  "graveyards"`; Avatar of Woe's "ten or more creature cards total in all
  graveyards" a `"count"` there. `compare: "prime"`: Zimone, All-Questioning's
  "you control a prime number of lands".
- `{ kind: "source-greatest", of, filter, strict? }` — the source's own
  power / toughness / mana value is the greatest among permanents matching
  `filter` (from its controller's view — `{ type: "creature" }` is every
  creature). `strict: true` is "greater than **each other** creature's
  power", where a tie fails; without it, "has the greatest power among …",
  where a tie still has the greatest. Vacuously true with nothing else
  matching; another member of the source's own token stack is another
  creature with the same value. On a static, the source's own value is read
  with that static switched off, so a static whose own P/T bonus changes the
  answer isn't modeled.
- `{ kind: "most-common-color", color?, sharedBy?, among?, untied? }` — the most
  common color among permanents (rule 105.2), each counted once per color, a
  token stack once per token, read at layer 5 so a P/T static can ask: `color`
  (`"W"` … or `"chosen"`) — Ruham Djinn's "as long as white is the most common
  color among all permanents or is tied"; `sharedBy` — "shares a color with the
  most common color or a color tied", `"attached"` (Heroic Defiance, under a
  `not` for its "unless") or `{ target: n }` at resolution (Tsabo's Assassin,
  Barrin's Unmaking); `among: { nontoken, chosenPlayer }` and `untied` — Call to
  Arms, with its state trigger on the `not`.
- `{ kind: "controls-greatest", of, filter }` — you control **the** permanent
  matching `filter` with the greatest power / toughness / mana value, or one
  tied for it, among every matching permanent whoever controls it (Thickest
  in the Thicket: `{ of: "power", filter: { type: "creature" } }`). False
  when you control none; leave `controlledBy` out of `filter`. On a trigger's
  `condition` it's an intervening if, asked again on resolution (rule 603.4 —
  Padeem, Consul of Innovation: `of: "mana-value"`, `{ type: "artifact" }`).
- `{ kind: "opponent-controls", filter: CardFilter, atLeast: number }` — *one*
  opponent must meet the count on their own (Defense of the Heart: "if an
  opponent controls three or more creatures").
- `{ kind: "opponent-controls-more", filter: CardFilter, activePlayerOnly? }` — *one* opponent
  controls more matching permanents than you (Land Tax, Knight of the White
  Orchid: "if an opponent controls more lands than you"). Your side counts
  every matching permanent you control, the source included.
  `activePlayerOnly: true` asks only the player whose turn it is — Keeper of
  the Accord's "at the beginning of each opponent's end step, if **that
  player** controls more creatures than you".
- `{ kind: "opponents-control-total", filter: CardFilter, atLeast: number }` —
  a combined count summed across *every* opponent (Turbulent Fen: "unless your
  opponents control eight or more lands" — plural "opponents" sums, unlike
  `opponent-controls`'s singular "an opponent").
- `opponent-controls`' `atMost` bounds the one opponent's count from above:
  Hagra Mauling's "if an opponent controls **no** basic lands" is
  `{ kind: "opponent-controls", filter: { type: "land", supertype: "basic" }, atLeast: 0, atMost: 0 }`.
- `{ kind: "your-turn" }`
- `{ kind: "turns-taken", atMost }` — you've taken at most that many turns this
  game, the one under way included (extra turns count, a skipped one doesn't).
  `FIRST_THREE_TURNS` in `helpers.ts` is "your first, second, or third turn of
  the game", with `your-turn`: Starting Town's `tappedUnless`, Serra Avenger's
  `castOnlyIf` (its `not`).
- `{ kind: "extra-turn" }` — this turn is an extra turn, whoever's (rule 500.7):
  Medomai the Ageless's "can't attack during extra turns" is a self static's
  `restrictions: ["cant-attack"]` with this `condition`.
- `{ kind: "devotion", colors, atLeast?, atMost? }` — your devotion (rule
  700.5) to one colour or two (a `{W/B}` once for "white and black"),
  inclusive bounds, the static's own permanent counting: the Theros Gods'
  "less than five" is `atMost: 4` (`godDevotion` — §4's `removeTypes`), March
  of the Canonized's intervening "if your devotion to white and black is seven
  or greater" `{ colors: ["W", "B"], atLeast: 7 }`.
- `{ kind: "player-counters", counter, who: "you" | "opponent" | "that-player", atLeast }` —
  a player has at least that many counters of a kind; `"opponent"` is *one*
  opponent on their own. Corrupted ("as long as an opponent has three or more
  poison counters") is `{ counter: "poison", who: "opponent", atLeast: 3 }`.
  `"that-player"` is the player a resolving effect is about — impulse-exile's
  `whoseIf` (Ixhel's "each opponent who has three or more poison counters",
  §6); a static has no such player, and reads it as false.
- `{ kind: "threshold" }` — 7+ cards in your graveyard.
- `{ kind: "hand-size", atMost?, atLeast?, who? }` — cards in your hand,
  inclusive (Flubs, the Fool); `who: "each-player"` is every player still in
  the game — Howltooth Hollow's "if each player has no cards in hand" is
  `{ who: "each-player", atMost: 0 }`.
- `{ kind: "library-size", who, atMost?, atLeast?, compare? }` — cards in a
  library, inclusive: yours (`"you"`), or some one library of a player still
  in the game, yours included (`"any-player"` — Shelldock Isle's "if a library
  has twenty or fewer cards in it"). `compare` takes an `{ amount }` bound as a
  `conditional` applies: Thassa's Oracle's "if X is greater than or equal to
  the number of cards in your library" is `{ op: "lte", n: { amount: {
  devotionTo: "U" } } }` (it fails closed anywhere nothing binds it).
- `{ kind: "spells-cast-this-game", named, atLeast }` — you've cast at least
  `atLeast` spells named `named` this game (`PlayerState
  .spellNamesCastThisGame`; a copy isn't cast). Approach of the Second Sun's
  "you've cast another spell named ~ this game", asked as it resolves beside
  `{ kind: "source", filter: { castFrom: "hand" } }`, is `atLeast: 2` — the
  resolving spell is one of them.
- `{ kind: "cards-in-graveyard", atLeast, filter?, whose?, excludeSelf? }` — `atLeast` cards
  in your graveyard matching `filter` (Oversold Cemetery: four creature cards);
  `whose: "an-opponent"` is "if an opponent has eight or more cards in their
  graveyard" (Zendikar Rising's Rogues — Blackbloom Rogue), each opponent's
  graveyard counted on its own. `excludeSelf` leaves out the card asking, when
  it's there: Proft, Sinister Mastermind's `castOnlyIf`, seven *other* cards when
  cast from a graveyard (the ruling).
- `{ kind: "attacked-you-last-turn", by? }` — a player declared a creature
  attacking you during their last turn, the player and not a planeswalker of
  yours. Avenge's "if a player attacked you during their last turn" has no `by`;
  O-Kagachi's "if that player attacked you …" is `by: "that-player"`.
- `{ kind: "life-total", who?, atLeast?, atMost? }` — a life total, inclusive:
  Bilbo, Birthday Celebrant's "activate only if you have 111 or more life"
  is `atLeast: 111`; "at most half your starting life total" is `atMost:
  "half-starting"` (rounded down). `who` is `"you"` (default), `"opponent"`
  (some opponent), `"each-opponent"` (every opponent) or `"that-player"` — the
  player a trigger or `for-each-player` is about, in a `conditional` (Ezio
  Auditore da Firenze's "if that player has 10 or less life"). A bound may be
  `{ startingPlus: n }`, the starting life total plus `n` (rule 103.4):
  Righteous Valkyrie's "at least 7 life more than your starting life total"
  is `atLeast: { startingPlus: 7 }`, "greater than your starting life total"
  `{ startingPlus: 1 }`, "greater than or equal to" `{ startingPlus: 0 }`.
- `{ kind: "of-player", player: ConditionPlayer, condition }` — **any condition
  read as though another player were its "you"** (2026-10-30): their hand,
  life, poison, graveyard, turn stats, what they control. `player` is
  `"that-player"` (a trigger's or `for-each-player`'s player — an attack
  trigger's defending player: Septic Rats' "if defending player is
  poisoned"), `"active-player"` (a step trigger's "that player": Lavaborn
  Muse's "at the beginning of each opponent's upkeep, if that player has two
  or fewer cards in hand" is `{ player: "active-player", condition: { kind:
  "hand-size", atMost: 2 } }`), `{ target: n }` (Hidetsugu's Second Rite's "if
  target player has exactly 10 life"), `{ controllerOf: n }`, or
  `"defending-player"` — the player the source creature is attacking (rule
  802.2a), which a static can read: Bouncing Beebles' "can't be blocked as
  long as defending player controls an artifact" (nobody while it isn't
  attacking; "can't attack unless defending player …" is
  `unlessDefender` on a `cant-attack` record instead, asked per attack declared). Works
  as an intervening-if (asked with the trigger's "that player" as it
  triggers and resolves), a `conditional`, an activation condition; on a
  static, only `"active-player"`, `"defending-player"` and `"host-controller"`
  (the controller of the permanent this one is attached to) mean anything. Prefer it over a
  kind's own `who: "that-player"`.
- `{ kind: "player-compare", stat, compare, than }` — one number of yours
  against other players' (2026-10-30). `stat` is `"life"`, `"hand"` or `{
  controls: CardFilter }`; `compare` `"more"`, `"fewer"` or `"at-least"` (the
  most, ties included); `than` `"each-opponent"` (every one, and there must be
  one — "each other player" in a free-for-all), `"an-opponent"` (some one) or a
  `ConditionPlayer`. Akuta's "if you have more cards in hand than each
  opponent": `{ stat: "hand", compare: "more", than: "each-opponent" }`;
  "if an opponent has more life than you" is you having **fewer** than an
  opponent: `{ stat: "life", compare: "fewer", than: "an-opponent" }`; Robber
  of the Rich's "if defending player has more cards in hand than you" `than:
  "that-player"`. A spell's own: Pulse of the Dross's "if that player has more
  cards in hand than you" is `than: { target: 0 }`, Pulse of the Forge's "that
  player or that planeswalker's controller" `than: { controllerOf: 0 }`.
  Under `of-player` it's that player's number (Rivalry's "if that player controls
  more lands than each other player"). `countPlayers`' `where` counts with it:
  Wojek Investigator's "for each opponent who has more cards in hand than you".
  **Compose these before asking for an option** (2026-11-03). The Backgrounds'
  "if no opponent has more life than that player" is `{ kind: "not", of: { kind:
  "of-player", player: "an-opponent", condition: { kind: "player-compare", stat:
  "life", compare: "more", than: "that-player" } } }` — the attacker's opponents
  only (the ruling), which `each-opponent` under an `of-player` of that player
  wouldn't say, since the attacker is one of theirs. Archaeomancer's Map's "if
  that player controls more lands than you": an `enters-battlefield` trigger's
  "that player" is who it entered under, so `compare: "fewer", than:
  "that-player"`. Unified Will's "more creatures than that spell's controller":
  `than: { controllerOf: 0 }`. Peer Pressure's "more creatures of that type
  than each other player": `stat: { controls: { type: "creature", subtype:
  "$chosen" } }` inside its `choose-creature-type`. "Its controller controls no
  other creatures": `of-player` over `not` `controls`, `"host-controller"` with
  `excludeHost` (Predator's Gambit, `countsSelf` too), `{ controllerOf: 0
  }` with `excludeTarget: 0` (Skulking Killer).
- `for-each-player`'s **`whoIf`** — "each player **who** …": only the players
  for whom the condition holds, read with each as `"that-player"` and all
  found before any acts. Depopulate's "each player who controls a
  multicolored creature draws a card" is `whoIf: { kind: "of-player", player:
  "that-player", condition: { kind: "controls", … } }`; Tectonic Hellion's
  "each player who controls the most lands" an `of-player` over `{ kind:
  "player-compare", stat: { controls: { type: "land" } }, compare: "at-least",
  than: "each-opponent" }`. **`except`** (a `ChosenPlayerRef`) is "each player
  **other than** …": Fractured Identity's `except: { controllerOf: 0 }`,
  the controller it had as it was exiled. **`whoseAmount`** keeps only the
  players for whom an amount read for them is 1 or more: Winds of Abandon's
  "for each creature exiled this way, its controller searches their library
  for a basic land card" is `whoseAmount: { thisWay: "exiled", who: "each" }`
  around a `search-library` of `who: "that-player"` whose `max` is that same
  amount (a search's `min`/`max` are read for its searcher), with
  `choicesHeld` — a player none of whose creatures went neither searches nor
  shuffles.
- A trigger's **`whileCondition`** reads the player its event named as
  `"that-player"`: Wedding Ring's "an opponent **who controls an artifact named
  Wedding Ring** draws a card **during their turn**" is an `of-player` over
  `controls` and `your-turn`, asked only as the event happens (rule 603.1).
- `controls`' **`anyController: true`** counts every player's permanents —
  "if there are four or more creatures on the battlefield" (Planar Collapse),
  Harbor Serpent's "can't attack unless there are five or more Islands on the
  battlefield". `monarch`'s `who: "nobody"` is "if there is no monarch".
- `{ kind: "cards-in-exile", atLeast, filter? }` — cards in exile, every
  player's (face-down ones too; tokens aren't cards): Ketramose, the New
  Dawn's "can't attack or block unless there are seven or more cards in
  exile" is a `restrictions: ["cant-attack", "cant-block"]` static gated by
  `{ kind: "not", of: { kind: "cards-in-exile", atLeast: 7 } }`.
- `{ kind: "metalcraft" }` — 3+ artifacts, the source counted when it is one (Chrome Steed).
- `{ kind: "opponent-lost-life-this-turn" }` — Theater of Horrors. Reads the
  per-player `lostLifeThisTurn` flag, set in `changeLife` so it catches damage
  and drain alike.
- `{ kind: "turn-structure", steps?, duringCombat?, combatPhase?, mainPhase?, endStep?, afterCombat? }` (`afterCombat`: "cast this spell only after combat", rule 506.8d, the turn's first combat phase over; `endStep: 1`: "if it's the first end step of the turn", Y'shtola Rhul, counted in `TurnState.endSteps`)
  — where the turn is: during one of `steps`, during a combat phase, during
  the Nth combat phase of the turn (Karlach's "if it's the first combat phase
  of the turn" is `combatPhase: 1`), or the Nth main phase ("your second main
  phase" is `mainPhase: 2`, which is the first postcombat main unless an
  additional one came before it). Every clause given has to hold; pair it
  with `your-turn` for "your". The counts are `TurnState.combatPhases` /
  `mainPhases`, the phase under way included. Portal's "Activate only during
  your turn, before attackers are declared" is `BEFORE_ATTACKERS_DECLARED`
  from `helpers.ts` (upkeep, draw, the first main phase, the first beginning
  of combat), `BEFORE_ATTACKERS_ANY_TURN` without the "your turn" (Norritt).
- `{ kind: "attacked-this-step" }` — Portal's "Cast this spell only during
  the declare attackers step and only if you've been attacked this step"
  (`castOnlyIf`; Just Fate, Harsh Justice): a declare attackers step in which
  a creature was declared attacking you — you, not a planeswalker of yours,
  and never one put onto the battlefield attacking (rule 508.3b) — though it
  has left combat since. "Each creature attacking you" (Blessed Reversal) is
  the filter `attackingYou: true`, which also leaves planeswalkers out;
  "creatures attacking your opponents" (Blast-Furnace Hellkite)
  `attackingOpponent: true`, whoever controls them; "creatures attacking
  your opponents **and/or planeswalkers they control**" (Roar of Resistance)
  `attackingOpponent: "or-their-planeswalkers"` — a battle an opponent
  protects is neither.
- `{ kind: "turn-history", what, who?, filter?, atLeast?, excludeSelf?, selfOnly?, from?, notFrom? }` —
  one of the `turnHistory` lists (§6) holds at least `atLeast` (default 1)
  this turn: "if you've discarded a card this turn" is `{ what: "discarded"
  }` (Gilt-Blade Prowler's activation restriction, Recalibrate's
  `conditional`); `what: "attackers"` is each creature `who` declared as an
  attacker, once and as it was declared (rule 508.1; one put onto the
  battlefield attacking never, 508.4): Deepway Navigator's "as long as you
  attacked with three or more Merfolk this turn"; `what: "turned-face-up"`
  (Oblivious Bookworm), `what: "regenerated"` with `selfOnly` (Spiny Starfish,
  the `{ turnHistory }` amount's `selfOnly` its count); `what: "entered"` with
  `filter: { token: true }` is "tokens you created this turn" (rule 111.2 —
  Ellyn Harbreeze); `what: "combat-damaged-by"` is the sources that dealt `who`
  combat damage, each read as it dealt it, whatever it is now: Lost Monarch of
  Ifnir's "if a player was dealt combat damage by a Zombie this turn" (`who:
  "any-player"`, `filter: { subtype: "Zombie" }`), Blitzball's "an opponent …
  by a legendary creature" (`who: "opponent"`), and `selfOnly` for this permanent
  alone, in the stint it's in or left: Wave of Rats' "if it dealt combat damage
  to a player this turn". Per player under `of-player` `"that-player"` in a
  `countPlayers`' `where` (Estinien Varlineau). Ichor Shade's "if an artifact or creature was put into a
  graveyard from the battlefield this turn" `{ what: "to-graveyard", who:
  "any-player", from: ["battlefield"], filter: { typesAnyOf: ["artifact",
  "creature"] } }`; Dimir Strandcatcher's "three or more cards … into your
  graveyard from anywhere other than the battlefield" `{ what: "to-graveyard",
  notFrom: ["battlefield"], atLeast: 3 }`; `what: "lands-played"` takes the
  same two for the zone a land was played from (rule 305.1), Spider-Man 2099's
  "played a land … from anywhere other than your hand" `{ what:
  "lands-played", who: "you", notFrom: ["hand"] }`, in an `any` with the
  `cast-this-turn` read of `castFrom: { not: "hand" }`. Éowyn, Shieldmaiden's "if another Human entered the battlefield
  under your control this turn" is `{ what: "entered", filter: { subtype:
  "Human" }, excludeSelf: true }` (a Human that entered and left since still
  counts); "if a creature died under your control this turn" is `{ what:
  "died" }`; "if you descended this turn" `{ what: "descended" }`. **Revolt**
  (and disappear, and "if a permanent you controlled left the battlefield this
  turn") is `{ what: "left" }` — `REVOLT_CONDITION` in `helpers.ts`: a
  permanent its controller controlled as it left (rule 603.10a), for any zone,
  however it left, a token too; Tale of Momo's "if a creature left the
  battlefield under your control" adds `filter: { type: "creature" }`.
  **Celebration** (Wilds of Eldraine — "if / as long as two or more nonland
  permanents entered the battlefield under your control this turn") is
  `CELEBRATION_CONDITION` in `helpers.ts`: `{ what: "entered", filter: {
  notTypes: ["land"] }, atLeast: 2 }` — each entry under its controller as
  it entered and read as it entered, counted though it has left or changed
  control since (the rulings), a token stack as every token in it, and one
  permanent that left and came back twice (rule 400.7). The same condition
  goes on a trigger (an intervening if) or a static (Armory Mice's "gets
  +0/+2 as long as …"); the scaffolder reads both.
  Phasing out isn't leaving (rule 702.26d). `who` is
  `"you"` (default), `"opponent"` or `"any-player"`. The `turn-stat`
  condition covers the running totals, raid (`stat: "attacked"`) and
  `"combat-damage-taken"` among them.
- `{ kind: "damage-dealt-this-turn", who?, combat?, colors?, atLeast }` —
  sources `who` (`"you"` by default, `"opponent"`, `"any-player"`)
  controlled dealt at least `atLeast` damage this turn: Ojer Axonil's Temple
  of Power's "activate only if red sources you controlled dealt 4 or more
  noncombat damage this turn" (an activated ability's `condition`) is
  `{ colors: ["R"], combat: false, atLeast: 4 }`. Each damage event is
  recorded against its source's controller with the source's colours as it
  dealt it — a departed source's as it last existed.
- `{ kind: "cast-this-turn", who?, filter?, atLeast?, atMost? }` — how many of
  the spells `who` (`"you"` by default, `"opponent"`, `"any"`) cast this turn
  match `filter`, each read **as it was cast** (`PlayerState.spellsCastThisTurnAs`,
  a snapshot taken as it reached the stack, its mana value counting its {X}):
  at least `atLeast` (default 1), at most `atMost`. Eshki Dragonclaw's "if
  you've cast both a creature spell and a noncreature spell this turn" is two
  of these under `all`, `{ filter: { type: "creature" } }` and `{ filter: {
  notTypes: ["creature"] } }` — an Adventure cast as its instant or sorcery
  half was a noncreature spell, though a creature card sits in exile after.
  The cast trigger's timing wrapper (`firstTimeEachTurn`/`nthEachTurn`) with a filter, and a
  `costModification`'s `firstEachTurn`, count the same records. Each record
  knows how its spell was cast, so `cast`, `castBy`, `castFrom` and `castVia`
  read it: "if a spell was warped this turn" (rule 702.185c) is `{ who:
  "any", filter: { castVia: "warp" } }` — a warped spell countered since
  still counts.
- `{ kind: "trigger-spell-first", anyOf: [{ filter, otherThanSource? }] }` — a
  cast trigger's spell is its caster's first spell this turn matching one of
  the filters (Alania, Divergent Storm — see `whileCondition` in §9), counting
  the same records. Only a cast trigger's `condition` can answer it.
- `{ kind: "spells-cast-last-turn", none?: true, byOnePlayerAtLeast?: n }` —
  the Innistrad werewolves' transforms (Hinterland Logger): `none` is "if no
  spells were cast last turn", `byOnePlayerAtLeast: 2` "if a player cast two
  or more spells last turn" — one player's, never two players' one each.
  The whole previous turn, wherever the werewolf was (`GameState.spellsCastLastTurn`,
  set as each turn begins); the scaffolder reads both.
- `{ kind: "creature-died-this-turn" }` — Liliana's Devotee. Reads the
  journal's `died` (`journal.ts`): each creature as it left for a graveyard.
- `{ kind: "created-token-this-turn" }` — the source's controller made a token
  this turn (Idol of Oblivion). Set in `mintTokenBatch`, the funnel every
  token-making path goes through, so a token *copy* counts too.
- `{ kind: "attacked-with-commander-this-turn" }` — the source's controller
  declared a commander (anyone's) an attacker this turn: Neriv, Crackling
  Vanguard's "during any turn you attacked with a commander, you may play
  those cards", an `impulse-exile`'s `gate` with `duration: "while-exiled"`.
- `{ kind: "used-graveyard-this-turn" }` — the source's controller cast a spell
  from a graveyard (flashback, escape, disturb, a graveyard permission) or
  activated an ability of a card in one this turn (Laboratory Drudge).
- `{ kind: "exiled-with-source", atLeast, now: true, filter? }` — at least that
  many cards are in exile with the source right now, of `filter`'s kind:
  Redemptor Dreadnought's "if a card is exiled with it".
- `{ kind: "exiled-with-source", atLeast }` — at least that many cards have
  been exiled *with* the source (an `exile { linked: true }`) in the
  battlefield stint it's in, ever — Colfenor's Urn's "if three or more cards
  have been exiled with this artifact" (its ruling: "over the course of the
  entire game"). False off the battlefield.
- `{ kind: "committed-crime-this-turn" }` — "if / as long as you've committed a crime
  this turn" (rule 700.13, the journal's `crime` entries — see the `crime-committed`
  trigger in §9): Slickshot Vault-Buster's +2/+0, Servant of the Stinger's intervening if.
- `{ kind: "all", of: [...] }` — every one of the conditions holds. Michelangelo,
  the Heart's "at the beginning of your second main phase, if you attacked this
  turn" is a `postcombat-main` trigger whose condition is a `turn-structure`
  `mainPhase: 2` and a `turn-stat` `attacked` together.
- `{ kind: "any", of: [...] }` — at least one of the conditions holds. **Void**
  ("if a nonland permanent left the battlefield this turn or a spell was
  warped this turn") is `VOID_CONDITION` in `helpers.ts`: a `turn-history`
  `{ what: "left", who: "any-player", filter: { notTypes: ["land"] } }` or a
  `cast-this-turn` `{ who: "any", filter: { castVia: "warp" } }`. Fatal Push's
  "mana value 2 or less, or 4 or less with revolt" is an `any` of a `target`
  and an `all` of revolt and a `target`. As an intervening if it's a
  triggered ability's `condition`; "sacrifice it unless …" (Chorale of the
  Void) is a `conditional` on its `not`, read only as it resolves; "… instead
  if …" a `conditional` with `else`, or an `ifCondition` amount (Plasma Bolt).
- `{ kind: "not", of }` — the negation of any other condition (Titan Hunter's
  "**if no creatures died this turn**"). Composes, so it's cheaper than a
  `no-` variant of each condition.
- `{ kind: "self-kicked" }` — the ability's own source was cast **kicked**
  (Verix Bladewing: "When this enters, *if it was kicked*, …"). A permanent
  spell's kicker rider can't live in `CardDefinition.kicker` the way an
  instant's does, because it resolves once the permanent is already on the
  battlefield; it's an ETB trigger with this as its intervening-if (rule
  603.4). `GameObject.kicked` dies with the stack object, so `moveObject`
  carries the one bit across to `enteredKicked`, cleared like any other
  zone-scoped flag on the *next* move — a Verix that dies and returns is
  unkicked.
- `{ kind: "self-counters", counter?, compare }` — how many counters the
  ability's **own source** has. Reads last-known information once the source
  has left the battlefield (rule 603.10), which is the only way Undying's "if
  it had no +1/+1 counters on it" can be asked at all: a dies-trigger is
  checked after the card is already in a graveyard, and `moveObject` clears
  counters on every zone change (`GameObject.lastKnown`). `parity: "odd" |
  "even"` in place of `compare` is "it has an odd / even number of counters
  on it" (Sab-Sunen, Luxa Embodied — zero is even): with no `counter`, every
  kind together. "Can't attack or block **unless** it has an even number" is
  the restriction with `parity: "odd"`.
- `{ kind: "target-chosen", index }` — a target was chosen for slot `index`,
  whether or not it's still legal: false only for an optional slot left
  empty. The Earth Crystal's "distribute two +1/+1 counters among one or two
  target creatures" puts one on each when a second was chosen — and a target
  found illegal loses its counter rather than passing it on (the ruling),
  which a `target` condition (blank for an illegal slot) would get wrong.
  Only meaningful inside a `conditional` effect.
- `{ kind: "target", index, filter }` — the object in target slot `index`
  matches `filter` (Scavenging Ooze: "Exile target card from a graveyard.
  **If it was a creature card**, …"). Same restriction as `trigger-object`
  below: only meaningful inside a `conditional` effect.
  A target that was a permanent and has left the battlefield since is matched
  as it last existed there.
- `{ kind: "sacrificed", filter }` — the permanent the spell or ability
  sacrificed (its cost, or a `sacrifice-source` step before this one)
  matched `filter` as it last existed on the battlefield: "if the sacrificed
  creature was a commander" (`{ isCommander: true }`), "if it was a Hamster".
  False when nothing was sacrificed. Only meaningful inside a `conditional`
  effect.
- `{ kind: "discarded", filter }` — the one card the spell's or ability's
  cost discarded matched `filter` where the discard put it: "if the
  discarded card was a creature card" (Moria Scavenger), "wasn't a land
  card" (`{ notTypes: ["land"] }` — Grab the Prize), "was multicolored"
  (Stormscale Anarch). Never a discard the effect itself makes — that's
  `this-way`. Only meaningful inside a `conditional` effect.
- `{ kind: "trigger-object", filter }` — the object whose event fired the
  *triggered ability* currently resolving matches `filter` (Akoum Hellkite:
  "If that land is a Mountain, it deals 2 damage instead"). Only meaningful
  inside a triggered ability's `conditional` effect; always false on a static,
  which has no triggering object.
- `{ kind: "source", filter }` — the ability's own source matches `filter`:
  "as long as ~ is equipped" (`{ equipped: true }`), "if ~ is attacking",
  "if ~ is tapped". A triggered ability whose source has left the
  battlefield since it triggered (its own dies trigger) reads it as it last
  existed there; otherwise wherever the source is now.
- `{ kind: "source-zone", zones, sameObject? }` — **where** the ability's own
  source is, as an intervening-if: Eminence's "if ~ is in the command zone or
  on the battlefield" (`zones: ["command", "battlefield"]`, Edgar Markov) or
  "if ~ is still on the battlefield" (`zones: ["battlefield"]`). Add
  `sameObject: true` whenever the clause names the card itself, which is
  nearly always: then a permanent that left and came back, or a commander
  cast from the command zone since, no longer counts (rule 400.7), checked
  against the timestamp the ability recorded when it triggered.
- `{ kind: "resolved-this-turn", n }` — "if this is the **Nth time this
  ability has resolved this turn**" (Omnath, Locus of Creation; Tannuk; Ms.
  Bumbleflower). `n` counts the resolution in progress, so the first is `1`.
  The count is per ability of one object and restarts each turn; a permanent
  that leaves and returns is a new object with a fresh count, and an ability
  that fizzled never resolved, so it doesn't count. Only meaningful inside the
  ability's own `conditional` effect (a `not` around it works too).
- `{ kind: "activated-this-turn", atLeast }` — "if this ability has been
  **activated four or more times this turn**" (Dragon Whelp: `atLeast: 4`).
  Every activation counts as it's made, resolved or not, the resolving one
  included; per ability of one object, restarting each turn and with a zone
  change. Only meaningful inside the activated ability's own `conditional`.
- `{ kind: "this-ability-did-this-turn" }` — this ability has done its thing
  this turn, as its effect recorded it: an `add-mana` with
  `marksAbilityDone: true` that added at least one mana (an amount of 0 adds
  none, rule 107.1b), or a `cast-now` with `marksAbilityDone: true` that cast
  a spell. Its `not` as a triggered ability's `condition` is Carpet
  of Flowers' "if you **haven't added mana with this ability this turn**", an
  intervening if (rule 603.4) asked as it triggers and as it resolves — and
  Planetarium of Wan Shi Tong's "you may cast that card … **Do this only once
  each turn**", spent only by a cast (its ruling: it doesn't trigger again
  that turn once it has cast; declining leaves it free). Per
  ability of one object (entries joined by `sameAbilityAs` share it —
  "at the beginning of each of your main phases" is two), restarting each turn
  and with a zone change. Answered for a triggered ability's `condition` and a
  `conditional` inside the ability.
- `{ kind: "source-on-battlefield" }` — "if ~ is still on the battlefield":
  the resolving ability's source is there as the same object it was (rule
  400.7). Shirei, Shizo's Caretaker's delayed return. Only a resolution can
  answer it.
- `{ kind: "trigger-value", compare }` — the value the triggering event gave
  the resolving triggered ability (its `{ triggerValue: true }` amount):
  "if you won" off a `clashes` trigger is `{ op: "gte", n: 1 }` (Rebellion
  of the Flamekin, Entangling Trap). Only a resolution can answer it.
- `{ kind: "amounts", left, op, right }` — one amount against another, unclamped, as a trigger's intervening-if or in a `conditional`: "if the amount of mana spent to cast that spell is greater than Liberator's power" (`{ manaSpentOf: "trigger-object" }`, `"gt"`, `{ powerOf: "source" }`), ED-E, Lonesome Eyebot's attackers against its quest counters. False in a static ability. A "this way" total is one of these too: Dance with Calamity's "if the total mana value of the cards exiled this way is 13 or less" is `left: { aggregate: "sum", of: "mana-value", filter: {}, in: { thisWay: "exiled" } }, op: "lte", right: 13` — after a `repeat`, over every pass (its "as many times as you choose, you may exile the top card" is a `may` around a `repeat` with `mayAgain: true`); the scaffolder reads both sentences, and "Shuffle your library." (`shuffle-library`).
- `{ kind: "x", compare }` — "if X is 10 or more" (Finale of Devastation:
  `{ op: "gte", n: 10 }`): the X the resolving spell or ability was cast or
  activated with. A resolution answers it, and so does a triggered ability's
  intervening-if when it's a permanent's own enters trigger or a cast trigger
  — the X it snapshots (rule 107.3m), 0 for a permanent that wasn't cast —
  both as it triggers and as it resolves: ravenous's "if X is 5 or more"
  (`ravenous()`, §6). Anywhere else it's false.
- `{ kind: "this-way", what, who?, filter?, atLeast?, atMost? }` — a question
  about what the resolving spell or ability has done so far: "if a land card
  is discarded **this way**" (Lord Windgrace: `{ what: "discarded", filter: {
  type: "land" } }`), "if you **didn't draw** cards this way" (Mr. Foxglove:
  `{ what: "drawn", who: "you", atMost: 0 }`), "if you don't" put a land
  onto the battlefield (Hakbal: `{ what: "put-onto-battlefield", atMost: 0 }`).
  Over the same objects the `thisWay` amount counts (§6); `atLeast` defaults
  to 1, or to 0 when `atMost` is given. `other: true` leaves the ability's
  own source out — Arid Archway's "return a land you control to its owner's
  hand. If **another** Desert was returned this way, surveil 1" (it returning
  itself doesn't count). Only meaningful inside a `conditional` effect.
  `what: "chosen"` is the cards picked in a `look-and-choose`, wherever they
  went — a processor's "If you do" after "you may put a card an opponent owns
  from exile into that player's graveyard" (Wasteland Strangler), which holds
  though Rest in Peace exiles the card again (the ruling).

**`replacement?`** (`ReplacementSpec`, `replacements.ts`) — a replacement effect
*is* a static ability:

- `{ event: "enters-battlefield", tapped?, tappedUnless?,
  tappedUnlessRevealFromHand?, tappedUnlessBehold?, painIfUntapped?, mayPayLife?,
  counters?: { kind, amount }, transformed?, instead? }` — a self-replacement.
  `counters.amount` is `"x"` for the X it was cast with (rule 107.3m) or any
  live amount, read as it enters and never counting itself or what enters
  with it (Aeve, Progenitor Ooze's "a +1/+1 counter on it for each other Ooze
  you control" is a plain `countOf`).
  `removeAllCountersFrom: CardFilter` is "As this creature enters, remove all
  counters from all permanents" (Thief of Blood — `{}`): every counter of
  every kind off each permanent already there matching it, as it enters (rule
  614.1c; never itself or what enters with it, 614.12; players' counters
  stay), and `counters: { kind: "+1/+1", amount: "removed-as-enters" }` is
  "a +1/+1 counter on it for each counter removed this way".
  `notes: EffectAmount` is "As this enchantment enters, note your life
  total" (Sigarda's Splendor — `{ lifeTotal: "you" }`): read as it enters
  (rule 614.1c, no trigger) and kept on the permanent for the stint, read
  back as `{ chosenNumber: true }` and replaced by a later `note` effect.
  `rollAsEnters: { sides, count }` is "As this creature enters, roll X d6"
  (Neverwinter Hydra — `{ sides: 6, count: "x" }`): its controller rolls as it
  enters (rules 614.1c, 706), a roll like any other to roll triggers and
  replacements, nothing rolled with no dice, and `counters: { kind: "+1/+1",
  amount: "rolled-as-enters" }` is "counters equal to the total of those
  results".
  `tapped` is unconditional; `tappedUnless: StaticCondition` is the check-land
  cycle (Rootbound Crag: `{ kind: "controls", filter: { subtypes: [...] },
  atLeast: 1 }`, via the `checkLandStatic`/`enterTappedUnlessLands` helpers),
  asked of what's already on the battlefield — never a land entering beside
  it (a tutor's finds, Scapeshift: rule 614.12, the check-land rulings);
  `tappedUnlessRevealFromHand: [type, type]` is the reveal-land cycle (Port
  Town, via the `revealLand` helper) — the one enters-tapped check that reads
  your **hand** rather than the battlefield, which is why it isn't a
  `StaticCondition`. The "you *may* reveal" is a `reveal-for-untapped`
  decision asked before the land moves (`askEnterChoice`), offering the
  qualifying cards in hand or none; the card revealed is shown to everyone.
  A changeling card qualifies for any creature type (rule 702.73a — Murmuring
  Bosk's Treefolk). With a `tappedUnless` too, each one failed taps it — unless
  `revealOrCondition: true`, when either spares it: Temple of the Dragon
  Queen's "enters tapped unless you revealed a Dragon card this way **or**
  you control a Dragon".
  `tappedUnlessBehold: BeholdSpec` is Theorist's Sanctum's "As this land
  enters, you may behold a Jace. If you don't, this land enters tapped"
  (rule 701.4a): a `choose-from-zone` over the Jace cards in hand and the
  Jaces you control (never the land), none chosen being "you don't" — asked
  only with one to behold, as it's about to enter (rule 614.12).
  (`instead: { exileUnless: filter }` is "if this creature would enter and it wasn't cast or no mana was
  spent to cast it, exile it instead": Primeval Spawn, nothing to choose, and no token copy is made.)
  `instead: EnterInstead` is what's done rather than entering, asked before it
  moves however it enters (rule 614.12): `sacrifice: { filter, count }` is
  Kjeldoran Outpost's "sacrifice a Plains instead. If you do, put this land onto
  the battlefield. If you don't, put it into its owner's graveyard", Scorched
  Ruins's `{ type: "land", tapped: false }`, count 2 (its controller's own, as
  many as there are — rule 609.3 — but only the whole number gets it in);
  `count: "all"` has no "if you don't" and enters regardless (Sheltered Valley,
  `{ name }`; Overlaid Terrain); `discard: { filter }` is Mox Diamond's "you may
  discard a land card instead", a `choose-from-zone`. One that doesn't enter goes
  to its owner's graveyard (it stays, if it was there) and no enters trigger sees
  it. A copy does this as what it's becoming; a token copy too, and one that
  doesn't enter was never created (§15).
  `mayPayLife: N` is a shock land (a `pay-life-for-untapped` decision, via the
  `shockLand` helper); `painIfUntapped: N` deals damage if it *did* end up
  entering untapped (Rockfall Vale). `mayEnterTapped: { then? }` is "you may
  have this land enter tapped. If you do, [then]" (Mariposa Military Base):
  asked before it moves ("Enter untapped" / "Enter tapped"), and `then` — an
  effect that asks nothing — happens as it enters, not as a trigger.
- `{ event: "would-begin-turn", who: "you" | "opponent" | "any", extraOnly?, may?, thenUntapSource? }` —
  "if [a player] would begin [a turn], that player skips that turn instead" (rules 500.11, 614.10), whose
  read from this permanent's controller; `extraOnly` is "an extra turn" (Gerrard's Hourglass Pendant,
  Stranglehold). `may` asks that player as the turn would begin, and `thenUntapSource` is "if you do, untap
  this", the first thing in the next turn to occur (rule 614.10b); a static's `condition` is "while this
  is tapped" (Time Vault). "You skip your next turn" is the `skip-turn` effect (Chronatog, Magosi).
- `{ event: "others-enter-battlefield", filter, tapped?, untapped?,
  counters?: { kind, amount } }` — how **other** permanents enter. `filter`
  picks which, read from this permanent's controller's side against each one
  as it will exist on the battlefield, including the player it's entering
  under: Thalia, Heretic Cathar's "creatures and nonbasic lands your
  opponents control enter tapped" is `{ controlledBy: "opponent", anyOf:
  [{ type: "creature" }, { type: "land", notSupertype: "basic" }] }` with
  `tapped: true`. `untapped: true` is "lands you control enter untapped" (The
  Wandering Minstrel, Spelunking) and beats every enters-tapped — the land's
  own, another permanent's `tapped`, an effect's "put it onto the battlefield
  tapped" — and a shock land isn't asked for its life. `counters.amount` is an
  `EffectAmount` read as the permanent enters, and never counts it or
  anything entering beside it: Giada's "an additional +1/+1 counter on it for
  each Angel you **already** control" is `{ countOf: { subtype: "Angel",
  controlledBy: "you" } }`; a fixed "an additional +1/+1 counter" is `1`.
  Leave "other" out of the filter: rule 614.12 already keeps a permanent's
  replacement off itself, and off anything entering at the same time as it
  (a token batch, a mass reanimation, a flicker's return, a tutor's finds are
  each one simultaneous entry).
**One `instead` (replacement effects, rules 614, 615 — theme 9 of `docs/plans/need-key-themes.md`).** A
replacement's `event` and its flat fields say what it matches; `instead` says what happens:
`{ effect, text? }` the event becomes this effect and never happens (rule 614.6), or
`{ modify: { times?, plus?, half?, atLeast?, atMost?, set? }, also? }` the event happens, changed, `also` done first beside
it ("instead that damage is dealt, but …"). Amounts are `EffectAmount`s, read as the event would happen. In the effect
`"x"` is "that much", `"trigger-object"` "that card" or the damage's source, `"trigger-recipient"` and `"trigger-player"`
who it would have happened to; it's run by the replacement's controller, so "that player" draws is an `as-player` or a
`who: "trigger-player"` (Undead Alchemist's combat damage become `{ kind: "mill", target: "trigger-player", amount: "x" }`,
with `combat: true`, a `source` filter and `to: "player"`). It mustn't repeat its own event after a decision (rule 614.5): use `also`. Damage has its own
`{ prevent, then?, perEvent?, thenCountsUnprevented? }` (`prevent`: `true`, a number, `{ allBut }` or `{ half }`) and
`{ redirect }`; the leave event takes a destination (`"exile"`, `"library-top"`, `"library-bottom"`, `"hand"`). `may: true`
is "you may instead", only on events that can wait for the answer (draw, tokens, turn begin): `test/instead-replacements.test.ts`
refuses it elsewhere. **New events:** `would-lose-game` (`{ who, instead: { effect } }`, conceding isn't replaced),
`would-scry` (`{ who, instead }`). `would-draw` also takes `instruction: { atLeast }` (the whole draw: "one or more
cards", "two or more", `"x"` the number) and `whileHandAtMost`; `would-create-token` takes `becomes: { effect, text? }` with
`firstEachTurn` and `may` (Moonlit Meditation); `would-deal-damage` takes `ifAtLeast`.
**A resolved replacement for a while** is `replacement-effect { replacement, duration, next?, players?, permanentsToo?, object?, fromObject? }`
(`state.activeReplacements`): the same words as a static's, with a `PlayerDuration`. `next: true` is "the next time" (spent
when it applies, 615.8), an amount "the next N" damage (615.7); `players`, `object` and `fromObject` are what its references
name, fixed as it resolves. Amounts in a `modify` are fixed as it resolves too; filters are read at each event, so what arrives later counts.
The `prevent-damage` family makes the same record.

- `{ event: "would-create-token", instead: { modify: { times } } }` — Doubling Season. `{ event:
  "would-create-token", creatureTokensInstead: "<token>" }` is Divine
  Visitation's "if one or more creature tokens would be created under your
  control, that many 4/4 … Angel creature tokens … are created instead":
  only a token made a creature (its definition, or a copy's copiable
  values), its characteristics replaced whole — copy exceptions and an X/X's
  size go — while tapped, attacking, "it gains haste", counters put on it
  and its later sacrifice or exile still happen (the ruling). Amass's Army
  made as an Angel isn't an Army, so it gets no counters (rule 701.47a).
  `{ event: "would-create-token", plusTokens: "<token>" }` is Chatterfang,
  Squirrel General's "those tokens **plus that many** 1/1 green Squirrel
  creature tokens are created instead": any kind of token, a token copy too,
  entering with the others as one event; the extra tokens get what the effect
  does to the tokens (tapped, attacking, haste, exiled later) and none of what
  they are (the rulings). With a doubler the totals are the same in either
  order (rule 616.1); before Divine Visitation, which makes them Angels too.
  `plusOneToken: "<token>"` is "those tokens **plus an additional** Food token"
  (Tippy-Toe, Xorn): one more however many are made, one opportunity at an
  event (rule 614.5), so a `sequence` with `simultaneous` making a Treasure and
  a Clue gets one Food between them. `tokensInstead: "<token>"` is that many of
  another token in place of the ones `ofTokens` names (Draconic Visitor,
  Fisher's Talent: `atLevel` it for a Class). `oneOfEach: ["<token>", …]` is
  Academy Manufactor: each token `ofTokens` names becomes one of each.
  `modify.times` with `ofTokens` multiplies just those tokens (Ojer Taq, Deepest
  Foundation, three times creature tokens), in the search rather than last.
  `anyController: true` on it, as on `would-add-counter`'s, is Primal Vigor's
  wording with no "under your control": anyone's tokens, anyone's creature.
  `ofTokens: { type?, subtypesAnyOf? }` limits any of these to tokens of a kind:
  what they'd be created as (a definition or a copy's copiable values). The
  event changes as they apply, so a Frog from one replacement makes Queen
  Allenal's "creature tokens" apply; the controller's order is the one that
  makes the most, worked out (`token-replacements.ts`), with doublers last. A
  replacement the player may decline ("you may instead", Jinnie Fay, Mirrormind
  Crown) isn't this vocabulary: nothing asks mid-creation.
- `manaProduction: [{ tapper: "you", times }]` — "if you tap a permanent for mana,
  it produces twice as much of that mana instead" (Mana Reflection, Nyxbloom
  Ancient): see "Triggered mana abilities" in §8.
- `manaProduction: [{ filter?, produces, tapper }]` (a static field, not a
  `replacement`) — a land tapped for mana producing another type instead
  (rules 106.12, 614.1a): Infernal Darkness's "if a land is tapped for mana,
  it produces {B} instead of any other type" is `[{ filter: { type: "land" }, produces: "B", tapper:
  "any" }]`; Reality Twist's "Plains produce {R}, Swamps produce {G}, …" is
  an entry a land type (`filter: { subtype: "Plains" }`). `tapper: "you"` is
  "if **you** tap a land". The amount is kept; mana a triggered mana ability
  adds on the tap isn't the land's. Deep Water's turn-long "{U}: Until end of
  turn, if you tap a land you control for mana, it produces {U} instead" is
  the `player-effect` field `manaProduction: { filter: { type: "land", controlledBy: "you" }, produces: "U", tapper: "you" }`. The auto-payer and the
  offered activations see the new type. Of several, the newest applies
  (rule 616.1). Not "one mana of a color of your choice instead of any other
  type and amount" (Harvest Mage).
- `{ event: "would-add-counter", instead: { modify: { times?, plus?, half? } }, counterKind?, filter?, other?, byEffectOnly?, whoPuts?, onPlayers? }` —
  Doubling Season (`times: 2`). `filter` narrows which of your permanents
  it covers (Branching Evolution: `{ type: "creature" }`; Caradora's "a
  creature or Vehicle": `anyOf`). `plus: 1` in the `modify` is "that many plus one" (Hardened
  Scales, `counterKind: "+1/+1"`), and `other: true` leaves out this
  permanent itself (Benevolent Hydra's "another creature you control"). Both
  apply to counters a permanent enters with too (rule 122.6). The order is
  the one best for the permanent's controller (rule 616.1): each `plus`
  before the doublers — (n + 1) × 2 — except for -1/-1 counters, where after
  them gives fewer. A negative `plus` is "that many minus one" (Vizier of Remedies'
  -1/-1 counters: `plus: -1`), applied the other way round and never below
  none. They reach counters put as a **cost** too (Devoted Druid's -1/-1, Wall of
  Roots' -0/-1), except one worded "if **an effect** would put" (Doubling
  Season): `byEffectOnly: true`. `whoPuts: "you" | "opponent"` reads who puts
  them, on anyone's permanent ("if you would put", Vorinclex, Monstrous Raider,
  Innkeeper's Talent; with `filter` to narrow it, Lae'zel, Vlaakith's Champion);
  `onPlayers: "any" | "you"` reaches players too, energy included ("or player",
  "or on yourself"); `halved: true` is "half that many, rounded down". A plus
  loyalty cost is put by its controller, so it's reached too.
- A static's `prohibits` `get-counters` act (`object` or `who`, `kind?`) is "counters can't be put on …"
  / "players can't get counters" (Solemnity: `{ players: "each" }` and `{ permanents: {
  typesAnyOf: ["artifact", "creature", "enchantment", "land"] } }`; Melira, Sylvok Outcast:
  `{ players: "you", kind: "poison" }` and `{ permanents: { type: "creature", controlledBy:
  "you" }, kind: "-1/-1" }`). Not a replacement: the counters just aren't put — by an effect,
  infect or wither damage, a move (122.5), a Saga's lore counter — a cost that would put them
  can't be paid, and a permanent enters without them unless the static enters with it.
  Energy counts as a player counter; a card in exile isn't a permanent and still gets them.
- A card's own "if this would be put into a graveyard from anywhere, reveal it and shuffle it
  into its owner's library instead" (Blightsteel Colossus, Nexus of Fate, Progenitus) is the
  definition's `shufflesIntoLibraryInstead: true`, not a static: it works from every zone (a
  death, a discard, a mill, a resolved or countered spell), goes ahead of Rest in Peace's exile
  (the order its owner would pick), and not once the permanent has lost its abilities.
- `{ event: "would-counter-spell" }` — "If a spell or ability you control would
  counter a spell, instead exile that spell and you may play that card without
  paying its mana cost" (Guile). Only what can be countered; it was never
  countered, so no "this way" rider happens.
- `{ event: "would-discard", causedBy: "effect" | "opponent", reveal? }` — a
  discard its player may put on top of their library instead, in an order they
  pick, still a discard to every trigger: Library of Leng's "if an effect causes
  you to discard a card" (never a cost's), Nephalia Academy's "a spell or ability
  an opponent controls", which reveals them.
- `{ event: "would-be-put-into-graveyard", instead: "library-top", self: true, from: "battlefield" }`
  — "if this creature would die, put it on top of its owner's library instead"
  (Gravebane Zombie). `notCycled: true` beside an exile's `filter` is "and it
  wasn't cycled" (Abandoned Sarcophagus).
- `{ event: "would-be-put-into-graveyard", instead: "exile", filter?, from? }`
  — Rest in Peace / Anafenza. `from: "battlefield"` is the **dies-only** form
  ("if a creature an opponent controls would die, exile it instead"): it lets
  a discard, a mill or a countered spell through, and its `filter` reads the
  permanent's computed characteristics and current controller, since it's
  still on the battlefield when the replacement is asked. `withCounters: {
  kind, amount }` is "instead exile it **with a void counter on it**" (Dauthi
  Voidwalker, whose "if a **card** would be put into an opponent's graveyard"
  is `filter: { ownedBy: "opponent", token: false }` — a token isn't a card,
  and still dies; Rest in Peace's "a card or token" has no filter; Valgavoth,
  Terror Eater's "a card **you didn't control**" adds `controlledBy:
  "opponent"` — a card off the battlefield and the stack is its owner's to
  control, rule 108.4a, so a discard or a mill is caught and a stolen
  permanent or a spell you cast from an opponent's cards isn't). `then` is
  what it does beside the exile, its controller's, once per token of a stack:
  "instead exile that card and create a 2/2 black Zombie" (Kalitas, Traitor of
  Ghet — an instruction of the replacement), or a `reflexive-trigger` for "exile
  it instead. When you do, create …" (Head of the Hunt). `linked: true` exiles
  the card **with** this permanent (rule 607.2b, `GameObject.exiledWith`), so its
  "exiled with ~" abilities find it: The Darkness Crystal (`then: { kind:
  "gain-life", amount: 2 }`, and a `card-in-exile { linked: true }` target for
  its return), Gisa, Glorious Resurrector (`return-exiled-by-source { linked:
  "battlefield", under: "you" }` at upkeep). Set it only when the card says
  "exiled with" somewhere. For a turn rather than
  a permanent, it's `player-effect`'s `graveyardExile`, §6. When
  another replacement would exile the card too — Rest in Peace, a finality
  counter, flashback, a disturb face's own, a Kess-style permission — the affected
  object's controller (its owner, off the battlefield and the stack) picks
  which applies (rule 616.1), and the two differ only in the counter: it's
  put on only when one of the replacements putting it is the chooser's own,
  the one choice that serves them (an opponent's flashback spell is exiled
  by flashback, with no void counter) — and so are `then` and `linked` (Rest
  in Peace beside The Darkness Crystal: no life, nothing linked). `self: true` is a disturb back face's
  "If ~ would be put into a graveyard from anywhere, exile it instead"
  (Hook-Haunt Drifter, rule 702.146): the face's own ability, catching only
  the object it's on (a token too), on the stack or the battlefield — so a
  Clone of the face is exiled too (rule 707.2) and the face that lost its
  abilities isn't. Give every disturb back face one; the disturb cast itself
  exiles nothing.
- **Finality counters** (rule 122) need no spec: any permanent with a
  `finality` counter that would go to a graveyard from the battlefield is
  exiled instead, by `moveObject` itself. Put one on with
  `put-onto-battlefield { withCounters: { kind: "finality", amount: 1 } }`
  (Admiral Brass, Unsinkable) or `add-counter`.
- "If it would leave the battlefield, exile it instead of putting it anywhere
  else" follows one object, not a static — `put-onto-battlefield
  { exileIfItWouldLeave: true }` (Whip of Erebos). It catches a bounce or a
  tuck as well as a death, and ends when the permanent leaves. That's a
  replacement effect, which losing all abilities doesn't touch; a card that says
  the permanent **gains** it as an ability (Geth, Thane of Contracts; Llanowar
  Greenwidow) is `exileIfItWouldLeave: "ability"` — granted in layer 6, so a later
  Humility or Turn to Frog strips it (rule 613.1f).
- `{ event: "would-draw", who: "opponent", instead: "you-draw",
  exceptFirstInDrawStep: true }` — Notion Thief's "if an opponent would draw a
  card except the first one they draw in each of their draw steps, instead
  that player skips that draw and you draw a card". `exceptFirstInDrawStep`
  spares the first card a player draws in their own draw step (the
  turn-based draw, or the next one if that was skipped). Only the draw is
  replaced: "draw a card, then discard a card" still discards (the ruling).
  The draw it hands its controller can be handed on by a Thief of one of
  *their* opponents, each effect applying to the draw once (rule 614.5, the
  rulings' procedure): with a Thief on each side of a duel the draw stays put,
  and two against one leaves it with the two. `{ event: "would-draw", who: "you", instead: { modify: { set: N } } }` is "if
  you would draw a card, draw N cards instead" (gate it with the static's
  `condition`); neither applies again to the draws it makes (rule 614.5).
  Several multiply (Thought Reflection twice is four). `exceptFirstInDrawStep:
  true` on it passes by the first card you draw in each of your draw steps
  (Teferi's Ageless Insight, Bard, King of Dale); `firstEachTurn: true` makes
  it "the first time you would draw a card each turn" (Reed Richards,
  Smartest Man, with both) — the turn's first draw event, read from the
  turn's history (`PlayerState.wouldDrawThisTurn`), so one arriving after it
  waits for the next turn, and at most one such applies to an event.
  `{ event: "would-draw", who: "you", instead: { effect: <EffectSpec> } }` is a
  draw replaced by an effect: Underrealm Lich's "instead look at the top three
  cards of your library, then put one into your hand and the rest into your
  graveyard" (a `look-and-choose`), Sages of the Anima's reveal-three,
  Tomorrow, Azami's Familiar's. It applies though the library is empty (rule
  614.11: no loss for it), the card isn't drawn (no draw trigger or count),
  and each draw of several is finished, its choice answered, before the next
  (614.11a). It takes the exemptions too, and is applied before a "draw N"
  on the same draw. Its effect mustn't draw unless it's `firstEachTurn`.
  With `may: true` it's "you **may** instead" (Abundance, Pavel Chekov, First
  Posting; Obstinate Familiar's "you may skip that draw instead" is an empty
  `sequence`): each draw, as it would happen, asks the drawing player "Draw a
  card" or the option `text` names after the card's name (rule 616.1); beside
  a mandatory one of theirs (Underrealm Lich) the draw is replaced either way,
  so the choice is between the two. `draw-replacement-may.test.ts`.
  `{ event: "would-draw", who: "you", instead: "win-game", whileLibraryEmpty:
  true }` is Laboratory Maniac's "if you would draw a card while your library
  has no cards in it, you win the game instead" (rule 614.11: it applies
  though there's no card to draw). It replaces the draw even for a player who
  can't win, who then neither wins nor loses for it (the rulings), and it's
  applied before an opponent's Notion Thief — the order the drawing player
  would pick whenever they can win (rule 616.1; when they can't, the choice
  isn't offered, see §15's replacement ordering). It also replaces a draw
  another replacement made of yours (rule 616.2): your own Notion Thief's
  "you draw a card instead" from an empty library wins.
- `{ event: "would-mill", who, instead: { modify: { times?, plus? } } }` — Bruvac the
  Grandiloquent's "if an opponent would mill one or more cards, they mill
  twice that many cards instead" (`who: "opponent"`, `times: 2`), The
  Water Crystal's "…they mill that many cards plus four instead" (`plus: 4`).
  Several multiply, then every `plus` adds, as damage's do; a mill of none is
  never replaced.
- `{ event: "would-lose-life", who, instead: { modify: { times } } }` — Bloodletter of Aclazotz's
  "if an opponent would lose life during your turn, they lose twice that much
  life instead", with a `your-turn` `condition`. Every loss, damage's and a life
  payment's included (rule 119); the damage itself doesn't change, so lifelink
  doesn't either. `from: "radiation"` narrows it to life lost as a result of the
  rad counters' own ability (rule 728.1a), and `instead: { effect }` is something
  else instead of the loss, "that much" being `"x"`: Strong, the Brutish
  Thespian's "you gain life rather than lose life from radiation" (`who: "you"`,
  `from: "radiation"`, `instead: { effect: { kind: "gain-life", amount: "x" } }`).
  An `{ effect }` isn't read for damage's loss, so give it a `from`.
- `{ event: "would-gain-life", who, instead?: { modify: { plus?, times? } } | { effect }, prevent?, becomesLoss? }` — Bilbo, Birthday
  Celebrant's "if you would gain life, you gain that much life plus 1
  instead" (`who: "you"`, `modify: { plus: 1 }`), or "your opponents can't gain life"
  (The Lord of Pain — `who: "opponent"`, `prevent: true`). Applied to every
  life gain, lifelink's included; one `prevent` beats every `plus`.
  `times: 2` is Rhox Faithmender's "you gain twice that much life
  instead", applied after every `plus` (the order the gaining player would
  pick, rule 616.1). `becomesLoss: true` is Tainted Remedy's "if an opponent
  would gain life, that player loses that much life instead" (`who:
  "opponent"`): applied before any `plus` or `multiplier`, after a `prevent`.
- `{ event: "would-deal-damage", instead, combat?, source?, fromSelf?, to?, toFilter?, ifAtMost?, ifAtLeast? }` — `instead` is `{ modify: { times, plus, atLeast, atMost, set, half } }`, `{ prevent, then?, perEvent?, thenCountsUnprevented? }`, `{ redirect }` or `{ effect }` (see **One `instead`** above); and — and since B250 `fromAttached?, toOther?, redirect?, preventAmount?, preventAllBut?, preventHalf?, halve?, ifAtMost?`:
  `to: "your-side"` is you or a permanent you control (`toFilter` narrowing only the permanents — Hyperion's "you or a Hero you control"),
  `to: "attached"` / `fromAttached: true` the Aura's or Equipment's host (Inviolability; Muzzle), `toOther` "other permanents" (Palisade Giant);
  `redirect: "self" | "attached" | "recipient-controller"` deals all of it there instead (Palisade Giant, Pariah, Treacherous Link — rule 614.9,
  once per event, 614.5); `instead: { prevent: 1 }` (Guardian Seraph, per source, 615.10), `{ prevent: { allBut: 1 } }` (Hyperion), `{ prevent: { half: "up" } }` (Gisela),
  `modify: { half: "down" }` (Ghosts of the Innocent — a replacement, so unpreventable damage is still halved), `ifAtMost: 3` with `prevent` (Callous Giant), `ifAtLeast: 3` with `modify: { set: 2 }` (Forethought Amulet).
  `then` runs with the damage's source as `"trigger-object"` (Swans of Bryn Argoll's "that source's controller") and the one it would have been dealt to as `"trigger-recipient"` (Vigor's "put a +1/+1 counter on that creature for each 1 damage prevented this way": `add-counter { target: "trigger-recipient", amount: "x" }`, `perEvent` for one follow-up per recipient over a simultaneous event).
  With `prevent` and `then`, `"x"` is the damage actually prevented — none when it can't be (Swans' "prevented this way"); `thenCountsUnprevented: true`
  makes it the damage either way (Jared Carthalion, True Heir's ruling: unpreventable damage is dealt and still puts "that many" counters on — rule 615.12); a `replacement-effect`'s shield reads it too (Gatta and Luzzu: `object: 0`, `perEvent`, for the turn).
  (`fromSelf: true` — only damage this permanent deals: Wolverine's "double all damage Wolverine would deal")
  — damage about to be dealt, changed. With neither `source` nor `to` it is
  **symmetric and global** (Dictate of the Twin Gods' `multiplier: 2` doubles
  damage from any source to any recipient, its own controller's included), so
  `affects` is irrelevant. `source` filters the source of the damage from this
  permanent's controller's side (Neriv: `{ type: "creature", controlledBy:
  "you", enteredThisTurn: true }`; Kuja's Flare Star: a Wizard you control; a
  departed source as it last existed); `to` narrows the recipient —
  `"opponent"`, `"opponent-side"` (an opponent or a permanent an opponent
  controls — Torbran's `plus: 2`), `"you"`, `"player"` (any player — Tok-Tok,
  Volcano Born's "a red source would deal damage to a player") or `"self"`; `toFilter` to a
  permanent matching a filter from this permanent's controller's side, as it
  is then — Iroas, God of Victory's "prevent all damage that would be dealt to
  attacking creatures you control" (`prevent: true, toFilter: { type:
  "creature", attacking: true, controlledBy: "you" }`). `prevent: true`
  prevents it instead, then applies `then` as this permanent's controller's
  effect with `"x"` the damage prevented: The Mindskinner's "prevent that
  damage and each opponent mills that many cards" (`to: "opponent"`, `source:
  { controlledBy: "you" }`, `then: { kind: "mill", target: "each-opponent",
  amount: "x" }`), "prevent that damage and put that many +1/+1 counters on
  it" (`to: "self"`). `combat` narrows it to combat (`true`) or noncombat
  (`false`) damage, and `atLeast: "this-power"` raises the damage to this
  permanent's power when it's less — Ojer Axonil, Deepest Might's "if a red
  source you control would deal an amount of noncombat damage less than Ojer
  Axonil's power to an opponent, that source deals damage equal to Ojer
  Axonil's power instead" (`atLeast: "this-power", combat: false, source:
  { colors: ["R"], controlledBy: "you" }, to: "opponent"`). "A red or artifact
  source" is `source: { anyOf: [{ colors: ["R"] }, { type: "artifact" }],
  controlledBy: "you" }` (Mechanized Warfare); "sources you control of the
  chosen type" is `source: { controlledBy: "you", ofChosenType: true }`
  (Collective Inferno). The affected player orders them (rule 616.1): the
  engine tries every order of the multipliers, pluses, `atLeast`s, the first
  `prevent` and the prevention shields, and applies the one dealing the least
  damage (a Heal's shield before a Furnace of Rath: 3 − 1 = 2, doubled to 4).

---

## 11. The `resolve` escape hatch

When the declarative vocab can't express a card, write an imperative
`resolve(ctx)`. It takes precedence over `effect`. `ctx` is a
`ResolutionContext`: `{ controller, source, targets, x }` plus every `EffectApi`
method (`ctx.dealDamage(ref, n)`, `ctx.draw(player, n)`,
`ctx.createToken(name, n)`, `ctx.searchLibrary(...)`, …). See `effects.ts` for
the full `EffectApi`.

Prefer `effect` — the declarative form is what the fuzzer, the layer system,
and future features understand. Reach for `resolve` only for genuine one-offs.
No pool card uses one: the last four (Atarka, World Render; Gaze of Granite;
Green Sun's Zenith; Toxic Deluge) went declarative on 2026-10-09. Grow the
vocabulary before adding one back.

---

## 12. Multi-face, transform, adventure, Saga, commander

- **Modal DFC / split / MDFC** — each face is its **own registered card file**.
  All faces share `faces: ["Front Name", "Back Name"]` (front first). The
  player picks a face when casting/playing. Example: `grovewatch-elder.ts` //
  `grovewatch-hollow.ts`. Run `gen:cards` after adding each face file.
- **Transforming DFC** — same `faces`, plus `transform: true` on **both**
  faces. Only ever cast/played as the front; a `transform` effect / day-night
  cycle flips it in place. `nightfall-cultist.ts`.
- **Flip card** (rule 710) — `faces: [normalName, alternativeName]` and
  `flip: true` on **both** halves, each its own file. The alternative half
  keeps the normal half's `manaCost` and `colors` (710.1c — write them on it,
  though Scryfall prints the cost on the normal half only; the scaffolder
  does). Cast only as the normal half (710.2); a `flip` effect flips it in
  place. `jushi-apprentice.ts` // `tomoya-the-revealer.ts`.
- **Meld** (rules 701.42, 712.4) — three files: the two front faces are
  ordinary cards (no `faces`), and the combined back face is a file of its own
  with `meldOf: [counterpart, melder]` (the order rule 712.5 lists the pair:
  the card without the melding ability first), no `manaCost`, its own colors
  and P/T. It's never a deck card. The melding card's instruction — "if you
  both own and control ~ and a creature named X, exile them, then meld them
  into Y" — is the effect `{ kind: "meld", partner: { name: "X", type:
  "creature" }, into: "Y" }`, which makes the test as it resolves; on a
  trigger the same "if" is also its intervening if, `condition: { kind:
  "meld-ready", partner: { … } }`. The melded permanent is one new object with
  Y's characteristics and the fronts' mana values summed; leaving, it's two
  cards. The counterpart's "(Melds with …)" line is reminder text. "It
  enters tapped and attacking" (Mishra, Claimed by Gix) is the effect's
  `tapped: true, attacking: "choose"` (rule 508.4), and "if ~ and a creature
  named X are attacking" an `attacking: true` on `partner` with a
  `conditional` on `{ kind: "source", filter: { attacking: true } }` around
  the `meld`.
  `graf-rats.ts`, `midnight-scavengers.ts` → `chittering-host.ts`;
  `hanweir-battlements.ts`; `meld.test.ts`.
- **Adventure** — `adventure: true` on both faces + `faces: [creatureName,
  adventureName]`. `emberclaw-scout.ts`. Each face's `colors` are its own
  mana cost's — Frolicking Familiar is blue, Blow Off Steam red — though
  Scryfall gives the card only the creature's (`card:verify` and the scaffold
  read the spell half's off its cost). An Omen face (`omen`) likewise.
- **Split card** (rule 709) — three files, each with `split: true` and
  `faces: ["Left // Right", "Left", "Right"]`. The whole card ("Left //
  Right") is what it is in every zone but the stack: both halves' text, the
  combined mana cost written as one (`"{U/R}{U/R}{X}{U}{U}{R}{R}"`, rule
  709.4b — `card:verify` joins Scryfall's two), no effect, never cast. Each
  half is an ordinary instant or sorcery, and casting offers each half on its
  own (rule 709.3). `expansion-explosion.ts`, `expansion.ts`, `explosion.ts`.
  **Fuse** (rule 702.102) is `fuse: true` on the whole card alone, which then
  stays effect-less: from its owner's hand it is also offered as face 0, a
  fused split spell for both costs, whose targets are the left half's then
  the right's and which follows the left half's effect, then the right's,
  each reading its own target slots from 0 (as a modal spell's chosen modes
  do). Each half is an ordinary instant or sorcery with one plain `effect`
  (no `resolve`, modes, kicker or X — `pool.test.ts` checks). From any other
  zone only a half is cast. `wear-tear.ts`, `wear.ts`, `tear.ts`;
  `fuse.test.ts`. **Aftermath** (rule 702.127a) is `aftermath: true` on
  the half that has it (Amonkhet's second halves): that half is offered from
  its owner's graveyard (`via: "aftermath"`, for its mana cost), refused from
  every other zone whatever would allow it, and exiled whenever it would leave
  the stack once cast from a graveyard (Kess's permission too). Its text keeps
  the reminder line. `consign-oblivion.ts`, `consign.ts`, `oblivion.ts`;
  `aftermath.test.ts`.
- **Saga** — `chapters: [{ at: number[], targets, effect, resolve, text }]`.
  `at` lists the lore counts that fire the chapter (`[1]`, `[2]`, `[1, 2]` for
  a shared "I, II"). `history-of-benalia.ts`. A chapter takes a triggered
  ability's `divided` (rule 603.3d): "II — Distribute seven +1/+1 counters
  among any number of target creatures you control" is an `any-number` group,
  `divided: { total: 7, slot: 0, of: "+1/+1 counters" }` and a
  `counters-divided` (`the-grand-evolution.ts`). Once its final chapter ability
  has left the stack its controller sacrifices it (rule 714.4) — a real
  sacrifice, so "whenever you sacrifice an enchantment" sees it — and the
  `chapter-resolves` trigger (§9) fires as each chapter ability resolves.
- **Commander** — it's whichever card a `DeckList.commander` names, and the deck
  validator (`canCommandAlone`) allows a legendary creature, Vehicle, or
  Spacecraft with P/T (rule 903.3), or a legendary card with
  `canBeCommander: true` for its printed "~ can be your commander" (903.3a —
  `lord-windgrace.ts`); any other planeswalker can't command. The
  engine adds the `{2}` tax and the command-zone choice (rule 903.9)
  automatically — for a non-creature commander (a Background) too. A
  commander's own "when this dies" trigger works as written: it dies first,
  and is offered the command zone after (Child of Alara).
- **Partner and its variants** (rule 702.124) — a deckbuilding ability, set as
  `pairing` and read only by the deck validator (`canPairCommanders`). The
  printed line still goes in `text`, but the validator never reads `text`, so
  a card without `pairing` can't pair however its text reads
  (`commander-pairing.test.ts` checks the two agree across the pool). Each
  kind pairs only with its own:
  - `{ kind: "partner" }` — plain "Partner". `thrasios-triton-hero.ts`.
  - `{ kind: "partner-with", name }` — "Partner with [name]": only with that
    card, whose own `partner-with` must name this one. The keyword also prints
    an enters trigger; add it as `triggered: [partnerWithTrigger(name)]` from
    `helpers.ts` (target player may search for the named card, reveal it, put
    it in hand).
  - `{ kind: "partner-group", group }` — "Partner—[text]" (`"Father & son"`,
    `"Survivors"`) and the older "Friends forever" / "Character select",
    which pair the same way: only with the identical `group` string.
  - `{ kind: "choose-a-background" }` — "Choose a Background": pairs with a
    legendary enchantment with subtype `Background`. The Background itself
    needs **no** `pairing` — its type line is what makes it one — and it can
    only be a commander as that second half. `ganax-astral-hunter.ts`.
  - `{ kind: "doctors-companion" }` — "Doctor's companion": pairs with a
    legendary creature whose subtypes are exactly `Time Lord` and `Doctor`,
    which needs no `pairing` of its own.

---

## 13. Worked examples

**ETB draw** (`elvish-visionary.ts`):

```ts
triggered: [{
  trigger: { on: "enters-battlefield", who: "self" },
  targets: [], effect: { kind: "draw", amount: 1 }, resolve: null,
  text: "When Elvish Visionary enters the battlefield, draw a card.",
}]
```

**Tap pinger** (`prodigal-sorcerer.ts`):

```ts
activated: [{
  cost: { mana: null, tap: true },
  targets: ["any-target"],
  effect: { kind: "damage", amount: 1, target: 0 },
  resolve: null,
  text: "{T}: Prodigal Sorcerer deals 1 damage to any target.",
}]
```

**Mana dork** (`llanowar-elves.ts`): `activated: [manaTapAbility("G")]`.

**A whole land/rock cycle** — `cards/helpers.ts` has a one-line constructor for
each of the big repeating shapes, and a new member of a cycle should use it
rather than being spelled out: `urzaLand` (Urza's Tower, Mine, Power Plant), `untappedEntryLand` (Mystic Sanctuary's
cycle — "When this land enters untapped" is the trigger's `filter: { tapped: false }`, read as it
enters, so tapping it for mana in response doesn't stop it, as an intervening-if would), `shockLand`, `fetchLand`, `checkLandStatic`,
`enterTappedUnlessLands`, `painLand`, `sacrificeFetchLand`, `talisman` (a pain land's
ability set on a `{2}` artifact), `signet` (a `{2}` artifact with "{1}, {T}:
Add [two colours]" — see the converter note in §15), `tapLand` (enters tapped,
taps for two colours — Timber Gorge; pass `true` for the gain-1-life variant,
Kazandu Refuge), `revealLand`, `basicLand`. `blood-crypt.ts` is the whole
file: `export default shockLand("Blood Crypt", ["Swamp", "Mountain"]);`

**Basic land types and their mana** (rules 305.6, 305.7): a land with a basic land type has "{T}: Add
[its colour]" for having it. A typed land still spells that out — the helpers above and `basicLand`
give it `manaTapAbility` per type, or one "{T}: Add {X} or {Y}." — and the engine reads those as
*stand-ins* for its printed types' abilities (`intrinsicStandIns`; `test/intrinsic-mana.test.ts` holds
every typed land in the pool to covering exactly its types). A stand-in lasts only while the land has
those types (a Tropical Island made a Mountain taps for {R} alone), and a basic land type an effect
gives a land brings its ability with it (Omo, Queen of Vesuva's everything counter; Eluge, the
Shoreless Sea's flood) — so an effect that makes a land a Plains or an Island is an `become`,
never an `become` plus a granted mana ability. A land that has lost all its abilities has none of
them, whenever it got the type. An effect that *sets* a land's subtype to basic land types takes the
abilities from its rules text too (rule 305.7 — Blood Moon, Spreading Seas); `setSubtypes` alone doesn't, so
such a card waits for that.

**{X} burn** (`fireball.ts` / `blaze.ts`): `manaCost: "{X}{R}"`, `targets:
["any-target"]`, `effect: { kind: "damage", amount: "x", target: 0 }`.

**Anthem** (`glorious-anthem.ts`):

```ts
static: [{ affects: { scope: "creatures-you-control" }, grantPt: [1, 1],
           text: "Creatures you control get +1/+1." }]
```

**Aura** (`pacifism.ts`): `subtypes: ["Aura"]`, `targets: ["creature"]`,
`static: [{ affects: { scope: "attached" }, restrictions: ["cant-attack",
"cant-block"], text: "…" }]`.

**Token maker** (`raise-the-alarm.ts`): `effect: { kind: "create-token", token:
"Soldier Token", count: 2 }`.

**Modal instant** — `castModal`, modes chosen as it's cast, a mode with no
targets saying so with `targets: []`:

```ts
castModal: {
  minModes: 1, maxModes: 1,
  modes: [
    { targets: [], text: "You gain 3 life.", effect: { kind: "gain-life", amount: 3 } },
    { targets: [], text: "Draw a card.",     effect: { kind: "draw", amount: 1 } },
  ],
}
```

Modes with their own targets: `duskwood-verdict.ts`, `sunder-charm.ts`; none
at all: `farewell.ts`, `austere-command.ts`.

**Planeswalker** (`chandra-acolyte-of-flame.ts`): `loyalty: 4`, `activated`
abilities each with a `loyaltyCost` and `cost: { mana: null, tap: false }`.

---

## 14. Preview your card

Both views below read the *built* engine, so rebuild after every edit
(`npm run build -w engine`, whose prebuild also registers a new file).

**How it reads** — the library page, which needs no room server:

```
npm run dev -w client          # → http://localhost:5173/library?card=Card%20Name
```

Its card overlay shows the printed face (this is where an `art` override
shows up), the `text` the definition carries for each face, the mechanics
it's built from and the tokens it makes.

**How it plays** — a dev room, with the real client and every decision's real
UI:

```
npm run dev-rooms -w server    # restart it after rebuilding the engine
npm run dev -w client          # → http://localhost:5173/?room=TWOPW
curl -s localhost:4099 -d '{"op":"spawn","room":"TWOPW","player":"alice","zone":"hand","cards":["Card Name"]}'
```

`TWOPW` gives you eight lands against a creature and a planeswalker to target;
`spawn` without `zone` puts a permanent straight onto the battlefield, and
`reset` rebuilds the room. `docs/architecture/server.md` lists the other rooms and commands.

---

## 15. Current engine limitations

If a card needs something here, it can't be authored faithfully yet, so by
**rule zero (§0) it isn't authored at all** — pick a different card, or build
the primitive first (`neededCards-features.md` ranks them by blocked-card
count; `ROADMAP.md` has the architecture constraints).

Keep this list honest in both directions. A **stale** entry is worse than a
real one: it makes authors skip cards that have been authorable for months.
Delete an entry in the same commit as the feature that retires it.

**No vocabulary for:**

- **Aggregates in the layer fold**: a sum or maximum (`AggregateSpec`) is an
  `EffectAmount`, a `StaticCondition` and a cost reduction, but not yet a
  characteristic-defining ability ("power equal to the greatest power among
  other creatures you control") or a static P/T bonus ("gets +X/+0, where X is
  the total power of …") over other permanents' **power or toughness**.
  Reading other creatures' power inside one creature's own layer fold needs
  dependency ordering the engine doesn't have. A **mana value** has no such
  problem: the CDA `{ greatestManaValueOf }` (Karn, Legacy Reforged) and the
  bonus `grantPtPerCount.commanderManaValue` (Tangleweave Armor) are built. An
  **attack batch** ("the greatest power among **them**" — the creatures that
  attacked) can only be approximated by an `attacking: true` filter at
  resolution, which drifts from the batch if an attacker leaves or another
  starts attacking — don't author a card on that approximation. A card that
  reads the creatures attacking *as it resolves* is that filter exactly:
  Ghalta and Mavren's "greatest power among other attacking creatures" (its
  ruling: "X is determined as the ability resolves").
- Putting a card from **another player's** graveyard into **your** hand
  ("put it into your hand" — a steal, not a return). `return-to-hand` with
  `from: "graveyard"` returns a targeted card to its **owner's** hand, which
  is the same thing for your own graveyard and for "return target card from a
  graveyard to its owner's hand";
  `return-from-graveyard` covers *your own* graveyard → battlefield / hand by
  filter; `escape` / `flashback` / `disturb` cover self-recursion of the spell itself;
  `StaticAbility.mayPlay` (Ramunap Excavator) lets you *play*
  matching cards from your graveyard. Reaching **any** graveyard is fine for a
  *targeted* effect — the `card-in-graveyard` target spec plus
  `return-to-hand`, `put-onto-battlefield` (Reanimate's shape) or `put-on-library`.
  Putting a card **on top of / on the bottom of a library** is the
  `put-on-library` effect (Academy Ruins) and `search-library`'s
  `destination: "library-top"` (Vampiric Tutor).
- `modify-pt` / `tap` targeting **another player** by scope. (`mill` takes
  a scope — `"each-opponent"` — as well as a target slot; `draw` takes both a
  `who` scope and a `target` slot, and `discard-hand` takes a scope — see §6.)
- A set rule beyond a shared land type, one-per-slot, different names and
  different powers on a search or a `look-and-choose` (`together` — Atraxa,
  Grand Unifier's one card a card type is built; Rip, Spawn Hunter's different
  powers too). The machinery takes a new rule cheaply
  (`zone-choice-together.ts`).
- `spellsCastThisTurn` triggers beyond `cast-spell` / `this-cast`.
- **Divided damage and distributed counters** — a *spell's* "N damage
  divided as you choose among any number of targets" is built (2026-10-01,
  Magma Opus — see `divided` in §3), and an activated or triggered ability's
  (2026-10-03 — Skarrgan Hellkite, Dragonlord Atarka; see `damage-divided`
  in §6), an X total (Fire Covenant) or one read from X (2026-11-05 —
  Meteor Shower, Shatterskull Smashing), a total read as it's announced
  (2026-10-31 — Volcanic Wind, Lukka, Ureni, Orca) and a reflexive
  trigger's (Death to Our Enemies) too. Fireball's "divided **evenly**"
  (`damage-divided-evenly`) and a cost for each target beyond the first
  (`costPerExtraTarget` — Fireball, Strive) are built too.
- ~~**Mana provenance / restricted spend.**~~ **Built.** The mana pool is a
  list of tagged `ManaUnit`s, so a unit remembers where it came from. An
  `add-mana` effect stamps three optional things on what it produces:
  - `spendOnly: { spell?, abilityOf?, purposes?, chosenType?, uncounterable?, text }` —
    "Spend this mana only to cast a creature spell of the chosen type"
    (Cavern of Souls, Unclaimed Territory, Secluded Courtyard, Ancient
    Ziggurat). `purposes` names what a filter can't, beside `spell` or alone:
    `"turn-face-up"`, `"unlock-door"`, `"disturb"`, `"equip-ability"`,
    `"power-up-ability"`, `"class-level"`, `"foretell"` (Karfell Harbinger),
    `"cumulative-upkeep"` (Adarkar Unicorn; any `unless` paying `times` the source's
    age counters, which is what `cumulativeUpkeep` writes), `"cost-with-x"` ("on
    costs that contain {X}": the total cost being paid, an ability's, a suspend
    cost, or one asked for as something resolves) and `"cost-with-c"` ("a cost
    that contains {C}", the same way: Cultivator Drone). `chosenType` folds in the
    type named as the permanent entered, and `orSpell` is a second filter it
    doesn't touch ("…of the chosen type or a legendary creature spell": The
    Ringhart Crest). `chosenColor` folds in the color chosen as it entered
    (`chooseOnEnter`): Throne of Eldraine's "only to cast monocolored spells of
    that color" is `spell: { multicolored: false }, chosenColor: true`. The cost's
    own `spendOnlyChosenColor` is its "spend only mana of the chosen color to
    activate this ability", and its `xSpendOnly: "B"` is "**Spend only black
    mana on X**" (Crypt Rats' `cost: { mana: "{X}", tap: false, xSpendOnly:
    "B" }`, Crimson Hellkite): the {X} is paid as that many mana of the
    colour, so the X offered stops at what there is; a generic reduction
    (Heartstone) still lowers it. One colour, an activated ability's cost
    only — a spell's (Consume Spirit) isn't built;
    `abilityOf` adds the "…or activate an ability of" half — of a
    permanent on the battlefield ("abilities of creatures" means creature
    permanents: Castle Garenbrig's ruling), unless `abilityOfAnyZone: true`
    ("an ability of a creature **source**" — Secluded Courtyard — which a
    card in the hand or a graveyard can be, rule 109.2a);
    `uncounterable` is Cavern's "and that spell can't be countered", which
    is a property of the spell the mana paid for rather than of the land.
    `notSpell` is the deny-list shape, set alone: "this mana can't be spent
    to cast nonartifact spells" (Karn, Legacy Reforged; a Powerstone) is `{
    notSpell: { notTypes: ["artifact"] } }` — it pays for anything but
    casting a matching spell, an ability, a ward cost and a cost paid as
    something resolves included (Karn's ruling); `notCastFrom: ["hand"]` is the
    same for a zone (Heartwood Crafter's "can't be spent to cast spells from your
    hand"). `castFrom: { zones?, notZones?, yours?, withFlashback? }`, alone or
    beside `spell`, is where the spell's cast from: Lord of the Forsaken's "a
    spell from your graveyard" (`zones: ["graveyard"], yours: true`),
    Interdimensional Web Watch's "spells from exile", Mm'menon's "from anywhere
    other than your hand" (`notZones`), Altar of the Lost's "spells with
    flashback from a graveyard". `purposes: ["kicked-spell"]` is "to cast kicked
    spells" (Elfhame Druid, Volshe Tideturner). A `spell` filter's `hasAbilities`
    reads the spell as it's cast, what a static grants it included (Jasmine Boreal
    of the Seven). On the spell's own card, `spendOnlyManaFrom: <ManaFromSpec>` is
    "Spend only mana produced by creatures to cast this spell" (Myr Superion;
    Imperiosaur's basic lands). `chooseCreatureTypeMenu` limits
    `chooseCreatureTypeOnEnter` to a list (Eclipsed Realms).
  - `spellGains: { spell?, keywords?, lasting?, uncounterable? }` (`uncounterable`: Boseiju, Who
    Shelters All's "if that mana is spent on an instant or sorcery spell, that spell can't be
    countered" — unrestricted mana, unlike Cavern of Souls' `spendOnly`) — "If that mana is spent on a Dragon
    creature spell, it gains haste until end of turn" (Carnelian Orb of
    Dragonkind — rule 106.6): not a trigger, so nothing can respond and the
    source needn't be around; the spell, and the permanent it becomes, gains
    the keywords until end of turn (a `castRider`). It rides on each unit, so
    "if **any of** that mana" (Arena of Glory, its `amount: 2`) is this too,
    each spell a unit went on gaining them. For a duration or a counter the
    mana's own text makes a trigger of ("When you spend this mana…, it enters
    with an additional +1/+1 counter on it and gains hexproof until your next
    turn" — Jade Orb of Dragonkind), `whenSpent` with target 0, the spell.
  - `spellEntersWith: { spell?, counter, amount }` — "If that mana is spent on
    a multicolored creature spell, that creature enters with an additional
    +1/+1 counter on it" (Guildmages' Forum, Animal Attendant — rules 106.6,
    614.1c): no trigger; each unit spent adds its own; spent ahead of plain mana
    when it reaches the spell. `amount` is read as it enters with that spell as
    the source (Opal Palace's `{ commanderCastsOf: "source" }`).
  - `whenSpent: { spell?, effect, text }` — "When that mana is spent to cast
    …" (Path of Ancestry). `spell: "shares-type-with-commander"` resolves
    against the controller's commanders at activation time. It fires as a
    real triggered ability, so it resolves *above* the spell it paid for.
    Only a *cast* fires it — mana spent on an ability never does — and it
    still fires if the permanent that made the mana has left since. A
    `manaValue` clause in `spell` reads the spell on the stack, so its chosen
    `{X}` counts (Gilanra, Caller of Wirewood: `{ manaValue: { op: "gte", n: 6 } }`).
    The spell is slot 0 of `effect` and its trigger object, so `copy-spell`'s
    `"trigger-spell"` is "copy that spell" — as it last was on the stack once
    it's gone (Primal Wellspring, whose ruling copies a spell countered before
    the rider resolves). One rider per unit spent.
  - `persists: true` — "you don't lose this mana as steps and phases end"
    (Savage Ventmaw). Still emptied at cleanup.
  - `untilEndOfCombat: true` — "this mana lasts until end of combat": kept
    through the combat phase's steps, lost as it ends (and not carried into
    an additional combat phase). Firebending's — see the `firebending`
    helper (§6).

  The *identity* clause is `mana: "commander-identity"` (Path of Ancestry,
  like Command Tower): only the player's commanders' colours, never plain
  `"any-color"` — the two differ for a colourless commander, a player with
  none, and a spell stolen from outside the identity. `mana-provenance.test.ts`.
- **An emblem's static can't be a layer-4 effect or a life floor, and an emblem
  has no activated ability of its own.** Those are read only off battlefield
  permanents (Serra the Benevolent; Ob Nixilis of the Black Oath's emblem's
  "{1}{B}, Sacrifice a creature: …"). The statics an emblem does carry are
  listed under `create-emblem` in §6, and `test/emblem-statics.test.ts` fails
  on any other field.
- **The auto-payer pays with a mana ability whose activation cost contains
  mana** — a "converter": `manaSources()` admits one whose own cost is generic,
  coloured or `{C}` pips, or two-colour hybrid (`ManaOption.genericCost` and
  `hybridCost`, a pip of one type or two): the ten Signets via the `signet`
  helper, the Odyssey filter lands' `{1}`, the Shadowmoor filter lands'
  `{G/U}`, Prismatic Lens's and the Grottos' `{1}` for one mana of any colour,
  Ceta Disciple's `{G}`, Apprentice Wizard's `{U}` (2026-10-13). A converter is
  never funded from itself, so a coloured pip isn't circular. One without
  `{T}` (Llanowar Envoy's `{1}{G}`, Bog Initiate's `{1}`) is offered once per
  payment; more activations are by hand. The planner reaches for a converter
  only after the sources that make a colour for free, funds its cost from
  floating mana the payment doesn't need, from those sources (preferring one
  whose colour the cost doesn't want; a source opened to fund one only by a
  free option), or from another converter's output — even a unit already
  paying the cost, which it then pays back — and orders converters last so the
  mana is in the pool when each activates; a Treasure comes after the
  converters (2026-10-10). Only one making more than it costs goes first in
  the funding-first retry. A filter land beside its free `{T}: Add {C}` falls
  back on that `{C}` when its paid option can't be funded (2026-10-13).
  Still out: an `{X}` cost, since nothing is resolving during payment
  planning; a hybrid pip with a generic or Phyrexian half; one that
  sacrifices itself without making more than it costs (Golden Egg,
  Kaleidostone — Implements of Sacrifice is in) or has no `{T}` (Crosis's
  Attendant): sacrificing to swap mana is the player's call. Selvala, Heart of
  the Wilds is still blocked, on its output rather than its cost.
- **A *mana* ability with a `tapOthers` cost is invisible to the auto-payer**
  (Jaspera Sentinel, Holdout Settlement: "{T}, Tap an untapped creature you
  control: Add one mana of any color"). `useManaSource` taps only the source,
  so offering these to `manaSources()` would hand out the mana without paying
  for it — strictly better than the printed card. They're excluded there and
  stay activatable by hand, which floats the mana; the effect is that the card
  is inert during auto-payment rather than wrong.
- No **"a player plays a land"** trigger distinct from "a land enters the
  battlefield" generally (Burgeoning) — the latter also fires for a land
  fetched by an effect, which the former shouldn't (needed-cards P18).
- **"As this enters" choices — the ways onto the battlefield that don't ask.**
  A Clone's copy (`copyOnEnter`), a chosen creature type and a `chooseOnEnter`
  word are asked *before* the permanent moves (rule 614.12 —
  `Game.askEnterChoice`), so the replacements that apply as it enters and the
  triggers that see it arrive both see it as chosen: a Clone copying an Angel
  gets Giada's counters, and gets the Angel's own "when this enters". Asked
  on a spell resolving, a land played, a reanimation (`put-onto-battlefield`,
  `return-from-graveyard`), a blink or a delayed return, an O-Ring's return,
  a tutor to the battlefield, a `reveal-until`'s find and a token copy
  (`create-token-copy`: each token for itself, off the battlefield until all of
  one instruction's have chosen, then entering together; a copy of a Clone
  that copied something copies what it copied, and a Clone's copy replaces the
  first copy's exceptions, rule 707.3). Not asked — it enters with nothing
  chosen — for a token made by name (`create-token`), a token with devour
  excepted (Dragon Broodmother's Dragons: asked as a token copy is), and
  `debugSpawn`.
  An `others-enter-battlefield` replacement's filter reads its permanent as
  its source, so Metallic Mimic's "each other creature you control **of the
  chosen type** enters with an additional +1/+1 counter" is `ofChosenType`
  there. "Is the chosen type in addition to its other
  types" is a static's `addsChosenCreatureType` (Titan of Littjara — §4).
- **Embalm** (rule 702.128 — Vizier of Many Faces, whose Clone ability has
  to carry it) is an unmodeled alt-cast mechanic (needed-cards P18); retrace
  is built (the `retrace` field) but not granted (Six). Bestow is built (the `bestow` field), but not
  combined with another cost or cast from the graveyard (Detective's Phoenix).
  **Riot** (rule 702.136) is built for a permanent that has it printed or
  copied (Skarrgan Hellkite — asked before it moves, like any "as this
  enters" choice), printed, copied, granted by a static that will reach it
  there (Rhythm of the Wild, rule 614.12) or gained as a spell. A token isn't
  asked, with the other as-enters choices above, and gets haste (its "if you
  don't"), so "other Spiders you control have riot" (Spider-Punk) is short of
  a choice for a Spider token.
- **Blitz** and **dash** are offered only from the hand and the command
  zone: a card with blitz or dash that another permission lets you cast (from
  exile, a graveyard, the top of a library) isn't offered that cost there.

**Partial:**

- **One instruction over several targets needs `simultaneous`.** "Destroy
  two target creatures", "return this card and up to one other target
  creature card" is one step per target slot, and only a `sequence` marked
  `simultaneous: true` (§6) moves them as one event: each leaving permanent
  sees the others leave, each entering one sees the others enter (the Elas
  il-Kor ruling), and none is "already" on the battlefield for another's
  `others-enter-battlefield` replacement (Giada). Without it they move one
  after another. Mass moves — a wrath, a token batch, `return-from-graveyard`
  of every match, a flicker's return, a tutor's finds, an O-Ring's exiles
  coming back — are one event already (`Game.withLeaveBatch`,
  `Game.withEnterBatch`).

- **Cascade and suspend cast with no modes and no optional costs.** Their
  free cast reads only the card's `targets`: a `castModal` spell (a Charm, a
  spree spell) cast that way has no modes and does nothing, and kicker or a
  gift is never offered (BACKLOG, "Engine rules gaps"). Cast any other way —
  from a hand, a graveyard permission, a `cast-now` — they're whole.
- **Text-change** (rule 612): exchanging text boxes is built (612.5 —
  `exchangeTextOnEnter`, Deadpool, Trading Card; `GameObject.textFrom`, and
  every ability read goes through `rulesTextName`). Word replacement isn't
  (612.2 — "change the text of target permanent by replacing all instances of
  one creature type with another": Artificial Evolution, Mind Bend, Magical
  Hack, New Blood); the partial `change-text` effect, which only ever changed
  the type line from a fixed menu, was removed on 2026-10-09. Exchange of
  Words (its "for as long as this enchantment remains on the battlefield"
  duration) isn't built.
- **Conditional statics / intervening-ifs** are limited to the
  `StaticCondition` kinds the union lists (`controls` / `opponent-controls` /
  `your-turn` / `threshold` / `delirium` / `metalcraft` / … — read the type).
  Other "as long as …" / "if …" clauses aren't expressible. (Coven and raid
  are built: `coven` and `turn-stat` `attacked`.)
- **Replacement ordering** — if two replacements would apply to one event
  there's no general `choose-replacement-order`. Feather, the Redeemed's
  exile beside another replacement that would exile the same resolving spell
  (flashback, Rest in Peace, an Adventure) asks, as a `choose-modes` decision
  (`exile-spell-as-it-resolves`, §6). A draw from an empty library under
  Laboratory Maniac (or Jace, Wielder of Mysteries) and an opponent's Notion
  Thief doesn't: the win is applied first, which is the drawing player's pick
  whenever they can win; when they can't (an opponent's Platinum Angel),
  letting the Notion Thief's controller draw instead isn't offered. Nor is
  which Notion Thief goes first when Thieves of **two different opponents**
  could take a draw (a game of three or more): the drawing player would
  choose (the Notion Thief ruling), and which one they pick decides which
  opponent ends up drawing; the engine takes the one first in turn order
  after them. (Against one opponent, however many Thieves they have, there's
  nothing to choose.) The same for Crafty Cutpurse effects of two different
  opponents on one token (`Game.tokenCreatorAfterRedirects`).
- **Snow mana of a spell's colours** — Boreal Outrider's "if {S} of any of
  that spell's colors was spent": a clause can't yet read the spell's colours
  for its `type`. Snow mana itself
  (`{S}`) is built — see §4.
- **A static can't pick what it affects by power or toughness.** Tetsuko
  Umezawa's "creatures you control with power or toughness 1 or less can't
  be blocked" needs P/T read inside the layer fold that computes them, and
  an `affects` filter with a `power`/`toughness` clause matches nothing
  there, so the card is blocked (`engine/data/sweep-3/B10.json`).
- **A keyword-scoped static sees only one level of keyword grants.**
  `withKeyword`/`withoutKeyword` match the target's *current* keywords, but
  those are folded from every static *not* itself scoped by keyword (plus
  emblems and the target's own modifiers). So Sephara's indestructible,
  granted to fliers, is invisible to another keyword-scoped static — a
  "creatures with indestructible get …" anthem wouldn't see it. No pool card
  needs that yet.
- **Additional costs** are `sacrifice` (a `CardFilter`, with `sacrificeCount`
  for several or X of them), `discard` (a count) and `payLife` (a count) —
  several may be set and all are paid. Not yet: a *spell's* "exile a card from
  your graveyard" form (an activated ability's is `exileFromGraveyard`, §8),
  an activated ability's "discard a card with mana value X" whose X a target
  reads (Kozilek, the Great Distortion). "You may sacrifice **any number** of …" is
  `sacrificeCount: "x"`: one that changes what it costs is `sacrificeReduces` (Dargo), one that
  copies the spell for each is `copyForEachSacrificed` (Plumb the Forbidden). **Kicker** is a
  single optional cost, a multikicker or two kicker costs (`kicker.second`).

**Phasing** (rule 702.26) is modeled (`phase-out`, the `phasing` keyword), but
not an ability that triggers when a permanent phases in or out (rule 603.10b —
no pool card has one yet), nor "phases out until …" with any event other than
its source leaving the battlefield.

**Not modeled at all:**
banding, "day/night"-independent double-faced tokens, ability-dependency
ordering (rule 613.8),
a −X loyalty cost (Ugin, the
Spirit Dragon).

### Known exceptions already in the pool

**None, since 2026-09-28.** Rule zero (§0) was written on **2026-09-20**, after
739 cards were already in, and the cards that predated it and didn't meet it —
each lost a printed ability or ran a wrong one — were debt, not precedent. No
new card joins this list: one the engine can't run exactly isn't authored.

`npm run card:text -w engine` is the live ledger for the first kind (a whole
clause gone missing). It found 13 of 739 on the day the rule landed. Every one
was fixed, with the feature each needed, but one:
Artificial Evolution was **removed** (2026-09-28): it changed only a
creature's type line, not the creature-type words in its rules text, and only
from a fixed menu of 12 types, and doing it properly — layer-3 text changing
across a card's abilities, for spells too — was more than one card rated. The
`change-text` effect and `choose-text` decision it used were removed on
2026-10-09. The fixes: Rydia, Summoner of Mist (the Summon
ability — Saga reanimation, `{X}` in a target filter); Saw in Half (half the
creature's P/T as a copy's `basePt`, and the `"died"` this-way gate — it had
made two 1/1s even of an indestructible creature); Finale of Devastation
(`search-library`'s `zones`, and its X ≥ 10 pump now waits for the find, which
it had missed); Fireball (`costPerExtraTarget`, `damage-divided-evenly`);
Mortivore (regeneration, which gave Wrath of God and the rest their "can't be
regenerated"); Will of the Sultai (`castModal.maxModesIf`); Starfield Vocalist
(`warp`); Iridescent Vinelasher (Offspring — `kicker.keyword` and
`offspringTrigger`, and "if it was kicked" now reads a departed permanent's
last-known information, which Verix Bladewing needed too); Fanatic of Rhonas
(`eternalizeAbility` and the `noManaCost` copy exception); Chandra, Acolyte of
Flame (the `cast-now` effect and decision); Terror of the Peaks (the
`targetedBySpellsCost` static, in place of a ward stand-in); Combat Thresher
(`prototype`).

The five `proliferate` cards were a fourteenth entry of exactly the kind
`card:text` cannot see — their text was right and their *behaviour* wasn't —
and have since been fixed rather than listed.

That last point is the ledger's limit, and Saw in Half is the proof: the audit
flagged four trailing words of it ("Round up each time") while the substantive
error — two 1/1s where the card makes two half-size copies — sat inside a
clause the matcher scored as close enough. **`card:text` catches a dropped
clause; nothing catches a wrong one but reading the card.**

Since 2026-10-02 it reads both ways inside a matched clause: a content word
ours *adds* is reported too ("added:"), not only one it drops. Harrow's lands
entered "tapped" and Tranquil Thicket's mana ability read "Sacrifice", both
words the real card doesn't have, and the one-way audit passed both; and
"may" is no longer filler (Temur Ascendancy's optional draw was forced). It
still only reads `text`: a card whose text is right and whose effect isn't
is invisible to it.

---

## 16. Testing a new card

- **Read the Oracle text beside the finished file**, clause by clause, and
  confirm each one is expressed. This is the only check that catches a clause
  that's present but *wrong* (§0, §15) — every tool below is blind to it.
- **Write the test from the Oracle text, not from the file.** A test that
  asserts what our card does locks a mistake in: Harrow's test said "fetches
  two basics tapped" because the card did, and kept passing.
- **Fuzz it.** `npm run play:random -w engine -- --games 100 --with "Card
  Name"` puts it in every seat's deck (the fuzzer's decks are built per seed
  from the whole pool, so it's already in the rotation without this; `--with`
  just makes sure it's drawn). If `legalActions` ever offers something
  `dispatch` refuses, this crashes.
- **Write a focused test** if the card exercises new-ish behaviour, on the
  shared table in `engine/src/test/harness.ts`: `table()` (alice's turn 1,
  main phase, her priority), `spawn` (silent) and `enter` (fires its enters
  triggers), `cast`/`activate` (which throw the engine's refusal instead of
  doing nothing), `pickTargets`/`watchTargets`/`pickModes`/`pickPermanents`/
  `pickFromZone` for the seats' answers, `attack`/`blockOffer`/`toStep`, and
  reads (`pt`, `keywords`, `supertypes`, `counters`, `life`, `named`, …).
  `engine/src/test/precon-standins.test.ts` is written on it. `npm run
  card:brief -w engine -- "Name" --test` prints a `describe` with an
  `it.todo` per ability and per ruling to start from. Vitest doesn't
  type-check tests; `npm run typecheck -w engine` does (`npm run verify` runs it).
- **Harness pitfalls** — where a test author's guess about the harness was
  wrong (batch 268's lead and three agents, 2026-11-06). Check this list
  before a test fails for a reason that isn't the card's:
  - **Every target slot gets an answer.** `cast`/`activate`'s `targets` and
    `pickTargets` need one entry per slot, `null` for a declined optional one —
    a per-opponent card (`{ seat: 1 }`, `{ seat: 2 }`, `{ seat: 3 }`) has all
    three slots even at 2 or 3 players. A refusal for the slot count looks
    like any other, so assert the message: `toThrow(/target/i)`, never a bare
    `toThrow()`, which passes for the wrong reason.
  - **Names, types and supertypes have their own reads.** `computeCharacteristics`
    has no `name`: a copy's "except its name is …" is `nameOf(object)`
    (`state.ts`). Use the harness's `types`, `subtypes`, `supertypes`,
    `keywords` and `pt`, not fields guessed off the characteristics object.
  - **`spawn()` doesn't make a token.** `debugSpawn` by a token's name gives an
    object with `isToken` false, so `tokensNamed` and `token: true` filters
    miss it. Make a token with a `create-token` effect
    (`game.debugApplyEffect`).
  - **"Put there from the battlefield this turn" needs the trip.** `toGraveyard`
    puts a card straight in; `spawn` then `game.debugMove(id, "graveyard")`
    (or `destroy`) is a card that died this turn.
  - **Which seat hook answers what:** targets are `pickTargets`/`watchTargets`;
    a card chosen from a zone — `look-and-choose`, `copyOnEnter`'s "enter as a
    copy of", "a card exiled with it" — is `pickFromZone`; permanents chosen
    without targeting are `pickPermanents`; modes and a `may` are `pickModes`.
  - **An attacker nobody can block** never asks the defender to block, so
    `blockOffer` runs on into a later turn: check combat straight to damage
    instead.
  - **A cost's sacrifice takes a filter wrapper:** `sacrifice: { filter: {
    subtype: "Food" } }`. A bare `sacrifice: { subtype: "Food" }` type-checks
    but throws at runtime.
  - **Prove a setup-dependent test can fail**: break the clause it checks
    and watch it go red, once.
- **Run the suite:** `npm run test -w engine` — or everything a change must
  pass, the fuzzer with the new cards forced in included: `npm run verify`.
- **Eyeball it:** in a dev room (§14).

Periodically re-verify the *whole* pool, not just new cards — `npm run card:verify -w
engine` (`engine/scripts/verify-cards.mjs`) diffs every `cards/pool/` card's mana cost,
colors, supertypes/types/subtypes, and power/toughness/loyalty against real Scryfall
data (batched, ~4 requests for the whole pool). A prior pass had shipped several cards
with a plainly wrong cost/color/stat block that no test caught, because nothing was
checking a card's characteristics against the real thing once it was in the pool — see
"Full-pool Scryfall verification pass" in `neededCards-features.md`. It only checks
structural fields, not ability text/behaviour, and skips `cards/tokens/` (token names
aren't unique on Scryfall).

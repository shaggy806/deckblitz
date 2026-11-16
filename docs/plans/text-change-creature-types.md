# Text changes over creature types

Status: done (2026-11-16) — `effect:text-change-creature-type-words`, proved on New Blood and
Artificial Evolution.

## What it is

Rule 612.2: a text-changing effect changes the words "used in the correct way", and names a
creature type word used as a creature type beside colour words and land types. Two cards do it:
Artificial Evolution ("replacing all instances of one creature type with another. The new creature
type can't be Wall") and New Blood ("… of that creature … with Vampire"). The engine already
changed colour words and basic land types (`text-change.ts`, 2026-10-31): a `PtModifier.textChange`
whose object's rules text is a definition of its own, built by the registry under a
`textChangedKey` that `rulesTextName` returns. This extends that one mechanism to a third kind of
word; it adds no new decision, layer or effect kind.

## The rules it follows

- **612.1** — the type line too. `changeSubtypes` now swaps creature types as it swapped land
  types, before layer 4, so a Goblin made a Vampire is no Goblin to anything.
- **612.2** — never a name: the card's own name, a token's given name ("Llanowar Elves"), Mirrodin
  Besieged's "Mirran or Phyrexian" faction (a choice's value), are masked or skipped.
- **612.2a** — a token-making text's creature types are also the token's name: "create a 1/1 red
  Goblin creature token" made Vampire makes a "Vampire Token" (rule 111.4's name for an unnamed
  token). `tokenNamedByTypes` tells such a name from a given one ("Marit Lage", "Walker").
- **612.3** — granted abilities aren't the object's text: only the definition changes.
- **612.4 / 111.3** — a token's subtypes and text are its maker's words, so a token made by changed
  text carries the changes as **copiable** values (`textChange`, `setName`, `setColors` with
  `copiable: true`): a copy of the token is the same (707.2), a copy of the changed creature isn't.
- **400.7a** — a permanent spell keeps the change as the permanent it becomes (the existing
  `castRider`).
- **New Blood's rulings** — the type is chosen as it resolves, any existing creature type whether
  or not the text has it (so the choice is the whole catalog, 205.3m, never a card type), the
  creature is a Vampire only if the type chosen was on its type line, "part of a word" ("non-Human")
  changes, the cost may tap a Vampire that came under your control this turn, and a granted ability
  keeps its words.

## The one judgement call: where a word is "printed"

The definitions hold creature types in structured fields (`subtype`, `notSubtypes`, `addSubtypes`,
`creatureType`, `exclude`…), and many of them are a keyword's or a batch word's, not the card's
words: afterlife's Spirits, soulshift's Spirit, embalm's Zombie, mutate's "non-Human", living
weapon's Germ, mobilize's Warriors, "outlaw"'s five types. Rule 612.2 changes only words on the
card; the rules' definition of a keyword or a batch word isn't text on it (reminder text isn't
rules text, 207.2). So a creature type changes in a field only where **its ability's own line, with
reminder text left out, prints the word** — "Goblin", "Goblins", "non-Goblin", "Goblincycling". An
ability's line is its `text` (a top-level `triggered`, `activated`, `static` or `chapters` entry),
in place of the card's other lines; every text below it (a mode's bullet, a choice's label, a
delayed or granted ability's words) adds to it, since those are part of that line. The same test
decides whether a created token, a gift's token or a face-down permanent's listed types take the
change, and the shown text changes inside a line's reminder text only when that line prints the
word outside it. Two pool audits pin it: every field holding a creature type is a word field or a
name/value field, and the cards where a skipped word is printed on another line (the soulshift and
"outlaw" cards) are listed by hand.

## What it adds

- `change-text`: `words: "creature-type"`, `to` (a word the card names — then only the first is
  asked, and it isn't offered), `notTo` (words the second can't be).
- `choose-value`'s `"text-word"`: a creature type is a **catalog** `choose-creature-type` (the
  search picker); `except` takes a list; `on` names the target whose own creature types lead the
  suggestions (`AwaitingDecision.suggestFirst`, public — it reads only that permanent's text). The
  client's picker shows the decision's `prompt` ("choose a creature type to replace with Vampire"),
  so Artificial Evolution's two questions read apart.
- Every way a text names a token it makes takes the change: `create-token` and a gift's token
  through `tokenTextChanges`, a would-create-token replacement's tokens (Chatterfang's Squirrels,
  Jinnie Fay's choice) through the name itself (`changedTokenName`, read only by `Game`'s token
  event and minted as the plain token with the changes as copiable values). Colour words ride the
  same path, so Sleight of Mind now turns Chatterfang's Squirrels blue.
- `GameObject.faceDown.textChanges`: what a text change made of an effect's listed face-down
  characteristics ("They're 2/2 Horror creatures", "It's a Forest land"), applied with the type
  line and gone when it's turned face up. Land types ride it too: Magical Hack now reaches Yedora.
- `alsoSubtypes` ("is also a Cleric, Rogue, Warrior, and Wizard") left `TOP_KEYS`: it's text-box
  words.

## What it leaves out

- Sarpadian Empires' "choose white Citizen, blue Camarid, …": the option labels are a choice's
  values and stay; the tokens they map to do change.
- Swirl the Mists (a static over every object's text) and Exchange of Words' duration, as before.
- The bots value a token by its definition, not by what a changed text made of it; and a bot
  answers the catalog choice with the first suggestion (the target's own type, for New Blood).

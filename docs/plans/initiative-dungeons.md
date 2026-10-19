# The initiative and dungeons

**Status:** decided, in progress (2026-10-19). Asked for by the user ("start looking into the
client design for the initiative style cards") while the set walk reached Commander Legends:
Battle for Baldur's Gate. The user's answers to the open questions are at the end; building
starts with step 1.

## Why now

Two mechanics, one machine:

- **Venture into the dungeon** (rule 701.49, dungeons rule 309) — Adventures in the Forgotten
  Realms. A player who ventures puts a dungeon card into the command zone, moves a marker room by
  room, and each room has an ability that triggers as the marker enters it.
- **The initiative** (rule 726) — Battle for Baldur's Gate. A designation like the monarch; its
  holder ventures into **Undercity** (a fifth dungeon, only reached this way — 701.49d) when they
  take it and at each of their upkeeps, and combat damage to them steals it.

What waits on them (`mechanic:dungeon` in the needs vocabulary): 10 triaged cards (Acererak the
Archlich, Sefris of the Hidden Ways, Nadaar, Seasoned Dungeoneer, the three Adventurers, Radiant
Solar, Sarevok's Tome, Explore the Underdark), and about 21 more in Baldur's Gate's remaining 161
("you take the initiative": Rilsa Rael, Caves of Chaos Adventurer, Undermountain Adventurer,
Trailblazer's Torch, Safana, Imoen, Dungeoneer's Pack …). Forgotten Realms and its Commander set,
when the walk gets there, add dozens more. It is the largest engine feature left in the walk.

## The rules that shape the design

- A dungeon is a **card in the command zone**, not a permanent (309.2b-c). One per player at a
  time (309.3). Its **rooms form a directed graph**: from some rooms two arrows lead on, and the
  player **chooses** which (701.49b). Room names are flavor (309.4b).
- Each room ability is **a triggered ability of the dungeon card**, controlled by its owner, that
  uses the stack (309.4c): "When you move your venture marker into this room, [effect]". So it
  has a source the stack can name, and it can be responded to.
- Venturing from the bottommost room removes the dungeon (**completing** it, 309.7) and starts a
  new one (701.49c); a state-based action also completes a dungeon whose marker sits on the
  bottommost room once its last room ability has left the stack (309.6). Cards ask "if you've
  completed a dungeon" / "… Tomb of Annihilation", and "whenever you complete a dungeon".
- Which dungeon to enter is **chosen** as the venture starts (701.49a) — among the three AFR
  dungeons for "venture into the dungeon", Undercity only for "venture into Undercity".
- The initiative's three abilities are **sourceless triggered abilities** that use the stack
  (726.2 — an exception to 113.8): venture at its holder's upkeep, steal it with combat damage,
  venture whenever a player takes it (including retaking it, 726.5). It passes like the monarch
  when its holder leaves the game (726.4).

### A gap found on the way: the monarch

The monarch's two abilities are sourceless triggered abilities too (725.2), but `Game` folds
them in **without the stack**: `endStepActions` draws directly (game.ts ~5957, its comment says
"folded in here without the stack, like the draw step"), and combat damage calls `setMonarch`
inline (~30461). So neither can be responded to (a Stifle, a flash blocker's death trigger
ordering, "whenever you draw" timing), and the comments cite the pre-2026 numbers (720.x). It isn't
in `docs/engine-gaps.md`. The initiative needs exactly the machinery the monarch is missing — a
pending trigger with no source object, controlled by a player — so the plan builds it once and
moves the monarch onto it in the same change.

## Engine model (what the client reads)

- **Dungeon definitions as data**, hand-authored: Lost Mine of Phandelver, Dungeon of the Mad
  Mage, Tomb of Annihilation, Undercity. Each is `{ name, rooms: [{ id, name, next: id[],
  effect, targets, text }] }`, the room effects in the ordinary `EffectSpec` vocabulary. **The
  Oracle snapshot has no room text** (Scryfall files the dungeons as double-faced tokens with
  empty text), so the four are authored from the printed cards and checked by a test that pins
  each room's text, not by `card:verify`.
- **The dungeon is a real `GameObject` in the command zone** (309.2b), owned by the venturing
  player, so a room ability's source is an object: the stack can show its name and art, "source"
  refs work, and the commander-zone code already knows how to hold non-permanents there.
- State: `PlayerState.dungeon: { object, room } | null`, `PlayerState.completedDungeons:
  string[]`; `GameState.initiative: PlayerId | null` beside `monarch`.
- Two new decisions (one module each under `decisions/`, the decision registry):
  **`choose-dungeon`** (as a venture starts with no dungeon) and **`choose-room`** (at a fork).
  Both carry everything the client needs to draw the choice — the dungeon(s), the rooms, the
  marker, the legal next rooms — so the client never reads a definition itself.
- Events: `initiative-changed` (`via`: effect / combat-damage / holder-left, like
  `monarch-changed`), `ventured` (player, dungeon, from-room, to-room), `dungeon-completed`.
- Sourceless triggers: a `pendingTriggers` entry with no `sourceObjectId`, a controller and a
  label ("the initiative", "the monarch") — the stack, the log and the bots all need a name for
  them.
- Conditions and triggers cards ask for: `has-initiative`, `completed-dungeon` (any / a named
  one), `completes-dungeon` and `takes-initiative` triggers, `ventures` triggers (Nadaar's "whenever
  you venture into the dungeon").

## Client design

The constraints come from `client/CLAUDE.md`'s standing rules: no fixed px (everything off
`--card-w`), a quadrant has no height to spare at ~768px tall, **what a decision picks is picked
where it lives** (not from a row of name buttons), and every decision asks in the bottom-right
`.decision-banner`. Precedents to reuse: the monarch's 👑 chip in `PlayerPanel` and its flying
crown in `AnimationLayer`; the emblems' count-plus-viewer (`onOpenEmblems` → `ZoneViewer`); the
`CreatureTypePicker` popup that opens beside the banner when the choice is too big for it.

### 1. Who has the initiative — a chip, like the crown

A chip in the player panel's head row, beside 👑: the Initiative's icon (the card's own art,
small, or a glyph if art reads badly at that size), titled "The initiative (rule 726): ventures
into Undercity at their upkeep; combat damage to them takes it". On `initiative-changed` it flies
from the old holder to the new, exactly as the crown does (`runCrown` generalised to a
designation). No chip anywhere until someone takes it (726.1).

### 2. Where each player is — a progress chip that opens a map

Also in the head row, only while a player has a dungeon: **`Undercity 3/5`** — the dungeon's
name and how many rooms deep the marker is, out of the longest path. Completed dungeons show as a
small count beside it (`✓2`) once there are any, since cards ask about them. It's public
information (309.2b — the command zone), so every seat sees every chip.

Clicking it opens the **dungeon map** in a modal (a portal, like `ZoneViewer`): the room graph
drawn top to bottom as nodes and arrows — each node the room's name and its effect text through
`<Symbols>` — with the venture marker on the current room, visited rooms dimmed, and the rooms
reachable next outlined. Below it, the dungeons this player has completed. The real card image
is one hover away (the dungeon's art pin), but the map is **drawn by us**, not a marker
overlaid on the card image: overlay coordinates per room per printing would be fragile, and the
card's text is too small to read at board size anyway.

Why not always show the map on the board: four rooms deep and two wide doesn't fit a quadrant's
height at 768px, and it's needed only at a fork or when someone asks.

### 3. A fork — choose the room on the map

When `choose-room` is waiting: the banner says **"Venture into Undercity — choose the next
room"**, and the dungeon map opens beside it (the `CreatureTypePicker` pattern: a popup tied to
the banner, collapsible with "Show choices") with the two candidate rooms highlighted and
clickable, each showing what it does. Clicking a room answers the decision. That keeps the rule
that a choice is made where the thing is — the room is on the map — and the effect text is right
there to weigh. Opponents see "Alice is choosing a room…" in the waiting label
(`game/waitingLabel.ts`) and can open Alice's map from her chip.

### 4. Entering a dungeon — choose among the three

`choose-dungeon` (only for "venture into the dungeon", never Undercity): the banner says
**"Venture into the dungeon — choose a dungeon"**, and the popup shows the three dungeons side by
side as small maps (Lost Mine of Phandelver: four rooms deep, quick; Dungeon of the Mad Mage:
long; Tomb of Annihilation: short and harsh), each a button. A dungeon a card cares about by
name (Acererak's "if you haven't completed Tomb of Annihilation") is just one of the three; the
client doesn't hint.

### 5. The stack and the log

- A room ability on the stack shows the dungeon as its source — the dungeon's art in the tile,
  "Undercity — Forge: Put two +1/+1 counters on target creature" as its text — so `Stack.tsx`'s
  source naming learns the command-zone dungeon object (App.tsx already draws emblems, which
  aren't in `view.objects`, through `emblemToVisible`; a dungeon is a real object, so it should
  need less).
- A sourceless trigger shows its label instead of a card: "The initiative — Alice ventures into
  Undercity", "The monarch — Bob draws a card". (This is new for the monarch: today it never
  appears on the stack.)
- Log lines (`format.ts`): "Alice takes the initiative", "Bob takes the initiative (combat
  damage)", "Alice ventures into Forge (Undercity)", "Alice completes Undercity".

### 6. Animation

Only two new cues, both small: the designation flying (shared with the crown), and the marker
stepping room to room on an open map (a short slide; nothing on the board when the map is shut —
the chip's count ticks up). Both go through `animationSchedule.ts` like the rest, so the viewer's
speed setting covers them.

## Bots

v2 needs answers for the two decisions: which dungeon (Lost Mine early, by default, unless a card
it controls names one), and which room (a cheap evaluation of each room's effect from the same
effect-worth knowledge that ranks targets — `effect-worth.ts`). The initiative changes combat
value: attacking the initiative holder is worth more than the damage, and holding it worth
defending. `bot-effect-knowledge.md` gets an entry; the gate and a decision-diff check it.

## Build order

1. **Sourceless triggers** in the engine, and the monarch moved onto them (its own commit, with
   tests that it now uses the stack — a rules fix on its own). **Done 2026-10-19**, on the pattern
   speed and rad counters already used rather than a new "no source" trigger: an inherent
   ability rides a pseudo-card object (kind `"emblem"`, in the command zone but in no zone list)
   that the trigger scan reads — `cards/monarch.ts`, `GameState.monarchAbility`, its controller
   kept the monarch. The view already hides an emblem-kind source; the ability's name on the
   stack is the object's ("The Monarch"). The initiative's three abilities take the same shape.
2. **Dungeons**: the four definitions, the command-zone object, venture, the two decisions,
   completion (the action and the SBA), the conditions and triggers; `dungeons.test.ts`. The
   decisions' wire shapes in `protocol/`.
3. **The initiative** on top: the designation, its three triggers, leaving the game; tests.
4. **Client**: the chips, the map modal, the two pickers, the stack and log text, the animation.
   Checked live in a 2- and a 4-player room at ~768px tall and at 1920×1080.
5. **Bots**: the two decisions, combat value; gate + decision-diff.
6. **Cards**: the 10 waiting and Baldur's Gate's ~21, then the walk carries on.

## Decisions (the user, 2026-10-19)

1. **Initiative chip** — a plain glyph, not the card's art.
2. **Dungeon map** — our own drawn graph, not the card image with a marker.
3. **The map at a fork** — a popup beside the banner (the `CreatureTypePicker` pattern).
4. **The monarch fix** — step 1 of this work.

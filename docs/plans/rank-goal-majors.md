# The rank goal's majors, and the lanes run

Status: **approved, not started** (2026-11-13). The user approved all five majors below for the
lanes run; New Blood was approved earlier the same day.

## Why lanes

The rank goal (every Commander card to EDHREC rank 10,000) was left, after batch 321, with 192
cards. The B322 re-triage (one read-only agent, `engine/data/sweep-3/B322.json`) read the 55
unsized records and the 50 majors against the engine as it now is: 7 cards run as they are (one,
Perplexing Chimera, on a key already built), 93 are small, 5 are still major. Several "majors" had gone stale as features landed (Vaevictis
Asmadi's per-player targets, built for Guff Rewrites History in B321).

The small keys are built by `build-family`'s **overnight lanes** mode (its skill has the
procedure): keys handed out by the part of the engine they're built in (`engine/data/lanes.json`,
six lanes), one agent a lane at a time, four at once, each agent taking its lane's next 3-4 keys
plus any key in the same implementation group. The aim is less wasted work a key rather than
more agents: one orientation serves several related keys, a group gets one general
implementation, and agents at once edit different parts of `game.ts`. Picking strictly by rank,
the overnight runs measured ~13 minutes a key; lanes should beat that, and the first night says by
how much.

## The majors

Each runs as an agent of its own, alone in its slot, with the design below as its starting point
(not a lane: none shares its key with another card in the goal list, except as noted).

- **Nicol Bolas, Dragon-God** (3677): each opponent chooses a card in hand or a permanent in one
  pick, unrevealed, knowing the choices before theirs, then all are exiled at once — a
  choose-from-zones decision across the hand and the battlefield, with its client UI; and a
  layer-6 static giving him the loyalty abilities of every other planeswalker (close to Havengul
  Lich's gained activated abilities). The mixed pick also serves **Lich's Mastery** (7960, sized
  small in B322 on that condition).
- **New Blood** (4536): changing a creature-type word in text (rule 612.2a) — the type line,
  every filter, "non-X" words and the names of tokens it creates. `change-text` knows colour and
  basic-land-type words only.
- **_____ Goblin** (6753): stickers (rule 123) — each player's sticker sheets, putting a name
  sticker on a permanent, the vowels on it counted.
- **Karn Liberated** (7147): restarting the game (rule 727) — new libraries from every card each
  player owns, starting life, mulligans, the command zone, Karn's linked exiled cards kept out and
  then put onto the battlefield. A core-rule change: it reaches the room server.
- **Zilortha, Strength Incarnate** (8974): lethal damage judged by power — every lethal-damage
  read (the state-based action, combat assignment in `combat/`, trample's excess, "excess
  damage", the bots' estimates) through one helper a static can switch.

## Order

1. Author the seven runs-now cards (`npm run cards:goal -w engine -- --size runs-now`): Displaced
   Dinosaurs, Gilraen, Faramir, Olivia, Perplexing Chimera, Arlinn, Vaevictis Asmadi. Each `why` in B322 names the
   point its test must settle.
2. `/build-family overnight lanes`, the majors among the agents as slots allow, Nicol Bolas and
   Zilortha first (best ranked; Zilortha is the closest to small).

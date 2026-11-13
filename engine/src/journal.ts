/**
 * What has happened in the game, for "this turn", "last turn", "during their
 * last turn", "since your last turn" and "this game": the one record every
 * such condition, amount, cost limit and filter clause reads. See
 * docs/plans/need-key-themes.md, theme 6's design note.
 *
 * - {@link JournalEntry} is one event, normalised: the same fields mean the
 *   same thing for every kind, and an object is kept as it was (rules
 *   603.10a, 608.2h), not as a bare id to be looked up later.
 * - {@link Journal} is the state's record: this round's entries, the turns
 *   they belong to, and a whole-game count.
 * - {@link JournalWhat} is what a card says ("died", "descended",
 *   "attackers"): each word defined once in {@link JOURNAL_VIEWS} as a kind
 *   and a match over entries of it.
 *
 * Kept in `GameState`, so it rides every clone the bots make: entries stay
 * small and are pruned as each turn begins. `eventLog` can't serve instead —
 * every bot simulation empties it.
 */

import type { ObjectId, PlayerId } from "./primitives.js";
import type { FlipLanding, RollRecord } from "./random-results.js";
import type { GameState, LastKnownInfo, ZoneType } from "./state.js";
import type { TargetRef } from "./target.js";

/** The events the journal keeps. Each is an event, not a question: "died"
 * is a `left` entry, "descended" a `to-graveyard` one (see
 * {@link JOURNAL_VIEWS}). */
export type JournalKind =
  /** A permanent entered the battlefield. `player`: its controller as it
   * entered; `was`: as it entered, after its replacement effects. */
  | "entered"
  /** A permanent left the battlefield, for any zone (`to`), however it left —
   * phasing out isn't leaving (702.26d). `player`: its controller as it left;
   * `was`: as it last existed there; `stint`: the stint it left. */
  | "left"
  /** `player` sacrificed a permanent. */
  | "sacrificed"
  /** A card or token was put into the graveyard of `player`, its owner, from
   * `from`. From the battlefield, `was` and `stint` are as it left. */
  | "to-graveyard"
  /** `player` discarded a card (701.9a), wherever it went. */
  | "discarded"
  /** `player` declared a creature as an attacker (508.1), at `target` (the
   * player, planeswalker or battle), in combat phase `combat`; `was`: as
   * declared. Never one put onto the battlefield attacking (508.4). */
  | "attacked"
  /** A creature `player` controlled blocked the attacker `target` (509.1),
   * once per attacker it blocked, in combat phase `combat`; `was` and
   * `targetWas`: each as declared. */
  | "blocked"
  /** A source `player` controlled dealt `amount` damage to `target`; `was`:
   * the source as it dealt it; `combat`: the combat phase, for combat damage. */
  | "damage"
  /** `player` put `amount` counters of `counter` on a permanent (every token of
   * a stack counted); `was`: the permanent as they went on. */
  | "counters-put"
  /** A permanent `player` controlled became tapped. */
  | "tapped"
  /** `player` turned a permanent face up (701.40b). */
  | "turned-face-up"
  /** A regeneration shield saved a permanent `player` controlled (701.19). */
  | "regenerated"
  /** `player` tapped a land for mana (106.12). */
  | "tapped-for-mana"
  /** `player` activated an ability of `object`; `how` says which kind
   * (`"loyalty"`: 606.3, `"equip"`: 702.6), `ability` which one where a limit
   * or a reader counts it ("activate only once each turn", 602.5b; "if this
   * ability has been activated four or more times this turn"). `how:
   * "ability"` is every activation of a permanent's ability, mana abilities
   * included, the permanent as it was then (`was`): "the first activated
   * ability of an artifact you activate each turn". `how: "targeting"`
   * is one permanent it was activated targeting (`target`, in `targetStint`,
   * `targetWas` as it was then), an entry per permanent: "the first activated
   * ability you activate that targets a creature you control". */
  | "activated"
  /** A triggered ability `ability` of `object` (its source, in `stint`)
   * triggered, `player` its controller — kept for "this ability triggers
   * only once each turn" (603.2). */
  | "triggered"
  /** The ability `ability` resolved — kept for the abilities that ask how
   * often ("if this is the second time this ability has resolved this turn"). */
  | "resolved"
  /** The ability `ability` had its mode `mode` chosen: "choose one that
   * hasn't been chosen this turn", and a `may` with "do this only once each
   * turn" (603.2h), whose one mode is doing it. */
  | "did"
  /** The ability `ability` did its thing (an `add-mana` with
   * `marksAbilityDone` that added mana — Carpet of Flowers). */
  | "done"
  /** `player`'s spell or ability (`how`: `"spell"`, `"activated"` for an
   * activated ability, `"ability"` for any other) targeted
   * the permanent `object` in `stint` (rule 115.1): valiant's and Angelic
   * Cub's "for the first time each turn". */
  | "targeted"
  /** `object` became saddled (702.171b) under `player`, in `stint`. */
  | "saddled"
  /** The Vehicle `object` became crewed (702.122c) under `player`, in `stint`. */
  | "crewed"
  /** `player` bent (`how`: water, earth, fire or air — rules 701.65b,
   * 701.66b, 701.67c, 702.189b). */
  | "bent"
  /** `player` played a land (305.1), from the zone `from` ("played a land
   * from anywhere other than your hand"). */
  | "land-played"
  /** `player` drew a card (121.1). */
  | "card-drawn"
  /** A card `player` owned left their graveyard, for anywhere. */
  | "left-graveyard"
  /** A card `player` owned was put into exile, from any zone, by anyone. */
  | "put-into-exile"
  /** `player` lost `amount` life (119.3). */
  | "life-lost"
  /** `player` gained `amount` life (119.3). */
  | "life-gained"
  /** `player` scried or surveilled (`how`: `"scry"` or `"surveil"`; 701.22,
   * 701.25); one of 0 isn't one. */
  | "scried"
  /** `player` searched their own library (701.23). */
  | "library-searched"
  /** `player` spent `amount` mana to cast a spell (700.14, expend). */
  | "mana-spent"
  /** `player` paid or lost `amount` energy counters. */
  | "energy-lost"
  /** `player` created one or more tokens, once per creation. */
  | "token-created"
  /** `player` committed a crime (rule 700.13) with the spell or ability
   * `object`. */
  | "crime"
  /** `player` cycled `object` (702.29c). */
  | "cycled"
  /** `player` flipped a coin (rule 705): `flip` how it landed, `seq` the
   * event's. An ignored flip never happened (706.6's way) and isn't here. */
  | "flipped"
  /** `player` rolled one or more dice as one roll (rule 706): `roll` what
   * came up, `seq` the event's. */
  | "rolled";

/** One event the journal keeps. Each field means one thing for every kind;
 * a kind leaves out what it doesn't have. */
export interface JournalEntry {
  readonly kind: JournalKind;
  /** The turn it happened in (`TurnState.number`). */
  readonly turn: number;
  /** Whose record it is — fixed per kind (see {@link JournalKind}). Absent
   * only on damage from a source with nothing left to say who controlled it:
   * its recipient's reads still count it. */
  readonly player?: PlayerId;
  readonly object?: ObjectId;
  /** The stint of `object` the event concerns (its `zoneChangeCount` then):
   * the one it entered, left, attacked or was tapped in (rule 400.7). */
  readonly stint?: number;
  /** For a move, the stint it arrived in: the card now in a graveyard is the
   * one "put there this turn". */
  readonly arrived?: number;
  /** `object` as it was (rules 603.10a, 608.2h), for the kinds a filter reads
   * as it was. Shared with the event's own snapshot, never a fresh copy. */
  readonly was?: LastKnownInfo;
  /** A token stack's size (default 1). */
  readonly count?: number;
  /** A quantity: damage, life, counters, mana, energy. */
  readonly amount?: number;
  /** The zone a move came from (`to-graveyard`), or a land was played from
   * (`land-played`). */
  readonly from?: ZoneType;
  /** The zone a move went to (`left`). */
  readonly to?: ZoneType;
  /** What it was done to: damage's recipient, an attack's defender, a block's
   * attacker. */
  readonly target?: TargetRef;
  readonly targetStint?: number;
  readonly targetWas?: LastKnownInfo;
  /** The combat phase it happened in (`TurnState.combatPhases`), for attacks,
   * blocks and combat damage. */
  readonly combat?: number;
  /** The kind of counter (`counters-put`). */
  readonly counter?: string;
  /** The kind's own qualifier (`scried`: scry or surveil; `activated`: the
   * ability's kind; `targeted`: a spell's or an ability's). */
  readonly how?: string;
  /** Which ability of which object (`activated`, `triggered`, `resolved`,
   * `did`, `done`): an opaque key, compared for equality, as `Game` builds
   * it for the reader that asks (`abilityTurnKey`, `usageKey`). */
  readonly ability?: string;
  /** The mode chosen (`did`), by index. */
  readonly mode?: number;
  /** How a coin landed (`flipped`). */
  readonly flip?: FlipLanding;
  /** What came up (`rolled`). */
  readonly roll?: RollRecord;
  /** The event's `seq` (`flipped`, `rolled`), for what's "this way". */
  readonly seq?: number;
}

/** A turn the journal still keeps entries for, and whose it was (extra
 * turns make the number no guide). */
export interface JournalTurn {
  readonly number: number;
  readonly player: PlayerId;
}

/** The game's record of what has happened (see the module comment). */
export interface Journal {
  /** This round's entries, oldest first. */
  entries: JournalEntry[];
  /** The turns `entries` may belong to, oldest first. */
  turns: JournalTurn[];
  /** The whole game's count of each kind, per player: "this game". */
  game: Partial<Record<PlayerId, Partial<Record<JournalKind, number>>>>;
  /** The whole game's record of who dealt each player combat damage: the
   * names of the creatures that did, each as it was named then, whoever
   * controlled it ("dealt combat damage this game by a creature named
   * Gollum, Obsessed Stalker"). Kept past the round the entries last. */
  combatDamagedBy?: Partial<Record<PlayerId, string[]>>;
  /** The triggered abilities that "trigger only once" and have, this game:
   * each one ability of one object in one stint (rule 400.7) — the Collectors
   * of Mystery Booster Commander. Kept past the round the entries last. */
  triggeredOnceEver?: string[];
}

/** Note that the "triggers only once" ability `key` has triggered. */
export function noteTriggeredOnceEver(state: GameState, key: string): void {
  const journal = (state.journal ??= emptyJournal());
  const list = (journal.triggeredOnceEver ??= []);
  if (!list.includes(key)) list.push(key);
}

/** Whether the "triggers only once" ability `key` has triggered this game. */
export function triggeredOnceEver(state: GameState, key: string): boolean {
  return state.journal?.triggeredOnceEver?.includes(key) === true;
}

/** Note that a creature with these `names` dealt `player` combat damage
 * (`Journal.combatDamagedBy`). */
export function noteCombatDamagedBy(state: GameState, player: PlayerId, names: readonly string[]): void {
  if (names.length === 0) return;
  const journal = (state.journal ??= emptyJournal());
  const list = ((journal.combatDamagedBy ??= {})[player] ??= []);
  for (const name of names) if (!list.includes(name)) list.push(name);
}

/** Whether a creature named `name` has dealt `player` combat damage this game. */
export function combatDamagedByNamed(state: GameState, player: PlayerId, name: string): boolean {
  return state.journal?.combatDamagedBy?.[player]?.includes(name) === true;
}

/**
 * Which turns a read covers. `you` is the reader's controller; `their` each
 * player whose record is read.
 * - `"this-turn"` (the default).
 * - `"last-turn"`: the turn before this one, whoever's it was ("if you lost
 *   life last turn", First Response).
 * - `"your-last-turn"`, `"their-last-turn"`: that player's most recent turn
 *   before this one ("if it attacked during your last turn", "if a player
 *   attacked you during their last turn").
 * - `"since-your-last-turn"`: everything after that turn ended ("if you
 *   haven't been dealt combat damage since your last turn").
 * - `"this-game"`: the whole game, as counts only (no filter reads it).
 */
export type JournalWindow =
  | "this-turn"
  | "last-turn"
  | "your-last-turn"
  | "their-last-turn"
  | "since-your-last-turn"
  | "this-game";

/** What a card asks the journal about: an event kind, or a narrower word
 * defined over one ({@link JOURNAL_VIEWS}). */
export type JournalWhat =
  | "entered"
  | "left"
  /** A creature left the battlefield for a graveyard. */
  | "died"
  | "sacrificed"
  /** A permanent left the battlefield for exile. */
  | "exiled"
  /** A permanent card was put into its owner's graveyard, from anywhere
   * (each "descends"). */
  | "descended"
  | "discarded"
  | "to-graveyard"
  /** A source dealt combat damage to this player, one entry a source a combat
   * damage step: the list is the damaged player's. */
  | "combat-damaged-by"
  /** Each creature declared as an attacker, once in each stint, however many
   * combats it attacked in. */
  | "attackers"
  | "turned-face-up"
  | "regenerated"
  | "counters-put"
  | "tapped"
  /** `activated` entries for loyalty abilities. */
  | "loyalty-activated"
  /** `activated` entries for equip abilities. */
  | "equip-activated"
  /** A player lost life: "if you lost life last turn" (First Response). */
  | "life-lost"
  /** A player gained life. */
  | "life-gained"
  /** A player played a land. */
  | "lands-played"
  /** A player waterbent, earthbent, firebent or airbent (`bent` entries):
   * Avatar Aang's "if you've done all four this turn". */
  | "waterbent"
  | "earthbent"
  | "firebent"
  | "airbent";

/** The zones a `to-graveyard` read takes its arrivals from (`from`: only
 * these) or leaves out (`notFrom`): "put into graveyards from the
 * battlefield" (`from: ["battlefield"]`), "from their library"
 * (`["library"]`), "from anywhere other than the battlefield" (`notFrom:
 * ["battlefield"]`). Entries with no `from` match no `from`. */
export interface JournalOrigin {
  readonly from?: readonly ZoneType[];
  readonly notFrom?: readonly ZoneType[];
}

/** How a {@link JournalWhat} is read: entries of `kind` passing `match`,
 * kept in the list of the player `whose` names (default the entry's own
 * `player`; `"target"`, the player it was done to), counted once per object
 * and stint with `distinct`. `oncePerList` is the same for a count that takes
 * a filter (`journalCount`): each object counted once per stint in each
 * player's list, among the entries the filter passes, each matched as it was
 * then — a double striker that dealt a player combat damage twice is one of
 * "three or more Pirates" (Admiral Beckett Brass's ruling). */
export interface JournalView {
  readonly kind: JournalKind;
  readonly whose?: "target";
  readonly match?: (entry: JournalEntry, read: JournalReader) => boolean;
  readonly distinct?: true;
  readonly oncePerList?: true;
}

/** What a view's match may read beside the entry: the state, and an object's
 * types as they are now (layer 4, `effectiveTypes`), passed in so this module
 * stays below `characteristics.ts`. */
export interface JournalReader {
  readonly state: GameState;
  readonly typesOf: (object: ObjectId) => readonly string[];
}

export const JOURNAL_VIEWS: Readonly<Record<JournalWhat, JournalView>> = {
  entered: { kind: "entered" },
  left: { kind: "left" },
  died: { kind: "left", match: (e) => e.to === "graveyard" && e.was?.types.includes("creature") === true },
  sacrificed: { kind: "sacrificed" },
  exiled: { kind: "left", match: (e) => e.to === "exile" },
  descended: { kind: "to-graveyard", match: (e, read) => isPermanentCard(e, read) },
  discarded: { kind: "discarded" },
  "to-graveyard": { kind: "to-graveyard" },
  "combat-damaged-by": {
    kind: "damage",
    whose: "target",
    match: (e) => e.combat !== undefined && e.target?.kind === "player",
    oncePerList: true,
  },
  attackers: { kind: "attacked", distinct: true },
  "turned-face-up": { kind: "turned-face-up" },
  regenerated: { kind: "regenerated" },
  "counters-put": { kind: "counters-put" },
  tapped: { kind: "tapped" },
  "loyalty-activated": { kind: "activated", match: (e) => e.how === "loyalty" },
  "equip-activated": { kind: "activated", match: (e) => e.how === "equip" },
  "life-lost": { kind: "life-lost" },
  "life-gained": { kind: "life-gained" },
  "lands-played": { kind: "land-played" },
  waterbent: { kind: "bent", match: (e) => e.how === "water" },
  earthbent: { kind: "bent", match: (e) => e.how === "earth" },
  firebent: { kind: "bent", match: (e) => e.how === "fire" },
  airbent: { kind: "bent", match: (e) => e.how === "air" },
};

const PERMANENT_CARD_TYPES: ReadonlySet<string> = new Set([
  "artifact",
  "battle",
  "creature",
  "enchantment",
  "land",
  "planeswalker",
]);

/** A card (not a token) with a permanent type (rule 110.4a), as it is now:
 * what a descend counts, as the card arrived in the graveyard. */
function isPermanentCard(entry: JournalEntry, read: JournalReader): boolean {
  const object = entry.object === undefined ? undefined : read.state.objects[entry.object];
  if (object === undefined || object.isToken || entry.was?.isToken === true) return false;
  return read.typesOf(object.id).some((t) => PERMANENT_CARD_TYPES.has(t));
}

/** An empty journal, as a game begins. */
export function emptyJournal(): Journal {
  return { entries: [], turns: [], game: {} };
}

/** Add `entry` to the journal, stamped with the current turn. */
export function appendJournal(state: GameState, entry: Omit<JournalEntry, "turn">): void {
  const journal = (state.journal ??= emptyJournal());
  journal.entries.push({ ...entry, turn: state.turn.number } as JournalEntry);
  if (entry.player === undefined) return;
  const counts = (journal.game[entry.player] ??= {});
  counts[entry.kind] = (counts[entry.kind] ?? 0) + (entry.count ?? 1);
}

/**
 * A turn begins: note whose it is, and drop what no window can name any more —
 * everything before the earliest of the last turn and each player's own last
 * turn. At four players that keeps one round.
 */
export function beginJournalTurn(state: GameState, number: number, player: PlayerId): void {
  const journal = (state.journal ??= emptyJournal());
  journal.turns.push({ number, player });
  let keepFrom = number - 1;
  for (const seat of state.turnOrder) {
    if (state.players[seat]?.hasLost === true) continue;
    const last = lastTurnOf(journal, seat, number);
    if (last !== undefined && last < keepFrom) keepFrom = last;
  }
  if (journal.turns[0] !== undefined && journal.turns[0].number < keepFrom) {
    journal.turns = journal.turns.filter((t) => t.number >= keepFrom);
  }
  if (journal.entries[0] !== undefined && journal.entries[0].turn < keepFrom) {
    journal.entries = journal.entries.filter((e) => e.turn >= keepFrom);
  }
}

/** `player`'s most recent turn before turn `before`, if the journal keeps it. */
function lastTurnOf(journal: Journal, player: PlayerId, before: number): number | undefined {
  for (let i = journal.turns.length - 1; i >= 0; i -= 1) {
    const turn = journal.turns[i];
    if (turn.number < before && turn.player === player) return turn.number;
  }
  return undefined;
}

/** Whether turn `turn` is in `window`, read for `you` (the reader's
 * controller) and `their` (the player whose record it is). A player with no
 * last turn yet has none to look back on. */
export function inJournalWindow(
  state: GameState,
  window: JournalWindow,
  turn: number,
  you: PlayerId,
  their: PlayerId,
): boolean {
  const now = state.turn.number;
  switch (window) {
    case "this-turn":
      return turn === now;
    case "last-turn":
      return turn === now - 1;
    case "your-last-turn":
    case "their-last-turn": {
      const journal = state.journal;
      const last = journal === undefined ? undefined : lastTurnOf(journal, window === "your-last-turn" ? you : their, now);
      return last !== undefined && turn === last;
    }
    case "since-your-last-turn": {
      const journal = state.journal;
      const last = journal === undefined ? undefined : lastTurnOf(journal, you, now);
      return last === undefined ? true : turn > last;
    }
    case "this-game":
      return true;
  }
}

/** The entries of `view` in `players`' lists within `window`, oldest first. */
export function journalEntries(
  read: JournalReader,
  view: JournalView,
  players: readonly PlayerId[],
  window: JournalWindow,
  you: PlayerId,
): JournalEntry[] {
  const state = read.state;
  const out: JournalEntry[] = [];
  for (const entry of state.journal?.entries ?? []) {
    if (entry.kind !== view.kind) continue;
    const whose = view.whose === "target" ? (entry.target?.kind === "player" ? entry.target.player : undefined) : entry.player;
    if (whose === undefined || !players.includes(whose)) continue;
    if (!inJournalWindow(state, window, entry.turn, you, whose)) continue;
    if (view.match !== undefined && !view.match(entry, read)) continue;
    out.push(entry);
  }
  if (view.distinct !== true) return out;
  const seen = new Set<string>();
  return out.filter((e) => {
    const key = `${e.object}@${e.stint}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** This turn's entries of `kind` (any player), oldest first: the fast path
 * for the engine's own counts. */
export function entriesThisTurn(state: GameState, kind: JournalKind): JournalEntry[] {
  const now = state.turn.number;
  const out: JournalEntry[] = [];
  for (const entry of state.journal?.entries ?? []) if (entry.turn === now && entry.kind === kind) out.push(entry);
  return out;
}

/** The sum of `amount` (or the count) of this turn's entries of `kind` in
 * `player`'s list. */
export function journalTotal(state: GameState, kind: JournalKind, player: PlayerId, measure: "count" | "amount"): number {
  const now = state.turn.number;
  let n = 0;
  for (const entry of state.journal?.entries ?? []) {
    if (entry.turn !== now || entry.kind !== kind || entry.player !== player) continue;
    n += measure === "amount" ? (entry.amount ?? 0) : (entry.count ?? 1);
  }
  return n;
}

/** How many of this turn's entries of `kind` are the ability `ability`'s —
 * the per-turn usage limits ("activate only once each turn", "triggers only
 * once each turn", "the second time this ability has resolved this turn"). */
export function abilityCountThisTurn(state: GameState, kind: JournalKind, ability: string): number {
  return abilityIndex(state).counts.get(`${kind}|${ability}`) ?? 0;
}

/** The modes this turn's `did` entries record for the ability `ability`, in
 * the order chosen. */
export function modesDoneThisTurn(state: GameState, ability: string): readonly number[] {
  return abilityIndex(state).modes.get(ability) ?? [];
}

/** This turn's ability-keyed entries, counted: what the usage limits ask on
 * every legal-action query and every trigger scan, so a journal scan each
 * time cost the bots dearly (B278). */
interface AbilityIndex {
  readonly turn: number;
  /** How many entries of `entries` it has read. */
  read: number;
  readonly counts: Map<string, number>;
  readonly modes: Map<string, number[]>;
}

/** Kept beside the state, never in it, per entries array: the journal only
 * appends to its array (`appendJournal`) or replaces it (a prune, a clone),
 * so the index reads just what was appended since, and starts again for a
 * new array or a new turn. */
const ABILITY_INDEX = new WeakMap<readonly JournalEntry[], AbilityIndex>();
const NO_ENTRIES: readonly JournalEntry[] = [];

function abilityIndex(state: GameState): AbilityIndex {
  const entries = state.journal?.entries ?? NO_ENTRIES;
  const now = state.turn.number;
  let index = ABILITY_INDEX.get(entries);
  if (index === undefined || index.turn !== now || index.read > entries.length) {
    index = { turn: now, read: 0, counts: new Map(), modes: new Map() };
    ABILITY_INDEX.set(entries, index);
  }
  for (; index.read < entries.length; index.read += 1) {
    const entry = entries[index.read];
    if (entry.ability === undefined || entry.turn !== now) continue;
    const key = `${entry.kind}|${entry.ability}`;
    index.counts.set(key, (index.counts.get(key) ?? 0) + 1);
    if (entry.kind === "did" && entry.mode !== undefined) {
      const modes = index.modes.get(entry.ability);
      if (modes === undefined) index.modes.set(entry.ability, [entry.mode]);
      else modes.push(entry.mode);
    }
  }
  return index;
}

/** The whole game's count of `kind` for `player` ("this game"). */
export function journalGameCount(state: GameState, kind: JournalKind, player: PlayerId): number {
  return state.journal?.game[player]?.[kind] ?? 0;
}

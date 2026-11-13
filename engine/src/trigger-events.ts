/**
 * The trigger events a card names by a word of its own — "whenever you
 * proliferate", "whenever you become the monarch", "whenever this creature
 * phases in" — each one row: which `GameEvent` it is, and how that event
 * names its player, its object and its amount. The generic
 * `{ on: "event", event, who?, filter?, by? }` trigger reads them (see
 * docs/plans/need-key-themes.md, theme 2's design note).
 *
 * A new trigger event is a row, not a new `TriggerSpec` kind. A kind with
 * rules of its own — looking back in time (603.10a), batching, the combat
 * and damage records, a cast's narrowings — keeps its own arm in
 * `Game.triggerMatches`; a row is an event, a subject and nothing else.
 *
 * Pure: no engine imports beyond types, so the bots and the text tools may
 * read it.
 */

import type { TriggerSpec } from "./abilities.js";
import type { GameEvent } from "./events.js";
import type { JournalKind } from "./journal.js";
import { rollOfEvent } from "./random-results.js";
import type { ObjectId, PlayerId } from "./primitives.js";

type EventOf<T extends GameEvent["type"]> = Extract<GameEvent, { type: T }>;

/**
 * One trigger event. Methods rather than function-valued fields so a row
 * typed for its own event fits the table's common type.
 *
 * The event's **subject** — what the trigger's `who` relates to the
 * ability's controller — is its object where the row names one (`object`,
 * or `objects` for one event with several), otherwise its player.
 */
export interface TriggerEventRow<T extends GameEvent["type"] = GameEvent["type"]> {
  readonly type: T;
  /** Narrows the event: a surveil, not a scry; a coin flip that was won. */
  when?(event: EventOf<T>): boolean;
  /** Whose act or state it is: the player who proliferated, the new
   * monarch. "That player" (`trigger-player`). */
  player?(event: EventOf<T>): PlayerId | undefined;
  /** What it happened to: the creature that fought, the Vehicle crewed.
   * "That creature" (`trigger-object`). */
  object?(event: EventOf<T>): ObjectId | undefined;
  /** One event, several objects (phasing): one occurrence each (603.2c). */
  objects?(event: EventOf<T>): readonly ObjectId[];
  /** Who did it, where that's neither the subject nor its controller. */
  by?(event: EventOf<T>): PlayerId | undefined;
  /** What `triggerValue` reads: "that much", "that many". */
  amount?(event: EventOf<T>): number;
  /** The journal kind that records this event, per subject, for the timing
   * wrapper ("for the first time each turn"); the act journals itself just
   * before it emits. Absent, the wrapper can't count it. */
  readonly journaled?: JournalKind;
}

function row<T extends GameEvent["type"]>(r: TriggerEventRow<T>): TriggerEventRow {
  return r as unknown as TriggerEventRow;
}

export const TRIGGER_EVENTS = {
  /** "Whenever a creature you control attacking causes a triggered ability
   * of that creature to trigger" (Firebender Ascension): the subject is that
   * ability, put on the stack just now — `who` reads its controller, and
   * `"trigger-ability"` is it ("copy that ability"). */
  "attack-triggers-own-ability": row({
    type: "ability-triggered",
    when: (e) => e.byOwnAttack === true,
    object: (e) => e.object,
  }),
  /** "Whenever a creature entering under an opponent's control causes a
   * triggered ability of that creature to trigger" (Aboleth Spawn): as
   * `attack-triggers-own-ability`, for its source, a creature, entering —
   * `who` reads the ability's controller, the entering creature's. */
  "entry-triggers-own-ability": row({
    type: "ability-triggered",
    when: (e) => e.byOwnEntry === true,
    object: (e) => e.object,
  }),
  /** "Whenever you forage" (rule 701.61a — Corpseberry Cultivator). */
  forages: row({ type: "foraged", player: (e) => e.player }),
  /** "Whenever you roll one or more dice" (rule 706); the value is the
   * result, the natural results plus the modifier (706.2). */
  "rolls-dice": row({ type: "dice-rolled", player: (e) => e.player, amount: (e) => rollOfEvent(e).total }),
  /** "Whenever you roll a 4 or higher", "a natural 20": once per die that
   * passes the trigger's `die` test, the value being that die's result
   * (`diceOccurrences`). */
  "rolls-die": row({ type: "dice-rolled", player: (e) => e.player }),
  /** "Whenever you discard one or more cards at random, select one or more
   * targets at random, choose one or more modes at random, flip one or more
   * coins, or roll one or more dice" (Chira, All In): once per such
   * instruction (`acted-at-random`). */
  "acts-at-random": row({ type: "acted-at-random", player: (e) => e.player }),
  /** "Whenever you take the initiative" (rule 726) — again when they already
   * had it (726.5). */
  "takes-initiative": row({ type: "initiative-taken", player: (e) => e.player }),
  /** "Whenever you venture into the dungeon" (rule 701.49). */
  ventures: row({ type: "ventured", player: (e) => e.player }),
  /** "Whenever you complete a dungeon" (rule 309.7). */
  "completes-dungeon": row({ type: "dungeon-completed", player: (e) => e.player }),
  /** "Whenever a player loses the game" (rule 104.3): the player who lost. */
  "loses-game": row({ type: "player-lost", player: (e) => e.player }),
  /** "Whenever you surveil" (rule 701.25) — once per surveil, however many
   * cards; one of 0 isn't one. The value is how many were looked at. */
  surveils: row({ type: "scried", when: (e) => e.mode === "surveil", player: (e) => e.player, amount: (e) => e.looked }),
  /** "Whenever you search your library" (rule 701.23): their own library
   * only (the rulings). */
  "searches-library": row({ type: "library-searched", when: (e) => e.owner === e.player, player: (e) => e.player }),
  /** "Whenever you collect evidence" (rule 701.59). */
  "collects-evidence": row({ type: "evidence-collected", player: (e) => e.player }),
  /** "Whenever you discover" (rule 701.57); the value is its N. */
  discovers: row({ type: "discovered", player: (e) => e.player, amount: (e) => e.amount }),
  /** "Whenever you foretell a card" (rule 702.143). The card is the trigger
   * object. */
  foretells: row({ type: "card-foretold", player: (e) => e.player }),
  /** "Whenever you commit a crime" (rule 700.13). */
  "commits-crime": row({ type: "crime-committed", player: (e) => e.player }),
  /** "Whenever a creature you control becomes renowned" (rule 702.112). */
  "becomes-renowned": row({ type: "became-renowned", object: (e) => e.object }),
  /** "Whenever a creature you control becomes monstrous" (rule 701.37); the
   * value is the N it became monstrous with (701.37c's X). */
  "becomes-monstrous": row({ type: "became-monstrous", object: (e) => e.object, amount: (e) => e.amount }),
  /** "Whenever a creature you control fights" (rule 701.14): one occurrence
   * per fighter, each its own event. */
  fights: row({ type: "creature-fought", object: (e) => e.object }),
  /** "Whenever you win a coin flip" (rule 705). */
  "wins-coin-flip": row({ type: "coin-flipped", when: (e) => e.won === true, player: (e) => e.player }),
  /** "Whenever you lose a coin flip" (rule 705). */
  "loses-coin-flip": row({ type: "coin-flipped", when: (e) => e.won === false, player: (e) => e.player }),
  /** "Whenever a permanent becomes untapped" — not one entering untapped
   * (603.2e). */
  "becomes-untapped": row({ type: "permanent-untapped", when: (e) => e.asItEntered !== true, object: (e) => e.object }),
  /** "Whenever players finish voting" (Erestor of the Council) — not an
   * "each player chooses", which isn't a vote (701.38 vs 101.4). The player
   * is whoever controlled the vote's spell or ability. */
  "voting-finishes": row({ type: "votes-finished", when: (e) => e.choice !== true, player: (e) => e.controller }),
  /** "Whenever this creature enlists a creature" (rule 702.154): the
   * enlisting creature is the subject, the enlisted one the `by`-less
   * partner the effect never names. */
  enlists: row({ type: "creature-tapped-for", when: (e) => e.as === "enlist", object: (e) => e.for }),
  /** "Whenever you proliferate" (rule 701.34) — even choosing nothing. */
  proliferates: row({ type: "proliferated", player: (e) => e.player }),
  /** "Whenever you become the monarch" (rule 725): the new monarch. A
   * player who already is doesn't become it again (`Game.setMonarch`). */
  "becomes-monarch": row({ type: "monarch-changed", player: (e) => e.player }),
  /** "Whenever this creature phases in" (rule 702.26c): each permanent that
   * phased in, one occurrence apiece. */
  "phases-in": row({ type: "permanents-phased-in", objects: (e) => e.objects }),
  /** "Whenever a creature you control connives" (rule 701.50): the
   * conniving creature, whether or not it's still there. */
  connives: row({ type: "connived", object: (e) => e.object, player: (e) => e.player }),
  /** "Whenever you waterbend, earthbend, firebend, or airbend" (Avatar
   * Aang — rules 701.65b, 701.66b, 701.67c, 702.189b): any of the four. */
  bends: row({ type: "bent", player: (e) => e.player }),
  /** "Whenever this Vehicle becomes crewed" (rule 702.122c): as its crew
   * ability resolves. The value is how many creatures crewed it. */
  "becomes-crewed": row({ type: "became-crewed", object: (e) => e.object, amount: (e) => e.crew.length, journaled: "crewed" }),
  /** "Whenever damage that would be dealt to you is prevented" (Selfless
   * Squire): any prevention, protection's included (rule 615, 702.16e), one
   * occurrence per prevention applied. The value is how much it prevented. */
  "damage-to-player-prevented": row({
    type: "damage-prevented",
    when: (e) => e.target.kind === "player",
    player: (e) => (e.target.kind === "player" ? e.target.player : undefined),
    amount: (e) => e.amount,
  }),
} satisfies Record<string, TriggerEventRow>;

export type TriggerEventName = keyof typeof TRIGGER_EVENTS;

/** The table by `GameEvent` type, for the lookups that start from an event:
 * "that player" and "that creature" (`Game.refsAtTrigger`,
 * `Game.eventTriggerObject`). Built once. */
export const TRIGGER_EVENTS_BY_TYPE: ReadonlyMap<GameEvent["type"], readonly TriggerEventRow[]> = (() => {
  const byType = new Map<GameEvent["type"], TriggerEventRow[]>();
  for (const r of Object.values(TRIGGER_EVENTS) as TriggerEventRow[]) {
    const list = byType.get(r.type);
    if (list === undefined) byType.set(r.type, [r]);
    else list.push(r);
  }
  return byType;
})();

/** The row `name` names. */
export function triggerEventRow(name: TriggerEventName): TriggerEventRow {
  return TRIGGER_EVENTS[name];
}

/** The subjects `event` holds for `name`'s row, or none when it isn't that
 * row's event: its objects where the row names some, else its player. An
 * object-less, player-less row (none yet) has one subject, `undefined`. */
export function triggerEventSubjects(
  name: TriggerEventName,
  event: GameEvent,
): { readonly objects?: readonly ObjectId[]; readonly player?: PlayerId } | undefined {
  const r = TRIGGER_EVENTS[name];
  if (event.type !== r.type) return undefined;
  if (r.when !== undefined && !r.when(event as never)) return undefined;
  if (r.objects !== undefined) return { objects: r.objects(event as never) };
  if (r.object !== undefined) {
    const object = r.object(event as never);
    return object === undefined ? { objects: [] } : { objects: [object] };
  }
  return { player: r.player?.(event as never) };
}

/** The player `event` names, by the first row of its type that names one —
 * "that player" of a generic trigger. */
export function triggerEventPlayer(event: GameEvent): PlayerId | undefined {
  for (const r of TRIGGER_EVENTS_BY_TYPE.get(event.type) ?? []) {
    if (r.when !== undefined && !r.when(event as never)) continue;
    const player = r.player?.(event as never);
    if (player !== undefined) return player;
  }
  return undefined;
}

/** The one object `event` names, by the first row of its type that names
 * one — "that creature". A several-object event has none (each occurrence's
 * object is its own). */
export function triggerEventObject(event: GameEvent): ObjectId | undefined {
  for (const r of TRIGGER_EVENTS_BY_TYPE.get(event.type) ?? []) {
    if (r.when !== undefined && !r.when(event as never)) continue;
    const object = r.object?.(event as never);
    if (object !== undefined) return object;
  }
  return undefined;
}

/**
 * Whether the timing wrapper (`TriggerTiming`: "for the first time each
 * turn", "your second … each turn") can be answered for `spec`'s kind and
 * shape — `Game.timingCount` counts it from the journal. A trigger the
 * wrapper can't count for never fires with it, and
 * `test/trigger-timing.test.ts` keeps every pool card off those.
 */
export function timingCountable(spec: TriggerSpec): boolean {
  switch (spec.on) {
    case "event":
      return TRIGGER_EVENTS[spec.event].journaled !== undefined;
    case "gains-life":
    case "loses-life":
    case "draws":
    case "cast-spell":
    case "attacks":
    case "becomes-saddled":
    case "put-into-graveyard":
    case "discards":
      return true;
    case "becomes-target":
      return spec.playerOnly !== true;
    case "step-begins":
      return spec.step === "upkeep";
    case "deals-combat-damage-to-player":
      // A narrowing asked as the damage is dealt can't be asked again of
      // earlier damage: only the plain and `toOpponent` shapes count.
      return spec.toPlayerIf === undefined && spec.toPlayerControlsMore === undefined && spec.orBattle !== true;
    case "becomes-tapped":
    case "counters-put":
      return spec.batched !== true;
    case "attack-with":
      return spec.filter === undefined && spec.eachOf === undefined && spec.includingThis !== true;
    default:
      return false;
  }
}

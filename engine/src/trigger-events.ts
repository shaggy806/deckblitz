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
import type { JournalEntry, JournalKind } from "./journal.js";
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
  /** The event — or, for one trigger event the rules name that the engine
   * announces as several, each of them: "a spell or ability is put onto the
   * stack" is a cast, an activation, a trigger or a copy. */
  readonly type: T | readonly T[];
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
  /** What it was done to, where that's not the subject: the creature
   * mentored ("put a shield counter on **that creature**" — Aegis of the
   * Legion). The trigger's recipient (`LastKnownRefs.recipient`, the
   * `"trigger-recipient"` reference), in the stint it was in as the ability
   * triggered; its controller is "that player" where the row names none. */
  recipient?(event: EventOf<T>): ObjectId | undefined;
  /** What `triggerValue` reads: "that much", "that many". */
  amount?(event: EventOf<T>): number;
  /** The name of the permanents whose abilities this event doesn't
   * trigger: "changing targets this way doesn't trigger abilities of
   * permanents named Psychic Battle". Read in `Game.eventTriggerMatches`
   * against the watching permanent's name. */
  unseenBy?(event: EventOf<T>): string | undefined;
  /** The objects "them" means, each in its stint — the `"trigger-batch"`
   * set of a trigger on it, one occurrence for them all: the cards manifest
   * dread put into a graveyard. */
  batch?(event: EventOf<T>): readonly { readonly object: ObjectId; readonly stint: number }[];
  /** The journal kind that records this event, per subject, for the timing
   * wrapper ("for the first time each turn"); the act journals itself just
   * before it emits. Absent, the wrapper can't count it. */
  readonly journaled?: JournalKind;
  /** Which of the `journaled` kind's entries are this event, where the kind
   * records more than it — a surveil's `scried` entry (`how: "surveil"`), not
   * a scry's: "whenever you surveil for the first time each turn" (Whispering
   * Snitch). Absent, every entry of the kind is. */
  journaledIf?(entry: JournalEntry): boolean;
}

function row<T extends GameEvent["type"]>(r: TriggerEventRow<T>): TriggerEventRow {
  return r as unknown as TriggerEventRow;
}

/** The `GameEvent` types row `r` watches. */
export function rowEventTypes(r: TriggerEventRow): readonly GameEvent["type"][] {
  return typeof r.type === "string" ? [r.type] : (r.type as readonly GameEvent["type"][]);
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
  /** "Whenever a permanent entering causes a triggered ability to trigger"
   * (Strict Proctor): any triggered ability, anyone's, whose trigger event
   * was a permanent entering the battlefield — its own source's or another's
   * ("whenever another creature enters", landfall), delayed ones too; never
   * a leaves trigger, nor an "as this enters" replacement (614.1c). Its
   * subject is that ability, put on the stack just now, so this triggers
   * after it and resolves first (rule 603.3b); `"trigger-ability"` /
   * `"trigger-object"` is it. */
  "entry-triggers-ability": row({
    type: "ability-triggered",
    when: (e) => e.byEntry === true,
    object: (e) => e.object,
  }),
  /** "Whenever you give a gift" (rule 702.174c — Jolly Gerbils): an instant
   * or sorcery of yours whose gift was promised resolves, or the gift
   * triggered ability of a permanent of yours does. The player is the giver;
   * the one it was promised to is the event's `to`. */
  "gives-gift": row({ type: "gift-given", player: (e) => e.player }),
  /** "Whenever equipped creature mentors a creature" (rule 702.134c — Aegis
   * of the Legion): a mentor ability (`keywordOf: "mentor"`) whose source is
   * the subject resolved, its target still legal; the creature mentored is
   * the recipient ("that creature", `"trigger-recipient"`). The subject is
   * matched as it last existed if it has left (the ruling: an Equipment
   * moved off it before the ability resolves doesn't see it). */
  mentors: row({ type: "mentored", object: (e) => e.object, recipient: (e) => e.target }),
  /** "Whenever you forage" (rule 701.61a — Corpseberry Cultivator). */
  forages: row({ type: "foraged", player: (e) => e.player }),
  /** "Whenever you manifest dread" (rule 701.62b — Paranormal Analyst): once
   * the whole process is done, even if some or all of it was impossible.
   * Its batch is the cards it put into a graveyard ("a card you put into
   * your graveyard this way"). */
  "manifests-dread": row({ type: "dread-manifested", player: (e) => e.player, batch: (e) => e.graveyard }),
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
  /** "Whenever a spell or ability is put onto the stack" (Grip of Chaos —
   * rules 405.1, 707.10): a spell cast (601.2i), an activated ability
   * activated (602.2) or a triggered ability put there (603.3), or a copy of
   * either put there (707.10) — once it's there with its targets chosen. The
   * subject is that spell or ability ("it": `"trigger-object"`), `who`
   * reading its controller. A mana ability never goes on the stack (605.3b):
   * its activation names no ability, so nothing triggers. */
  "put-on-stack": row({
    type: ["spell-cast", "spell-copied", "ability-activated", "ability-triggered", "ability-copied"],
    object: (e) =>
      e.type === "spell-cast" || e.type === "ability-triggered"
        ? e.object
        : e.type === "ability-activated"
          ? e.ability
          : e.copy,
  }),
  /** "Whenever you venture into the dungeon" (rule 701.49). */
  ventures: row({ type: "ventured", player: (e) => e.player, journaled: "ventured" }),
  /** "Whenever you complete a dungeon" (rule 309.7). */
  "completes-dungeon": row({ type: "dungeon-completed", player: (e) => e.player }),
  /** "Whenever you open an Attraction" (rule 701.51c): only an Attraction
   * that instruction put onto the battlefield — not one whose entry was
   * prevented or replaced. Its subject is the player who opened it. */
  "opens-attraction": row({ type: "attraction-opened", player: (e) => e.player }),
  /** "Whenever you roll to visit your Attractions" (rule 701.52 — "Lifetime"
   * Pass Holder): the value is the die's result. */
  "rolls-to-visit": row({ type: "rolled-to-visit", player: (e) => e.player, amount: (e) => e.result }),
  /** An Attraction was visited (rule 701.52a): the subject is the
   * Attraction, `by` the player who visited it. Its own visit ability
   * (702.159a) is `who: "self"` — the `visit()` helper in `cards/helpers.ts`.
   * Myra the Magnificent's "whenever **you** visit it" is a delayed ability
   * watching the Attraction, `who: "self"` with `by: "you"`: the watched
   * permanent is read as its controller's, so only `by` tells who visited.
   * Journaled as `visited`. */
  visited: row({
    type: "attraction-visited",
    object: (e) => e.object,
    player: (e) => e.player,
    by: (e) => e.player,
    journaled: "visited",
  }),
  /** "Whenever you claim the prize of an Attraction" (rule 702.159b — The
   * Most Dangerous Gamer): the subject is the player who claimed it. */
  "claims-prize": row({ type: "prize-claimed", player: (e) => e.player }),
  /** "Whenever a player loses the game" (rule 104.3): the player who lost. */
  "loses-game": row({ type: "player-lost", player: (e) => e.player }),
  /** A creature was put onto the battlefield attacking (rule 508.4), once
   * what it attacks is settled: the subject is that creature. It never
   * attacked (508.3a), so an `attacks` trigger misses it — "whenever a
   * creature you control attacks or enters attacking" (Arni Metalbrow) is
   * both, one ability written as two entries (`sameAbilityAs`). */
  "enters-attacking": row({ type: "entered-attacking", object: (e) => e.object }),
  /** "Whenever you surveil" (rule 701.25) — once per surveil, however many
   * cards; one of 0 isn't one. The value is how many were looked at.
   * Journaled as a `scried` entry of `how: "surveil"`, for "for the first
   * time each turn" (Whispering Snitch: surveils before it entered count). */
  surveils: row({
    type: "scried",
    when: (e) => e.mode === "surveil",
    player: (e) => e.player,
    amount: (e) => e.looked,
    journaled: "scried",
    journaledIf: (entry) => entry.how === "surveil",
  }),
  /** "Whenever you choose to put one or more cards on the bottom of your
   * library while scrying" (rule 701.22a — The Temporal Anchor): a scry
   * that bottomed any; the value is how many. */
  "scry-bottoms": row({
    type: "scried",
    when: (e) => e.mode === "scry" && e.movedAway > 0,
    player: (e) => e.player,
    amount: (e) => e.movedAway,
  }),
  /** "Whenever you search your library" (rule 701.23): their own library
   * only (the rulings). */
  "searches-library": row({ type: "library-searched", when: (e) => e.owner === e.player, player: (e) => e.player }),
  /** "Whenever an opponent shuffles their library" (Psychic Surgery, Cosi's
   * Trickster — rule 701.24a): once per shuffle, the library's owner the one
   * who shuffles it. A library of zero or one card still is (701.24e), and
   * a search's "then shuffle" is one even with the found card kept out
   * (701.24b); two shuffles are two (701.24f — Green Sun's Zenith's search
   * and then itself, Psychic Surgery's ruling). "That library" is the
   * `"trigger-player"`'s. */
  "shuffles-library": row({ type: "library-shuffled", player: (e) => e.player }),
  /** "Whenever one or more cards are put into a library from anywhere" (Wan
   * Shi Tong, All-Knowing; `batched`): once per simultaneous move of cards
   * into libraries from other zones — never a scry, a surveil or a shuffle,
   * which move nothing into one (its ruling). The subjects are the cards, in
   * whichever library they went to; `{ triggerValue: true }` is how many. */
  "put-into-library": row({ type: "cards-put-into-library", objects: (e) => e.arrivals.map((a) => a.object) }),
  /** "Whenever one or more creatures block" (Tide of War; `batched`): once
   * each combat, as the last defending player's declaration completes, if
   * any creature was declared as a blocker (the card's ruling: "only once
   * each combat and only if at least one blocker is declared"). The
   * subjects are the blockers, `who` and `filter` asking about each ("one or
   * more creatures **you control** block"); one put onto the battlefield
   * blocking never blocked (rule 509.4). */
  "creatures-block": row({ type: "attackers-blocked", objects: (e) => e.blockers }),
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
  fights: row({ type: "creature-fought", object: (e) => e.object, journaled: "fought" }),
  /** "Whenever **one or more** creatures you control fight" (Neyith of the
   * Dire Hunt), with `batched`: the fight as one event — both creatures, or
   * all those of several fights an effect has happen at once — so two of
   * yours fighting each other is one trigger. */
  "creatures-fight": row({ type: "creatures-fought", objects: (e) => e.objects }),
  /** "Whenever your commander is put into the command zone from anywhere"
   * (Myth Unbound — rules 903.9a, 903.9b): its owner is the subject, so
   * `who: "you"` is "your commander". */
  "commander-to-command-zone": row({ type: "commander-put-into-command-zone", player: (e) => e.owner }),
  /** "Whenever you win a coin flip" (rule 705). */
  "wins-coin-flip": row({ type: "coin-flipped", when: (e) => e.won === true, player: (e) => e.player }),
  /** "Whenever you lose a coin flip" (rule 705). */
  "loses-coin-flip": row({ type: "coin-flipped", when: (e) => e.won === false, player: (e) => e.player }),
  /** "Whenever a permanent becomes untapped" — not one entering untapped
   * (603.2e). */
  "becomes-untapped": row({ type: "permanent-untapped", when: (e) => e.asItEntered !== true, object: (e) => e.object }),
  /** "Whenever ~ becomes untapped during your untap step" (The Ninth Doctor):
   * a permanent an untap step untapped (rule 502.3), `by` the player whose
   * step it was — `by: "you"` is "your untap step". */
  "untaps-during-untap-step": row({
    type: "permanent-untapped",
    when: (e) => e.untapStepOf !== undefined,
    object: (e) => e.object,
    by: (e) => e.untapStepOf,
  }),
  /** "Whenever you untap one or more permanents during your untap step" (The
   * Millennium Calendar): once a step in which the active player's untap
   * step untapped any permanent they control (rule 502.3); the value is how
   * many. It triggers with no player having priority, so it waits for the
   * upkeep (rule 603.3b, the card's ruling). */
  "untaps-in-untap-step": row({ type: "untap-step-untapped", player: (e) => e.player, amount: (e) => e.count }),
  /** "Whenever players finish voting" (Erestor of the Council) — not an
   * "each player chooses", which isn't a vote (701.38 vs 101.4). The player
   * is whoever controlled the vote's spell or ability. */
  "voting-finishes": row({ type: "votes-finished", when: (e) => e.choice !== true, player: (e) => e.controller }),
  /** "Whenever this creature enlists a creature" (rule 702.154): the
   * enlisting creature is the subject, the enlisted one the `by`-less
   * partner the effect never names. */
  enlists: row({ type: "creature-tapped-for", when: (e) => e.as === "enlist", object: (e) => e.for }),
  /** "Whenever this creature becomes tapped to pay a teamwork cost" (Agent
   * Maria Hill — rule 702.194a): the creature tapped is the subject, once
   * for each creature tapped for the cost. */
  "tapped-for-teamwork": row({ type: "creature-tapped-for", when: (e) => e.as === "teamwork", object: (e) => e.creature }),
  /** "Whenever you proliferate" (rule 701.34) — even choosing nothing. */
  proliferates: row({ type: "proliferated", player: (e) => e.player }),
  /** "Whenever a player chooses one or more targets" (Psychic Battle): once
   * for the spell or ability they were chosen for — the subject, "that spell
   * or ability" (`trigger-object`) — as it went on the stack or as its
   * targets were changed; the chooser is "that player". A change Psychic
   * Battle's own ability made doesn't trigger permanents of that name
   * (`unseenBy`). */
  "chooses-targets": row({
    type: "targets-chosen",
    object: (e) => e.object,
    player: (e) => e.player,
    unseenBy: (e) => e.unseenBy,
  }),
  /** "Whenever you become the monarch" (rule 725): the new monarch. A
   * player who already is doesn't become it again (`Game.setMonarch`). */
  "becomes-monarch": row({ type: "monarch-changed", player: (e) => e.player }),
  /** "Whenever this creature phases out" (rule 702.26b — Teferi's Imp), and
   * with `batched` "whenever one or more other permanents phase out" (The
   * War Doctor): each permanent that phased out, directly or indirectly. It
   * looks back in time (rule 603.10b): what phased out sees itself and the
   * rest go, read as it last existed (`Game.lookBackSources`). */
  "phases-out": row({ type: "permanents-phased-out", objects: (e) => e.objects }),
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
  /** "Whenever the final chapter ability of a Saga you control triggers"
   * (Historian's Boon — rule 714.2e): as it triggers, so both wait for the
   * same placement (603.3b). The Saga is the subject. Not as it resolves
   * (`chapter-resolves`' `finalOnly`). */
  "final-chapter-triggers": row({ type: "chapter-triggered", when: (e) => e.final, object: (e) => e.saga }),
  /** "Whenever a mana ability of this creature resolves" (rule 605.3b —
   * Tyvar the Bellicose's grant): the permanent whose ability it was; the
   * value is how much mana the ability made. */
  "mana-ability-resolves": row({ type: "mana-ability-resolved", object: (e) => e.object, player: (e) => e.player, amount: (e) => e.amount }),
  /** "Whenever you investigate" (rule 701.16a — Erdwal Illuminator): once
   * per investigation, journaled for "for the first time each turn". */
  investigates: row({ type: "investigated", player: (e) => e.player, journaled: "investigated" }),
  /** "When a player doesn't pay this enchantment's cumulative upkeep"
   * (Thought Lash — rule 702.24a): the permanent whose upkeep went unpaid,
   * and the player who didn't pay it ("that player"), as the sacrifice it
   * owes begins — whether or not the sacrifice happens. */
  "cumulative-upkeep-unpaid": row({ type: "cumulative-upkeep-unpaid", object: (e) => e.object, player: (e) => e.player }),
  /** "Whenever you pay this enchantment's cumulative upkeep" (Hibernation's
   * End — rule 702.24a): the permanent whose upkeep was paid, once the
   * payment for every age counter is made. */
  "cumulative-upkeep-paid": row({ type: "cumulative-upkeep-paid", object: (e) => e.object, player: (e) => e.player }),
  /** "Whenever you pay life" (rule 119.4 — Font of Agonies): any payment
   * of more than 0, a cost's or an effect's; the value is how much. */
  "pays-life": row({ type: "life-paid", player: (e) => e.player, amount: (e) => e.amount }),
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
    for (const type of rowEventTypes(r)) {
      const list = byType.get(type);
      if (list === undefined) byType.set(type, [r]);
      else list.push(r);
    }
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
  const r: TriggerEventRow = TRIGGER_EVENTS[name];
  if (typeof r.type === "string" ? event.type !== r.type : !r.type.includes(event.type)) return undefined;
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

/** The objects `event` holds as a batch, by the first row of its type that
 * names one — "them" of a generic trigger (`"trigger-batch"`), or none. */
export function triggerEventBatch(event: GameEvent): readonly { readonly object: ObjectId; readonly stint: number }[] | undefined {
  for (const r of TRIGGER_EVENTS_BY_TYPE.get(event.type) ?? []) {
    if (r.when !== undefined && !r.when(event as never)) continue;
    const batch = r.batch?.(event as never);
    if (batch !== undefined) return batch;
  }
  return undefined;
}

/** The object `event` did something to, by the first row of its type that
 * names one — a generic trigger's recipient (`"trigger-recipient"`). */
export function triggerEventRecipient(event: GameEvent): ObjectId | undefined {
  for (const r of TRIGGER_EVENTS_BY_TYPE.get(event.type) ?? []) {
    if (r.when !== undefined && !r.when(event as never)) continue;
    const recipient = r.recipient?.(event as never);
    if (recipient !== undefined) return recipient;
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
      // "Your third die each turn": counted die by die (`diceRolledThisTurn`).
      return spec.event === "rolls-die" || TRIGGER_EVENTS[spec.event].journaled !== undefined;
    case "gains-life":
      // A `life-gained` entry doesn't say which spell caused it.
      return spec.bySpell === undefined;
    case "loses-life":
    case "draws":
    case "cast-spell":
    case "attacks":
    case "becomes-saddled":
    case "put-into-graveyard":
    case "discards":
    case "cycles":
      return true;
    case "becomes-target":
      // The journal's `targeted` entry doesn't keep the spell, so a
      // `spellFilter` can't be asked of earlier ones; it counts objects, not
      // the spells a `batched` watcher counts.
      return spec.playerOnly !== true && spec.spellFilter === undefined && spec.batched !== true;
    case "step-begins":
      return spec.step === "upkeep";
    case "deals-combat-damage-to-player":
      // A narrowing asked as the damage is dealt can't be asked again of
      // earlier damage: only the plain and `toOpponent` shapes count.
      return (
        spec.toPlayerIf === undefined &&
        spec.toPlayerControlsMore === undefined &&
        spec.toEnchantedPlayer !== true &&
        spec.toOwner !== true &&
        spec.orBattle !== true
      );
    case "becomes-tapped":
    case "counters-put":
      return spec.batched !== true;
    case "dealt-damage":
      // Counted by simultaneous damage event (the journal's `damage` entries'
      // `seq`), combat or not: an amount, excess or source narrowing can't be
      // asked again of earlier events, nor one firing for several permanents.
      return spec.batched !== true && spec.atLeast === undefined && spec.excess !== true && spec.bySource === undefined;
    case "attack-with":
      return (
        spec.filter === undefined &&
        spec.eachOf === undefined &&
        spec.allOf === undefined &&
        spec.includingThis !== true &&
        spec.attackingYourPlaneswalkers !== true
      );
    default:
      return false;
  }
}

/**
 * What a spell or ability has done "this way" — the cards it made players
 * discard, draw or mill, the permanents it made them sacrifice, and what it
 * destroyed, exiled, returned to a hand, put into a graveyard or put onto the
 * battlefield. Read off the events of the resolution under way: every event
 * since `GameState.resolutionSince` is its own, because nothing else happens
 * while it resolves, across the decisions it waits on too. Behind the
 * `thisWay` amount, the `this-way` condition and the `thisWay` filter clause.
 */

import type { ThisWayKind } from "./effects.js";
import type { GameEvent } from "./events.js";
import type { ObjectId, PlayerId } from "./primitives.js";
import type { GameState } from "./state.js";
import type { TargetRef } from "./target.js";

/** One object the resolution did something to. */
export interface ThisWayEntry {
  readonly object: ObjectId;
  /**
   * Whose it counts as: the player who discarded, drew, milled or sacrificed
   * it; for a permanent destroyed, exiled or returned to a hand, its
   * controller as it left; for a card put into a graveyard, or moved from
   * anywhere but the battlefield, its owner; for a permanent put onto the
   * battlefield, its controller there.
   */
  readonly player: PlayerId;
  /** It left the battlefield doing so, so it is asked about as it last
   * existed there (rule 608.2h). */
  readonly departed: boolean;
  /** How many permanents it stands for: a token stack that went whole. */
  readonly count: number;
  /** Shown to everyone: its mana value can be read in a hidden zone too (Naya
   * Soulbeast's "the total mana value of all cards revealed this way"). */
  readonly revealed?: true;
}

/** The events since `seq` (inclusive), oldest first. The log is append-only
 * and in `seq` order, so this walks back from its end. */
export function eventsSince(state: GameState, seq: number): readonly GameEvent[] {
  const log = state.eventLog;
  let i = log.length;
  while (i > 0 && log[i - 1].seq >= seq) i -= 1;
  return log.slice(i);
}

/**
 * How much life `players` (everyone when absent) have lost since event
 * `since` — the resolution under way's "life lost this way". Read off the
 * life changes themselves, so it is the life actually lost.
 */
export function lifeLostSince(
  state: GameState,
  since: number,
  players?: readonly PlayerId[],
): number {
  const whose = players === undefined ? undefined : new Set(players);
  let lost = 0;
  for (const event of eventsSince(state, since)) {
    if (event.type !== "life-changed" || event.delta >= 0) continue;
    if (whose === undefined || whose.has(event.player)) lost -= event.delta;
  }
  return lost;
}

/**
 * How many counters `players` (everyone when absent) have had removed from
 * themselves since event `since` — a player's counters are counters too (rule
 * 122.1), so the `thisWay: "counters-removed"` amount adds these to the
 * permanents': Leeches' "target player loses all poison counters. Leeches
 * deals **that much** damage to that player". Read off the changes
 * themselves, so it is what actually came off.
 */
export function playerCountersRemovedSince(
  state: GameState,
  since: number,
  players?: readonly PlayerId[],
): number {
  const whose = players === undefined ? undefined : new Set(players);
  let removed = 0;
  for (const event of eventsSince(state, since)) {
    if (event.type !== "player-counters-changed" || event.delta >= 0) continue;
    if (whose === undefined || whose.has(event.player)) removed -= event.delta;
  }
  return removed;
}

/** The excess damage (rule 120.4a) dealt to permanents in the resolution that
 * began at event `since` — see the `excessDamageThisWay` amount. */
export function excessDamageSince(state: GameState, since: number, to?: ObjectId): number {
  let excess = 0;
  for (const event of eventsSince(state, since)) {
    if (event.type !== "damage-dealt") continue;
    if (to !== undefined && (event.target.kind !== "object" || event.target.object !== to)) continue;
    excess += event.excess ?? 0;
  }
  return excess;
}

/** The damage dealt in the resolution that began at event `since` — see the
 * `damageDealtThisWay` amount: to `to` only when given (an object or a
 * player), to players only with `playersOnly`. Damage prevented was never
 * dealt (rule 615.1), so it isn't here. */
export function damageDealtSince(
  state: GameState,
  since: number,
  to?: TargetRef,
  playersOnly?: boolean,
): number {
  let dealt = 0;
  for (const event of eventsSince(state, since)) {
    if (event.type !== "damage-dealt") continue;
    if (playersOnly === true && event.target.kind !== "player") continue;
    if (to !== undefined) {
      const same =
        to.kind === "player"
          ? event.target.kind === "player" && event.target.player === to.player
          : event.target.kind === "object" && event.target.object === to.object;
      if (!same) continue;
    }
    dealt += event.amount;
  }
  return dealt;
}

/** The damage prevented by the shields the resolution that began at event
 * `madeIn` made, up to now — see the `damagePreventedThisWay` amount. Those
 * shields can only have worked since. */
export function damagePreventedBy(state: GameState, madeIn: number): number {
  let prevented = 0;
  for (const event of eventsSince(state, madeIn)) {
    if (event.type === "damage-prevented" && event.shieldMadeIn === madeIn) prevented += event.amount;
  }
  return prevented;
}

/** The cards the scries and surveils since event `since` looked at and left on
 * top of the library — see the `keptOnTopThisWay` amount. */
export function keptOnTopSince(state: GameState, since: number): number {
  let kept = 0;
  for (const event of eventsSince(state, since)) {
    if (event.type === "scried") kept += event.looked - event.movedAway;
  }
  return kept;
}

/**
 * What the resolution that began at event `since` — by default the one under
 * way, and nothing between resolutions — has done `what` to, each object
 * once, oldest first.
 */
export function thisWayEntries(
  state: GameState,
  what: ThisWayKind,
  since: number | undefined = state.resolutionSince,
): ThisWayEntry[] {
  if (since === undefined) return [];
  const out: ThisWayEntry[] = [];
  const seen = new Set<ObjectId>();
  const add = (object: ObjectId, player: PlayerId | undefined, departed: boolean): void => {
    if (player === undefined || seen.has(object)) return;
    seen.add(object);
    // A compacted stack moved whole is every token in it; it keeps its
    // `stackCount` until the tokens cease to exist.
    const count = departed ? (state.objects[object]?.stackCount ?? 1) : 1;
    out.push({ object, player, departed, count });
  };
  // Who controlled a permanent as it left: its last-known information, or a
  // ceased token's.
  const leftBy = (id: ObjectId): PlayerId | undefined =>
    state.objects[id]?.lastKnown?.controller ?? state.ceasedTokens?.[id]?.controller;
  const ownerOf = (id: ObjectId): PlayerId | undefined => state.objects[id]?.owner;
  // Cards put into a hand: read off the cards in the hands, not the log —
  // no event announces a card arriving in a hand. In the order they came.
  if (what === "put-into-hand") {
    const arrived: { id: ObjectId; seq: number; owner: PlayerId }[] = [];
    for (const player of state.turnOrder) {
      for (const id of state.zones.perPlayer[player]?.hand ?? []) {
        const object = state.objects[id];
        const seq = object?.handArrivalSeq;
        if (seq !== undefined && seq >= since) arrived.push({ id, seq, owner: object.owner });
      }
    }
    arrived.sort((a, b) => a.seq - b.seq);
    for (const { id, owner } of arrived) add(id, owner, false);
    return out;
  }
  // Read off the permanents, not the log: a control effect on a permanent its
  // player already controls changes nothing, so no event says it applied.
  if (what === "control-effect") {
    for (const id of state.zones.shared.battlefield) {
      const object = state.objects[id];
      if (object?.controlEffects?.some((e) => e.entered !== true && (e.madeAtSeq ?? -1) >= since) === true) {
        out.push({ object: id, player: object.controller, departed: false, count: object.stackCount ?? 1 });
      }
    }
    return out;
  }
  // What left the battlefield for a graveyard, for "died": a destroyed
  // permanent a replacement sent elsewhere (Rest in Peace) didn't die.
  const wentToGraveyard = new Set<ObjectId>();
  for (const event of eventsSince(state, since)) {
    switch (what) {
      case "discarded":
        if (event.type === "cards-discarded") for (const id of event.objects) add(id, event.player, false);
        break;
      case "milled":
        if (event.type === "cards-milled") for (const id of event.objects) add(id, event.player, false);
        break;
      case "drawn":
        if (event.type === "card-drawn") add(event.object, event.player, false);
        break;
      case "sacrificed":
        if (event.type === "permanent-sacrificed") add(event.object, event.player, true);
        break;
      case "destroyed":
        // A destroy effect's, not a creature dying of damage or the legend
        // rule (both of which share the event).
        if (event.type === "permanent-destroyed" && event.reason === "destroyed") {
          add(event.object, leftBy(event.object), true);
        }
        break;
      case "died":
        // "If that creature dies this way" (Saw in Half): destroyed, and put
        // into a graveyard from the battlefield (rule 700.4). The move is
        // logged before the destroy event that reports it.
        if (event.type === "permanent-left-battlefield" && event.toZone === "graveyard") {
          wentToGraveyard.add(event.object);
        } else if (
          event.type === "permanent-destroyed" &&
          event.reason === "destroyed" &&
          wentToGraveyard.has(event.object)
        ) {
          add(event.object, leftBy(event.object), true);
        }
        break;
      case "exiled":
        if (event.type === "permanent-left-battlefield" && event.toZone === "exile") {
          add(event.object, leftBy(event.object), true);
        } else if (event.type === "cards-put-into-exile") {
          for (const { object, from } of event.arrivals) {
            add(object, from === "battlefield" ? leftBy(object) : ownerOf(object), from === "battlefield");
          }
        }
        break;
      case "exiled-from-hand":
        if (event.type === "cards-put-into-exile") {
          for (const { object, from } of event.arrivals) if (from === "hand") add(object, ownerOf(object), false);
        }
        break;
      case "returned-to-hand":
        if (event.type === "permanent-returned-to-hand") {
          const fromBattlefield = event.from === undefined;
          add(event.object, fromBattlefield ? leftBy(event.object) : event.owner, fromBattlefield);
        }
        break;
      case "chosen":
        // Whoever chose them, wherever they went (a replacement may have
        // sent them somewhere else).
        if (event.type === "cards-chosen-from-zone") {
          for (const object of event.objects) add(object, event.player, false);
        }
        // A vote's or a choice's permanents: one at a time as they're chosen,
        // a secret vote's all at once as they're revealed.
        if (event.type === "vote-cast" && "object" in event.vote.choice) {
          add(event.vote.choice.object, event.vote.voter, false);
        }
        if (event.type === "votes-finished") {
          for (const { voter, choice } of event.votes) if ("object" in choice) add(choice.object, voter, false);
        }
        break;
      case "cast":
        // Off a `cast-now` (rule 608.2g), by its caster.
        if (event.type === "spell-cast" && event.via === "effect") add(event.object, event.player, false);
        break;
      case "put-into-graveyard":
        // Whose graveyard: its owner's, wherever it came from.
        if (event.type === "cards-put-into-graveyard") {
          for (const { object, from } of event.arrivals) add(object, ownerOf(object), from === "battlefield");
        }
        break;
      case "created":
        // A token only ever enters by being created.
        if (event.type === "permanent-entered-battlefield" && state.objects[event.object]?.isToken === true) {
          const object = event.object;
          if (!seen.has(object)) {
            seen.add(object);
            out.push({ object, player: state.objects[object].controller, departed: false, count: event.count ?? 1 });
          }
        }
        break;
      case "shuffled-into-library":
        // Counted by the library's owner (the cards' owner).
        if (event.type === "cards-shuffled-into-library") for (const id of event.objects) add(id, event.player, false);
        break;
      case "countered":
        // Not through `add`: an ability object standing for several copies is
        // the same id each time, and each is one countered.
        if (event.type === "spell-countered") {
          out.push({ object: event.object, player: event.controller, departed: false, count: 1 });
        }
        break;
      case "put-on-bottom":
        // From a hand, by a choice the resolution asked (`cards-put-on-bottom`
        // — the mulligan's bottoming never happens during a resolution).
        if (event.type === "cards-put-on-bottom") for (const id of event.objects) add(id, event.player, false);
        break;
      case "gained-control":
        // A stack changes hands whole.
        if (event.type === "control-changed" && !seen.has(event.object)) {
          const object = state.objects[event.object];
          if (object !== undefined) {
            seen.add(event.object);
            out.push({ object: event.object, player: event.controller, departed: false, count: object.stackCount ?? 1 });
          }
        }
        break;
      case "transformed":
        if (event.type === "permanent-transformed" && !seen.has(event.object)) {
          const object = state.objects[event.object];
          if (object !== undefined) {
            seen.add(event.object);
            out.push({ object: event.object, player: object.controller, departed: false, count: 1 });
          }
        }
        break;
      case "tapped":
        // A stack tapped whole is every token in it.
        if (event.type === "permanent-tapped" && !seen.has(event.object)) {
          const object = state.objects[event.object];
          if (object !== undefined) {
            seen.add(event.object);
            out.push({ object: event.object, player: object.controller, departed: false, count: object.stackCount ?? 1 });
          }
        }
        break;
      case "phased-out":
        // Directly or indirectly (rule 702.26g). One still phased out is
        // asked about as it last was on the battlefield.
        if (event.type === "permanents-phased-out") {
          for (const id of event.objects) {
            const object = state.objects[id];
            add(id, object?.phasedOut?.controller ?? object?.controller, object?.phasedOut !== undefined);
          }
        }
        break;
      case "counters-removed":
        // Each counter taken off a permanent or a suspended card, one entry a
        // removal, counted by the counters it took.
        if (event.type === "counter-removed" && event.amount > 0) {
          const object = state.objects[event.object];
          if (object !== undefined) {
            out.push({ object: event.object, player: object.controller, departed: false, count: event.amount * (event.tokens ?? 1) });
          }
        } else if (event.type === "time-counter-removed") {
          const object = state.objects[event.object];
          if (object !== undefined) out.push({ object: event.object, player: object.owner, departed: false, count: 1 });
        }
        break;
      case "counters-put":
        // A permanent's counters (a player's are `player-counters-changed`):
        // its controller now, whoever put them.
        if (event.type === "counter-added" && event.amount > 0) {
          const object = state.objects[event.object];
          if (object !== undefined && !seen.has(event.object)) {
            seen.add(event.object);
            out.push({ object: event.object, player: object.controller, departed: false, count: 1 });
          }
        }
        break;
      case "revealed":
        // From a library (parley's "each player reveals the top card of
        // their library") or a hand (the Scents' "reveal any number of green
        // cards in your hand"), counted by the player who revealed it.
        if (event.type === "cards-revealed" && (event.from === "library" || event.from === "hand")) {
          for (const id of event.objects) {
            if (seen.has(id)) continue;
            seen.add(id);
            out.push({ object: id, player: event.player, departed: false, count: 1, revealed: true });
          }
        }
        break;
      case "amassed":
        if (event.type === "amassed") add(event.object, event.player, false);
        break;
      case "attached":
        // Whose: the attachment's controller, as it was attached.
        if (event.type === "permanent-attached" || event.type === "permanent-attached-to-player") {
          add(event.source, state.objects[event.source]?.controller, false);
        }
        break;
      case "unattached-from":
        if (event.type === "permanent-unattached") add(event.from, state.objects[event.from]?.controller, false);
        break;
      case "put-onto-battlefield":
        // Moved there from a zone — not a token created, nor a permanent
        // spell resolving.
        if (event.type === "permanent-entered-battlefield") {
          const object = state.objects[event.object];
          const entry = object?.entry;
          if (entry !== undefined && entry.cast === undefined && entry.from !== "stack") {
            add(event.object, object.controller, false);
          }
        }
        break;
    }
  }
  // Opposition Agent's exile: the instruction that searched can't see its finds
  // there (its ruling). A read begun since is about a later move of them.
  const unseen = state.unseenFinds;
  return unseen !== undefined && since <= unseen.at ? out.filter((entry) => !unseen.objects.includes(entry.object)) : out;
}

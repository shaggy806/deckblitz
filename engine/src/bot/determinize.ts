/**
 * Sampling a plausible world from one seat's point of view — a bot that
 * doesn't read its opponents' hands.
 *
 * `ControllerView.state` is the real, un-redacted `GameState`, opponents' hands
 * and library order included, and v2 exploits that: it scores a spell against
 * the exact card an opponent is holding, and its simulated draws come off the
 * real library because `fromSnapshot` restores `rngState`. See "Known: the bot
 * cheats" in `docs/plans/smarter-bots.md`.
 *
 * Built for v3, which planned over sampled worlds and is retired
 * (`docs/plans/bot-effect-knowledge.md`). What still uses `determinize` and
 * `sampleWorlds` is the rollout column of `bot:audit`. v2 stopped reading the
 * libraries' order and the other players' hands on 2026-11-17 through
 * `withHiddenCards` at the end of this file: one deal a turn of the cards the
 * seat can't see, the ones it knows or remembers (`seat-memory.ts`) left
 * where they are.
 *
 * ## What sampling buys
 *
 * Three separate things, only one of which is about honesty:
 *
 * 1. **Measured strength becomes strength against people.** A bot that never
 *    has to guess looks better in self-play than it plays against a human, and
 *    nothing in v2's numbers distinguishes the two.
 * 2. **It is the variance control deeper rollouts need anyway.** A single
 *    playout of a three-turn future is one sample of a very noisy variable;
 *    averaging over sampled worlds is what turns it into an estimate.
 * 3. **It makes hidden-information play expressible at all.** Holding up a
 *    counterspell, playing round a likely wrath — none of it means anything
 *    when you can simply look.
 *
 * ## What "plausible" means here, and what it deliberately ignores
 *
 * The honest reconstruction: an opponent's hand and library are one pool of
 * cards we can't see into, so they're pooled, shuffled, and dealt back at the
 * hand size we *can* see. Our own library gets shuffled too — we know its
 * contents but not its order, and leaving it alone would keep the sharper half
 * of the cheat.
 *
 * Two simplifications, both deliberate and both costing us information we
 * legitimately have:
 *
 * - **Cards an opponent has revealed** (a foretold card's owner, something
 *   shown to the table) are re-pooled like anything else, so the bot forgets
 *   them. Tracking revealed cards is real work for a rare payoff.
 * - **A card's identity is not inferred from play patterns.** No "they left two
 *   mana up, it's probably a counterspell".
 *
 * Both make the bot weaker than a perfectly-informed reasoner, which is the
 * correct direction to be wrong in.
 */

import type { CardRegistry } from "../cards.js";
import { createRng, shuffle } from "../primitives.js";
import type { ObjectId, PlayerId, Rng } from "../primitives.js";
import { playersControlledBy } from "../player-control.js";
import type { GameObject, GameState } from "../state.js";
import { cloneGameState } from "../state.js";
import { hiddenCardsInSight } from "../view.js";
import { knownEnds, publiclyKnown } from "./seat-memory.js";
import type { SeatMemory } from "./seat-memory.js";

/**
 * A copy of `state` with the zones `me` cannot see resampled: every opponent's
 * hand redealt from their own hand-plus-library pool, and every library
 * reshuffled.
 *
 * Only object *ids* move between zones — the objects themselves, and every
 * reference to them from anywhere else in the state, are untouched. That is
 * what keeps a resampled world internally consistent.
 *
 * **Only safe at a clean decision point.** A state with something mid-flight —
 * a targeted trigger waiting on a choice, a spell resolving that names a
 * specific card in a hand — can hold a reference to an object whose zone this
 * would change underneath it. Callers determinize at a priority window with an
 * empty stack, and {@link canDeterminize} is the check.
 */
export function determinize(state: GameState, me: PlayerId, rng: Rng): GameState {
  const next = cloneGameState({ ...state, eventLog: [] });
  for (const player of next.turnOrder) {
    const zones = next.zones.perPlayer[player];
    if (player === me) {
      // Our own contents are known; only the order is hidden. Leaving this out
      // would keep the sharper half of the cheat — knowing our own next draws.
      zones.library = shuffle(zones.library, rng);
      continue;
    }
    const pool = shuffle([...zones.hand, ...zones.library], rng);
    zones.hand = pool.slice(0, zones.hand.length);
    zones.library = pool.slice(zones.hand.length);
  }
  return next;
}

/** Whether `state` is at a point where resampling can't break a reference — an
 * empty stack, nothing awaited, no queued decision mid-resolution. */
export function canDeterminize(state: GameState): boolean {
  return (
    state.awaiting === null &&
    state.zones.shared.stack.length === 0 &&
    state.pendingTargetedTrigger === null
  );
}

/**
 * `count` sampled worlds from `me`'s point of view, drawn from one seeded
 * stream.
 *
 * **Every candidate action at one decision must be scored against the same
 * list.** This is common random numbers, and it is not a refinement — v2
 * learned the hard way what happens without it. Comparing two sibling moves on
 * *different* shuffles measures which one drew better, not which one was
 * better, and on that data the shipped evaluator appeared to rank pairs
 * correctly 13% of the time. The artefact vanished entirely once the draws were
 * shared.
 *
 * Seeding from the state (rather than from wall-clock or a module-level
 * generator) is what keeps a replay exact: the same position always samples the
 * same worlds.
 */
export function sampleWorlds(
  state: GameState,
  me: PlayerId,
  count: number,
  seed: number = state.rngState,
): GameState[] {
  if (!canDeterminize(state)) return [];
  const rng: Rng = createRng(seed);
  return Array.from({ length: count }, () => determinize(state, me, rng));
}

/** FNV-1a over `text`, as an unsigned 32-bit number. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * The cards something in flight names: the decision being asked, a
 * resolution waiting to carry on, a trigger waiting to go on the stack, a
 * spell or ability on it. Every quoted string of those, so a card's id is in
 * it if any of them holds the card. `null` with nothing in flight.
 *
 * Such a card stays where it really is in a planning state: the player is
 * looking at it (a scry, a search, a hand being chosen from), or what is in
 * flight would act on it where it lies.
 */
function namedInFlight(state: GameState): ReadonlySet<string> | null {
  const stack = state.zones.shared.stack;
  if (
    state.awaiting === null &&
    state.suspendedResolutions.length === 0 &&
    state.pendingTriggers.length === 0 &&
    state.pendingTargetedTrigger === null &&
    stack.length === 0
  ) {
    return null;
  }
  const text = JSON.stringify([
    state.awaiting,
    state.suspendedResolutions,
    state.pendingTriggers,
    state.pendingTargetedTrigger,
    stack.map((id) => state.objects[id]),
  ]);
  const named = new Set<string>();
  for (const quoted of text.match(/"[^"\\]+"/g) ?? []) named.add(quoted.slice(1, -1));
  return named;
}

/** What `withHiddenCards` may be told. */
export interface HiddenCardsOptions {
  /** What the seat has seen (`seat-memory.ts`): the cards it knows in other
   * players' hands, and the ones it can place in a library. Without one, it
   * knows what everyone knows and what the board shows it now. */
  readonly memory?: Pick<SeatMemory, "hands" | "placed">;
  /** `"real"` leaves the other players' hands as they are, and hides only
   * how the libraries lie. */
  readonly hands?: "hidden" | "real";
}

/**
 * `state` as `me` may plan on it: the cards it can't see dealt out afresh,
 * the ones it knows left where they are, and a simulation's random numbers
 * not the real game's.
 *
 * v2's rollouts play on copies of the real state. So a draw in one came off
 * the real library, a shuffle or a coin flip came out as the real one would
 * (`fromSnapshot` restores `rngState`), and an opponent in one cast what
 * that player really held. On a live board with Garruk's Uprising,
 * Dragonhawk and Ureni out — a draw, an exile-and-play and a look at the top
 * eight in every line — the same position played three different turns over
 * three orders of the same library (`docs/bot-misplays.md`, 2026-11-17).
 *
 * **What is hidden.** For each other player, the cards of their hand `me`
 * doesn't know and the cards of their library it can't place are one pool:
 * the hand is dealt again from it, at the size it really is, and the rest go
 * under the library. For `me`'s own library, the cards it can't place. A
 * player in the bot's chair knows no more: how many cards a player holds,
 * and which cards of that deck it hasn't seen leave (the bot plans as if it
 * had read each deck's list, as at an open-decklist table; it knows nothing
 * of where a card is).
 *
 * **What is left where it is.** A card of a hand everyone knows is there
 * (`publiclyKnown`: bounced, returned, revealed) or `me` was shown
 * (`SeatMemory.hands`), a hand played revealed, a player `me` is making the
 * decisions of (rule 723); a run of library cards `me` can name from the top
 * or the bottom (`knownEnds`: a top card in sight, cards it scried or put
 * back); any card something in flight names (`namedInFlight`). A library
 * card everyone knows is in that library, at a place `me` can't name, is
 * never dealt into the hand.
 *
 * **How it is dealt.** By the cards themselves: each pool card is keyed by a
 * hash of the turn, the seat and its id, and the pool is those keys in
 * order: the first into the hand's unknown places, the rest into the
 * library's. So where a card really is has no say at all: two games that
 * differ only in how the unseen cards lie give the same answer. One deal a
 * turn, the same for every line a decision weighs (lines are compared on the
 * same draws: `sampleWorlds`' note on common random numbers) and for every
 * decision of the turn: a plan made in one window still reads the same in
 * the next, and a window already searched and passed on is known again
 * (`passMemoKey` takes the whole state, these lists included). A card the
 * other player draws is the one the deal had on top; one they cast leaves
 * the pool and the rest stay as dealt.
 *
 * A shallow copy: the hand and library lists and `rngState` are new, and so
 * is the record of a card dealt across (its `zone` says where the deal put
 * it); every other object is the game's own.
 *
 * Not done here: face-down cards (a foretold card, a morph) are read as what
 * they are, and one deal stands for all the hands a player might hold.
 */
export function withHiddenCards(
  state: GameState,
  registry: CardRegistry,
  me: PlayerId,
  options: HiddenCardsOptions = {},
): GameState {
  const named = namedInFlight(state);
  const seed = `${state.turn.number}:${me}`;
  const sight = hiddenCardsInSight(state, registry, me);
  const hideHands = options.hands !== "real";
  const answering = hideHands ? playersControlledBy(state, me) : [];
  const memory = options.memory;
  const byKey = (ids: readonly ObjectId[]): ObjectId[] =>
    ids
      .map((id) => ({ id, key: hash(`${seed}:${id}`) }))
      .sort((a, b) => a.key - b.key || (a.id < b.id ? -1 : 1))
      .map(({ id }) => id);
  const perPlayer = { ...state.zones.perPlayer };
  let objects: Record<ObjectId, GameObject> | null = null;
  for (const player of state.turnOrder) {
    const zones = perPlayer[player];
    if (zones === undefined) continue;
    const library = zones.library;
    const ends = knownEnds(library, memory?.placed[player], sight.tops[player] ?? null);
    const held = library.map(
      (id, at) => at < ends.top || at >= library.length - ends.bottom || named?.has(id) === true,
    );
    const loose = library.filter((_, at) => !held[at]);
    const hides = hideHands && player !== me && !sight.hands.has(player) && !answering.includes(player);
    const unknown = hides
      ? zones.hand.filter(
          (id) => named?.has(id) !== true && !publiclyKnown(state, id) && memory?.hands.has(id) !== true,
        )
      : [];
    if (loose.length === 0 || loose.length + unknown.length < 2) continue;
    // A library card everyone knows is in the library can't be in the hand.
    const stays = unknown.length === 0 ? [] : loose.filter((id) => publiclyKnown(state, id));
    const pool = byKey(stays.length === 0 ? [...unknown, ...loose] : [...unknown, ...loose.filter((id) => !stays.includes(id))]);
    const dealt = pool.slice(0, unknown.length);
    const under = stays.length === 0 ? pool.slice(unknown.length) : byKey([...pool.slice(unknown.length), ...stays]);
    let next = 0;
    const order = library.map((id, at) => (held[at] ? id : under[next++]));
    if (unknown.length === 0) {
      perPlayer[player] = { ...zones, library: order };
      continue;
    }
    const was = new Set(unknown);
    let slot = 0;
    perPlayer[player] = { ...zones, hand: zones.hand.map((id) => (was.has(id) ? dealt[slot++] : id)), library: order };
    const now = new Set(dealt);
    for (const id of dealt) {
      if (!was.has(id)) (objects ??= { ...state.objects })[id] = { ...state.objects[id], zone: "hand" };
    }
    for (const id of unknown) {
      if (!now.has(id)) (objects ??= { ...state.objects })[id] = { ...state.objects[id], zone: "library" };
    }
  }
  return {
    ...state,
    rngState: hash(`${seed}:rng`),
    zones: { ...state.zones, perPlayer },
    ...(objects === null ? {} : { objects }),
  };
}

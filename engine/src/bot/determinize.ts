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
 * libraries' order on 2026-11-17 through the lighter `withHiddenLibraryOrder`
 * at the end of this file: one made-up order a turn, no hands redealt.
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
import type { GameState } from "../state.js";
import { cloneGameState } from "../state.js";
import { libraryTopsSeenBy } from "../view.js";

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
 * Whether a library's order can be made up without disturbing anything in
 * flight: no resolution is waiting to carry on (it may hold cards it looked
 * at by their place), and the decision being asked names no library card (a
 * scry, a search, a "look at the top four": cards the player is looking at).
 */
function orderCanBeHidden(state: GameState): boolean {
  if (state.suspendedResolutions.length > 0) return false;
  if (state.awaiting === null) return true;
  const asked = JSON.stringify(state.awaiting);
  return !state.turnOrder.some((player) =>
    (state.zones.perPlayer[player]?.library ?? []).some((id) => asked.includes(`"${id}"`)),
  );
}

/**
 * `state` as `me` may plan on it: every library's cards in an order made up
 * for this decision, and a simulation's random numbers not the real game's.
 *
 * v2's rollouts play on copies of the real state, so a draw in one came off
 * the real library, and a shuffle or a coin flip came out as the real one
 * would (`fromSnapshot` restores `rngState`). On a live board with Garruk's
 * Uprising, Dragonhawk and Ureni out — a draw, an exile-and-play and a look
 * at the top eight in every line — the same position played three different
 * turns over three orders of the same library, and a line's value moved by
 * tens of points on what its rollout turned up (`docs/bot-misplays.md`,
 * 2026-11-17).
 *
 * The order is made from the cards themselves: each unseen card is keyed by a
 * hash of the turn, the seat and its id, and the library is those keys in
 * order. So the real order has no say at all: two games that differ only in
 * how a library lies give the same answer. A top card `me` can see
 * (`libraryTopSeenBy`: Future Sight, an opponent's revealed top) stays on
 * top. One order a turn, the same for every line a decision weighs (lines are
 * compared on the same draws: `sampleWorlds`' note on common random numbers)
 * and for every decision of the turn: a plan made in one window still reads
 * the same in the next, and a window already searched and passed on is known
 * again (`passMemoKey` takes the whole state, these lists included).
 *
 * A shallow copy: only the library lists and `rngState` are new, and nothing
 * moves between zones, so every reference into the state still holds. The
 * state itself is returned where an order can't be made up safely
 * (`orderCanBeHidden`).
 *
 * Not done here, and still read by the rollouts: the opponents' hands, and
 * what a player knows of a library beyond its top (a card they put there).
 */
export function withHiddenLibraryOrder(
  state: GameState,
  registry: CardRegistry,
  me: PlayerId,
  /** The caller's, kept between its decisions: the orders made up so far
   * this turn, reused while a library and its seen top are what they were. */
  memo?: LibraryOrderMemo,
): GameState {
  if (!orderCanBeHidden(state)) return state;
  const seed = `${state.turn.number}:${me}`;
  if (memo !== undefined && memo.seed !== seed) {
    memo.seed = seed;
    memo.libraries = {};
  }
  const tops = libraryTopsSeenBy(state, registry, me);
  const perPlayer = { ...state.zones.perPlayer };
  for (const player of state.turnOrder) {
    const zones = perPlayer[player];
    if (zones === undefined || zones.library.length < 2) continue;
    const top = tops[player] ?? null;
    const made = memo?.libraries[player];
    const known =
      made !== undefined &&
      made.top === top &&
      made.real.length === zones.library.length &&
      made.real.every((id, i) => id === zones.library[i]);
    let order: readonly ObjectId[];
    if (known) {
      order = made.order;
    } else {
      const unseen = top === null ? zones.library : zones.library.filter((id) => id !== top);
      const sorted = unseen
        .map((id) => ({ id, key: hash(`${seed}:${id}`) }))
        .sort((a, b) => a.key - b.key || (a.id < b.id ? -1 : 1))
        .map(({ id }) => id);
      order = top === null ? sorted : [top, ...sorted];
      if (memo !== undefined) memo.libraries[player] = { real: [...zones.library], top, order };
    }
    perPlayer[player] = { ...zones, library: [...order] };
  }
  return { ...state, rngState: hash(`${seed}:rng`), zones: { ...state.zones, perPlayer } };
}

/** What `withHiddenLibraryOrder` remembers for one seat between decisions. */
export interface LibraryOrderMemo {
  seed: string;
  libraries: Record<PlayerId, { readonly real: readonly ObjectId[]; readonly top: ObjectId | null; readonly order: readonly ObjectId[] }>;
}

/** An empty `LibraryOrderMemo`. */
export const libraryOrderMemo = (): LibraryOrderMemo => ({ seed: "", libraries: {} });

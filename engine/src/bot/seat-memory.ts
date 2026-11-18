/**
 * What one seat has seen of the cards it can't see now — a bot that plans on
 * what a player in its chair would know (`determinize.ts`'s `withHiddenCards`
 * is the planning state made from it).
 *
 * A bot's view holds the real game state, every hand and library in it, and
 * its simulations play on copies of that. Hiding those cards from it is only
 * half of playing fair: a player also *remembers*. They know the card they
 * left on top with a scry, the two they put back with Brainstorm, the hand
 * they looked at last turn, the creature that was bounced. A bot that forgot
 * all of that the moment the card left its sight would be playing a different
 * game from the people at the table, in the other direction.
 *
 * Two sources, and nothing else:
 *
 * - **What everyone knows** is the engine's own record, `GameState.publicStints`
 *   (`publiclyKnown`): a card that went to a hand or a library from where all
 *   could see it, or was revealed there, until it moves on or its library is
 *   shuffled. Every client is sent the same record; nothing is kept here.
 * - **What this seat alone was shown, and where cards lie in a library**, is
 *   kept here, from what the seat is shown as it is asked each decision: the
 *   cards its decision shows it (`awaitedCardsShownTo`, the same rule its
 *   view is built by), hands played revealed, a top card in sight, and how
 *   each library changed since it last looked.
 *
 * Where a card lies in a library is known as a set of cards "placed" there,
 * read as a run from the top and a run from the bottom: the cards the seat
 * arranged itself or saw put there. A run ends at the first card it can't
 * name. The set is emptied when the library is shuffled, when its owner
 * looks at and rearranges its top (a scry), and whenever the cards that were
 * there lie in another order without the seat having arranged them.
 *
 * Wrong in the safe direction throughout: it forgets what a careful player
 * would work out (a known card three from the top after two unknown ones go
 * on it; which card a player put back when the seat knew their whole hand),
 * and never names a card the seat was not shown. One thing it reads that a
 * player couldn't: whether the cards it remembers still lie as it remembers
 * them, which it uses only to forget.
 */

import type { CardRegistry } from "../cards.js";
import { playersControlledBy } from "../player-control.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { GameState } from "../state.js";
import { awaitedCardsShownTo, hiddenCardsInSight } from "../view.js";

/** What a seat remembers between its decisions. */
export interface SeatMemory {
  /** Cards in other players' hands the seat was shown, or saw them take. */
  hands: Set<ObjectId>;
  /** For each library, the cards whose place in it the seat knows. */
  placed: Record<PlayerId, Set<ObjectId>>;
  /** Each library as it lay when the seat was last asked something. */
  libraries: Record<PlayerId, readonly ObjectId[]>;
  /** The seat's own hand then. */
  ownHand: ReadonlySet<ObjectId>;
  /** The cards its decision then showed it: its own to arrange. */
  arranging: ReadonlySet<ObjectId>;
  /** How much of the game's log it had read, and the game's clock then. */
  read: number;
  seq: number;
}

/** A memory with nothing in it. */
export const seatMemory = (): SeatMemory => ({
  hands: new Set(),
  placed: {},
  libraries: {},
  ownHand: new Set(),
  arranging: new Set(),
  read: 0,
  seq: 0,
});

/** Whether every player knows what `id` is: its last `PublicStint` is open. */
export function publiclyKnown(state: GameState, id: ObjectId): boolean {
  const stints = state.publicStints?.[id];
  const last = stints?.[stints.length - 1];
  return last !== undefined && last.until === undefined;
}

/**
 * How many cards of `library` the seat can name from the top and from the
 * bottom, given the cards it can place (`SeatMemory.placed`) and a top card
 * in sight: two runs that never overlap.
 */
export function knownEnds(
  library: readonly ObjectId[],
  placed: ReadonlySet<ObjectId> | undefined,
  topInSight: ObjectId | null = null,
): { readonly top: number; readonly bottom: number } {
  let top = 0;
  while (top < library.length && ((top === 0 && library[0] === topInSight) || placed?.has(library[top]) === true)) top += 1;
  let bottom = 0;
  while (top + bottom < library.length && placed?.has(library[library.length - 1 - bottom]) === true) bottom += 1;
  return { top, bottom };
}

/** Whether the cards `prev` and `cur` share lie in the same order in both. */
function sameOrder(
  prev: readonly ObjectId[],
  cur: readonly ObjectId[],
  before: ReadonlySet<ObjectId>,
  here: ReadonlySet<ObjectId>,
): boolean {
  let i = 0;
  for (const id of cur) {
    if (!before.has(id)) continue;
    while (i < prev.length && !here.has(prev[i])) i += 1;
    if (prev[i] !== id) return false;
    i += 1;
  }
  return true;
}

/**
 * Take in the game as `me` is asked a decision: what it is shown now, and
 * what changed in the hidden zones since it was last asked. Call it on the
 * real game's states only, in order; a state from before the last one read
 * (another game, a copy rewound) empties the memory first.
 */
export function observe(memory: SeatMemory, state: GameState, registry: CardRegistry, me: PlayerId): void {
  if (state.eventSeq < memory.seq || state.eventLog.length < memory.read) Object.assign(memory, seatMemory());
  const mine = new Set<PlayerId>([me, ...playersControlledBy(state, me)]);
  const shown = new Set<ObjectId>();
  for (const seat of mine) for (const id of awaitedCardsShownTo(state, seat)) shown.add(id);

  // What the log says happened since: shuffles, other players' looks at
  // their own libraries, reveals, and a search's find put on a library.
  const shuffled = new Set<PlayerId>();
  const peeked = new Set<PlayerId>();
  const arranged = new Set<PlayerId>();
  const revealed = new Set<ObjectId>(state.revealedThisTurn);
  const found: { readonly by: PlayerId; readonly id: ObjectId }[] = [];
  for (let i = memory.read; i < state.eventLog.length; i += 1) {
    const event = state.eventLog[i];
    if (event.type === "library-shuffled" || event.type === "cards-shuffled-into-library") shuffled.add(event.player);
    else if (event.type === "scried") (mine.has(event.player) ? arranged : peeked).add(event.player);
    else if (event.type === "cards-revealed") for (const id of event.objects) revealed.add(id);
    else if (event.type === "cards-chosen-from-zone" && (event.to === "library-top" || event.to === "library-bottom")) {
      for (const id of event.objects) found.push({ by: event.player, id });
    }
  }
  // A find put on a library is known to the player who found it, and to
  // everyone when it was revealed on the way ("reveal it, then shuffle and
  // put that card on top").
  const putBack = new Set(found.filter(({ by, id }) => mine.has(by) || revealed.has(id)).map(({ id }) => id));

  const sight = hiddenCardsInSight(state, registry, me);

  // Hands: what the seat is shown now, what it already knew is still there,
  // and a card it knew was on top of that player's library.
  const hands = new Set<ObjectId>();
  for (const player of state.turnOrder) {
    if (player === me) continue;
    const zones = state.zones.perPlayer[player];
    if (zones === undefined) continue;
    const open = sight.hands.has(player) || mine.has(player);
    const was = memory.libraries[player];
    const onTop =
      was === undefined || shuffled.has(player) || peeked.has(player)
        ? new Set<ObjectId>()
        : new Set(was.slice(0, knownEnds(was, memory.placed[player]).top));
    for (const id of zones.hand) {
      if (open || shown.has(id) || revealed.has(id) || memory.hands.has(id) || onTop.has(id)) hands.add(id);
    }
  }
  memory.hands = hands;

  // Libraries.
  for (const player of state.turnOrder) {
    const cur = state.zones.perPlayer[player]?.library ?? [];
    const prev = memory.libraries[player];
    const here = new Set(cur);
    let placed = memory.placed[player] ?? new Set<ObjectId>();
    if (prev === undefined || shuffled.has(player) || peeked.has(player)) {
      placed = new Set();
    } else {
      const before = new Set(prev);
      const byMe = arranged.has(player) || prev.some((id) => memory.arranging.has(id));
      if (!byMe && !sameOrder(prev, cur, before, here)) {
        placed = new Set();
      } else {
        for (const id of placed) if (!here.has(id)) placed.delete(id);
        // Cards put there since, from where the seat could see what they were.
        for (const id of cur) {
          if (!before.has(id) && (publiclyKnown(state, id) || memory.ownHand.has(id))) placed.add(id);
        }
      }
    }
    for (const id of cur) {
      if (shown.has(id) || putBack.has(id) || (revealed.has(id) && publiclyKnown(state, id))) placed.add(id);
    }
    const top = sight.tops[player] ?? null;
    if (top !== null) placed.add(top);
    memory.placed[player] = placed;
    memory.libraries[player] = [...cur];
  }

  memory.ownHand = new Set(state.zones.perPlayer[me]?.hand ?? []);
  memory.arranging = shown;
  memory.read = state.eventLog.length;
  memory.seq = state.eventSeq;
}

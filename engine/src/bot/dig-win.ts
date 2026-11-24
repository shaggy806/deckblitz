/**
 * A dig for the card that wins the game this turn.
 *
 * `dig.ts` names a card only where the dig is safe: one time in ten of a
 * miss at most, and twenty cards expected left in the library. Neither
 * matters to a card that ends the game now: nothing is left to protect, and
 * a miss is a gamble worth taking for the game (the user, 2026-11-23). So
 * such a card is named whenever it is found more often than not
 * (`WIN_RISK_MAX`; the chance itself can't be got round: one copy is in
 * Demonic Consultation's top six 6 times in N whatever the bot wants).
 *
 * **Whether a card wins is played out, not read off it.** Craterhoof
 * Behemoth, Torment of Hailfire and the second half of a combo win on the
 * right board only. Each card the dig could find and the mana left could
 * cast is put where the dig finds it, and the turn played on with our seat
 * acting as v1 does and the others blocking (`simulate.ts`'s `"acting"`):
 * the name is one whose turn ends with the game won. So it sees a win that
 * lands this turn and that v1 plays into; a card that sets up next turn's
 * win is still picked by `dig.ts`'s rule.
 *
 * **Tainted Pact** sees each card, so its two rules give way the same way
 * ({@link winningOffer}): a card whose taking wins the turn is taken
 * whatever the library holds better, and while a card that would win is
 * still in the library and likelier than not to come up before two cards of
 * one name end the dig (`reachChance`), every other card is turned down,
 * past the thirty cards it otherwise stops at.
 *
 * A few simulations for each dig, and only v2 asks (`EvalBotController`):
 * the stand-ins inside its rollouts name as v1 does, so a win search never
 * runs inside another.
 */

import { isManaAbility } from "../abilities.js";
import type { Action } from "../actions.js";
import type { CardRegistry } from "../cards.js";
import { manaValue, parseManaCost } from "../mana.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { GameState } from "../state.js";
import type { ControllerView } from "../controller.js";
import { WIN_RISK_MAX, namesWithinRisk, offeredByDig, reachChance } from "./dig.js";
import type { Dig } from "./dig.js";
import { PlayingRolloutController, simulateAction } from "./simulate.js";

/** The most cards one dig plays out as it resolves, dearest first: each
 * costs a turn's simulation (8 ms on a small four-player board), and a card
 * that ends the game is more often a dear one. With more castable names
 * than this in the library, the cheapest go unlooked at (a Lightning Bolt
 * for the last three life, behind two dozen others). */
const WIN_CANDIDATES = 24;
/** The same for a dig still in hand, which is asked once a turn for as long
 * as it is held: half as many. */
const WIN_CANDIDATES_HELD = 12;

/** Our own seat in a played-out dig: v1's turn, naming `name`. */
class NamingController extends PlayingRolloutController {
  private readonly name: string;

  constructor(player: PlayerId, registry: CardRegistry, name: string) {
    super(player, registry);
    this.name = name;
  }

  override chooseCardName(): string {
    return this.name;
  }
}

/** Our own seat in a played-out Tainted Pact: v1's turn, taking the next
 * card the dig offers. */
class TakingController extends PlayingRolloutController {
  private readonly cards: CardRegistry;

  constructor(player: PlayerId, registry: CardRegistry) {
    super(player, registry);
    this.cards = registry;
  }

  override chooseModes(view: ControllerView, min: number, max: number, texts: readonly string[]): readonly number[] {
    return offeredByDig(view.state, this.cards, this.playerId) !== null ? [0] : super.chooseModes(view, min, max, texts);
  }
}

/** The nonland cards among `named` that `mana` could cast, dearest first,
 * `limit` at most. */
function castable<T extends { readonly name: string }>(
  registry: CardRegistry,
  named: readonly T[],
  mana: number,
  limit: number,
): T[] {
  return named
    .flatMap((each) => {
      if (!registry.has(each.name)) return [];
      const def = registry.get(each.name);
      if (def.types.includes("land")) return [];
      const value = manaValue(parseManaCost(def.manaCost));
      return value <= mana ? [{ each, value }] : [];
    })
    .sort((a, b) => b.value - a.value || (a.each.name < b.each.name ? -1 : a.each.name > b.each.name ? 1 : 0))
    .slice(0, limit)
    .map(({ each }) => each);
}

/** The mana `me` could still make this turn, counted roughly: what is in
 * the pool, and one for each untapped permanent with a mana ability. */
function manaLeft(state: GameState, registry: CardRegistry, me: PlayerId): number {
  let mana = state.players[me]?.manaPool.length ?? 0;
  for (const id of state.zones.shared.battlefield) {
    const object = state.objects[id];
    if (object === undefined || object.controller !== me || object.tapped) continue;
    if (registry.has(object.cardName) && registry.get(object.cardName).activated.some(isManaAbility)) mana += 1;
  }
  return mana;
}

/** `state` with `card` lying where a dig that exiles `exiledFirst` cards
 * first finds it at once. */
function found(state: GameState, me: PlayerId, card: ObjectId, exiledFirst: number): GameState {
  const zones = state.zones.perPlayer[me];
  const library = zones.library.filter((id) => id !== card);
  library.splice(Math.min(exiledFirst, library.length), 0, card);
  return { ...state, zones: { ...state.zones, perPlayer: { ...state.zones.perPlayer, [me]: { ...zones, library } } } };
}

/** Whether `state` is inside a resolution, whose "this way" reads need the
 * event log a simulation otherwise drops (`simulateAction`'s `keepEvents`):
 * a dig answering its name choice or its offer, not one about to be cast. */
const midResolution = (state: GameState): boolean => state.resolutionSince !== undefined;

/** A search under way: a played-out turn that reaches another dig names as
 * v1 does there, and never starts a search of its own. */
let searching = false;

/**
 * The name `me`'s named dig should choose because finding that card wins
 * the game this turn, or `null` — see the module comment.
 *
 * `start` is the move the played-out turn begins with for a name: the
 * answer to the name choice when the dig is already resolving, or the cast
 * of the dig itself, which then spends `cost` of the mana first. `usual` is
 * the name `dig.ts` would choose: where the turn is won with that card found
 * too, the win isn't this card's and nothing is gambled for it.
 */
export function winningName(
  state: GameState,
  registry: CardRegistry,
  me: PlayerId,
  dig: Extract<Dig, { kind: "named" }>,
  start: (name: string) => Action,
  usual: string | null,
  cost = 0,
): string | null {
  if (searching) return null;
  searching = true;
  try {
    return winnerAmong(state, registry, me, dig, start, usual, cost);
  } finally {
    searching = false;
  }
}

function winnerAmong(
  state: GameState,
  registry: CardRegistry,
  me: PlayerId,
  dig: Extract<Dig, { kind: "named" }>,
  start: (name: string) => Action,
  usual: string | null,
  cost: number,
): string | null {
  const mana = manaLeft(state, registry, me) - cost;
  const limit = midResolution(state) ? WIN_CANDIDATES : WIN_CANDIDATES_HELD;
  const candidates = castable(registry, namesWithinRisk(state, me, dig, WIN_RISK_MAX), mana, limit);
  const wins = (name: string, card: ObjectId): boolean => {
    const after = simulateAction(
      found(state, me, card, dig.exiledFirst),
      registry,
      start(name),
      "turn",
      "acting",
      new NamingController(me, registry, name),
      midResolution(state),
    );
    return after !== null && after.result.over && after.result.winner === me;
  };
  const winner = candidates.find(({ name, card }) => wins(name, card));
  if (winner === undefined || winner.name === usual) return winner?.name ?? null;
  const library = state.zones.perPlayer[me].library;
  const usually = library.find((id) => state.objects[id]?.cardName === usual);
  return usual !== null && usually !== undefined && wins(usual, usually) ? null : winner.name;
}

/** Each name in `me`'s library once, with its copy nearest the top. */
function libraryNames(state: GameState, me: PlayerId): { readonly name: string; readonly card: ObjectId }[] {
  const seen = new Set<string>();
  return state.zones.perPlayer[me].library.flatMap((card) => {
    const name = state.objects[card]?.cardName;
    if (name === undefined || seen.has(name)) return [];
    seen.add(name);
    return [{ name, card }];
  });
}

/** Whether the turn played on from `start`, our seat taking the next card
 * Tainted Pact offers, ends with the game won. */
function winsTaking(state: GameState, registry: CardRegistry, me: PlayerId, start: Action): boolean {
  const self = new TakingController(me, registry);
  const after = simulateAction(state, registry, start, "turn", "acting", self, midResolution(state));
  return after !== null && after.result.over && after.result.winner === me;
}

/**
 * The card in `me`'s library that wins the turn when Tainted Pact digs to
 * it, among those `mana` could cast: put on top, the turn played on from
 * `start` with our seat taking the first card offered. Not weighed here:
 * how likely the dig is to reach it (`reachChance`).
 */
function soughtByDig(
  state: GameState,
  registry: CardRegistry,
  me: PlayerId,
  start: Action,
  mana: number,
  exiled: readonly ObjectId[],
): string | null {
  const limit = midResolution(state) ? WIN_CANDIDATES : WIN_CANDIDATES_HELD;
  for (const { name, card } of castable(registry, libraryNames(state, me), mana, limit)) {
    if (reachChance(state, me, exiled, name) < 1 - WIN_RISK_MAX) continue;
    if (winsTaking(found(state, me, card, 0), registry, me, start)) return name;
  }
  return null;
}

/**
 * Whether casting Tainted Pact with `cast`, for `cost` mana, digs to a card
 * that wins the game this turn and is likelier than not to come up — see
 * the module comment.
 */
export function winsByDigging(state: GameState, registry: CardRegistry, me: PlayerId, cast: Action, cost: number): boolean {
  if (searching) return false;
  searching = true;
  try {
    return soughtByDig(state, registry, me, cast, manaLeft(state, registry, me) - cost, []) !== null;
  } finally {
    searching = false;
  }
}

/** What {@link winningOffer} says of one offer. */
export interface OfferForTheWin {
  /** Take the offered card, turn it down to dig on, or `null`: no card
   * wins, and `dig.ts`'s rule answers. */
  readonly answer: "take" | "dig-on" | null;
  /** The card still in the library that wins the turn when found, as far as
   * this dig has looked: handed back in as `sought` at its later offers, so
   * the library is played out once a dig and not once a card. */
  readonly sought: string | null;
}

/**
 * Tainted Pact's offer, answered for a win this turn — see the module
 * comment. `dug` is the offer (`offeredByDig`); `sought` is what this dig's
 * earlier offers found to look for, `undefined` at its first.
 */
export function winningOffer(
  state: GameState,
  registry: CardRegistry,
  me: PlayerId,
  dug: { readonly offered: ObjectId; readonly exiled: readonly ObjectId[] },
  sought: string | null | undefined,
): OfferForTheWin {
  if (searching) return { answer: null, sought: sought ?? null };
  searching = true;
  try {
    const mana = manaLeft(state, registry, me);
    const take: Action = { type: "choose-modes", player: me, modes: [0] };
    const name = state.objects[dug.offered]?.cardName;
    if (name !== undefined && castable(registry, [{ name }], mana, 1).length > 0) {
      if (winsTaking(state, registry, me, take)) return { answer: "take", sought: sought ?? null };
    }
    const turnDown: Action = { type: "choose-modes", player: me, modes: [] };
    const looked = sought !== undefined ? sought : soughtByDig(state, registry, me, turnDown, mana, dug.exiled);
    const ahead = looked !== null && reachChance(state, me, dug.exiled, looked) >= 1 - WIN_RISK_MAX;
    return { answer: ahead ? "dig-on" : null, sought: looked };
  } finally {
    searching = false;
  }
}

/**
 * Would a spell or ability on the stack affect a player — them, or anything
 * of theirs? The server's auto-pass asks this of an opponent's spell,
 * activation or trigger (the user's rule, 2026-11-11: "auto pass should be paused
 * whenever a spell/ability would affect you or your board"), so it stops for
 * a Wrath or a discard spell, targeted or not, and carries on past a creature
 * cast or a tutor.
 *
 * Answered by playing it: on a copy of the game, everyone passes until the
 * object is on top of the stack, the player's side is printed, it resolves,
 * and the player's side is printed again. Anything that differs is "affected"
 * — life, counters and the rest of their player record, their hand, library,
 * graveyard, exile and command zone, their spells on the stack, and each
 * permanent they control as it is and as it reads through the layers (a -1/-1
 * to the board, a "can't block"). Decisions on the way are answered as the
 * bots' combat stand-ins answer them (v1), so a "sacrifice a creature" picks
 * one and shows. What it doesn't see: an effect that only changes what may
 * happen later without changing anything now ("players can't gain life").
 */

import type { CardRegistry } from "./cards/card-registry.js";
import { CombatRolloutController } from "./bot/simulate.js";
import { computeCharacteristics, withComputedCache } from "./characteristics.js";
import type { PlayerController } from "./controller.js";
import { Game } from "./game.js";
import type { ObjectId, PlayerId } from "./primitives.js";
import type { GameState } from "./state.js";

/** A ceiling on the steps one preview plays — resolving the things above the
 * object and then the object itself, each through its decisions. */
const MAX_STEPS = 400;

const onStack = (state: GameState, object: ObjectId): boolean => state.zones.shared.stack.includes(object);

/** Everything of `player`'s a resolution could change, as one string. */
function sideOf(state: GameState, registry: CardRegistry, player: PlayerId): string {
  return withComputedCache(() => {
    const parts: unknown[] = [
      state.players[player],
      state.zones.perPlayer[player],
      state.monarch === player,
      state.initiative === player,
    ];
    for (const id of state.zones.shared.battlefield) {
      const object = state.objects[id];
      if (object?.controller !== player) continue;
      parts.push(id, object, computeCharacteristics(state, registry, id));
    }
    for (const id of state.zones.shared.stack) {
      const object = state.objects[id];
      if (object?.controller === player) parts.push(id, object);
    }
    return JSON.stringify(parts);
  });
}

/**
 * Whether `object`, on the stack in `state`, would affect `player` when it
 * resolves — or `null` when it can't be told: the object isn't on the stack,
 * or leaves it without resolving (countered by something above it). An error
 * in the copy reads as `true`: a pause too many costs one click.
 */
export function wouldAffectPlayer(
  state: GameState,
  registry: CardRegistry,
  object: ObjectId,
  player: PlayerId,
): boolean | null {
  if (!onStack(state, object) || state.players[player] === undefined) return null;
  try {
    const controllers: Record<PlayerId, PlayerController> = {};
    for (const seat of state.turnOrder) controllers[seat] = new CombatRolloutController(seat, registry);
    const sim = Game.fromSnapshot({ ...state, eventLog: [] }, { registry, controllers });
    let steps = 0;
    const capped = (): boolean => (steps += 1) > MAX_STEPS;
    // Up to the moment it's about to resolve: on top, nothing being asked.
    sim.advanceUntil(
      (s) =>
        capped() ||
        !onStack(s, object) ||
        (s.zones.shared.stack[s.zones.shared.stack.length - 1] === object && s.awaiting === null),
    );
    if (sim.state.result.over || !onStack(sim.state, object) || steps > MAX_STEPS) return null;
    const before = sideOf(sim.state, registry, player);
    // Then until it has gone and the game is back at a priority window: the
    // state-based actions it caused have happened, the triggers it caused are
    // on the stack (not resolved — they're abilities of their own).
    steps = 0;
    sim.advanceUntil(
      (s) => capped() || (!onStack(s, object) && s.awaiting === null && s.pendingTriggers.length === 0),
    );
    return sideOf(sim.state, registry, player) !== before;
  } catch {
    return true;
  }
}

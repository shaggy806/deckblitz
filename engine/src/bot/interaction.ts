/**
 * Which actions are **interaction** — a counterspell, removal, a wipe — and
 * whom each is aimed at. `scoreOutcome` scores those on the opponent they
 * hit, at full weight, and everything else by standings (the bot audit's
 * Q4; `aimedOutcome` in `evaluate.ts`).
 *
 * Read off the action, not the card's name or type:
 *
 * - a spell or ability with a **target an opponent controls**, a permanent
 *   or a spell on the stack, is aimed at that opponent. Nothing here asks
 *   what it does to the target: a spell pointed at an opponent's object is
 *   an answer to it, and one that takes nothing from them changes no score.
 *   A player as a target is not one: burn at a face is a race, and a race is
 *   weighed by standings.
 * - one with no such target whose effect **destroys, exiles, damages,
 *   returns or has sacrificed everything** a filter matches is aimed at
 *   every opponent, and scored on the one it takes the most from.
 */
import type { Action } from "../actions.js";
import type { CardRegistry } from "../cards.js";
import type { PlayerId } from "../primitives.js";
import type { GameState } from "../state.js";

/** The opponents an action is aimed at; `"all"` for a wipe; `null` when it
 * isn't interaction. */
export type Aimed = readonly PlayerId[] | "all" | null;

const MASS: ReadonlySet<unknown> = new Set([
  "destroy-all",
  "exile-all",
  "damage-all",
  "return-to-hand-all",
  "sacrifice-all",
  "sacrifice-all-but",
]);

const massMemo = new WeakMap<object, boolean>();

/** Whether a mass removal effect is anywhere in `effect`'s tree. */
function wipes(effect: unknown): boolean {
  if (effect === null || typeof effect !== "object") return false;
  let found = massMemo.get(effect);
  if (found === undefined) {
    found = Array.isArray(effect)
      ? effect.some(wipes)
      : MASS.has((effect as { readonly kind?: unknown }).kind) || Object.values(effect).some(wipes);
    massMemo.set(effect, found);
  }
  return found;
}

/** What `action` does as it resolves: the spell's effect (its chosen modes'
 * for a modal one), or the activated ability's. */
function effectOf(state: GameState, registry: CardRegistry, action: Action): unknown {
  if (action.type === "cast-spell") {
    const name = state.objects[action.card]?.cardName;
    if (name === undefined || !registry.has(name)) return undefined;
    const def = registry.get(name);
    const modes = def.castModal?.modes;
    if (modes === undefined) return def.effect;
    return action.modes === undefined ? modes.map((mode) => mode.effect) : action.modes.map((i) => modes[i]?.effect);
  }
  if (action.type === "activate-ability") {
    const name = state.objects[action.source]?.cardName;
    if (name === undefined || !registry.has(name)) return undefined;
    return registry.get(name).activated?.[action.abilityIndex]?.effect;
  }
  return undefined;
}

/** Whom `action`, taken by `me` on `state`'s board, is aimed at. */
export function aimedAt(state: GameState, registry: CardRegistry, me: PlayerId, action: Action): Aimed {
  if (action.type !== "cast-spell" && action.type !== "activate-ability") return null;
  const aimed: PlayerId[] = [];
  for (const target of action.targets ?? []) {
    if (target === null || target.kind !== "object") continue;
    const object = state.objects[target.object];
    if (object === undefined || (object.zone !== "battlefield" && object.zone !== "stack")) continue;
    if (object.controller !== me && !aimed.includes(object.controller)) aimed.push(object.controller);
  }
  if (aimed.length > 0) return aimed;
  return wipes(effectOf(state, registry, action)) ? "all" : null;
}

/** Every opponent a line's steps were aimed at, each step read on the board
 * it was taken from. */
export function aimedByLine(
  registry: CardRegistry,
  me: PlayerId,
  steps: readonly (Action | "combat")[],
  before: readonly GameState[],
): Aimed {
  let all: PlayerId[] | null = null;
  for (let i = 0; i < steps.length; i += 1) {
    const step = steps[i];
    const state = before[i];
    if (step === undefined || step === "combat" || state === undefined) continue;
    const aimed = aimedAt(state, registry, me, step);
    if (aimed === null) continue;
    if (aimed === "all") return "all";
    all ??= [];
    for (const player of aimed) if (!all.includes(player)) all.push(player);
  }
  return all;
}

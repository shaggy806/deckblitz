/**
 * What a removal's aim is worth past what the evaluation scores it: a
 * premium for taking an opponent's commander, and for taking its token
 * makers (`EvalWeights.opposingCommander`, `opposingTokenEngines`).
 *
 * It is added only where one removal chooses among its own targets: a
 * trigger's target (`bestDecision`), and the target of the cast or
 * activation a priority search has already chosen (`EvalBotController.
 * reaimed`). It never makes a removal the better play than something else.
 * As terms of the evaluation the same two numbers were judged
 * (`bot:judge --kind removal`, 2026-11-15, 21 games): they were better each
 * of the five times they changed which permanent a removal took, once
 * keeping the bot in the game, and worse both times they fired a removal in
 * place of developing, once at the cost of a game it went on to win. Why
 * these two marks and no table of threats: `docs/plans/bot-next-steps.md`,
 * step 7.
 *
 * **Both weights are 0, and this is off.** Judged on the aim alone
 * (2026-11-16, 23 games, 17 changed aims: 3 better, 4 worse, 10 even), the
 * commander weight fails: 2 better and 4 worse of 12, because a commander
 * removed goes to the command zone and comes back (rules 903.9a, 903.8), so
 * the removal was better spent on an engine that isn't one. The token-maker
 * weight changed four aims, one for the better and none for the worse, which
 * settles nothing; the hook stays for the run that would
 * (`--weights '{"opposingTokenEngines":4}'`, about 150 games).
 */

import type { CardDefinition } from "../cards/define.js";
import type { CardRegistry } from "../cards.js";
import type { PlayerId } from "../primitives.js";
import { rulesTextName } from "../state.js";
import type { GameState } from "../state.js";
import type { TargetRef } from "../target.js";
import type { EvalWeights } from "./evaluate.js";
import { tokenRate } from "./features.js";

/** What a removal does to a permanent it targets. */
const REMOVES: ReadonlySet<string> = new Set(["destroy", "exile", "return-to-hand", "gain-control", "damage", "put-on-library", "shuffle-into-library"]);

const removing = new WeakMap<CardDefinition, boolean>();

/** Does this card remove a permanent it targets, by its spell, a mode, a
 * trigger or an ability? Read off the definition, anywhere in it. */
export function removesATarget(def: CardDefinition): boolean {
  let found = removing.get(def);
  if (found === undefined) {
    const walk = (node: unknown): boolean => {
      if (node === null || typeof node !== "object") return false;
      if (Array.isArray(node)) return node.some(walk);
      const { kind, target } = node as { readonly kind?: unknown; readonly target?: unknown };
      return (typeof kind === "string" && REMOVES.has(kind) && typeof target === "number") || Object.values(node).some(walk);
    };
    found = walk([def.effect, def.castModal, def.triggered, def.activated]);
    removing.set(def, found);
  }
  return found;
}

/**
 * The premium on `targets` for a removal from the card named `source`,
 * `me` aiming it: for each permanent an opponent controls among them,
 * `opposingCommander` if it is its owner's commander, and
 * `opposingTokenEngines` for each token a round it makes. 0 when the
 * weights are, when the source removes nothing, and for anything aimed at
 * our own side.
 */
export function aimPremium(
  state: GameState,
  registry: CardRegistry,
  weights: EvalWeights,
  me: PlayerId,
  source: string | undefined,
  targets: readonly (TargetRef | null | undefined)[] | undefined,
): number {
  if (weights.opposingCommander === 0 && weights.opposingTokenEngines === 0) return 0;
  if (source === undefined || targets === undefined || !registry.has(source) || !removesATarget(registry.get(source))) return 0;
  const opponents = state.turnOrder.filter((p) => !state.players[p].hasLost).length - 1;
  let premium = 0;
  for (const target of targets) {
    if (target === null || target === undefined || target.kind !== "object") continue;
    const object = state.objects[target.object];
    if (object === undefined || object.zone !== "battlefield" || object.controller === me) continue;
    if (object.isCommander && object.owner === object.controller) premium += weights.opposingCommander;
    const name = rulesTextName(object);
    if (weights.opposingTokenEngines !== 0 && registry.has(name)) {
      premium += weights.opposingTokenEngines * tokenRate(registry, registry.get(name), Math.max(1, opponents));
    }
  }
  return premium;
}

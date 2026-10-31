/**
 * Choosing a modal spell or ability's modes (rule 700.2) — "choose one —",
 * "choose two", "choose one or both", Charms and Commands.
 *
 * Only the *non-targeted* modal path comes through here. A modal spell whose
 * modes take targets is declared with `CardDefinition.castModal` and resolved
 * at cast time instead, because the targets have to be chosen along with the
 * modes rather than after them.
 *
 * Some modes carry a cost with `{X}` in it ("you may pay {X}{R}"), which is
 * why the offer can include an `xCost` ceiling — the one field here the
 * module cannot compute for itself.
 */

import type { Action, LegalAction } from "../actions.js";
import { parseManaCost } from "../mana.js";
import { defineDecision } from "./define.js";
import { noDuplicates, withinRange } from "./shared/picks.js";
import { subsetsBetween } from "./shared/subsets.js";

export const chooseModes = defineDecision({
  kind: "choose-modes",

  hasSource: true,

  legal: (ctx, awaiting): LegalAction[] => [
    {
      kind: "choose-modes",
      source: awaiting.source,
      minModes: awaiting.minModes,
      maxModes: awaiting.maxModes,
      ...(awaiting.orNone === true ? { orNone: true } : {}),
      modeTexts: awaiting.modes.map((m) => m.text),
      // "You choose an opponent": each mode is that player's (an
      // `about-player` effect), so a driver can name them properly.
      ...(awaiting.modes.some((m) => m.effect.kind === "about-player")
        ? { modePlayers: awaiting.modes.map((m) => (m.effect.kind === "about-player" ? m.effect.player : null)) }
        : {}),
      ...(awaiting.about !== undefined ? { about: awaiting.about } : {}),
      ...(awaiting.ward !== undefined ? { ward: { spell: awaiting.ward.spell } } : {}),
      // "You may pay one or more {E}" / "any amount of {E}": X in energy,
      // up to what the chooser has (the raise capped `maxX` at it).
      ...(awaiting.energyX !== undefined
        ? {
            xCost: {
              maxX: Math.min(awaiting.maxX ?? 0, ctx.state.players[awaiting.player].energy),
              ...(awaiting.energyX === "one-or-more" ? { minX: 1 } : {}),
              energy: true as const,
            },
          }
        : {}),
      // "You may pay {X}{R}" — tell the driver how large X may be.
      ...(awaiting.energyX === undefined && awaiting.cost !== undefined && parseManaCost(awaiting.cost).x > 0
        ? {
            xCost: {
              maxX: Math.min(
                ctx.maxAffordableAbilityX(awaiting.player, awaiting.cost, awaiting.xColor),
                awaiting.maxX ?? Infinity,
              ),
            },
          }
        : {}),
      ...(awaiting.trigger !== undefined && awaiting.trigger.alikeCount > 0
        ? { sameForAll: awaiting.trigger.alikeCount }
        : {}),
    },
  ],

  whyCannot: (ctx, action, player): string | null => {
    if (action.type !== "choose-modes") return `${player} is not being asked to choose modes`;
    const awaiting = ctx.state.awaiting;
    if (awaiting === null || awaiting.kind !== "choose-modes" || awaiting.player !== player) {
      return `${player} is not being asked to choose modes`;
    }
    const chosen = action.modes;
    const duplicate = noDuplicates(chosen, `${player} chose the same mode twice`);
    if (duplicate !== null) return duplicate;
    const count =
      awaiting.orNone === true && chosen.length === 0
        ? null
        : withinRange(
            chosen,
            awaiting.minModes,
            awaiting.maxModes,
            (got, min, max) =>
              awaiting.orNone === true
                ? `${player} must choose none, or between ${min} and ${max} mode(s), chose ${got}`
                : `${player} must choose between ${min} and ${max} mode(s), chose ${got}`,
          );
    if (count !== null) return count;
    for (const i of chosen) {
      if (i < 0 || i >= awaiting.modes.length || !Number.isInteger(i)) {
        return `${i} is not a valid mode index`;
      }
    }
    // "X can't be greater than —".
    if (awaiting.maxX !== undefined && (action.xValue ?? 0) > awaiting.maxX) {
      return `X can't be greater than ${awaiting.maxX}`;
    }
    // "One or more {E}": saying yes pays at least one.
    if (awaiting.energyX === "one-or-more" && chosen.length > 0 && (action.xValue ?? 0) < 1) {
      return `${player} must pay at least one {E}`;
    }
    return null;
  },

  apply: (host, action): void => {
    if (action.type !== "choose-modes") return;
    host.applyModesChoice(action.player, action.modes, action.xValue, action.forAll === true);
  },

  ask: (controller, view, awaiting, player): Action => {
    const modes = controller.chooseModes(
      view,
      awaiting.minModes,
      awaiting.maxModes,
      awaiting.modes.map((m) => m.text),
    );
    // A controller that answers modes alone pays all the energy it may
    // (`may.costEnergyX`) when it says yes.
    return {
      type: "choose-modes",
      player,
      modes,
      ...(awaiting.energyX !== undefined && modes.length > 0 ? { xValue: awaiting.maxX ?? 0 } : {}),
    };
  },

  /**
   * Every legal combination of modes, smallest first, crossed with the two X
   * values worth trying.
   *
   * Only the extremes of X: paying the most affordable and paying nothing.
   * The interesting question is whether to sink mana into the mode at all,
   * and a rollout per intermediate value buys almost nothing for a
   * multiplicative cost in candidates.
   */
  candidates: (legal, player, limit): Action[] => {
    if (legal.kind !== "choose-modes") return [];
    const indices = legal.modeTexts.map((_, i) => i);
    const xValues =
      legal.xCost === undefined
        ? [undefined]
        : [...new Set([legal.xCost.maxX, legal.xCost.minX ?? 0])];
    const subsets = subsetsBetween(indices, legal.minModes, legal.maxModes, limit);
    // "You may choose two": choosing none is an answer too.
    if (legal.orNone === true && legal.minModes > 0) subsets.unshift([]);
    return subsets.flatMap((modes) =>
      xValues.map(
        (xValue): Action => ({
          type: "choose-modes",
          player,
          modes,
          ...(xValue !== undefined ? { xValue } : {}),
        }),
      ),
    );
  },

  randomAnswer: (legal, player, rng): Action => {
    // "You may choose two": none, now and then.
    if (legal.orNone === true && legal.minModes > 0 && rng.pickIndex(4) === 0) {
      return { type: "choose-modes", player, modes: [] };
    }
    const count =
      legal.minModes + Math.floor(rng.random() * (legal.maxModes - legal.minModes + 1));
    const pool = legal.modeTexts.map((_text, i) => i);
    const modes: number[] = [];
    for (let i = 0; i < count && pool.length > 0; i += 1) {
      modes.push(pool.splice(rng.pickIndex(pool.length), 1)[0]);
    }
    // An amount of energy: any amount it may pay.
    const energy = legal.xCost?.energy === true ? legal.xCost : undefined;
    if (energy !== undefined && modes.length > 0) {
      const min = energy.minX ?? 0;
      return { type: "choose-modes", player, modes, xValue: min + rng.pickIndex(energy.maxX - min + 1) };
    }
    return { type: "choose-modes", player, modes };
  },
});

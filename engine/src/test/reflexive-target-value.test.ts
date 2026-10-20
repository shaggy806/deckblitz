/**
 * A reflexive ability's target filter reads its own trigger value (rule 603.12): "discard a
 * card. When you do, destroy target creature with mana value equal to the discarded card's" —
 * `{ amount: { triggerValue: true } }` in the reflexive ability's targets is the `value` it
 * triggers with, not the creating ability's (0 here). `bindDynamicCompares` binds those targets
 * in the creating resolution, with the reflexive value.
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { ScriptedController } from "../controller.js";
import type { EffectSpec } from "../effects.js";
import { Game } from "../game.js";

import { A, B, activate, spawn, toHand, zone } from "./harness.js";

const discardThenDestroy: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "discard", target: "you", amount: 1 },
    {
      kind: "reflexive-trigger",
      value: { thisWay: "discarded", sumOf: "mana-value" },
      targets: [
        { kind: "permanent", filter: { type: "creature", manaValue: { op: "eq", n: { amount: { triggerValue: true } } } } },
      ],
      effect: { kind: "destroy", target: 0 },
      text: "When you do, destroy target creature with mana value equal to the discarded card's mana value.",
    },
  ],
};

const TEXT =
  "{0}: Discard a card. When you do, destroy target creature with mana value equal to the discarded card's mana value.";
const tester = defineCard({
  name: "Test Reflexive Value Altar",
  manaCost: "{1}",
  types: ["artifact"],
  text: TEXT,
  activated: [{ cost: { mana: "{0}", tap: false }, targets: [], effect: discardThenDestroy, resolve: null, text: TEXT }],
});

const setUp = () => {
  const a = new ScriptedController(A);
  const game = Game.create({
    seed: 1,
    shuffle: false,
    registry: createDefaultRegistry().register(tester),
    startingPlayer: A,
    rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
    controllers: { [A]: a, [B]: new ScriptedController(B) },
    decks: [
      { player: A, cards: Array<string>(40).fill("Wastes") },
      { player: B, cards: Array<string>(40).fill("Wastes") },
    ],
  });
  game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
  return { game, a };
};

describe("a reflexive ability's targets read its own trigger value (603.12)", () => {
  it("destroys only the creature whose mana value matches the discarded card", () => {
    const { game, a } = setUp();
    const altar = spawn(game, "Test Reflexive Value Altar");
    const giantCard = toHand(game, "Hill Giant");
    a.chooseDiscardsFn = () => [giantCard];
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    // The only legal target, so it's chosen without asking.
    activate(game, altar);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

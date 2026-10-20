/**
 * A triggered ability's intervening-if about the object whose event fired it (rule 603.4) — "if it
 * was a Bear", "if it has flying" — a top-level `trigger-object` condition. It's asked as the
 * ability triggers and again as it resolves, about the same object (`eventTriggerObject`), read
 * as it last existed if it has left (608.2h).
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";

import { A, B, attack, destroy, hand, spawn, toStep } from "./harness.js";

const watcher = defineCard({
  name: "Test Bear Mourner",
  manaCost: "{1}",
  types: ["enchantment"],
  text: "Whenever a creature you control dies, if it was a Bear, draw a card.",
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" } },
      condition: { kind: "trigger-object", filter: { subtype: "Bear" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever a creature you control dies, if it was a Bear, draw a card.",
    },
  ],
});
const flyerFan = defineCard({
  name: "Test Flyer Fan",
  manaCost: "{1}",
  types: ["enchantment"],
  text: "Whenever a creature you control attacks, if it has flying, draw a card.",
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control" },
      condition: { kind: "trigger-object", filter: { keyword: "flying" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever a creature you control attacks, if it has flying, draw a card.",
    },
  ],
});

const setUp = () => {
  const registry = createDefaultRegistry().register(watcher).register(flyerFan);
  const a = new ScriptedController(A);
  const b = new ScriptedController(B);
  const game = Game.create({
    seed: 1,
    shuffle: false,
    registry,
    startingPlayer: A,
    rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
    controllers: { [A]: a, [B]: b },
    decks: [
      { player: A, cards: Array<string>(40).fill("Wastes") },
      { player: B, cards: Array<string>(40).fill("Wastes") },
    ],
  });
  game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
  return { game, a };
};

describe("a trigger-level trigger-object condition (603.4)", () => {
  it("'if it was a Bear' reads the creature that died as it last existed", () => {
    const { game } = setUp();
    spawn(game, "Test Bear Mourner");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const before = hand(game).length;
    destroy(game, giant);
    toStep(game, "begin-combat");
    expect(hand(game).length).toBe(before);
    destroy(game, bears);
    toStep(game, "postcombat-main");
    expect(hand(game).length).toBe(before + 1);
  });

  it("'if it has flying' asks about the attacker", () => {
    const { game, a } = setUp();
    spawn(game, "Test Flyer Fan");
    const bears = spawn(game, "Grizzly Bears");
    const serra = spawn(game, "Serra Angel");
    const before = hand(game).length;
    attack(game, a, [bears, serra]);
    expect(hand(game).length).toBe(before + 1);
  });
});

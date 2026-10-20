/**
 * A flicker of several permanents exiles them as one event (rule 603.2c — Brago, Ghostly
 * Flicker, Eerie Interlude), so each one's leaves-the-battlefield trigger looks back at the board
 * as it stood before any of them moved (603.10a): a Bears flickered with Glorious Anthem left as a
 * 3/3, whichever of the two the engine moved first.
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";

import { A, B, life, ref, settle, spawn } from "./harness.js";

const watcher = defineCard({
  name: "Test Big Leaver Watcher",
  manaCost: "{1}",
  types: ["enchantment"],
  text: "Whenever a creature you control with power 3 or greater leaves the battlefield, you gain 1 life.",
  triggered: [
    {
      trigger: {
        on: "leaves-battlefield",
        who: "you-control",
        filter: { type: "creature", power: { op: "gte", n: 3 } },
      },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: "Whenever a creature you control with power 3 or greater leaves the battlefield, you gain 1 life.",
    },
  ],
});

const setUp = (): Game => {
  const registry = createDefaultRegistry().register(watcher);
  const game = Game.create({
    seed: 1,
    shuffle: false,
    registry,
    startingPlayer: A,
    rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
    controllers: { [A]: new ScriptedController(A), [B]: new ScriptedController(B) },
    decks: [
      { player: A, cards: Array<string>(40).fill("Wastes") },
      { player: B, cards: Array<string>(40).fill("Wastes") },
    ],
  });
  game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
  return game;
};

describe("a multi-target flicker's leaves are one event (603.2c)", () => {
  it("the Bears leave as a 3/3 though the Anthem is exiled first", () => {
    const game = setUp();
    spawn(game, "Test Big Leaver Watcher");
    const anthem = spawn(game, "Glorious Anthem");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "flicker", target: [0, 1] }, [ref(anthem), ref(bears)]);
    settle(game);
    expect(game.state.objects[bears]?.zone ?? "battlefield").toBe("battlefield");
    expect(life(game)).toBe(21);
  });
});

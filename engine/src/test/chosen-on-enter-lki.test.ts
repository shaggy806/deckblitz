/**
 * A source's chosen colour, read by an ability that resolves after the source has left, is the
 * one it chose as it entered — read as it last existed (rule 608.2h; `LastKnownInfo.chosenOnEnter`).
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";

import { A, B, destroy, spawn } from "./harness.js";

const TEXT = "When this enchantment leaves the battlefield, add two mana of the chosen color.";
const prism = defineCard({
  name: "Test Departing Prism",
  manaCost: "{1}",
  types: ["enchantment"],
  text: `As this enchantment enters, choose a color.\n${TEXT}`,
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "chosen", amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});

describe("a departed source's chosen colour (608.2h)", () => {
  it("is the one it chose as it entered", () => {
    const game = Game.create({
      seed: 1,
      shuffle: false,
      registry: createDefaultRegistry().register(prism),
      startingPlayer: A,
      rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
      controllers: { [A]: new ScriptedController(A), [B]: new ScriptedController(B) },
      decks: [
        { player: A, cards: Array<string>(40).fill("Wastes") },
        { player: B, cards: Array<string>(40).fill("Wastes") },
      ],
    });
    game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
    const id = spawn(game, "Test Departing Prism");
    game.state.objects[id].chosenOnEnter = "R";
    destroy(game, id);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0);
    const red = game.state.players[A].manaPool.filter((u) => u.type === "R").length;
    expect(red).toBe(2);
  });
});

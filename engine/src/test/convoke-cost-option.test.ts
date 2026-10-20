/**
 * A convoke spell with a choice of additional costs is offered on convoke alone: the
 * `legalActions` convoke re-check prices each option (its `costOption`), not the spell with no
 * option chosen, which would be refused outright.
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";

import { A, B, spawn, toHand } from "./harness.js";

const TEXT = "Convoke\nAs an additional cost to cast this spell, sacrifice a creature or pay {1}.\nYou gain 3 life.";
const card = defineCard({
  name: "Test Convoked Offering",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
  convoke: true,
  additionalCost: {
    options: [
      { text: "Sacrifice a creature", sacrifice: { type: "creature", controlledBy: "you" } },
      { text: "Pay {1}", mana: "{1}" },
    ],
  },
  effect: { kind: "gain-life", amount: 3 },
});

describe("convoke with a choice of additional costs", () => {
  it("each option is offered when only convoke can pay", () => {
    const game = Game.create({
      seed: 1,
      shuffle: false,
      registry: createDefaultRegistry().register(card),
      startingPlayer: A,
      rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
      controllers: { [A]: new ScriptedController(A), [B]: new ScriptedController(B) },
      decks: [
        { player: A, cards: Array<string>(40).fill("Wastes") },
        { player: B, cards: Array<string>(40).fill("Wastes") },
      ],
    });
    game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
    // Six green creatures, no lands: five convoke {3}{G} plus the {1}, or four do and one is sacrificed.
    for (let i = 0; i < 6; i += 1) spawn(game, "Llanowar Elves", A, { sick: true });
    const id = toHand(game, "Test Convoked Offering");
    const offers = game.legalActions(A).filter((l) => l.kind === "cast-spell" && l.card === id);
    const options = offers.map((l) => (l.kind === "cast-spell" ? l.costOption : undefined));
    expect(options).toContain(0);
    expect(options).toContain(1);
  });
});

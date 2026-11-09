import { describe, expect, it } from "vitest";
import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import type { Game } from "../game.js";
import { A, destroy, graveyard, life, settle, spawn, table, toGraveyard } from "./harness.js";

/**
 * Decaying Soil's shape: a threshold static granting the permanent a
 * leaves-the-battlefield trigger. The trigger looks back to just before the
 * event (rule 603.10a), so the creature whose death makes the seventh card
 * doesn't trigger it, and one that dies at seven does.
 */
const soil = defineCard({
  name: "Gap Test Threshold Soil",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: 'Threshold — As long as there are seven or more cards in your graveyard, this enchantment has "Whenever a nontoken creature is put into your graveyard from the battlefield, you gain 1 life."',
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantsTriggered: [
        {
          trigger: { on: "dies", who: "any", filter: { type: "creature", token: false, ownedBy: "you" } },
          targets: [],
          effect: { kind: "gain-life", amount: 1 },
          resolve: null,
          text: "Whenever a nontoken creature is put into your graveyard from the battlefield, you gain 1 life.",
        },
      ],
      text: "Threshold",
    },
  ],
});

const setUp = (cardsInGraveyard: number): Game => {
  const { game } = table({ registry: createDefaultRegistry().register(soil) });
  for (let i = 0; i < cardsInGraveyard; i++) toGraveyard(game, "Forest");
  spawn(game, soil.name);
  return game;
};

describe("a threshold-gated granted dies trigger", () => {
  it("isn't triggered by the creature whose death makes the seventh card", () => {
    const game = setUp(6);
    const before = life(game);
    destroy(game, spawn(game, "Grizzly Bears"));
    settle(game);
    expect(graveyard(game)).toHaveLength(7);
    expect(life(game)).toBe(before);
  });

  it("is triggered by a creature that dies with seven already there", () => {
    const game = setUp(7);
    const before = life(game);
    destroy(game, spawn(game, "Grizzly Bears"));
    settle(game);
    expect(life(game)).toBe(before + 1);
  });

  it("two creatures dying at once at six trigger nothing, both looking back", () => {
    const game = setUp(6);
    const before = life(game);
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "destroy-all", filter: { type: "creature" } }, [], {});
    settle(game);
    expect(graveyard(game)).toHaveLength(8);
    expect(life(game)).toBe(before);
  });

  it("the permanent still leaving at seven keeps the trigger it had", () => {
    const game = setUp(7);
    const before = life(game);
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "destroy-all", filter: { type: "creature" } }, [], {});
    settle(game);
    expect(game.state.objects[bears].zone).toBe("graveyard");
    expect(life(game)).toBe(before + 1);
  });
});

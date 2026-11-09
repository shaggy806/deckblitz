/**
 * A delayed "whenever a card is put into a graveyard" (rule 603.7) triggers once per card, as a
 * printed one does: several cards moved at once are several events' worth of "a card" (603.2c
 * batches only "one or more"). Duskmantle Guildmage's first ability is the printed case.
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";

import { A, activate, B, graveyard, life, settle, spawn, table } from "./harness.js";

const TEXT = "{0}: Whenever a card is put into an opponent's graveyard from anywhere this turn, that player loses 1 life.";
const guild = defineCard({
  name: "Test Graveyard Watcher",
  manaCost: "{1}",
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { tap: false },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { whenever: { on: "put-into-graveyard", who: "opponent" } },
        effect: { kind: "lose-life", amount: 1, who: "trigger-controller" },
        text: TEXT,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
const registry = createDefaultRegistry().register(guild);

describe("a delayed 'whenever a card is put into a graveyard'", () => {
  it("fires once for each card of a mill", () => {
    const { game } = table({ registry });
    activate(game, spawn(game, "Test Graveyard Watcher"));
    game.debugApplyEffect(A, { kind: "mill", target: "each-opponent", amount: 3 });
    settle(game);
    expect(graveyard(game, B)).toHaveLength(3);
    expect(life(game, B)).toBe(17);
  });

  it("doesn't fire for a card put into your own graveyard", () => {
    const { game } = table({ registry });
    activate(game, spawn(game, "Test Graveyard Watcher"));
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 2 });
    settle(game);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(20);
  });
});

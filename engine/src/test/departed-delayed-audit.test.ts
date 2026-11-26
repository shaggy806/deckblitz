import { describe, expect, it } from "vitest";

import { B, C, enter, nextTurn, pickTargets, spawn, table, zone } from "./harness.js";

/**
 * A rules audit (2026-11-26): a delayed triggered ability whose controller
 * has left the game isn't put onto the stack (rule 800.4d).
 */
describe("a departed player's delayed triggers, audited", () => {
  it("Flickerwisp's 'return it at the next end step' doesn't happen once its controller has left: the card stays exiled (rule 800.4d)", () => {
    const { game, c } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(c, bears);
    enter(game, "Flickerwisp", C);
    expect(zone(game, bears)).toBe("exile");
    game.concede(C);
    nextTurn(game);
    expect(zone(game, bears)).toBe("exile");
  });

  it("with its controller still in, the card returns (control for the test above)", () => {
    const { game, c } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(c, bears);
    enter(game, "Flickerwisp", C);
    nextTurn(game);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

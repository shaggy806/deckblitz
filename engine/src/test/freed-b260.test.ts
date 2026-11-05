/**
 * Batch 260's lead cards (need-keys Phase 2, cards freed by built families):
 * those the agents couldn't finish alone.
 */
import { describe, expect, it } from "vitest";

import { B, activate, enter, pickPermanents, pickTargets, spawn, table, toStep, zone } from "./harness.js";

describe("Mysterious Limousine", () => {
  it("exiles a creature until it leaves, and the next one exiled returns the first", () => {
    const { game, a } = table();
    const first = spawn(game, "Grizzly Bears", B);
    const second = spawn(game, "Hill Giant", B);
    pickTargets(a, first);
    const limo = enter(game, "Mysterious Limousine");
    expect(zone(game, first)).toBe("exile");

    // Crewed and attacking: the attack trigger exiles the second, and the
    // first — another card exiled with it — comes back.
    const crew = [spawn(game, "Hill Giant"), spawn(game, "Hill Giant")];
    pickPermanents(a, ...crew);
    activate(game, limo, 0);
    pickTargets(a, second);
    a.declareAttackersFn = () => [{ attacker: limo, defender: B }];
    toStep(game, "postcombat-main");
    expect(zone(game, second)).toBe("exile");
    expect(zone(game, first)).toBe("battlefield");
    expect(game.state.objects[first].controller).toBe(B);
  });

  it("returns nothing when no creature is exiled this way", () => {
    const { game, a } = table();
    const first = spawn(game, "Grizzly Bears", B);
    pickTargets(a, first);
    const limo = enter(game, "Mysterious Limousine");
    const crew = [spawn(game, "Hill Giant"), spawn(game, "Hill Giant")];
    pickPermanents(a, ...crew);
    activate(game, limo, 0);
    pickTargets(a, null);
    a.declareAttackersFn = () => [{ attacker: limo, defender: B }];
    toStep(game, "postcombat-main");
    expect(zone(game, first)).toBe("exile");
  });
});

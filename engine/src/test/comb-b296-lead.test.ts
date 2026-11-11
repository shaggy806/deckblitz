import { describe, expect, it } from "vitest";

import { A, B, counters, enter, lands, life, pickModes, ref, table, toGraveyard, zone } from "./harness.js";

// Batch B296's cards the authoring agent left untested, checked by the lead.

describe("Bloodthirsty Adversary", () => {
  it("paid twice: two counters, two cards exiled, and both copies may be cast free", () => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    const bolt = toGraveyard(game, "Lightning Bolt");
    const shock = toGraveyard(game, "Shock");
    a.chooseTargetsFn = (_view, sourceName) =>
      sourceName === "Bloodthirsty Adversary" ? [ref(bolt), ref(shock)] : [ref(B)];
    pickModes(a, 0);
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts[0];
      if (way === undefined) return null;
      return { type: "cast-spell", player: A, card: way.card, targets: [ref(B)], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    const adversary = enter(game, "Bloodthirsty Adversary", A, { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 2 });
    for (let i = 0; i < 12 && !(game.state.zones.shared.stack.length === 0 && game.state.awaiting === null && game.state.pendingTriggers.length === 0); i++) {
      const before = JSON.stringify(game.state.awaiting);
      game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
      if (JSON.stringify(game.state.awaiting) === before && game.state.awaiting !== null) break;
    }
    expect(game.state.awaiting).toBeNull();
    expect(counters(game, adversary)).toBe(2);
    expect(zone(game, bolt)).toBe("exile");
    expect(zone(game, shock)).toBe("exile");
    // Lightning Bolt's 3 and Shock's 2, both copies cast.
    expect(life(game, B)).toBe(15);
  });
});

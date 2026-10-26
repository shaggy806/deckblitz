/**
 * A divided amount chosen as a trigger went on the stack still deals its shares when it
 * comes after a decision in the resolution (Kuldotha Flamefiend's "you may sacrifice an
 * artifact. If you do, … 4 damage divided as you choose") — the parked steps carry the
 * division (found in batch 199: it was lost when the resolution resumed).
 */
import { describe, expect, it } from "vitest";
import { A, B, lands, life, pickModes, spawn, table, toHand, zone } from "./harness.js";

describe("Kuldotha Flamefiend", () => {
  const setUp = (sacrifice: boolean) => {
    const { game, a } = table();
    const relic = spawn(game, "Ornithopter");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 6);
    a.chooseSacrificesFn = (_view, eligible) => (sacrifice ? [eligible[0]!] : []);
    if (sacrifice) pickModes(a, 0);
    const fiend = toHand(game, "Kuldotha Flamefiend");
    game.dispatch({ type: "cast-spell", player: A, card: fiend });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-targets");
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind === "choose-targets" && awaiting.divide).toEqual({ total: 4, slot: 0 });
    game.dispatch({
      type: "choose-targets",
      player: A,
      targets: [{ kind: "object", object: bears }, { kind: "player", player: B }],
      division: [2, 2],
    });
    game.advanceUntil(
      (s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0,
    );
    return { game, relic, bears };
  };

  it("sacrificing an artifact deals the 4 damage as divided", () => {
    const { game, relic, bears } = setUp(true);
    expect(zone(game, relic)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });

  it("declining deals nothing", () => {
    const { game, relic, bears } = setUp(false);
    expect(zone(game, relic)).toBe("battlefield");
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, B)).toBe(20);
  });
});

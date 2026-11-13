/**
 * Trigger events added to the vocabulary for the triggers-journal lane
 * (2026-11-13): a mill once per card, each one its own trigger.
 */
import { describe, expect, it } from "vitest";
import { A, B, C, hand, life, pickModes, settle, spawn, table, toGraveyard, toLibrary, zone } from "./harness.js";

describe("mills, per card (Glowing One, Infesting Radroach)", () => {
  it("Glowing One gains 1 life for each nonland card milled, whoever milled", () => {
    const { game } = table({ players: 2, deck: "Wastes" });
    spawn(game, "Glowing One");
    toLibrary(game, "Grizzly Bears", B);
    toLibrary(game, "Wastes", B);
    toLibrary(game, "Llanowar Elves", B);
    toLibrary(game, "Shock", B);
    const before = life(game, A);
    game.debugApplyEffect(A, { kind: "mill", target: "each-opponent", amount: 4 });
    settle(game);
    expect(life(game, A)).toBe(before + 3);
  });

  it("a mill of lands alone doesn't trigger it", () => {
    const { game } = table({ players: 2, deck: "Wastes" });
    spawn(game, "Glowing One");
    const before = life(game, A);
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 3 });
    settle(game);
    expect(life(game, A)).toBe(before);
  });

  it("Infesting Radroach returns from your graveyard when an opponent mills a nonland card", () => {
    const { game, a } = table({ players: 2, deck: "Wastes" });
    const roach = toGraveyard(game, "Infesting Radroach", A);
    toLibrary(game, "Grizzly Bears", B);
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "mill", target: "each-opponent", amount: 1 });
    settle(game);
    expect(zone(game, roach)).toBe("hand");
    expect(hand(game, A)).toContain(roach);
  });

  it("doesn't trigger on its controller's own mill", () => {
    const { game } = table({ players: 2, deck: "Wastes" });
    const roach = toGraveyard(game, "Infesting Radroach", A);
    toLibrary(game, "Grizzly Bears", A);
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 1 });
    settle(game);
    expect(zone(game, roach)).toBe("graveyard");
  });

  it("sees an opponent's mill made at the same time as its own (the ruling)", () => {
    // Each player mills a card, in turn order: Alice's Bears, then Bob's,
    // then Carol's Radroach — announced once every one of them has milled.
    const { game, c } = table({ players: 3, deck: "Wastes" });
    toLibrary(game, "Grizzly Bears", A);
    toLibrary(game, "Grizzly Bears", B);
    const roach = toLibrary(game, "Infesting Radroach", C);
    pickModes(c, 0);
    game.debugApplyEffect(B, { kind: "mill", target: "each-player", amount: 1 });
    settle(game);
    expect(zone(game, roach)).toBe("hand");
  });
});

/**
 * "Reveal the first card you draw each turn" — every turn, not only yours
 * (`revealsFirstDrawEachTurn: "each-turn"`, rule 701.20a), its "whenever you
 * reveal a … card this way" a `draws` trigger with `nthEachTurn: 1` and a
 * drawn-card filter: Rowen (a basic land), Primitive Etchings (a creature).
 */
import { describe, expect, it } from "vitest";

import { A, B, nextTurn, settle, spawn, table, toLibrary, toStep, zone } from "./harness.js";

describe("Rowen", () => {
  it("on an opponent's turn, the first card you draw is revealed; a basic land draws another, not revealed", () => {
    const { game } = table();
    spawn(game, "Rowen", A);
    nextTurn(game);
    const second = toLibrary(game, "Memnite", A);
    const forest = toLibrary(game, "Forest", A);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(zone(game, forest)).toBe("hand");
    expect(game.state.revealedThisTurn).toContain(forest);
    expect(zone(game, second)).toBe("hand");
    expect(game.state.revealedThisTurn).not.toContain(second);
  });

  it("a nonbasic land first is revealed but draws nothing", () => {
    const { game } = table();
    spawn(game, "Rowen", A);
    nextTurn(game);
    const second = toLibrary(game, "Forest", A);
    const wilds = toLibrary(game, "Evolving Wilds", A);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(game.state.revealedThisTurn).toContain(wilds);
    expect(zone(game, second)).toBe("library");
  });

  it("only the first card of the turn: a basic land drawn second is neither revealed nor draws", () => {
    const { game } = table();
    spawn(game, "Rowen", A);
    nextTurn(game);
    const third = toLibrary(game, "Memnite", A);
    const forest = toLibrary(game, "Forest", A);
    const bolt = toLibrary(game, "Lightning Bolt", A);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(game.state.revealedThisTurn).toContain(bolt);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(zone(game, forest)).toBe("hand");
    expect(game.state.revealedThisTurn).not.toContain(forest);
    expect(zone(game, third)).toBe("library");
  });

  it("an opponent's first draw isn't revealed", () => {
    const { game } = table();
    spawn(game, "Rowen", A);
    nextTurn(game);
    const forest = toLibrary(game, "Forest", B);
    game.debugApplyEffect(B, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(zone(game, forest)).toBe("hand");
    expect(game.state.revealedThisTurn).not.toContain(forest);
  });
});

describe("Primitive Etchings", () => {
  it("your draw step's creature is revealed and draws another card", () => {
    const { game } = table({ step: "upkeep" });
    spawn(game, "Primitive Etchings", A);
    const second = toLibrary(game, "Lightning Bolt", A);
    const memnite = toLibrary(game, "Memnite", A);
    toStep(game, "draw");
    settle(game);
    expect(game.state.revealedThisTurn).toContain(memnite);
    expect(zone(game, second)).toBe("hand");
  });

  it("a noncreature first draw is revealed and draws nothing", () => {
    const { game } = table();
    spawn(game, "Primitive Etchings", A);
    nextTurn(game);
    const second = toLibrary(game, "Memnite", A);
    const bolt = toLibrary(game, "Lightning Bolt", A);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(game.state.revealedThisTurn).toContain(bolt);
    expect(zone(game, second)).toBe("library");
  });
});

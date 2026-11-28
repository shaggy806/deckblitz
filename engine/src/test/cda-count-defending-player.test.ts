/**
 * `setBasePtFromCount.forDefendingPlayer`: base power and toughness counted
 * from the defending player's side while the creature attacks (rule 506.2) —
 * Gaea's Liege, whose two conditional statics aren't CDAs (rule 604.3a(5))
 * and so work on the battlefield alone.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, activate, lands, pt, ref, spawn, subtypes, table, toGraveyard, toHand, toStep } from "./harness.js";

describe("Gaea's Liege", () => {
  it("counts its controller's Forests while it isn't attacking", () => {
    const { game } = table();
    const liege = spawn(game, "Gaea's Liege", A);
    lands(game, "Forest", 3, A);
    lands(game, "Forest", 5, B);
    expect(pt(game, liege)).toEqual({ power: 3, toughness: 3 });
  });

  it("counts the defending player's Forests while it attacks, and its controller's again after combat", () => {
    const t = table({ players: 3 });
    const { game } = t;
    lands(game, "Forest", 2, A);
    lands(game, "Forest", 4, B);
    lands(game, "Forest", 6, C);
    const liege = spawn(game, "Gaea's Liege", A);
    // The Forests are counted from the player it attacks, not every opponent.
    t.a.declareAttackersFn = () => [{ attacker: liege, defender: B }];
    toStep(game, "declare-blockers", A);
    expect(pt(game, liege)).toEqual({ power: 4, toughness: 4 });
    toStep(game, "postcombat-main", A);
    expect(pt(game, liege)).toEqual({ power: 2, toughness: 2 });
  });

  it("is 0/0 off the battlefield", () => {
    const { game } = table();
    lands(game, "Forest", 3, A);
    expect(pt(game, toHand(game, "Gaea's Liege", A))).toEqual({ power: 0, toughness: 0 });
    expect(pt(game, toGraveyard(game, "Gaea's Liege", A))).toEqual({ power: 0, toughness: 0 });
  });

  it("makes a land a Forest until it leaves the battlefield, and back to an Island after", () => {
    const { game } = table();
    lands(game, "Forest", 1, A);
    const island = lands(game, "Island", 1, B)[0];
    const liege = spawn(game, "Gaea's Liege", A);
    expect(pt(game, liege)).toEqual({ power: 1, toughness: 1 });
    activate(game, liege, 0, { targets: [ref(island)] });
    expect(subtypes(game, island)).toEqual(["Forest"]);
    game.debugMove(liege, "graveyard");
    expect(subtypes(game, island)).toEqual(["Island"]);
  });
});

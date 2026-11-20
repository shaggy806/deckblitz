/**
 * A turn-history condition about one named player's turn so far (`of`):
 * Tunnel Ignus's "whenever a land enters under an opponent's control, if
 * **that player** had another land enter the battlefield under their control
 * this turn, this creature deals 3 damage to that player" — an intervening
 * if (rule 603.4) over that player's own entries, never anyone else's.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, enter, life, settle, spawn, table, toGraveyard } from "./harness.js";

describe("Tunnel Ignus", () => {
  it("an opponent's first land this turn does nothing; their second deals 3 to them", () => {
    const { game } = table();
    spawn(game, "Tunnel Ignus");
    const start = life(game, B);
    enter(game, "Mountain", B);
    expect(life(game, B)).toBe(start);
    enter(game, "Forest", B);
    expect(life(game, B)).toBe(start - 3);
    enter(game, "Island", B);
    expect(life(game, B)).toBe(start - 6);
  });

  it("two lands entering at once each trigger it, each seeing the other (its ruling)", () => {
    const { game } = table();
    spawn(game, "Tunnel Ignus");
    toGraveyard(game, "Mountain", B);
    toGraveyard(game, "Forest", B);
    const start = life(game, B);
    game.debugApplyEffect(
      B,
      { kind: "return-from-graveyard", filter: { type: "land" }, destination: "battlefield", count: "all" },
      [],
    );
    settle(game);
    expect(life(game, B)).toBe(start - 6);
  });

  it("another player's land doesn't count for that player", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Tunnel Ignus");
    const [b, c] = [life(game, B), life(game, C)];
    enter(game, "Mountain", C);
    enter(game, "Forest", B);
    expect(life(game, B)).toBe(b);
    expect(life(game, C)).toBe(c);
  });

  it("your own lands never trigger it", () => {
    const { game } = table();
    spawn(game, "Tunnel Ignus");
    const [a, b] = [life(game, A), life(game, B)];
    enter(game, "Mountain", A);
    enter(game, "Forest", A);
    expect(life(game, A)).toBe(a);
    expect(life(game, B)).toBe(b);
  });
});

/**
 * The `player-dealt-combat-damage-by-source` target — Hope of Ghirapur:
 * "Sacrifice Hope of Ghirapur: Until your next turn, target player who was
 * dealt combat damage by Hope of Ghirapur this turn can't cast noncreature
 * spells."
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, attack, cast, lands, nextTurn, ref, spawn, table, toHand, zone } from "./harness.js";

describe("Hope of Ghirapur", () => {
  it("can't be activated before it has dealt combat damage to anyone", () => {
    const { game } = table();
    const hope = spawn(game, "Hope of Ghirapur");
    expect(() => activate(game, hope, 0, { targets: [ref(B)] })).toThrow();
  });

  it("after combat damage, the player hit can't cast noncreature spells until your next turn", () => {
    const seats = table();
    const { game } = seats;
    const hope = spawn(game, "Hope of Ghirapur");
    attack(game, seats.a, [hope]);
    activate(game, hope, 0, { targets: [ref(B)] });
    expect(zone(game, hope)).toBe("graveyard");
    nextTurn(game);
    lands(game, "Mountain", 3, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    expect(() => cast(game, bolt, { player: B, targets: [ref(A)] })).toThrow();
    const courser = toHand(game, "Raging Goblin", B);
    cast(game, courser, { player: B });
    expect(zone(game, courser)).toBe("battlefield");
    // Alice's next turn: the restriction is over.
    nextTurn(game);
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, bolt, { player: B, targets: [ref(A)] });
    expect(zone(game, bolt)).toBe("graveyard");
  });

  it("only the player it hit: you can't target yourself", () => {
    const seats = table();
    const { game } = seats;
    const hope = spawn(game, "Hope of Ghirapur");
    attack(game, seats.a, [hope]);
    expect(() => activate(game, hope, 0, { targets: [ref(A)] })).toThrow();
  });
});

/**
 * Valiant: "whenever this creature becomes the target of a spell or ability
 * you control for the first time each turn" — the first time this turn its
 * controller targets it, in this battlefield stint; an opponent's targeting
 * neither triggers it nor uses the turn's first time up.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, counters, destroy, lands, life, nextTurn, ref, spawn, table, toHand } from "./harness.js";

describe("valiant", () => {
  it("Heartfire Hero: a counter the first time you target it each turn, not the second", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const hero = spawn(game, "Heartfire Hero");
    cast(game, toHand(game, "Brute Force"), { targets: [ref(hero)] });
    expect(counters(game, hero)).toBe(1);
    cast(game, toHand(game, "Brute Force"), { targets: [ref(hero)] });
    expect(counters(game, hero)).toBe(1);
    // A new turn, a new first time.
    nextTurn(game);
    nextTurn(game);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Brute Force"), { targets: [ref(hero)] });
    expect(counters(game, hero)).toBe(2);
  });

  it("an opponent's spell targeting it doesn't trigger it, nor use up your first time", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Mountain", 1, B);
    const hero = spawn(game, "Heartfire Hero");
    game.state.objects[hero].counters["+1/+1"] = 4; // survives a Shock
    // Bob casts it with priority: Alice passes on an empty stack first.
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(hero)] });
    expect(counters(game, hero)).toBe(4);
    cast(game, toHand(game, "Brute Force"), { targets: [ref(hero)] });
    expect(counters(game, hero)).toBe(5);
  });

  it("dies dealing its last power to each opponent", () => {
    const { game } = table();
    const hero = spawn(game, "Heartfire Hero");
    game.state.objects[hero].counters["+1/+1"] = 2;
    destroy(game, hero);
    expect(life(game, B)).toBe(17);
  });
});

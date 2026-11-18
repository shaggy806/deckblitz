/**
 * "Untap this … during each other player's untap step" granted to another
 * permanent (`grantsStatic` carrying `untapsDuringOthersUntap: "self"`):
 * Urban Burgeoning's "Enchanted land has 'Untap this land during each other
 * player's untap step.'" The granted static works from the land, as Bender's
 * Waterskin's printed one does from itself (rule 113.10), and untaps it with
 * the active player's permanents (rule 502.3).
 */

import { describe, expect, it } from "vitest";

import { A, B, C, cast, destroy, nextTurn, ref, spawn, table, toHand } from "./harness.js";

describe("Urban Burgeoning", () => {
  it("untaps the enchanted land during each other player's untap step, and no other land", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Forest");
    const land = spawn(game, "Forest", A, { tapped: true });
    const other = spawn(game, "Forest", A, { tapped: true });
    const aura = toHand(game, "Urban Burgeoning");
    cast(game, aura, { targets: [ref(land)] });
    expect(game.state.objects[aura].attachedTo).toBe(land);

    nextTurn(game); // bob's
    expect(game.state.objects[land].tapped).toBe(false);
    expect(game.state.objects[other].tapped).toBe(true);

    game.state.objects[land].tapped = true;
    nextTurn(game); // carol's: another other player's untap step
    expect(game.state.objects[land].tapped).toBe(false);
  });

  it("stops once the Aura is gone", () => {
    const { game } = table();
    spawn(game, "Forest");
    const land = spawn(game, "Forest", A, { tapped: true });
    const aura = toHand(game, "Urban Burgeoning");
    cast(game, aura, { targets: [ref(land)] });
    destroy(game, aura, B);
    expect(game.state.objects[aura].zone).toBe("graveyard");

    nextTurn(game); // bob's
    expect(game.state.objects[land].tapped).toBe(true);
  });

  it("on an opponent's land, \"other\" is other than that land's controller", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Forest");
    const theirs = spawn(game, "Forest", C, { tapped: true });
    const aura = toHand(game, "Urban Burgeoning");
    cast(game, aura, { targets: [ref(theirs)] });

    nextTurn(game); // bob's: not carol's own, so it untaps
    expect(game.state.objects[theirs].tapped).toBe(false);
  });
});

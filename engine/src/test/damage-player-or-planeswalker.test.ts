/**
 * "At the beginning of enchanted player's upkeep, this Aura deals 1 damage to
 * that player or a planeswalker that player controls." (Curse of the Pierced
 * Heart): not targeted, so the Aura's controller chooses as it resolves — the
 * player, or a planeswalker of theirs and which one (a `modal` whose second
 * mode is open only while they control one, then a `vote` with `choose`).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { A, B, cast, counters, lands, life, pickModes, pickPermanents, ref, spawn, table, toHand, toStep } from "./harness.js";

function curse(game: Game): void {
  lands(game, "Mountain", 2);
  cast(game, toHand(game, "Curse of the Pierced Heart"), { targets: [ref(B)] });
}

describe("Curse of the Pierced Heart", () => {
  it("deals 1 damage to the enchanted player at the beginning of their upkeep, not yours", () => {
    const { game } = table();
    curse(game);
    toStep(game, "draw", B);
    expect(life(game, B)).toBe(19);
    toStep(game, "draw", A);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(19);
  });

  it("may deal it to a planeswalker of your choice that player controls instead", () => {
    const { game, a } = table();
    const jace = spawn(game, "Jace Beleren", B);
    const garruk = spawn(game, "Garruk Wildspeaker", B);
    game.state.objects[jace].counters.loyalty = 3;
    game.state.objects[garruk].counters.loyalty = 3;
    curse(game);
    pickModes(a, 1);
    const seen = pickPermanents(a, garruk);
    toStep(game, "draw", B);
    expect(seen.offered).toEqual(expect.arrayContaining([jace, garruk]));
    expect(life(game, B)).toBe(20);
    expect(counters(game, jace, "loyalty")).toBe(3);
    expect(counters(game, garruk, "loyalty")).toBe(2);
  });

  it("or to the player, with a planeswalker there", () => {
    const { game, a } = table();
    const jace = spawn(game, "Jace Beleren", B);
    game.state.objects[jace].counters.loyalty = 3;
    curse(game);
    pickModes(a, 0);
    toStep(game, "draw", B);
    expect(life(game, B)).toBe(19);
    expect(counters(game, jace, "loyalty")).toBe(3);
  });

  it("never a planeswalker you control", () => {
    const { game, a } = table();
    const mine = spawn(game, "Jace Beleren");
    game.state.objects[mine].counters.loyalty = 3;
    curse(game);
    // Only "that player" is open: asked, it's the one mode offered.
    let offered: readonly string[] | undefined;
    a.chooseModesFn = (_view, _min, _max, texts) => {
      offered = texts;
      return [0];
    };
    toStep(game, "draw", B);
    expect(life(game, B)).toBe(19);
    expect(counters(game, mine, "loyalty")).toBe(3);
    expect(offered === undefined || offered.length === 1).toBe(true);
  });
});

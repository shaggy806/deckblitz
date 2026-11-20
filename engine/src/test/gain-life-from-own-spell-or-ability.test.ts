/**
 * "If a spell or ability would cause its controller to gain life, that player loses that much
 * life instead" (Rain of Gore): a `would-gain-life` replacement with `byOwnSpellOrAbility`, read
 * only for a gain an effect brings to the player who controls it — not lifelink's (the card's
 * ruling), nor one a spell gives another player.
 */
import { describe, expect, it } from "vitest";

import { A, B, attack, cast, enter, lands, life, ref, spawn, table, toHand } from "./harness.js";

describe("Rain of Gore", () => {
  it("a spell's gain to its controller becomes a loss", () => {
    const { game } = table();
    spawn(game, "Rain of Gore", B);
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    const helix = toHand(game, "Lightning Helix");
    cast(game, helix, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(17);
  });

  it("an ability's gain to its controller becomes a loss", () => {
    const { game } = table();
    spawn(game, "Rain of Gore", A);
    spawn(game, "Soul Warden", B);
    enter(game, "Grizzly Bears", A);
    expect(life(game, B)).toBe(19);
  });

  it("a spell's gain to another player is gained", () => {
    const { game } = table();
    spawn(game, "Rain of Gore", A);
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    const swords = toHand(game, "Swords to Plowshares");
    cast(game, swords, { targets: [ref(bear)] });
    expect(life(game, B)).toBe(22);
  });

  it("lifelink's gain is gained (the ruling)", () => {
    const { game, a } = table();
    spawn(game, "Rain of Gore", B);
    const hawk = spawn(game, "Vampire Nighthawk", A);
    attack(game, a, [hawk]);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });
});

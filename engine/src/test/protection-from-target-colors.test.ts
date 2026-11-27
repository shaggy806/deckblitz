/**
 * "Protection from each of that permanent's / that spell's colors" (rule
 * 702.16a): `ProtectionQualities.colorsOf`, an object's colours read as the
 * `grant-protection` resolves and fixed then — Samite Elder's target, Opal
 * Titan's triggering spell. The creatures it covers are those there as it
 * resolves (rule 611.2c).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { cardSource, legalTargets } from "../targeting.js";
import { A, B, activate, cast, keywords, lands, pt, ref, spawn, subtypes, table, toHand, toStep, types } from "./harness.js";

/** Whether `player`'s copy of `spell` could target `at` now. */
function canAim(game: Game, spell: string, player: PlayerId, at: ObjectId): boolean {
  const card = toHand(game, spell, player);
  const def = game.registry.get(spell);
  return legalTargets(game.state, game.registry, def.targets[0], player, cardSource(def, card)).some(
    (t) => t.kind === "object" && t.object === at,
  );
}

describe("Samite Elder", () => {
  it("gives creatures you control protection from each of the target's colors", () => {
    const { game } = table();
    const elder = spawn(game, "Samite Elder");
    const bears = spawn(game, "Grizzly Bears");
    const fires = spawn(game, "Fires of Yavimaya");
    activate(game, elder, 0, { targets: [ref(fires)] });
    // Red and green: Bolt and Giant Growth can't aim at them, Doom Blade can.
    for (const creature of [elder, bears]) {
      expect(canAim(game, "Lightning Bolt", B, creature)).toBe(false);
      expect(canAim(game, "Giant Growth", B, creature)).toBe(false);
      expect(canAim(game, "Doom Blade", B, creature)).toBe(true);
    }
  });

  it("covers only the creatures there as it resolves, and ends with the turn", () => {
    const { game } = table();
    const elder = spawn(game, "Samite Elder");
    activate(game, elder, 0, { targets: [ref(elder)] });
    const late = spawn(game, "Grizzly Bears");
    expect(canAim(game, "Swords to Plowshares", B, elder)).toBe(false);
    expect(canAim(game, "Swords to Plowshares", B, late)).toBe(true);
    toStep(game, "upkeep", B);
    expect(canAim(game, "Swords to Plowshares", B, elder)).toBe(true);
  });

  it("a colorless target gives no protection", () => {
    const { game } = table();
    const elder = spawn(game, "Samite Elder");
    const thopter = spawn(game, "Ornithopter");
    activate(game, elder, 0, { targets: [ref(thopter)] });
    expect(canAim(game, "Lightning Bolt", B, elder)).toBe(true);
    expect(canAim(game, "Swords to Plowshares", B, thopter)).toBe(true);
  });

  it("can't target a permanent an opponent controls", () => {
    const { game } = table();
    const elder = spawn(game, "Samite Elder");
    const theirs = spawn(game, "Fires of Yavimaya", B);
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: elder, abilityIndex: 0, targets: [ref(theirs)] }),
    ).toMatch(/target/i);
  });
});

describe("Opal Titan", () => {
  it("becomes a 4/4 Giant with protection from each of the creature spell's colors", () => {
    const { game } = table();
    const titan = spawn(game, "Opal Titan");
    toStep(game, "precombat-main", B);
    lands(game, "Mountain", 2, B);
    cast(game, toHand(game, "Burning-Tree Emissary", B), { player: B });
    expect(types(game, titan)).toEqual(["creature"]);
    expect(subtypes(game, titan)).toEqual(["Giant"]);
    expect(pt(game, titan)).toEqual({ power: 4, toughness: 4 });
    expect(canAim(game, "Lightning Bolt", B, titan)).toBe(false);
    expect(canAim(game, "Giant Growth", B, titan)).toBe(false);
    expect(canAim(game, "Doom Blade", B, titan)).toBe(true);
    expect(keywords(game, titan).has("flying")).toBe(false);
  });

  it("a colorless creature spell gives it protection from nothing", () => {
    const { game } = table();
    const titan = spawn(game, "Opal Titan");
    toStep(game, "precombat-main", B);
    cast(game, toHand(game, "Ornithopter", B), { player: B });
    expect(pt(game, titan)).toEqual({ power: 4, toughness: 4 });
    expect(canAim(game, "Lightning Bolt", B, titan)).toBe(true);
  });
});

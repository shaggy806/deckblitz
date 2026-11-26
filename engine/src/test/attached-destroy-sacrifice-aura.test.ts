/**
 * "If enchanted land would be destroyed, instead sacrifice this Aura and
 * that land gains indestructible until end of turn" (Harmonious and
 * Crackling Emergence): a `would-be-destroyed` replacement over the Aura's
 * host (`hostOfSource`), applied to an effect's destruction and to lethal
 * damage alike (rule 614.6, the first ruling), never to a sacrifice (the
 * second).
 */
import { describe, expect, it } from "vitest";

import { invalidateComputedCache } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, destroy, keywords, pt, ref, settle, spawn, table, toStep, types, zone } from "./harness.js";

function emerged(game: Game, aura: string): { land: ObjectId; emergence: ObjectId } {
  const land = spawn(game, "Forest");
  const emergence = spawn(game, aura);
  game.state.objects[emergence].attachedTo = land;
  invalidateComputedCache();
  return { land, emergence };
}

describe("Harmonious Emergence", () => {
  it("makes the land a 4/5 Spirit creature with vigilance and haste, still a land", () => {
    const { game } = table();
    const { land } = emerged(game, "Harmonious Emergence");
    expect(pt(game, land)).toEqual({ power: 4, toughness: 5 });
    expect(types(game, land)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect([...keywords(game, land)]).toEqual(expect.arrayContaining(["vigilance", "haste"]));
  });

  it("destroyed by an effect: the Aura is sacrificed instead and the land gains indestructible", () => {
    const { game } = table();
    const { land, emergence } = emerged(game, "Harmonious Emergence");
    destroy(game, land);
    expect(zone(game, land)).toBe("battlefield");
    expect(zone(game, emergence)).toBe("graveyard");
    expect([...keywords(game, land)]).toContain("indestructible");
    // No longer a creature: the Aura's gone.
    expect(types(game, land)).not.toContain("creature");
    // Indestructible for the turn: a second destruction does nothing.
    destroy(game, land);
    expect(zone(game, land)).toBe("battlefield");
  });

  it("is sacrificed instead of the land dying to lethal damage", () => {
    const { game } = table();
    const { land, emergence } = emerged(game, "Harmonious Emergence");
    game.debugApplyEffect(B, { kind: "damage", amount: 5, target: 0 }, [ref(land)]);
    toStep(game, "begin-combat");
    settle(game);
    expect(zone(game, land)).toBe("battlefield");
    expect(zone(game, emergence)).toBe("graveyard");
    expect([...keywords(game, land)]).toContain("indestructible");
  });

  it("doesn't replace a sacrifice of the land", () => {
    const { game } = table();
    const { land, emergence } = emerged(game, "Harmonious Emergence");
    game.debugApplyEffect(A, { kind: "sacrifice-target", target: 0 }, [ref(land)]);
    toStep(game, "begin-combat");
    expect(zone(game, land)).toBe("graveyard");
    // The Aura, attached to nothing, goes as a state-based action (704.5m).
    expect(zone(game, emergence)).toBe("graveyard");
  });
});

describe("Crackling Emergence", () => {
  it("makes the land a 3/3 red Spirit with haste, and is sacrificed instead of it being destroyed", () => {
    const { game } = table();
    const { land, emergence } = emerged(game, "Crackling Emergence");
    expect(pt(game, land)).toEqual({ power: 3, toughness: 3 });
    expect([...keywords(game, land)]).toContain("haste");
    destroy(game, land);
    expect(zone(game, land)).toBe("battlefield");
    expect(zone(game, emergence)).toBe("graveyard");
    expect([...keywords(game, land)]).toContain("indestructible");
  });
});

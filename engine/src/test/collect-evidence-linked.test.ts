/**
 * `AbilityCost.collectEvidenceLinked`: the cards an activated ability's
 * "Collect evidence N" cost exiles are exiled with the permanent (rule
 * 607.2a), in its stint then, for another ability's "cards exiled with it"
 * (Kylox's Voltstrider).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, attack, lands, life, pickFromZone, ref, spawn, table, toExile, toGraveyard, types, zone } from "./harness.js";

const linkedTo = (game: Game, card: ObjectId, source: ObjectId): boolean => game.state.objects[card].exiledWith?.source === source;

const board = () => {
  const t = table();
  const { game, a } = t;
  const vehicle = spawn(game, "Kylox's Voltstrider");
  const bolt = toGraveyard(game, "Lightning Bolt");
  const divination = toGraveyard(game, "Divination");
  const counterspell = toGraveyard(game, "Counterspell");
  const bears = toGraveyard(game, "Grizzly Bears");
  pickFromZone(a, bolt, divination, counterspell);
  activate(game, vehicle, 0);
  return { ...t, vehicle, bolt, divination, counterspell, bears };
};

describe("Kylox's Voltstrider", () => {
  it("collect evidence 6: it becomes an artifact creature, the cards exiled with it", () => {
    const { game, vehicle, bolt, divination, counterspell, bears } = board();
    expect(types(game, vehicle)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    for (const card of [bolt, divination, counterspell]) {
      expect(zone(game, card)).toBe("exile");
      expect(linkedTo(game, card, vehicle)).toBe(true);
    }
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("can't be activated without 6 total mana value in the graveyard (rule 701.59b)", () => {
    const { game } = table();
    const vehicle = spawn(game, "Kylox's Voltstrider");
    toGraveyard(game, "Divination");
    toGraveyard(game, "Counterspell");
    expect(() => activate(game, vehicle, 0)).toThrow(/evidence/i);
  });

  it("attacking, casts an instant from among them, paying for it; it goes to the bottom of its owner's library", () => {
    const { game, a, vehicle, bolt } = board();
    const other = toExile(game, "Shock");
    lands(game, "Mountain", 1);
    let offered: readonly ObjectId[] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offered = offer.cards;
      return { type: "cast-spell", player: A, card: bolt, targets: [ref(B)], via: "effect" };
    };
    attack(game, a, [vehicle]);
    expect(offered).toContain(bolt);
    expect(offered).not.toContain(other);
    // 3 from the Bolt, 4 from the Vehicle.
    expect(life(game, B)).toBe(13);
    expect(zone(game, bolt)).toBe("library");
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).toBe(bolt);
  });
});

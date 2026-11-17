/**
 * A bonus read from the card exiled with a permanent (rule 607.2a) —
 * Phyrexian Ingester's "+X/+Y, where X is the exiled creature card's power
 * and Y is its toughness": two `grantPtPerCount` sums over `in:
 * "exiled-with-source"`, read live from the card as it is in exile (its old
 * counters gone, the rulings), a creature card only, and only the cards
 * exiled with this stint (rule 400.7).
 */
import { describe, expect, it } from "vitest";

import { invalidateComputedCache } from "../characteristics.js";
import { B, enter, pickModes, pickTargets, pt, spawn, table, toExile, zone } from "./harness.js";

describe("Phyrexian Ingester", () => {
  it("gets the exiled creature card's power and toughness, its counters left behind", () => {
    const seats = table();
    const { game } = seats;
    const wurm = spawn(game, "Craw Wurm", B);
    game.state.objects[wurm].counters = { "+1/+1": 2 };
    invalidateComputedCache();
    pickTargets(seats.a, wurm);
    pickModes(seats.a, 0);
    const ingester = enter(game, "Phyrexian Ingester");
    expect(zone(game, wurm)).toBe("exile");
    // A 3/3 plus Craw Wurm's 6/4.
    expect(pt(game, ingester)).toEqual({ power: 9, toughness: 7 });
  });

  it("a card exiled with it that isn't a creature card gives nothing", () => {
    const seats = table();
    const { game } = seats;
    const wurm = spawn(game, "Craw Wurm", B);
    pickTargets(seats.a, wurm);
    pickModes(seats.a, 0);
    const ingester = enter(game, "Phyrexian Ingester");
    const forest = toExile(game, "Forest", B);
    game.state.objects[forest].exiledWith = { ...game.state.objects[wurm].exiledWith! };
    delete game.state.objects[wurm].exiledWith;
    invalidateComputedCache();
    expect(pt(game, ingester)).toEqual({ power: 3, toughness: 3 });
  });

  it("back on the battlefield as a new object, the card exiled before isn't its", () => {
    const seats = table();
    const { game } = seats;
    const wurm = spawn(game, "Craw Wurm", B);
    pickTargets(seats.a, wurm);
    pickModes(seats.a, 0);
    const ingester = enter(game, "Phyrexian Ingester");
    expect(pt(game, ingester)).toEqual({ power: 9, toughness: 7 });
    game.debugMove(ingester, "exile");
    game.debugMove(ingester, "battlefield");
    expect(pt(game, ingester)).toEqual({ power: 3, toughness: 3 });
  });
});

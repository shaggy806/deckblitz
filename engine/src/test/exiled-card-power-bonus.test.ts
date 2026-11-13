/**
 * Drach'Nyen: "Equipped creature has menace and gets +X/+0, where X is the
 * exiled card's power" — a static's aggregate over the cards exiled with its
 * source (rule 607.2a).
 */
import { describe, expect, it } from "vitest";

import { activate, B, enter, keywords, lands, pickTargets, pt, ref, spawn, table, zone } from "./harness.js";

describe("Drach'Nyen", () => {
  it("the equipped creature gets the exiled card's power, and menace", () => {
    const seats = table();
    const { game } = seats;
    lands(game, "Mountain", 2);
    const wurm = spawn(game, "Craw Wurm", B);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(seats.a, wurm);
    const sword = enter(game, "Drach'Nyen");
    expect(zone(game, wurm)).toBe("exile");
    activate(game, sword, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 8, toughness: 2 });
    expect(keywords(game, bears).has("menace")).toBe(true);
  });

  it("with nothing exiled, +0/+0", () => {
    const seats = table();
    const { game } = seats;
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(seats.a, null);
    const sword = enter(game, "Drach'Nyen");
    activate(game, sword, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

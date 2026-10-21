/**
 * "This spell costs {X} less to cast, where X is your devotion to <color>"
 * (rule 700.5 — the `{ devotionTo }` cost reduction): Theros Beyond Death's
 * Drag to the Underworld and Daybreak Chimera (batch 118). Only the generic
 * part is reduced; the colored mana must still be paid (their rulings).
 */
import { describe, expect, it } from "vitest";

import { B, cast, lands, ref, spawn, table, toHand, zone } from "./harness.js";

describe("cost reduction by devotion", () => {
  it("Drag to the Underworld costs {B}{B} with devotion to black two", () => {
    const { game } = table();
    spawn(game, "Tymaret, Chosen from Death"); // {B}{B}
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Drag to the Underworld"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("without devotion it costs its full {2}{B}{B}", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3);
    expect(() => cast(game, toHand(game, "Drag to the Underworld"), { targets: [ref(bears)] })).toThrow();
  });

  it("counts only its own color, and never the colored pips: Daybreak Chimera", () => {
    const { game } = table();
    spawn(game, "Tymaret, Chosen from Death"); // black: no help
    lands(game, "Plains", 4);
    expect(() => cast(game, toHand(game, "Daybreak Chimera"))).toThrow();
    spawn(game, "Benalish Marshal"); // {W}{W}{W}: three off the {3}
    const chimera = toHand(game, "Daybreak Chimera");
    cast(game, chimera);
    expect(zone(game, chimera)).toBe("battlefield");
  });
});

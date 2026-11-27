/**
 * "For every three cards in your graveyard" (Recursive Recruitment): an
 * amount divided and rounded down — `{ half, round: "down", fraction: 3 }` —
 * here only if the spell was cast from a graveyard (flashback).
 */
import { describe, expect, it } from "vitest";

import { cast, counters, graveyard, lands, named, table, toGraveyard, toHand } from "./harness.js";

describe("Recursive Recruitment", () => {
  it("cast from hand: two plain Cadets", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    for (let i = 0; i < 7; i += 1) toGraveyard(game, "Grizzly Bears");
    const before = named(game, "Cadet").length;
    cast(game, toHand(game, "Recursive Recruitment"));
    const cadets = named(game, "Cadet").slice(before);
    expect(cadets.map((id) => counters(game, id))).toEqual([0, 0]);
  });

  it("flashback: a counter on each for every three cards in the graveyard, rounded down", () => {
    const { game } = table();
    lands(game, "Island", 4);
    lands(game, "Swamp", 4);
    for (let i = 0; i < 7; i += 1) toGraveyard(game, "Grizzly Bears");
    const spell = toGraveyard(game, "Recursive Recruitment");
    const size = graveyard(game).length - 1; // the spell is on the stack as it resolves
    const before = named(game, "Cadet").length;
    cast(game, spell, { via: "flashback" });
    const cadets = named(game, "Cadet").slice(before);
    expect(cadets).toHaveLength(2);
    expect(cadets.map((id) => counters(game, id))).toEqual([Math.floor(size / 3), Math.floor(size / 3)]);
    expect(Math.floor(size / 3)).toBeGreaterThanOrEqual(2);
  });
});

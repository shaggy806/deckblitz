/**
 * "You may exile it and collect evidence 4. If you do, return this card to the
 * battlefield tapped" (Lamplight Phoenix): the `collect-evidence` effect's
 * `exiling` — one action, offered only while the card is still in its owner's
 * graveyard and the rest of the graveyard holds the total (rule 701.59b); the
 * card itself is never evidence (the ruling), and once chosen the collecting
 * can't be declined.
 */
import { describe, expect, it } from "vitest";

import { A, destroy, pickFromZone, spawn, table, toGraveyard, zone } from "./harness.js";

describe("exile it and collect evidence (Lamplight Phoenix)", () => {
  it("exiles the Phoenix and the evidence, then returns it tapped", () => {
    const { game, a } = table();
    const phoenix = spawn(game, "Lamplight Phoenix");
    const giant = toGraveyard(game, "Hill Giant"); // mana value 4
    const seen = pickFromZone(a, giant);
    a.chooseModesFn = () => [0];
    destroy(game, phoenix);
    expect(zone(game, giant)).toBe("exile");
    expect(seen.offered).not.toContain(phoenix);
    expect(zone(game, phoenix)).toBe("battlefield");
    expect(game.state.objects[phoenix].tapped).toBe(true);
    expect(game.state.objects[phoenix].controller).toBe(A);
  });

  it("isn't offered when only the Phoenix itself would make the total", () => {
    const { game, a } = table();
    const phoenix = spawn(game, "Lamplight Phoenix");
    const bear = toGraveyard(game, "Grizzly Bears"); // 2, +3 for the Phoenix would be 5
    const seen = pickFromZone(a, bear);
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    destroy(game, phoenix);
    expect(asked).toBe(0);
    expect(seen.offered).toEqual([]);
    expect(zone(game, phoenix)).toBe("graveyard");
    expect(zone(game, bear)).toBe("graveyard");
  });

  it("declined: the Phoenix stays in the graveyard and nothing is exiled", () => {
    const { game, a } = table();
    const phoenix = spawn(game, "Lamplight Phoenix");
    const giant = toGraveyard(game, "Hill Giant");
    a.chooseModesFn = () => [];
    destroy(game, phoenix);
    expect(zone(game, phoenix)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });
});

/**
 * `hasActivatedAbility.tapCost` — an activated ability with {T} in its cost
 * (rule 107.5) — Magewright's Stone: "Untap target creature that has an
 * activated ability with {T} in its cost."
 */
import { describe, expect, it } from "vitest";

import { activate, lands, ref, spawn, table } from "./harness.js";

describe("Magewright's Stone", () => {
  it("untaps a creature with a {T} ability, its land type's intrinsic one included", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const stone = spawn(game, "Magewright's Stone");
    const elves = spawn(game, "Llanowar Elves", undefined, { tapped: true });
    const arbor = spawn(game, "Dryad Arbor", undefined, { tapped: true });
    activate(game, stone, 0, { targets: [ref(elves)] });
    expect(game.state.objects[elves].tapped).toBe(false);
    game.state.objects[stone].tapped = false;
    activate(game, stone, 0, { targets: [ref(arbor)] });
    expect(game.state.objects[arbor].tapped).toBe(false);
  });

  it("can't target a creature with no {T} ability, or one with only a non-{T} ability", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const stone = spawn(game, "Magewright's Stone");
    const bears = spawn(game, "Grizzly Bears", undefined, { tapped: true });
    const dragon = spawn(game, "Shivan Dragon", undefined, { tapped: true });
    expect(() => activate(game, stone, 0, { targets: [ref(bears)] })).toThrow();
    expect(() => activate(game, stone, 0, { targets: [ref(dragon)] })).toThrow();
  });
});

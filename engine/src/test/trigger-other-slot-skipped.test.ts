/**
 * A trigger asks only the slots its chooser fills, so "other than slot n" reads
 * those slots' own numbers: Phantom Blade with no creature of yours for its
 * first slot still asks for the second, which can't then conflict with itself.
 */

import { describe, expect, it } from "vitest";

import { A, B, cast, lands, ref, settle, spawn, table, toHand, zone } from "./harness.js";

describe("an other-slot relation to a slot not asked", () => {
  it("Phantom Blade with nothing in its first slot destroys the one it's asked for", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Phantom Blade"));
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind).toBe("choose-targets");
    game.dispatch({ type: "choose-targets", player: A, targets: [ref(bears)] });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

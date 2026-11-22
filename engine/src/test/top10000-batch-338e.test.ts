/**
 * B338 (author-top-cards overnight), decisions lane: Magus of the Balance —
 * Balance's three parts on an activated ability, with no engine code of its
 * own. Leshrac's Sigil is in `top10000-batch-338e-sigil.test.ts`, Celestial
 * Judgment in `choose-for-each-slot.test.ts`.
 */
import { describe, expect, it } from "vitest";

import { B, activate, hand, lands, spawn, table, toHand, zone } from "./harness.js";

describe("Magus of the Balance", () => {
  it("sacrifices itself, then each player keeps as many lands, cards and creatures as the fewest", () => {
    const { game, a } = table();
    const magus = spawn(game, "Magus of the Balance");
    const plains = lands(game, "Plains", 6);
    lands(game, "Swamp", 2, B);
    const myBears = spawn(game, "Grizzly Bears");
    const myOther = spawn(game, "Llanowar Elves");
    const theirBears = spawn(game, "Grizzly Bears", B);
    toHand(game, "Grizzly Bears");
    toHand(game, "Grizzly Bears");
    toHand(game, "Grizzly Bears");
    const fewest = Math.min(hand(game).length, hand(game, B).length);
    // The Magus is sacrificed as a cost, so A's two creatures are measured
    // against B's one.
    const keep = [...plains.slice(0, 2), myBears];
    a.choosePermanentsFn = (_view, eligible) => keep.filter((id) => eligible.includes(id));
    activate(game, magus, 0);
    expect(zone(game, magus)).toBe("graveyard");
    expect(plains.filter((id) => zone(game, id) === "battlefield")).toHaveLength(2);
    expect(hand(game)).toHaveLength(fewest);
    expect(hand(game, B)).toHaveLength(fewest);
    expect(zone(game, myBears)).toBe("battlefield");
    expect(zone(game, myOther)).toBe("graveyard");
    expect(zone(game, theirBears)).toBe("battlefield");
  });
});

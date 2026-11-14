/**
 * "They shuffle another creature they own into their library" — a player's
 * own choice of a permanent they **own** (not a target), shuffled into its
 * owner's library — inside a villainous choice (rule 701.55) faced by the
 * owner of a creature that has already left for their library (rule 108.3:
 * the owner never changes). This Is How It Ends, written from the Oracle
 * text.
 */
import { describe, expect, it } from "vitest";

import { invalidateComputedCache } from "../characteristics.js";
import { A, B, cast, lands, life, pickModes, pickPermanents, ref, spawn, table, toHand, zone } from "./harness.js";

describe("This Is How It Ends", () => {
  it("the owner shuffles the target in, then may lose 5 life", () => {
    const { game, b } = table();
    lands(game, "Swamp", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    pickModes(b, 0);
    cast(game, toHand(game, "This Is How It Ends"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("library");
    expect(life(game, B)).toBe(15);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("or shuffle another creature they own, theirs to choose", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const other = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Grizzly Bears", A);
    let aliceAsked = false;
    a.chooseModesFn = () => {
      aliceAsked = true;
      return [0];
    };
    pickModes(b, 1);
    const seen = pickPermanents(b, giant);
    cast(game, toHand(game, "This Is How It Ends"), { targets: [ref(bears)] });
    expect(aliceAsked).toBe(false);
    expect(zone(game, bears)).toBe("library");
    expect(zone(game, giant)).toBe("library");
    expect(zone(game, other)).toBe("battlefield");
    expect(seen.offered).not.toContain(mine);
    expect(life(game, B)).toBe(20);
  });

  it("a creature they own but don't control can be chosen; one they control but don't own can't", () => {
    const { game, b } = table();
    lands(game, "Swamp", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const lent = spawn(game, "Hill Giant", B);
    const borrowed = spawn(game, "Hill Giant", A);
    game.state.objects[lent].controller = A;
    game.state.objects[borrowed].controller = B;
    invalidateComputedCache();
    pickModes(b, 1);
    const seen = pickPermanents(b, lent);
    cast(game, toHand(game, "This Is How It Ends"), { targets: [ref(bears)] });
    expect(seen.offered).toContain(lent);
    expect(seen.offered).not.toContain(borrowed);
    expect(zone(game, lent)).toBe("library");
    expect(game.state.zones.perPlayer[B].library).toContain(lent);
  });

  it("the shuffle option may be chosen with no other creature, and does nothing (rule 701.55b)", () => {
    const { game, b } = table();
    lands(game, "Swamp", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(b, 1);
    cast(game, toHand(game, "This Is How It Ends"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("library");
    expect(life(game, B)).toBe(20);
  });

  it("the owner faces it even when they don't control the target", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 4);
    const stolen = spawn(game, "Grizzly Bears", B);
    game.state.objects[stolen].controller = A;
    invalidateComputedCache();
    let aliceAsked = false;
    a.chooseModesFn = () => {
      aliceAsked = true;
      return [0];
    };
    pickModes(b, 0);
    cast(game, toHand(game, "This Is How It Ends"), { targets: [ref(stolen)] });
    expect(aliceAsked).toBe(false);
    expect(game.state.zones.perPlayer[B].library).toContain(stolen);
    expect(life(game, B)).toBe(15);
    expect(life(game, A)).toBe(20);
  });
});

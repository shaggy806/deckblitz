/**
 * Transfigure (rule 702.71a): "[Cost], Sacrifice this permanent: Search your
 * library for a creature card with the same mana value as this permanent and
 * put it onto the battlefield. Then shuffle your library. Activate only as a
 * sorcery." — Fleshwrither, through the `transfigure` helper. The mana value
 * is the sacrificed permanent's as it last existed (rule 608.2h).
 */

import { describe, expect, it } from "vitest";

import { A, B, activate, cast, lands, pickFromZone, spawn, table, toHand, toLibrary, zone } from "./harness.js";

describe("Transfigure — Fleshwrither", () => {
  it("sacrifices it to put a creature card with the same mana value onto the battlefield", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const writher = spawn(game, "Fleshwrither");
    const giant = toLibrary(game, "Hill Giant");
    const bears = toLibrary(game, "Grizzly Bears");
    const archive = toLibrary(game, "Hedron Archive");
    const seen = pickFromZone(a, giant);
    activate(game, writher);
    // Only creature cards of mana value 4: not the Bears (2), not the
    // Archive (an artifact of 4).
    expect(seen.offered).toContain(giant);
    expect(seen.offered).not.toContain(bears);
    expect(seen.offered).not.toContain(archive);
    expect(zone(game, writher)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].controller).toBe(A);
  });

  it("activates only as a sorcery", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 1);
    const writher = spawn(game, "Fleshwrither");
    toLibrary(game, "Hill Giant");
    // A spell of alice's on the stack: no sorcery-speed activation (rule 602.5d).
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [{ kind: "player", player: B }], settle: false });
    pickFromZone(a);
    expect(() => activate(game, writher, 0, { settle: false })).toThrow(/while the stack is empty/);
    expect(zone(game, writher)).toBe("battlefield");
  });
});

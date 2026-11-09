/**
 * Scavenge (rule 702.97a) puts "a number of +1/+1 counters equal to the power
 * of the card you exiled": as it last existed in the graveyard, whatever
 * happens after the cost is paid (Dodgy Jalopy's and Young Deathclaws'
 * rulings).
 */

import { describe, expect, it } from "vitest";

import { A, activate, counters, destroy, lands, pt, ref, settle, spawn, table, toGraveyard, types, zone } from "./harness.js";

describe("scavenge reads the card as it last existed in the graveyard", () => {
  it("Dodgy Jalopy: destroying the biggest creature in response changes nothing", () => {
    const { game } = table();
    const dreadmaw = spawn(game, "Colossal Dreadmaw", A); // mana value 6
    const bears = spawn(game, "Grizzly Bears", A);
    const jalopy = toGraveyard(game, "Dodgy Jalopy", A);
    expect(pt(game, jalopy).power).toBe(6);
    lands(game, "Forest", 3);
    activate(game, jalopy, 1, { targets: [ref(bears)], settle: false });
    expect(zone(game, jalopy)).toBe("exile");
    destroy(game, dreadmaw);
    settle(game);
    expect(counters(game, bears)).toBe(6);
    expect(types(game, jalopy)).not.toContain("creature");
  });

  it("Young Deathclaws: each creature card in your graveyard scavenges for its mana cost", () => {
    const { game } = table();
    spawn(game, "Young Deathclaws", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = toGraveyard(game, "Hill Giant", A); // {3}{R}, 3/3
    lands(game, "Mountain", 4);
    activate(game, giant, 0, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(3);
    expect(zone(game, giant)).toBe("exile");
  });

  it("Young Deathclaws: an {X} in the mana cost is 0", () => {
    const { game } = table();
    spawn(game, "Young Deathclaws", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const ooze = toGraveyard(game, "Hangarback Walker", A); // {X}{X}
    activate(game, ooze, 1, { targets: [ref(bears)] }); // its own ability first
    expect(zone(game, ooze)).toBe("exile");
    expect(counters(game, bears)).toBe(0);
  });
});

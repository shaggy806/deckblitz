/**
 * "This creature has all activated abilities of all creature cards exiled
 * with it" (Dark Impostor): `grantsActivatedOf` over `zone: "exiled-with"`
 * with a `{ type: "creature" }` filter, read on the card in exile — so a
 * permanent that was a creature only for a while (an animated land) gives
 * nothing (the ruling), and the abilities go with the card or the Impostor.
 */

import { describe, expect, it } from "vitest";

import { B, activate, counters, lands, life, pt, ref, spawn, table, zone } from "./harness.js";

describe("Dark Impostor", () => {
  it("exiles a creature, grows, and has the exiled creature card's activated abilities", () => {
    const { game } = table();
    const impostor = spawn(game, "Dark Impostor");
    const shaman = spawn(game, "Anaba Shaman", B);
    lands(game, "Swamp", 6);
    lands(game, "Mountain", 1);
    activate(game, impostor, 0, { targets: [ref(shaman)] });
    expect(zone(game, shaman)).toBe("exile");
    expect(counters(game, impostor)).toBe(1);
    expect(pt(game, impostor)).toEqual({ power: 3, toughness: 3 });
    // Anaba Shaman's "{R}, {T}: This creature deals 1 damage to any target."
    activate(game, impostor, 1, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    expect(game.state.objects[impostor].tapped).toBe(true);
  });

  it("an animated land it exiles is a land card in exile, and gives nothing", () => {
    const { game } = table();
    const impostor = spawn(game, "Dark Impostor");
    const vault = spawn(game, "Mutavault");
    lands(game, "Swamp", 7);
    activate(game, vault, 1); // a 2/2 creature until end of turn
    activate(game, impostor, 0, { targets: [ref(vault)] });
    expect(zone(game, vault)).toBe("exile");
    expect(counters(game, impostor)).toBe(1);
    // Mutavault's abilities aren't the Impostor's: it has only its own.
    expect(() => activate(game, impostor, 1)).toThrow(/abilit/i);
  });
});

/**
 * "Search your library for an Aura card that could enchant it" (Auratouched
 * Mage): `CardFilter.couldEnchant`, bound to the object and stint it names
 * and read by the game (`Game.couldEnchantFor`, rule 303.4) — as the object
 * is while it's on the battlefield, as its last-known snapshot once it has
 * left (the ruling). On the battlefield the find enters attached to it;
 * gone, it's revealed and put into its owner's hand.
 */
import { describe, expect, it } from "vitest";

import { matchesFilter } from "../filter.js";
import { A, enter, hand, pickFromZone, settle, spawn, table, toLibrary, zone } from "./harness.js";

const MAGE = "Auratouched Mage";

describe("Auratouched Mage: an Aura card that could enchant it", () => {
  it("offers only Auras that could enchant it, and attaches the one found", () => {
    const { game, a } = table();
    const strength = toLibrary(game, "Holy Strength"); // enchant creature
    const growth = toLibrary(game, "Wild Growth"); // enchant land
    const animate = toLibrary(game, "Animate Dead"); // enchant creature card in a graveyard
    const pacifism = toLibrary(game, "Pacifism"); // enchant creature
    const seen = pickFromZone(a, strength);
    const mage = enter(game, MAGE);
    expect([...seen.offered].sort()).toEqual([strength, pacifism].sort());
    expect(seen.offered).not.toContain(growth);
    expect(seen.offered).not.toContain(animate);
    expect(zone(game, strength)).toBe("battlefield");
    expect(game.state.objects[strength].attachedTo).toBe(mage);
  });

  it("gone before it resolves: an Aura that could enchant it as it last existed goes to the hand", () => {
    const { game, a } = table();
    const strength = toLibrary(game, "Holy Strength");
    const growth = toLibrary(game, "Wild Growth");
    const seen = pickFromZone(a, strength);
    const mage = enter(game, MAGE, A, { settle: false });
    game.debugMove(mage, "graveyard");
    settle(game);
    expect(seen.offered).toEqual([strength]);
    expect(seen.offered).not.toContain(growth);
    expect(zone(game, strength)).toBe("hand");
    expect(hand(game)).toContain(strength);
  });

  it("flickered before it resolves, it's a new object (rule 400.7): not still there, so the Aura goes to the hand", () => {
    const { game, a } = table();
    const strength = toLibrary(game, "Holy Strength");
    pickFromZone(a, strength);
    const mage = enter(game, MAGE, A, { settle: false });
    game.debugMove(mage, "exile");
    game.debugMove(mage, "battlefield");
    // Its new enters ability finds nothing more to search for.
    settle(game);
    expect(zone(game, strength)).toBe("hand");
    expect(game.state.objects[strength].attachedTo ?? null).toBeNull();
  });

  it("an unbound clause, or one with no game to ask, matches nothing", () => {
    const { game } = table();
    const strength = toLibrary(game, "Holy Strength");
    const bears = spawn(game, "Grizzly Bears");
    expect(matchesFilter(game.state, game.registry, strength, { couldEnchant: "source" }, { you: A })).toBe(false);
    const stint = game.state.objects[bears].zoneChangeCount ?? 0;
    expect(
      matchesFilter(game.state, game.registry, strength, { couldEnchantHost: { object: bears, stint } }, { you: A }),
    ).toBe(true);
    expect(
      matchesFilter(game.state, game.registry, bears, { couldEnchantHost: { object: bears, stint } }, { you: A }),
    ).toBe(false);
  });
});

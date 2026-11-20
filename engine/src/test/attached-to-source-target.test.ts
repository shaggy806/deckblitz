/**
 * A target "attached to it", where "it" is the ability's own source: the
 * `attachedTo: { isSource: true }` clause in a target slot's filter, read
 * against the source as the target is chosen. Shackles of Treachery grants a
 * stolen creature "Whenever this creature deals damage, destroy target
 * Equipment attached to it" — the Equipment on that creature, and no other.
 * With none attached, the trigger is removed for want of a target (rule 603.3d).
 * In an effect's filter the same clause is "destroy all Auras attached to
 * Hakim" (Hakim, Loreweaver).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { A, activate, attack, B, cast, keywords, lands, life, ref, spawn, table, toGraveyard, toHand, watchTargets, zone } from "./harness.js";

const equip = (game: Game, what: string, host: ObjectId, player: PlayerId = B): ObjectId => {
  const attached = spawn(game, what, player);
  game.state.objects[attached].attachedTo = host;
  return attached;
};

const shackles = (game: Game, creature: ObjectId): void => {
  lands(game, "Mountain", 3);
  cast(game, toHand(game, "Shackles of Treachery"), { targets: [ref(creature)] });
};

describe("Shackles of Treachery: destroy target Equipment attached to it", () => {
  it("steals and untaps the creature, gives it haste, and its damage destroys its Equipment", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].tapped = true;
    const blade = equip(game, "Bonesplitter", bears);
    shackles(game, bears);
    expect(game.state.objects[bears].controller).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(keywords(game, bears)).toContain("haste");
    attack(game, a, [bears]);
    // 2 + Bonesplitter's 2 dealt, then the Equipment destroyed.
    expect(life(game, B)).toBe(16);
    expect(zone(game, blade)).toBe("graveyard");
  });

  it("offers only the Equipment on that creature, not another creature's", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const mine = equip(game, "Bonesplitter", bears);
    const giant = spawn(game, "Hill Giant", B);
    const other = equip(game, "Bonesplitter", giant);
    const loose = spawn(game, "Bonesplitter", B);
    shackles(game, bears);
    const seen = watchTargets(a, (offered) => [offered[0]?.find((id) => id === mine) ?? null]);
    attack(game, a, [bears]);
    // A single legal target is picked without asking; either way, only `mine`.
    if (seen.asked) expect(seen.offered[0]).toEqual([mine]);
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, other)).toBe("battlefield");
    expect(zone(game, loose)).toBe("battlefield");
  });

  it("with no Equipment attached, the trigger is removed and nothing else is destroyed", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const other = equip(game, "Bonesplitter", giant);
    shackles(game, bears);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    expect(zone(game, other)).toBe("battlefield");
    expect(game.state.zones.shared.stack).toEqual([]);
  });
});

describe("Hakim, Loreweaver: Auras attached to Hakim", () => {
  it("destroys all Auras attached to Hakim and no other", () => {
    const { game } = table();
    const hakim = spawn(game, "Hakim, Loreweaver");
    const bears = spawn(game, "Grizzly Bears");
    const mine = equip(game, "Holy Strength", hakim, A);
    const theirs = equip(game, "Pacifism", hakim, B);
    const elsewhere = equip(game, "Holy Strength", bears, A);
    lands(game, "Island", 2);
    activate(game, hakim, 1);
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, elsewhere)).toBe("battlefield");
  });

  it("returns an Aura card attached to Hakim, only in your upkeep and only while Hakim isn't enchanted", () => {
    const { game } = table({ step: "upkeep" });
    const hakim = spawn(game, "Hakim, Loreweaver");
    const aura = toGraveyard(game, "Holy Strength");
    lands(game, "Island", 4);
    activate(game, hakim, 0, { targets: [ref(aura)] });
    expect(zone(game, aura)).toBe("battlefield");
    expect(game.state.objects[aura].attachedTo).toBe(hakim);
    // Enchanted now: no second activation.
    const other = toGraveyard(game, "Holy Strength");
    expect(() => activate(game, hakim, 0, { targets: [ref(other)] })).toThrow();
  });

  it("not outside your upkeep", () => {
    const { game } = table();
    const hakim = spawn(game, "Hakim, Loreweaver");
    const aura = toGraveyard(game, "Holy Strength");
    lands(game, "Island", 2);
    expect(() => activate(game, hakim, 0, { targets: [ref(aura)] })).toThrow();
  });

  it("an Aura that can't enchant Hakim stays in the graveyard (rule 303.4g)", () => {
    const { game } = table({ step: "upkeep" });
    const hakim = spawn(game, "Hakim, Loreweaver");
    const aura = toGraveyard(game, "Wild Growth");
    lands(game, "Island", 2);
    activate(game, hakim, 0, { targets: [ref(aura)] });
    expect(zone(game, aura)).toBe("graveyard");
  });
});

/**
 * Target relations among the chosen targets: `other`'s `shares` ("two target permanents that
 * share a card type", "…that shares one of those types with it", "…share no creature types") and
 * a group's `equalToughness` and `differentNames` — offered narrowed, refused when broken
 * (rule 601.2c), and judged again as the spell or ability resolves (608.2b): Legerdemain, Rivals'
 * Duel, Secret Tunnel, V.A.T.S., Behold the Sinister Six!.
 */
import { describe, expect, it } from "vitest";

import { EVERY_CREATURE_TYPE } from "../subtypes.js";
import { invalidTargetReason, stateTargetFacts, typesShare } from "../targeting.js";
import { slotOptions, targetsFillable } from "../target.js";
import type { TargetRef, TargetSpec } from "../target.js";

import {
  A,
  B,
  activate,
  cast,
  controller,
  destroy,
  keywords,
  lands,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

const why = (game: ReturnType<typeof table>["game"], specs: readonly TargetSpec[], chosen: TargetRef[], name = "it") =>
  invalidTargetReason(game.state, game.registry, specs, chosen, A, name);

describe("targets that share a type", () => {
  const SHARE_CARD: TargetSpec[] = [
    "permanent",
    { kind: "other", of: "permanent", than: { slot: 0 }, shares: { kind: "card" } },
  ];

  it("offers the second slot only what shares a card type with the first, and refuses one that doesn't", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", B);
    const ring = spawn(game, "Sol Ring", B);
    const thopter = spawn(game, "Ornithopter", B);
    const facts = stateTargetFacts(game.state, game.registry);
    const all = [bears, giant, ring, thopter].map(ref);
    expect(slotOptions(SHARE_CARD, [all, all], 1, [ref(bears)], facts)).toEqual([ref(giant), ref(thopter)]);
    expect(slotOptions(SHARE_CARD, [all, all], 1, [ref(ring)], facts)).toEqual([ref(thopter)]);
    expect(why(game, SHARE_CARD, [ref(bears), ref(giant)])).toBeNull();
    expect(why(game, SHARE_CARD, [ref(bears), ref(ring)])).toMatch(/another/);
    // A lone Sol Ring with no other artifact: no pair fills both slots.
    expect(targetsFillable(SHARE_CARD, [[ref(ring), ref(bears)], [ref(ring), ref(bears)]], [], 0, facts)).toBe(false);
  });

  it("`among` counts only the types it names (Legerdemain: artifact or creature)", () => {
    const { game } = table();
    const forest = spawn(game, "Forest", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", B);
    const island = spawn(game, "Island", B);
    const LEGERDEMAIN: TargetSpec[] = [
      { kind: "permanent", filter: { typesAnyOf: ["artifact", "creature"] } },
      { kind: "other", of: "permanent", than: { slot: 0 }, shares: { kind: "card", among: ["artifact", "creature"] } },
    ];
    expect(why(game, LEGERDEMAIN, [ref(bears), ref(giant)])).toBeNull();
    expect(why(game, LEGERDEMAIN, [ref(bears), ref(island)])).toMatch(/another/);
    // Two lands share a card type, but not one of those.
    const LANDS: TargetSpec[] = [
      "permanent",
      { kind: "other", of: "permanent", than: { slot: 0 }, shares: { kind: "card", among: ["artifact", "creature"] } },
    ];
    expect(why(game, LANDS, [ref(forest), ref(island)])).toMatch(/another/);
  });

  it("a creature type, a changeling sharing one with anything that has one, and `none`", () => {
    const { game } = table();
    const elves = spawn(game, "Llanowar Elves", A);
    const mystic = spawn(game, "Elvish Mystic", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const outcast = spawn(game, "Changeling Outcast", B);
    const thopter = spawn(game, "Ornithopter", B);
    const SHARE: TargetSpec[] = ["creature", { kind: "other", of: "creature", than: { slot: 0 }, shares: { kind: "creature" } }];
    const NONE: TargetSpec[] = [
      "creature",
      { kind: "other", of: "creature", than: { slot: 0 }, shares: { kind: "creature", none: true } },
    ];
    expect(why(game, SHARE, [ref(elves), ref(mystic)])).toBeNull();
    expect(why(game, SHARE, [ref(elves), ref(bears)])).toMatch(/another/);
    expect(why(game, SHARE, [ref(bears), ref(outcast)])).toBeNull();
    expect(why(game, SHARE, [ref(thopter), ref(outcast)])).toBeNull();
    expect(why(game, NONE, [ref(elves), ref(bears)])).toBeNull();
    expect(why(game, NONE, [ref(elves), ref(mystic)])).toMatch(/another/);
    expect(why(game, NONE, [ref(outcast), ref(thopter)])).toMatch(/another/);
    expect(why(game, NONE, [ref(outcast), ref(bears)])).toMatch(/another/);
  });

  it("one with no creature type shares none, even with a changeling", () => {
    const typeless = { types: ["creature" as const], subtypes: [] };
    const changeling = { types: ["creature" as const], subtypes: ["Shapeshifter", EVERY_CREATURE_TYPE] };
    expect(typesShare(typeless, changeling, { kind: "creature" })).toBe(false);
    expect(typesShare(changeling, typeless, { kind: "creature" })).toBe(false);
    expect(typesShare(changeling, { types: ["creature"], subtypes: ["Elf"] }, { kind: "creature" })).toBe(true);
  });
});

describe("Legerdemain", () => {
  it("exchanges an artifact or creature with another permanent sharing one of those types", () => {
    const { game } = table();
    lands(game, "Island", 4, A);
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", B);
    const card = toHand(game, "Legerdemain", A);
    cast(game, card, { targets: [ref(bears), ref(giant)] });
    expect(controller(game, bears)).toBe(B);
    expect(controller(game, giant)).toBe(A);
  });

  it("can't take a land for a creature, and with no pair sharing one can't be cast", () => {
    const { game } = table();
    lands(game, "Island", 4, A);
    const bears = spawn(game, "Grizzly Bears", A);
    const island = spawn(game, "Island", B);
    const card = toHand(game, "Legerdemain", A);
    expect(() => cast(game, card, { targets: [ref(bears), ref(island)] })).toThrow(/has no legal/);
    spawn(game, "Hill Giant", B);
    expect(() => cast(game, card, { targets: [ref(bears), ref(island)] })).toThrow(/another/);
  });
});

describe("Rivals' Duel", () => {
  it("two creatures sharing no creature type fight", () => {
    const { game } = table();
    lands(game, "Mountain", 4, A);
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", B);
    const card = toHand(game, "Rivals' Duel", A);
    cast(game, card, { targets: [ref(bears), ref(giant)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[giant].damageMarked).toBe(2);
  });

  it("made to share a creature type before it resolves, neither fights (the ruling)", () => {
    const { game } = table();
    lands(game, "Mountain", 4, A);
    lands(game, "Wastes", 2, A);
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", B);
    // Mirror Entity: creatures Alice controls gain all creature types.
    const entity = spawn(game, "Mirror Entity", A);
    const card = toHand(game, "Rivals' Duel", A);
    cast(game, card, { targets: [ref(bears), ref(giant)], settle: false });
    activate(game, entity, 0, { x: 2, settle: false });
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(0);
    expect(zone(game, card)).toBe("graveyard");
  });
});

describe("Secret Tunnel", () => {
  it("two creatures you control sharing a creature type can't be blocked", () => {
    const { game } = table();
    lands(game, "Wastes", 4, A);
    const tunnel = spawn(game, "Secret Tunnel", A);
    const elves = spawn(game, "Llanowar Elves", A);
    const mystic = spawn(game, "Elvish Mystic", A);
    const bears = spawn(game, "Grizzly Bears", A);
    expect(() => activate(game, tunnel, 1, { targets: [ref(elves), ref(bears)] })).toThrow(/another/);
    activate(game, tunnel, 1, { targets: [ref(elves), ref(mystic)] });
    expect(keywords(game, elves).has("unblockable")).toBe(true);
    expect(keywords(game, mystic).has("unblockable")).toBe(true);
  });

  it("one gone, the other is read against the type it had as it left (the ruling)", () => {
    const { game } = table();
    lands(game, "Wastes", 4, A);
    const tunnel = spawn(game, "Secret Tunnel", A);
    const elves = spawn(game, "Llanowar Elves", A);
    const mystic = spawn(game, "Elvish Mystic", A);
    activate(game, tunnel, 1, { targets: [ref(elves), ref(mystic)], settle: false });
    destroy(game, elves);
    settle(game);
    expect(zone(game, elves)).toBe("graveyard");
    expect(keywords(game, mystic).has("unblockable")).toBe(true);
  });
});

describe("with equal toughness (V.A.T.S.)", () => {
  it("offers only creatures of the first one's toughness, and refuses a mix", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", B);
    const bears2 = spawn(game, "Grizzly Bears", B);
    const specs: TargetSpec[] = [{ kind: "any-number", of: "creature", equalToughness: true }];
    const facts = stateTargetFacts(game.state, game.registry);
    const all = [bears, giant, bears2].map(ref);
    expect(slotOptions(specs, [all], 1, [ref(bears)], facts)).toEqual([ref(bears2)]);
    expect(why(game, specs, [ref(bears), ref(bears2)])).toBeNull();
    expect(why(game, specs, [ref(bears), ref(giant)])).toMatch(/equal toughness/);
  });

  it("destroys them all", () => {
    const { game } = table();
    lands(game, "Swamp", 4, A);
    const bears = spawn(game, "Grizzly Bears", A);
    const bears2 = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const card = toHand(game, "V.A.T.S.", A);
    cast(game, card, { targets: [ref(bears), ref(bears2)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, bears2)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("no longer all equal as it resolves, none is destroyed (the ruling)", () => {
    const { game } = table();
    lands(game, "Swamp", 4, A);
    // Prowess: casting V.A.T.S. makes the Swiftspear 2/3 before it resolves.
    const spear = spawn(game, "Monastery Swiftspear", A);
    const bears = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "V.A.T.S.", A);
    cast(game, card, { targets: [ref(spear), ref(bears)] });
    expect(zone(game, spear)).toBe("battlefield");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, card)).toBe("graveyard");
  });

  it("a lone target is destroyed whatever its toughness has become (the ruling)", () => {
    const { game } = table();
    lands(game, "Swamp", 4, A);
    const spear = spawn(game, "Monastery Swiftspear", A);
    const card = toHand(game, "V.A.T.S.", A);
    cast(game, card, { targets: [ref(spear)] });
    expect(zone(game, spear)).toBe("graveyard");
  });
});

describe("with different names (Behold the Sinister Six!)", () => {
  it("refuses two cards of one name and returns the rest together", () => {
    const { game } = table();
    lands(game, "Swamp", 7, A);
    const bears = toGraveyard(game, "Grizzly Bears", A);
    const bears2 = toGraveyard(game, "Grizzly Bears", A);
    const giant = toGraveyard(game, "Hill Giant", A);
    const card = toHand(game, "Behold the Sinister Six!", A);
    const facts = stateTargetFacts(game.state, game.registry);
    const specs: TargetSpec[] = [
      { kind: "any-number", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }, max: 6, differentNames: true },
    ];
    expect(slotOptions(specs, [[bears, bears2, giant].map(ref)], 1, [ref(bears)], facts)).toEqual([ref(giant)]);
    expect(() => cast(game, card, { targets: [ref(bears), ref(bears2)] })).toThrow(/different names/);
    cast(game, card, { targets: [ref(bears), ref(giant)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, bears2)).toBe("graveyard");
  });
});

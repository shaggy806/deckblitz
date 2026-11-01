/**
 * "Shares a … type with it" against a reference object — `CardFilter`'s
 * `sharesCardTypeWith`, `sharesPermanentTypeWith`, `sharesCreatureTypeWith`
 * and `sharesLandTypeWith`, each taking a `ShareReference`: the enchanted
 * creature (`"attached"`), the sacrificed permanent, a target slot, or the
 * permanents you control matching a filter. Bound by `bindDynamicCompares`
 * to `sharesTypeWith` as the effect applies: the reference objects
 * themselves always match, anything else needs one of their types of that
 * kind (rule 205.2a card types, 205.3i land types, 205.3m creature types;
 * changeling, 702.73a, through `hasSubtype`).
 */
import { describe, expect, it } from "vitest";

import { bindDynamicCompares } from "../effects.js";
import type { EffectSpec, ResolutionContext } from "../effects.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  keywords,
  lands,
  pickFromZone,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("sharesCreatureTypeWith: \"attached\" — the Crowns", () => {
  it("Crown of Vigor: the enchanted creature and every creature sharing a creature type with it, either side, get +1/+1", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const elves = spawn(game, "Llanowar Elves");
    const mystic = spawn(game, "Elvish Mystic");
    const theirMystic = spawn(game, "Elvish Mystic", B);
    const outcast = spawn(game, "Changeling Outcast", B);
    const bears = spawn(game, "Grizzly Bears");
    const crown = toHand(game, "Crown of Vigor");
    cast(game, crown, { targets: [ref(elves)] });
    expect(pt(game, elves)).toEqual({ power: 2, toughness: 2 });

    activate(game, crown);
    expect(zone(game, crown)).toBe("graveyard");
    // The Aura's own +1/+1 is gone with it; the sacrifice's is until end of turn.
    expect(pt(game, elves)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, mystic)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirMystic)).toEqual({ power: 2, toughness: 2 });
    // A changeling shares every creature type (rule 702.73a).
    expect(pt(game, outcast)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("Crown of Ascension: flying for the host and its kin; a Bear doesn't get it", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const elves = spawn(game, "Llanowar Elves");
    const mystic = spawn(game, "Elvish Mystic", B);
    const bears = spawn(game, "Grizzly Bears");
    const crown = toHand(game, "Crown of Ascension");
    cast(game, crown, { targets: [ref(elves)] });
    activate(game, crown);
    expect(keywords(game, elves).has("flying")).toBe(true);
    expect(keywords(game, mystic).has("flying")).toBe(true);
    expect(keywords(game, bears).has("flying")).toBe(false);
  });

  it("with the enchanted creature gone before it resolves, nothing shares a type with it", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const elves = spawn(game, "Llanowar Elves");
    const mystic = spawn(game, "Elvish Mystic");
    const crown = toHand(game, "Crown of Ascension");
    cast(game, crown, { targets: [ref(elves)] });
    activate(game, crown, 0, { settle: false });
    game.debugMove(elves, "graveyard");
    settle(game);
    expect(keywords(game, mystic).has("flying")).toBe(false);
  });
});

describe("sharesCreatureTypeWith: \"sacrificed\"", () => {
  it("Endemic Plague destroys every creature sharing a creature type with the sacrificed one, as it last existed", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const elves = spawn(game, "Llanowar Elves");
    const theirMystic = spawn(game, "Elvish Mystic", B);
    const outcast = spawn(game, "Changeling Outcast", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Endemic Plague"), { sacrifice: elves });
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, theirMystic)).toBe("graveyard");
    expect(zone(game, outcast)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Pyre of Heroes offers only creature cards sharing a creature type, at one more mana value", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const pyre = spawn(game, "Pyre of Heroes");
    const elves = spawn(game, "Llanowar Elves");
    const visionary = toLibrary(game, "Elvish Visionary");
    const bears = toLibrary(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    const seen = pickFromZone(a, visionary);
    game.dispatch({ type: "activate-ability", player: A, source: pyre, abilityIndex: 0, targets: [], sacrifice: elves });
    settle(game);
    expect(seen.offered).toContain(visionary);
    expect(seen.offered).not.toContain(bears);
    expect(seen.offered).not.toContain(giant);
    expect(zone(game, visionary)).toBe("battlefield");
  });
});

describe("sharesCreatureTypeWith: a target slot — Killer", () => {
  it("deals 3 damage to the target and each other creature sharing a creature type with it, in one event", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const theirMystic = spawn(game, "Elvish Mystic", B);
    const elves = spawn(game, "Llanowar Elves");
    const outcast = spawn(game, "Changeling Outcast");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Coward // Killer"), { face: 2, targets: [ref(theirMystic)] });
    expect(zone(game, theirMystic)).toBe("graveyard");
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, outcast)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(0);
  });

  it("Coward makes its target a Coward: a later Killer at another Coward hits it", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Coward // Killer"), { face: 1, targets: [ref(giant)] });
    cast(game, toHand(game, "Coward // Killer"), { face: 2, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    // Hill Giant (3/3) shares no type with a Bear, so it took nothing.
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(0);
  });
});

describe("sharesCardTypeWith: a target slot", () => {
  it("Counterlash offers only the spells in hand sharing a card type with the countered spell", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    lands(game, "Island", 9);
    const giant = toHand(game, "Hill Giant");
    const bears = toHand(game, "Grizzly Bears");
    const shock = toHand(game, "Shock");
    let offered: readonly ObjectId[] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offered = offer.cards;
      const way = offer.casts.find((c) => c.card === bears)!;
      return { type: "cast-spell", player: A, card: bears, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    cast(game, giant, { settle: false });
    cast(game, toHand(game, "Counterlash"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(offered).toContain(bears);
    expect(offered).not.toContain(shock);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Reality Scramble reveals until a card sharing a card type with the permanent as it last existed", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    const shock = toLibrary(game, "Shock");
    const island = toLibrary(game, "Island");
    cast(game, toHand(game, "Reality Scramble"), { targets: [ref(bears)] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, shock)).toBe("library");
    expect(zone(game, island)).toBe("library");
    const library = game.state.zones.perPlayer[A].library;
    // Bears went to the bottom first; the two revealed went under it.
    expect(library.slice(-3)).toEqual(expect.arrayContaining([bears, shock, island]));
  });
});

describe("sharesLandTypeWith: { controlled } — Hiveheart Shaman", () => {
  it("searches only for a basic land card sharing no land type with a land you control", () => {
    const { game, a } = table();
    spawn(game, "Forest");
    spawn(game, "Island");
    const shaman = spawn(game, "Hiveheart Shaman");
    const forest = toLibrary(game, "Forest");
    const island = toLibrary(game, "Island");
    const plains = toLibrary(game, "Plains");
    pickModes(a, 0);
    const seen = pickFromZone(a, plains);
    attack(game, a, [shaman]);
    expect(seen.offered).toContain(plains);
    expect(seen.offered).not.toContain(forest);
    expect(seen.offered).not.toContain(island);
    // Wastes has no land type, so it shares none.
    expect(seen.offered.some((id) => game.state.objects[id].cardName === "Wastes")).toBe(true);
    expect(zone(game, plains)).toBe("battlefield");
  });
});

describe("bindDynamicCompares binds the shares clauses", () => {
  it("an unbound clause matches nothing; an empty reference shares with nothing", () => {
    const ctx = {
      source: "x",
      controller: A,
      targets: [],
      triggerObject: undefined,
      sacrificed: undefined,
      attachedHost: () => undefined,
      attachedOwner: () => undefined,
      chosenPermanent: () => undefined,
      cardTypesOf: () => [],
      subtypesOf: () => [],
    } as unknown as ResolutionContext;
    const spec: EffectSpec = { kind: "destroy-all", filter: { type: "creature", sharesCreatureTypeWith: "sacrificed" } };
    expect(bindDynamicCompares(spec, ctx)).toEqual({
      kind: "destroy-all",
      filter: { type: "creature", sharesTypeWith: [{ kind: "creature", objects: [], types: [] }] },
    });
  });
});

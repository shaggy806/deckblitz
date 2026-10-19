/**
 * Dominaria United, group d. One test (or two) per card, on its riskiest
 * clause and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { nameOf } from "../state.js";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  watchTargets,
  zone,
} from "./harness.js";

const canBlock = (offer: ReturnType<typeof blockOffer>, blocker: ObjectId): readonly ObjectId[] =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];

const library = (game: Game, player = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;

const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

/** One land of each of these basic types. */
const domain = (game: Game, names: readonly string[], player = A): ObjectId[] =>
  names.map((name) => spawn(game, name, player));

const ALL_FIVE = ["Plains", "Island", "Swamp", "Mountain", "Forest"] as const;

/** Cast a read-ahead Saga for alice, choosing `chapter`. */
function castSaga(game: Game, a: ScriptedController, name: string, chapter: string): ObjectId {
  a.chooseCreatureTypeFn = () => chapter;
  const card = toHand(game, name);
  cast(game, card);
  return card;
}

describe("Radha, Coalition Warlord", () => {
  it("becoming tapped pumps another creature you control by domain", () => {
    const { game, a } = table();
    domain(game, ["Forest", "Mountain", "Island"]);
    const radha = spawn(game, "Radha, Coalition Warlord");
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [bears]);
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(radha)]);
    settle(game);
    expect(seen.offered[0]).toContain(other);
    expect(seen.offered[0]).not.toContain(radha);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, radha)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Ragefire Hellkite", () => {
  it("may sacrifice another creature as it attacks to gain double strike", () => {
    const { game, a } = table();
    const kite = spawn(game, "Ragefire Hellkite");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    a.chooseSacrificesFn = (_view, eligible) => {
      expect(eligible).not.toContain(kite);
      return [bears];
    };
    attack(game, a, [kite]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(10);
  });

  it("declining keeps the creature and deals single damage", () => {
    const { game, a } = table();
    const kite = spawn(game, "Ragefire Hellkite");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a);
    attack(game, a, [kite]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, B)).toBe(15);
  });
});

describe("Gibbering Barricade", () => {
  it("may sacrifice itself to its own ability: gain 1 life and draw (the ruling)", () => {
    const { game } = table();
    const wall = spawn(game, "Gibbering Barricade");
    spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 3);
    const before = hand(game).length;
    const offer = game
      .legalActions(A)
      .find((o): o is Extract<typeof o, { kind: "activate-ability" }> => o.kind === "activate-ability" && o.source === wall);
    expect(offer?.sacrifice?.choices).toContain(wall);
    game.dispatch({ type: "activate-ability", player: A, source: wall, abilityIndex: 0, targets: [], sacrifice: wall });
    settle(game);
    expect(zone(game, wall)).toBe("graveyard");
    expect(life(game)).toBe(21);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Stall for Time", () => {
  it("kicked, taps two creatures and stuns both, then draws", () => {
    const { game } = table();
    const x = spawn(game, "Grizzly Bears", B);
    const y = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 2);
    lands(game, "Island", 3);
    const card = toHand(game, "Stall for Time");
    const before = hand(game).length;
    cast(game, card, { targets: [ref(x), ref(y)], kicked: true });
    expect(tapped(game, x) && tapped(game, y)).toBe(true);
    expect(counters(game, x, "stun")).toBe(1);
    expect(counters(game, y, "stun")).toBe(1);
    expect(hand(game).length).toBe(before);
  });

  it("unkicked, taps without stun counters", () => {
    const { game } = table();
    const x = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Stall for Time"), { targets: [ref(x), null] });
    expect(tapped(game, x)).toBe(true);
    expect(counters(game, x, "stun")).toBe(0);
  });
});

describe("Shadow Prophecy", () => {
  it("looks at domain-many cards, keeps up to two, bins the rest, loses 2 life", () => {
    const { game, a } = table();
    domain(game, ["Swamp", "Island", "Forest"]);
    const deep = toLibrary(game, "Lightning Bolt");
    const c1 = toLibrary(game, "Grizzly Bears");
    const c2 = toLibrary(game, "Sol Ring");
    const c3 = toLibrary(game, "Ornithopter");
    const seen = pickFromZone(a, c3, c1);
    cast(game, toHand(game, "Shadow Prophecy"));
    expect([...seen.offered].sort()).toEqual([c1, c2, c3].sort());
    expect(zone(game, c1)).toBe("hand");
    expect(zone(game, c3)).toBe("hand");
    expect(zone(game, c2)).toBe("graveyard");
    expect(zone(game, deep)).toBe("library");
    expect(life(game)).toBe(18);
  });
});

describe("Herd Migration", () => {
  it("makes a 3/3 Beast per basic land type", () => {
    const { game } = table();
    domain(game, ALL_FIVE);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Herd Migration"));
    expect(tokensNamed(game, "3/3 Beast Token", A)).toBe(5);
  });

  it("discarding it fetches a basic land to hand and gains 3 life", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const forest = toLibrary(game, "Forest");
    const herd = toHand(game, "Herd Migration");
    pickFromZone(a, forest);
    activate(game, herd, 0);
    expect(zone(game, herd)).toBe("graveyard");
    expect(zone(game, forest)).toBe("hand");
    expect(life(game)).toBe(23);
  });
});

describe("Sengir Connoisseur", () => {
  it("gets one counter however many creatures die in a turn", () => {
    const { game } = table();
    const vampire = spawn(game, "Sengir Connoisseur");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    destroy(game, theirs);
    expect(counters(game, vampire)).toBe(1);
    destroy(game, mine);
    expect(counters(game, vampire)).toBe(1);
  });
});

describe("Citizen's Arrest", () => {
  it("exiles an opponent's creature until it leaves the battlefield", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    spawn(game, "Grizzly Bears", B);
    pickTargets(a, giant);
    const arrest = enter(game, "Citizen's Arrest");
    expect(zone(game, giant)).toBe("exile");
    destroy(game, arrest);
    expect(named(game, "Hill Giant", B)).toHaveLength(1);
  });

  it("exiles nothing if it leaves before its trigger resolves (the ruling)", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    spawn(game, "Grizzly Bears", B);
    pickTargets(a, giant);
    const arrest = enter(game, "Citizen's Arrest", A, { settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(arrest)]);
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Scout the Wilderness", () => {
  it("kicked, fetches a tapped basic and makes two Soldiers", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    lands(game, "Plains", 2);
    const plains = toLibrary(game, "Plains");
    pickFromZone(a, plains);
    cast(game, toHand(game, "Scout the Wilderness"), { kicked: true });
    expect(zone(game, plains)).toBe("battlefield");
    expect(tapped(game, plains)).toBe(true);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(2);
  });

  it("kicked, makes the Soldiers even when no land is found (the ruling)", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Scout the Wilderness"), { kicked: true });
    expect(tokensNamed(game, "Soldier Token", A)).toBe(2);
  });

  it("unkicked, makes no Soldiers", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const forest = toLibrary(game, "Forest");
    pickFromZone(a, forest);
    cast(game, toHand(game, "Scout the Wilderness"));
    expect(zone(game, forest)).toBe("battlefield");
    expect(tokensNamed(game, "Soldier Token", A)).toBe(0);
  });
});

describe("Nael, Avizoa Aeronaut", () => {
  it("with five basic land types, keeps one on top, then draws it", () => {
    const { game, a } = table();
    domain(game, ALL_FIVE);
    const nael = spawn(game, "Nael, Avizoa Aeronaut");
    const cards = ["Grizzly Bears", "Sol Ring", "Ornithopter", "Lightning Bolt", "Hill Giant"].map((n) => toLibrary(game, n));
    const keep = cards[1]!;
    const seen = pickFromZone(a, keep);
    attack(game, a, [nael]);
    expect(seen.offered).toHaveLength(5);
    expect(zone(game, keep)).toBe("hand");
    for (const c of cards.filter((c) => c !== keep)) expect(library(game).slice(-4)).toContain(c);
  });

  it("with fewer types, looks at that many and draws nothing", () => {
    const { game, a } = table();
    domain(game, ["Forest", "Island"]);
    const nael = spawn(game, "Nael, Avizoa Aeronaut");
    const low = toLibrary(game, "Hill Giant");
    const top1 = toLibrary(game, "Grizzly Bears");
    const top0 = toLibrary(game, "Sol Ring");
    const before = hand(game).length;
    const seen = pickFromZone(a, top1);
    attack(game, a, [nael]);
    expect([...seen.offered].sort()).toEqual([top0, top1].sort());
    expect(library(game)[0]).toBe(top1);
    expect(library(game).at(-1)).toBe(top0);
    expect(library(game)[1]).toBe(low);
    expect(hand(game).length).toBe(before);
  });
});

describe("Rona's Vortex", () => {
  it("returns a creature you don't control to its owner's hand", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    lands(game, "Island", 1);
    const vortex = toHand(game, "Rona's Vortex");
    expect(() => cast(game, vortex, { targets: [ref(mine)] })).toThrow();
    cast(game, vortex, { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("hand");
  });

  it("kicked, puts it on the bottom of its owner's library instead", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Rona's Vortex"), { targets: [ref(theirs)], kicked: true });
    expect(zone(game, theirs)).toBe("library");
    expect(library(game, B).at(-1)).toBe(theirs);
  });
});

describe("Elvish Hydromancer", () => {
  it("kicked, copies a creature you control", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    lands(game, "Island", 4);
    const seen = watchTargets(a, () => [bears]);
    cast(game, toHand(game, "Elvish Hydromancer"), { kicked: true });
    expect(seen.offered[0]).toContain(bears);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(2);
  });

  it("copying itself, the token wasn't kicked and doesn't trigger again (the ruling)", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    lands(game, "Island", 4);
    const card = toHand(game, "Elvish Hydromancer");
    pickTargets(a, card);
    cast(game, card, { kicked: true });
    expect(named(game, "Elvish Hydromancer", A)).toHaveLength(2);
  });

  it("unkicked, nothing triggers", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Elvish Hydromancer"));
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
  });
});

describe("Drag to the Bottom", () => {
  it("gives each creature -X/-X, X = 1 plus domain", () => {
    const { game } = table();
    domain(game, ["Swamp", "Plains", "Island"]);
    lands(game, "Swamp", 1);
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    const mine = spawn(game, "Colossal Dreadmaw");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Drag to the Bottom"));
    expect(pt(game, dreadmaw)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 2 });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Extinguish the Light", () => {
  it("destroys; gains 3 life only for mana value 3 or less", () => {
    const { game } = table();
    lands(game, "Swamp", 8);
    const bears = spawn(game, "Grizzly Bears", B);
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Extinguish the Light"), { targets: [ref(dreadmaw)] });
    expect(zone(game, dreadmaw)).toBe("graveyard");
    expect(life(game)).toBe(20);
    cast(game, toHand(game, "Extinguish the Light"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game)).toBe(23);
  });
});

describe("Radha's Firebrand", () => {
  it("as it attacks, a creature with less power can't block; one with more can't be targeted", () => {
    const { game, a } = table();
    const brand = spawn(game, "Radha's Firebrand");
    const bears = spawn(game, "Grizzly Bears", B);
    const thopter = spawn(game, "Ornithopter", B);
    const giant = spawn(game, "Hill Giant", B);
    const seen = watchTargets(a, () => [bears]);
    const offer = blockOffer(game, a, [brand]);
    expect([...seen.offered[0]!].sort()).toEqual([bears, thopter].sort());
    expect(canBlock(offer, bears)).toEqual([]);
    expect(canBlock(offer, giant)).toEqual([brand]);
  });

  it("its pump costs {1} less per basic land type, once each turn", () => {
    const { game } = table();
    const brand = spawn(game, "Radha's Firebrand");
    const ls = domain(game, ALL_FIVE);
    activate(game, brand, 0);
    expect(pt(game, brand)).toEqual({ power: 5, toughness: 3 });
    expect(ls.filter((l) => tapped(game, l))).toHaveLength(1);
    expect(() => activate(game, brand, 0)).toThrow();
  });
});

describe("Sheoldred's Restoration", () => {
  it("unkicked, returns a creature card and loses its mana value in life, then exiles itself", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const dreadmaw = toGraveyard(game, "Colossal Dreadmaw");
    const card = toHand(game, "Sheoldred's Restoration");
    cast(game, card, { targets: [ref(dreadmaw)] });
    expect(zone(game, dreadmaw)).toBe("battlefield");
    expect(life(game)).toBe(14);
    expect(zone(game, card)).toBe("exile");
  });

  it("kicked, gains that much life instead", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    lands(game, "Plains", 3);
    const dreadmaw = toGraveyard(game, "Colossal Dreadmaw");
    cast(game, toHand(game, "Sheoldred's Restoration"), { targets: [ref(dreadmaw)], kicked: true });
    expect(zone(game, dreadmaw)).toBe("battlefield");
    expect(life(game)).toBe(26);
  });

  it("with its target gone, does nothing and goes to the graveyard (the ruling)", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const dreadmaw = toGraveyard(game, "Colossal Dreadmaw");
    const card = toHand(game, "Sheoldred's Restoration");
    cast(game, card, { targets: [ref(dreadmaw)], settle: false });
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(dreadmaw)]);
    settle(game);
    expect(zone(game, card)).toBe("graveyard");
    expect(life(game)).toBe(20);
  });
});

describe("Yavimaya Iconoclast", () => {
  it("kicked, gets +1/+1 and haste until end of turn", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Mountain", 1);
    const card = toHand(game, "Yavimaya Iconoclast");
    cast(game, card, { kicked: true });
    expect(pt(game, card)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, card).has("haste")).toBe(true);
    expect(keywords(game, card).has("trample")).toBe(true);
  });

  it("unkicked, stays a 3/2 without haste", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const card = toHand(game, "Yavimaya Iconoclast");
    cast(game, card);
    expect(pt(game, card)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, card).has("haste")).toBe(false);
  });
});

describe("Bortuk Bonerattle", () => {
  it("cast, returns a creature card with mana value up to domain to the battlefield", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bears);
    cast(game, toHand(game, "Bortuk Bonerattle"));
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("cast, puts a bigger one into your hand instead", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    const dreadmaw = toGraveyard(game, "Colossal Dreadmaw");
    pickTargets(a, dreadmaw);
    cast(game, toHand(game, "Bortuk Bonerattle"));
    expect(zone(game, dreadmaw)).toBe("hand");
  });

  it("put onto the battlefield without being cast, does nothing", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Bortuk Bonerattle");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("In Thrall to the Pit", () => {
  it("threatens a creature until end of turn", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "In Thrall to the Pit"), { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    expect(tapped(game, bears)).toBe(false);
    expect(keywords(game, bears).has("haste")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("kicked, sacrifices it at the beginning of the next end step", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 4);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "In Thrall to the Pit"), { targets: [ref(bears)], kicked: true });
    expect(controller(game, bears)).toBe(A);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(graveyard(game, B)).toContain(bears);
  });
});

describe("Hurloon Battle Hymn", () => {
  it("deals 4 damage; kicked, you gain 4 life", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    lands(game, "Plains", 1);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Hurloon Battle Hymn"), { targets: [ref(giant)], kicked: true });
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game)).toBe(24);
  });

  it("unkicked, no life", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Hurloon Battle Hymn"), { targets: [ref(dreadmaw)] });
    expect(damage(game, dreadmaw)).toBe(4);
    expect(life(game)).toBe(20);
  });
});

describe("Frostfist Strider", () => {
  it("taps an opponent's creature and stuns it as it enters", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant", B);
    pickTargets(a, bears);
    enter(game, "Frostfist Strider");
    expect(tapped(game, bears)).toBe(true);
    expect(counters(game, bears, "stun")).toBe(1);
  });
});

describe("Fires of Victory", () => {
  it("deals damage equal to your hand size; kicked, draws first", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "discard-hand", who: "you" });
    settle(game);
    lands(game, "Mountain", 2);
    lands(game, "Island", 3);
    toHand(game, "Grizzly Bears");
    toHand(game, "Hill Giant");
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Fires of Victory"), { targets: [ref(dreadmaw)], kicked: true });
    expect(hand(game)).toHaveLength(3);
    expect(damage(game, dreadmaw)).toBe(3);
  });

  it("unkicked, counts the hand without drawing", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "discard-hand", who: "you" });
    settle(game);
    lands(game, "Mountain", 2);
    toHand(game, "Grizzly Bears");
    toHand(game, "Hill Giant");
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Fires of Victory"), { targets: [ref(dreadmaw)] });
    expect(hand(game)).toHaveLength(2);
    expect(damage(game, dreadmaw)).toBe(2);
  });
});

describe("Yotia Declares War", () => {
  it("chapter I makes a 0/2 flying Thopter named Ornithopter", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    castSaga(game, a, "Yotia Declares War", "1");
    const [token] = named(game, "Ornithopter Token", A);
    expect(token).toBeDefined();
    expect(nameOf(game.state.objects[token!]!)).toBe("Ornithopter");
    expect(pt(game, token!)).toEqual({ power: 0, toughness: 2 });
    expect(keywords(game, token!).has("flying")).toBe(true);
    expect(types(game, token!)).toEqual(expect.arrayContaining(["artifact", "creature"]));
  });

  it("chapter II taps any number of artifacts, then deals that much damage to a target", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const o1 = spawn(game, "Ornithopter");
    const o2 = spawn(game, "Ornithopter");
    spawn(game, "Ornithopter");
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    spawn(game, "Hill Giant", B);
    pickPermanents(a, o1, o2);
    pickTargets(a, dreadmaw);
    castSaga(game, a, "Yotia Declares War", "2");
    expect(tapped(game, o1) && tapped(game, o2)).toBe(true);
    expect(damage(game, dreadmaw)).toBe(2);
  });

  it("chapter II tapping none still triggers the reflexive ability, for 0 damage (the ruling)", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    spawn(game, "Ornithopter");
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    spawn(game, "Hill Giant", B);
    pickPermanents(a);
    const seen = watchTargets(a, () => [dreadmaw]);
    castSaga(game, a, "Yotia Declares War", "2");
    expect(seen.asked).toBe(1);
    expect(damage(game, dreadmaw)).toBe(0);
  });

  it("chapter III makes an artifact a 4/4 artifact creature, then the Saga is sacrificed", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const ring = spawn(game, "Sol Ring");
    spawn(game, "Ornithopter");
    pickTargets(a, ring);
    const saga = castSaga(game, a, "Yotia Declares War", "3");
    expect(types(game, ring)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(pt(game, ring)).toEqual({ power: 4, toughness: 4 });
    expect(zone(game, saga)).toBe("graveyard");
  });
});

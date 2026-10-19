/**
 * The Brothers' War, group e. One test (or two) per card, on its riskiest
 * clause and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
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

const drawOne = (game: Game): void => {
  game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
  settle(game);
};

describe("Ravenous Gigamole", () => {
  it("takes a milled creature card into hand, and gets no counter", () => {
    const { game, a } = table();
    toLibrary(game, "Island");
    const bears = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Island");
    pickModes(a, 0);
    const seen = pickFromZone(a, bears);
    const mole = enter(game, "Ravenous Gigamole");
    expect(seen.offered).toEqual([bears]);
    expect(zone(game, bears)).toBe("hand");
    expect(counters(game, mole)).toBe(0);
  });

  it("gets the counter when no creature card was milled (the ruling)", () => {
    const { game } = table();
    for (let i = 0; i < 3; i++) toLibrary(game, "Island");
    const mole = enter(game, "Ravenous Gigamole");
    expect(counters(game, mole)).toBe(1);
    expect(pt(game, mole)).toEqual({ power: 3, toughness: 4 });
  });

  it("can still take a milled creature card a Rest in Peace exiled (the ruling)", () => {
    const { game, a } = table();
    spawn(game, "Rest in Peace", B);
    const island = toLibrary(game, "Island");
    const bears = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Island");
    pickModes(a, 0);
    pickFromZone(a, bears);
    const mole = enter(game, "Ravenous Gigamole");
    expect(zone(game, island)).toBe("exile");
    expect(zone(game, bears)).toBe("hand");
    expect(counters(game, mole)).toBe(0);
  });
});

describe("Tomakul Scrapsmith", () => {
  it("declining the milled artifact card gives it the counter", () => {
    const { game, a } = table();
    const ring = toLibrary(game, "Sol Ring");
    toLibrary(game, "Island");
    toLibrary(game, "Island");
    pickModes(a);
    const smith = enter(game, "Tomakul Scrapsmith");
    expect(zone(game, ring)).toBe("graveyard");
    expect(counters(game, smith)).toBe(1);
  });

  it("taking the milled artifact card puts it in hand with no counter", () => {
    const { game, a } = table();
    const ring = toLibrary(game, "Sol Ring");
    const bears = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Island");
    pickModes(a, 0);
    const seen = pickFromZone(a, ring);
    const smith = enter(game, "Tomakul Scrapsmith");
    expect(seen.offered).toEqual([ring]);
    expect(zone(game, ring)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, smith)).toBe(0);
  });
});

describe("Horned Stoneseeker", () => {
  it("makes a tapped Powerstone, and sacrifices a Powerstone when it leaves", () => {
    const { game } = table();
    const lizard = enter(game, "Horned Stoneseeker");
    expect(tokensNamed(game, "Powerstone Token", A)).toBe(1);
    const stone = named(game, "Powerstone Token", A)[0];
    expect(game.state.objects[stone].tapped).toBe(true);
    expect(keywords(game, lizard).has("menace")).toBe(true);
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [ref(lizard)]);
    settle(game);
    expect(zone(game, lizard)).toBe("hand");
    expect(tokensNamed(game, "Powerstone Token", A)).toBe(0);
  });
});

describe("Mishra's Domination", () => {
  it("on your own creature: +2/+2", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Mishra's Domination"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("on an opponent's creature: no bonus, and it can't block", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Grizzly Bears", B);
    const attacker = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Mishra's Domination"), { targets: [ref(theirs)] });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    const offer = blockOffer(game, a, [attacker]);
    expect(canBlock(offer, theirs)).toEqual([]);
    expect(canBlock(offer, other)).toEqual([attacker]);
  });
});

describe("Dredging Claw", () => {
  it("may attach to a creature returned from your graveyard, which gets +1/+0 and menace", () => {
    const { game, a } = table();
    const claw = spawn(game, "Dredging Claw");
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Swamp", 1);
    pickModes(a, 0);
    cast(game, toHand(game, "Reanimate"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[claw].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("menace")).toBe(true);
  });

  it("doesn't trigger for a creature from an opponent's graveyard", () => {
    const { game, a } = table();
    const claw = spawn(game, "Dredging Claw");
    const bears = toGraveyard(game, "Grizzly Bears", B);
    lands(game, "Swamp", 1);
    pickModes(a, 0);
    cast(game, toHand(game, "Reanimate"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[claw].attachedTo ?? null).toBeNull();
  });
});

describe("Swiftgear Drake", () => {
  it("puts up to one target card from a graveyard on the bottom of its owner's library", () => {
    const { game, a } = table();
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    pickTargets(a, bolt);
    const drake = enter(game, "Swiftgear Drake");
    expect(zone(game, bolt)).toBe("library");
    expect(library(game, B).at(-1)).toBe(bolt);
    expect(keywords(game, drake).has("haste")).toBe(true);
  });
});

describe("Gnarlroot Pallbearer", () => {
  it("target creature gets +X/+X for each creature card in your graveyard", () => {
    const { game, a } = table();
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Ornithopter");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Grizzly Bears", B);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Gnarlroot Pallbearer");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Tawnos's Tinkering", () => {
  it("a tapped land gets two counters, untaps, and becomes a 2/2 creature land", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const land = spawn(game, "Wastes", A, { tapped: true });
    cast(game, toHand(game, "Tawnos's Tinkering"), { targets: [ref(land)] });
    expect(counters(game, land)).toBe(2);
    expect(game.state.objects[land].tapped).toBe(false);
    expect(types(game, land)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(pt(game, land)).toEqual({ power: 2, toughness: 2 });
  });

  it("a creature just gets the counters and untaps", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    cast(game, toHand(game, "Tawnos's Tinkering"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Battlefield Butcher", () => {
  it("costs {1} less for each creature card in your graveyard", () => {
    const { game } = table();
    const butcher = spawn(game, "Battlefield Butcher");
    for (let i = 0; i < 3; i++) toGraveyard(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    activate(game, butcher, 0);
    expect(life(game, B)).toBe(18);
  });

  it("can't be activated for less without the creature cards", () => {
    const { game } = table();
    const butcher = spawn(game, "Battlefield Butcher");
    toGraveyard(game, "Lightning Bolt");
    lands(game, "Wastes", 4);
    expect(() => activate(game, butcher, 0)).toThrow();
  });
});

describe("Veteran's Powerblade", () => {
  it("equip Soldier {W} only reaches a Soldier; equipped creature gets +2/+0", () => {
    const { game } = table();
    const blade = spawn(game, "Veteran's Powerblade");
    const bears = spawn(game, "Grizzly Bears");
    const soldier = spawn(game, "Air Marshal");
    lands(game, "Plains", 1);
    expect(() => activate(game, blade, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, blade, 0, { targets: [ref(soldier)] });
    expect(game.state.objects[blade].attachedTo).toBe(soldier);
    expect(pt(game, soldier)).toEqual({ power: 4, toughness: 1 });
  });
});

describe("Aeronaut Cavalry", () => {
  it("puts a +1/+1 counter on another Soldier you control", () => {
    const { game, a } = table();
    const soldier = spawn(game, "Air Marshal");
    const other = spawn(game, "Battlefield Butcher");
    spawn(game, "Grizzly Bears");
    spawn(game, "Air Marshal", B);
    const seen = watchTargets(a, () => [other]);
    const cavalry = enter(game, "Aeronaut Cavalry");
    expect([...seen.offered[0]].sort()).toEqual([soldier, other].sort());
    expect(counters(game, other)).toBe(1);
    expect(counters(game, cavalry)).toBe(0);
  });
});

describe("Unleash Shell", () => {
  it("deals 5 to the creature and 2 to its controller", () => {
    const { game } = table();
    const giant = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Unleash Shell"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });
});

describe("Heavyweight Demolisher", () => {
  it("is tapped at your upkeep unless you pay {3}", () => {
    const { game, a } = table();
    const demolisher = spawn(game, "Heavyweight Demolisher");
    pickModes(a);
    toStep(game, "draw");
    expect(game.state.objects[demolisher].tapped).toBe(true);
  });

  it("stays untapped when you pay {3}", () => {
    const { game, a } = table();
    const demolisher = spawn(game, "Heavyweight Demolisher");
    const wastes = lands(game, "Wastes", 3);
    pickModes(a, 0);
    toStep(game, "draw");
    expect(game.state.objects[demolisher].tapped).toBe(false);
    expect(wastes.every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("unearths from the graveyard with haste", () => {
    const { game } = table();
    const card = toGraveyard(game, "Heavyweight Demolisher");
    lands(game, "Mountain", 8);
    activate(game, card, 0);
    expect(zone(game, card)).toBe("battlefield");
    expect(keywords(game, card).has("haste")).toBe(true);
  });
});

describe("Autonomous Assembler", () => {
  it("cast prototyped for {1}{W} it's a white 2/2", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const card = toHand(game, "Autonomous Assembler");
    cast(game, card, { prototype: true });
    expect(zone(game, card)).toBe("battlefield");
    expect(pt(game, card)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, card).has("vigilance")).toBe(true);
  });

  it("{1}, {T}: a +1/+1 counter on target Assembly-Worker you control, not another creature", () => {
    const { game } = table();
    const worker = spawn(game, "Autonomous Assembler");
    const other = spawn(game, "Autonomous Assembler");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 1);
    expect(() => activate(game, worker, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, worker, 0, { targets: [ref(other)] });
    expect(counters(game, other)).toBe(1);
  });
});

describe("Gaea's Courser", () => {
  it("draws on attack with three creature cards in your graveyard", () => {
    const { game, a } = table();
    const courser = spawn(game, "Gaea's Courser");
    for (let i = 0; i < 3; i++) toGraveyard(game, "Grizzly Bears");
    const before = hand(game).length;
    attack(game, a, [courser]);
    expect(hand(game).length).toBe(before + 1);
  });

  it("doesn't with only two", () => {
    const { game, a } = table();
    const courser = spawn(game, "Gaea's Courser");
    for (let i = 0; i < 2; i++) toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Lightning Bolt");
    const before = hand(game).length;
    attack(game, a, [courser]);
    expect(hand(game).length).toBe(before);
  });
});

describe("Battery Bearer", () => {
  it("gives your creatures a {T}: Add {C} that pays for an artifact spell", () => {
    const { game } = table();
    spawn(game, "Battery Bearer");
    spawn(game, "Grizzly Bears");
    const ring = toHand(game, "Sol Ring");
    cast(game, ring);
    expect(zone(game, ring)).toBe("battlefield");
  });

  it("its mana can't cast a nonartifact spell", () => {
    const { game } = table();
    spawn(game, "Battery Bearer");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    lands(game, "Island", 1);
    expect(() => cast(game, toHand(game, "Divination"))).toThrow();
  });

  it("draws when you cast an artifact spell with mana value 6 or greater", () => {
    const { game } = table();
    spawn(game, "Battery Bearer");
    lands(game, "Wastes", 6);
    const wurm = toHand(game, "Wurmcoil Engine");
    const before = hand(game).length;
    cast(game, wurm);
    expect(hand(game).length).toBe(before); // the Wurmcoil left, a card came
    expect(zone(game, wurm)).toBe("battlefield");
  });
});

describe("Evangel of Synthesis", () => {
  it("loots as it enters, and with two cards drawn this turn it's a 3/3 with menace", () => {
    const { game } = table();
    for (let i = 0; i < 5; i++) toHand(game, "Island");
    const evangel = enter(game, "Evangel of Synthesis");
    expect(graveyard(game).length).toBe(1);
    // Alice drew for the turn, then the loot's draw: two.
    expect(pt(game, evangel)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, evangel).has("menace")).toBe(true);
  });
});

describe("Trench Stalker", () => {
  it("has deathtouch and lifelink only once you've drawn two cards this turn", () => {
    const { game } = table();
    const stalker = spawn(game, "Trench Stalker");
    // One card drawn so far (the turn's draw).
    expect(keywords(game, stalker).has("deathtouch")).toBe(false);
    drawOne(game);
    expect(keywords(game, stalker).has("deathtouch")).toBe(true);
    expect(keywords(game, stalker).has("lifelink")).toBe(true);
  });
});

describe("Keeper of the Cadence", () => {
  it("puts an artifact, instant or sorcery card from a graveyard on the bottom of its library", () => {
    const { game } = table();
    const keeper = spawn(game, "Keeper of the Cadence");
    const ring = toGraveyard(game, "Sol Ring", B);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    lands(game, "Wastes", 3);
    expect(() => activate(game, keeper, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, keeper, 0, { targets: [ref(ring)] });
    expect(library(game, B).at(-1)).toBe(ring);
  });
});

describe("Argothian Sprite", () => {
  it("can't be blocked by artifact creatures", () => {
    const { game, a } = table();
    const sprite = spawn(game, "Argothian Sprite");
    const thopter = spawn(game, "Ornithopter", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [sprite]);
    expect(canBlock(offer, thopter)).toEqual([]);
    expect(canBlock(offer, bears)).toEqual([sprite]);
  });

  it("{7}: two +1/+1 counters", () => {
    const { game } = table();
    const sprite = spawn(game, "Argothian Sprite");
    lands(game, "Wastes", 7);
    activate(game, sprite, 0);
    expect(pt(game, sprite)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Air Marshal", () => {
  it("gives any player's Soldier flying, but not a non-Soldier", () => {
    const { game } = table();
    const marshal = spawn(game, "Air Marshal");
    const theirs = spawn(game, "Battlefield Butcher", B);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 6);
    expect(() => activate(game, marshal, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, marshal, 0, { targets: [ref(theirs)] });
    expect(keywords(game, theirs).has("flying")).toBe(true);
  });
});

describe("Kill-Zone Acrobat", () => {
  it("may sacrifice another creature or artifact as it attacks to gain flying", () => {
    const { game, a } = table();
    const acrobat = spawn(game, "Kill-Zone Acrobat");
    const ring = spawn(game, "Sol Ring");
    pickModes(a, 0);
    a.chooseSacrificesFn = (_view, eligible) => {
      expect(eligible).not.toContain(acrobat);
      return [ring];
    };
    attack(game, a, [acrobat]);
    expect(zone(game, ring)).toBe("graveyard");
    expect(keywords(game, acrobat).has("flying")).toBe(true);
  });
});

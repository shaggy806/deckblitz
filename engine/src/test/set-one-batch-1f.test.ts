/**
 * Phyrexia: All Will Be One (ONE/ONC), batch 1, group f (2026-10-17). Written on the shared
 * table in `harness.ts`, each test from the card's Oracle text.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  life,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";
import type { ObjectId } from "../primitives.js";

describe("Gleeful Demolition", () => {
  it("makes three Phyrexian Goblins only when you controlled the destroyed artifact", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const mine = spawn(game, "Sol Ring");
    const theirs = spawn(game, "Sol Ring", B);
    cast(game, toHand(game, "Gleeful Demolition"), { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(tokensNamed(game, "Phyrexian Goblin Token")).toBe(0);
    cast(game, toHand(game, "Gleeful Demolition"), { targets: [ref(mine)] });
    expect(zone(game, mine)).toBe("graveyard");
    expect(tokensNamed(game, "Phyrexian Goblin Token", A)).toBe(3);
  });
});

describe("Kemba's Banner", () => {
  it("For Mirrodin! attaches it to a Rebel, which gets +1/+1 for each creature you control", () => {
    const { game } = table();
    enter(game, "Kemba's Banner");
    const [rebel] = game.battlefield.filter((id) => game.state.objects[id].cardName === "Rebel Token");
    expect(rebel).toBeDefined();
    expect(pt(game, rebel)).toEqual({ power: 3, toughness: 3 });
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    expect(pt(game, rebel)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Norn's Wellspring", () => {
  it("gets an oil counter when a creature you control dies, and draws for two of them", () => {
    const { game } = table();
    const well = spawn(game, "Norn's Wellspring");
    destroy(game, spawn(game, "Grizzly Bears"));
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(counters(game, well, "oil")).toBe(1);
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(counters(game, well, "oil")).toBe(2);
    lands(game, "Plains", 1);
    const before = hand(game).length;
    activate(game, well);
    expect(hand(game).length).toBe(before + 1);
    expect(counters(game, well, "oil")).toBe(0);
  });
});

describe("Annex Sentry", () => {
  it("exiles an opponent's artifact or creature of mana value 3 or less until it leaves", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const angel = spawn(game, "Serra Angel", B);
    const ring = spawn(game, "Sol Ring", B);
    const myBears = spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [bears]);
    const sentry = enter(game, "Annex Sentry");
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).toContain(ring);
    expect(seen.offered[0]).not.toContain(angel);
    expect(seen.offered[0]).not.toContain(myBears);
    expect(zone(game, bears)).toBe("exile");
    destroy(game, sentry);
    expect(game.battlefield.some((id) => game.state.objects[id].cardName === "Grizzly Bears" && game.state.objects[id].controller === B)).toBe(true);
  });
});

describe("Charge of the Mites", () => {
  it("deals damage equal to the number of creatures you control", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Charge of the Mites"), { modes: [0], targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(2);
  });

  it("or makes two Phyrexian Mites", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Charge of the Mites"), { modes: [1] });
    expect(tokensNamed(game, "Phyrexian Mite Token", A)).toBe(2);
  });
});

describe("Adaptive Sporesinger", () => {
  it("can proliferate as it enters, an opponent's poison counters included", () => {
    const { game, a } = table();
    game.state.players[B].counters.poison = 2;
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 1;
    pickModes(a, 1);
    a.chooseProliferateFn = (_view, eligible) => eligible;
    enter(game, "Adaptive Sporesinger");
    expect(game.state.players[B].counters.poison).toBe(3);
    expect(counters(game, bears)).toBe(2);
  });

  it("or gives a target creature +2/+2 and vigilance", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    pickTargets(a, bears);
    enter(game, "Adaptive Sporesinger");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Kemba, Kha Enduring", () => {
  it("attaches an Equipment to a Cat that enters, and equipped creatures you control get +1/+1", () => {
    const { game, a } = table();
    const kemba = spawn(game, "Kemba, Kha Enduring");
    const blade = spawn(game, "Bonesplitter");
    lands(game, "Plains", 5);
    pickTargets(a, blade);
    activate(game, kemba);
    const [cat] = game.battlefield.filter((id) => game.state.objects[id].cardName === "Cat Token");
    expect(game.state.objects[blade].attachedTo).toBe(cat);
    expect(pt(game, cat)).toEqual({ power: 5, toughness: 3 });
    expect(pt(game, kemba)).toEqual({ power: 2, toughness: 2 });
  });

  it("attaches one to Kemba herself as she enters", () => {
    const { game, a } = table();
    const blade = spawn(game, "Bonesplitter");
    pickTargets(a, blade);
    const kemba = enter(game, "Kemba, Kha Enduring");
    expect(game.state.objects[blade].attachedTo).toBe(kemba);
    expect(pt(game, kemba)).toEqual({ power: 5, toughness: 3 });
  });
});

describe("Cephalopod Sentry", () => {
  it("has power equal to the number of artifacts you control, itself included", () => {
    const { game } = table();
    const squid = spawn(game, "Cephalopod Sentry");
    spawn(game, "Sol Ring");
    spawn(game, "Sol Ring", B);
    expect(pt(game, squid)).toEqual({ power: 2, toughness: 5 });
  });
});

describe("Indoctrination Attendant", () => {
  it("makes a Mite only if you return another permanent", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring");
    pickPermanents(a);
    enter(game, "Indoctrination Attendant");
    expect(tokensNamed(game, "Phyrexian Mite Token")).toBe(0);
    const seen = pickPermanents(a, ring);
    const second = enter(game, "Indoctrination Attendant");
    expect(seen.offered).not.toContain(second);
    expect(zone(game, ring)).toBe("hand");
    expect(tokensNamed(game, "Phyrexian Mite Token", A)).toBe(1);
  });
});

describe("Minor Misstep", () => {
  it("counters a spell of mana value 1 but can't target one of mana value 3", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Island", 5);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Minor Misstep"), { targets: [ref(bolt)] });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    const divination = toHand(game, "Divination");
    cast(game, divination, { settle: false });
    expect(() => cast(game, toHand(game, "Minor Misstep"), { targets: [ref(divination)], settle: false })).toThrow();
  });
});

describe("Trawler Drake", () => {
  it("enters with an oil counter and grows with each noncreature spell you cast", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const drake = toHand(game, "Trawler Drake");
    cast(game, drake);
    expect(counters(game, drake, "oil")).toBe(1);
    expect(pt(game, drake)).toEqual({ power: 1, toughness: 1 });
    cast(game, toHand(game, "Opt"));
    expect(pt(game, drake)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Free from Flesh", () => {
  it("gives +2/+2 and two oil counters", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Free from Flesh"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(counters(game, bears, "oil")).toBe(2);
  });
});

describe("Skyscythe Engulfer", () => {
  it("can't be blocked by creatures with flying", () => {
    const { game, a } = table();
    const engulfer = spawn(game, "Skyscythe Engulfer");
    const angel = spawn(game, "Serra Angel", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [engulfer]);
    const canBlock = (id: ObjectId): readonly ObjectId[] => offer.eligible.find((e) => e.blocker === id)?.canBlock ?? [];
    expect(canBlock(angel)).toEqual([]);
    expect(canBlock(bears)).toEqual([engulfer]);
  });
});

describe("Geth, Thane of Contracts", () => {
  it("returns a creature card that is exiled if it would leave, and shrinks your other creatures", () => {
    const { game } = table();
    const geth = spawn(game, "Geth, Thane of Contracts");
    const theirs = spawn(game, "Grizzly Bears", B);
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Swamp", 3);
    activate(game, geth, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, geth)).toEqual({ power: 3, toughness: 4 });
    destroy(game, bears);
    expect(zone(game, bears)).toBe("exile");
    expect(graveyard(game)).not.toContain(bears);
  });
});

describe("Vivisection Evangelist", () => {
  it("destroys an opponent's creature only while an opponent has three or more poison counters", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    game.state.players[B].counters.poison = 2;
    enter(game, "Vivisection Evangelist");
    expect(zone(game, bears)).toBe("battlefield");
    game.state.players[B].counters.poison = 3;
    enter(game, "Vivisection Evangelist");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Lattice-Blade Mantis", () => {
  it("enters with two oil counters, and may spend one as it attacks to untap and get +1/+1", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const mantis = toHand(game, "Lattice-Blade Mantis");
    cast(game, mantis);
    expect(counters(game, mantis, "oil")).toBe(2);
    toStep(game, "precombat-main");
    pickModes(a, 0);
    attack(game, a, [mantis]);
    expect(counters(game, mantis, "oil")).toBe(1);
    expect(game.state.objects[mantis].tapped).toBe(false);
    expect(pt(game, mantis)).toEqual({ power: 5, toughness: 4 });
    expect(life(game, B)).toBe(15);
  });
});

describe("Cinderslash Ravager", () => {
  it("costs {1} less for each permanent you control with oil counters on it", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    const ring = spawn(game, "Sol Ring", A, { tapped: true });
    game.state.objects[ring].counters.oil = 1;
    const theirs = spawn(game, "Grizzly Bears", B);
    game.state.objects[theirs].counters.oil = 3;
    const ravager = toHand(game, "Cinderslash Ravager");
    expect(() => cast(game, ravager)).toThrow();
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters.oil = 2;
    cast(game, ravager);
    expect(zone(game, ravager)).toBe("battlefield");
    expect(game.state.objects[theirs].damageMarked).toBe(1);
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });
});

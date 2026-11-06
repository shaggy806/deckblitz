/**
 * Star Trek (TRK) — group C of the set's second batch: kicked retargets, the
 * "total power 8" attack triggers, a Spacecraft that only counts while it
 * isn't a creature, the Doctor's counters and the type-setting Aura.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

const addCounters = (game: Game, id: ObjectId, counter: string, amount: number): void =>
  game.debugApplyEffect(game.state.objects[id].controller, { kind: "add-counter", target: 0, counter, amount }, [
    ref(id),
  ]);
const library = (game: Game, player: PlayerId = A): number => game.state.zones.perPlayer[player].library.length;

describe("Highly Illogical", () => {
  it("counters only a spell of mana value 2 or less unless kicked, then any spell", () => {
    const { game } = table();
    lands(game, "Island", 7);
    const divination = toHand(game, "Divination");
    cast(game, divination, { settle: false });
    const counter = toHand(game, "Highly Illogical");
    expect(() => cast(game, counter, { targets: [ref(divination)], settle: false })).toThrow();
    const before = hand(game).length;
    cast(game, counter, { targets: [ref(divination)], kicked: true });
    expect(zone(game, divination)).toBe("graveyard");
    expect(hand(game).length).toBe(before - 1);
  });
});

describe("Mirror Universe Intrusion", () => {
  it("copies one target creature with menace, or every creature of a target opponent when kicked", () => {
    const { game } = table();
    lands(game, "Island", 5);
    lands(game, "Swamp", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Llanowar Elves", B);
    cast(game, toHand(game, "Mirror Universe Intrusion"), { targets: [ref(bears)] });
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(1);
    expect(tokensNamed(game, "Llanowar Elves", A)).toBe(0);
    const copy = game.battlefield.find((id) => game.state.objects[id].isToken && game.state.objects[id].cardName === "Grizzly Bears")!;
    expect(keywords(game, copy).has("menace")).toBe(true);

    nextTurn(game);
    nextTurn(game);
    cast(game, toHand(game, "Mirror Universe Intrusion"), { targets: [ref(B)], kicked: true });
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(2);
    expect(tokensNamed(game, "Llanowar Elves", A)).toBe(1);
  });
});

describe("Federation Field Medic", () => {
  it("draws only while you control a permanent with a counter on it", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 1);
    const before = hand(game).length;
    enter(game, "Federation Field Medic");
    expect(hand(game).length).toBe(before);
    addCounters(game, bears, "+1/+1", 1);
    enter(game, "Federation Field Medic");
    expect(hand(game).length).toBe(before + 1);
  });

  it("puts a +1/+1 counter on the target, which gains vigilance", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    pickTargets(a, bears);
    enter(game, "Federation Field Medic");
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("vigilance")).toBe(true);
  });
});

describe("The Doctor, EMH", () => {
  it("counters the target, then each creature you control with a counter of any kind", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    const ornithopter = spawn(game, "Ornithopter");
    addCounters(game, elves, "shield", 1);
    pickTargets(a, bears);
    const doctor = enter(game, "The Doctor, EMH");
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, elves)).toBe(1);
    expect(counters(game, ornithopter)).toBe(0);
    expect(counters(game, doctor)).toBe(0);
  });
});

describe("Salt Vampire", () => {
  it("has the opponent exile the chosen nonland card and draw", () => {
    const { game, a } = table();
    const shock = toHand(game, "Shock", B);
    const forest = toHand(game, "Forest", B);
    const seen = pickFromZone(a, shock);
    const libraryBefore = library(game, B);
    enter(game, "Salt Vampire");
    expect(seen.offered).not.toContain(forest);
    expect(zone(game, shock)).toBe("exile");
    expect(library(game, B)).toBe(libraryBefore - 1);
  });

  it("doesn't draw them a card if you choose nothing", () => {
    const { game, a } = table();
    const shock = toHand(game, "Shock", B);
    pickFromZone(a);
    const libraryBefore = library(game, B);
    enter(game, "Salt Vampire");
    expect(zone(game, shock)).toBe("hand");
    expect(library(game, B)).toBe(libraryBefore);
  });
});

describe("Gwyndala, the Progeny", () => {
  it("attaches a Neuroflux Heirloom, which can become a copy of another Equipment until end of turn", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const gwyndala = enter(game, "Gwyndala, the Progeny");
    expect(tokensNamed(game, "Neuroflux Heirloom Token", A)).toBe(1);
    expect(pt(game, gwyndala)).toEqual({ power: 2, toughness: 2 });
    const bonesplitter = spawn(game, "Bonesplitter");
    activate(game, gwyndala, 0, { targets: [ref(bonesplitter)] });
    expect(pt(game, gwyndala)).toEqual({ power: 3, toughness: 1 });
    nextTurn(game);
    expect(pt(game, gwyndala)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Sarcophagus, Ship of the Dead", () => {
  it("gains a charge counter as a creature dies only while it isn't a creature", () => {
    const { game } = table();
    const ship = spawn(game, "Sarcophagus, Ship of the Dead");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, bears).power).toBe(3);
    destroy(game, spawn(game, "Llanowar Elves", B));
    expect(counters(game, ship, "charge")).toBe(1);
    addCounters(game, ship, "charge", 9);
    expect(types(game, ship)).toContain("creature");
    expect(keywords(game, ship).has("flying")).toBe(true);
    destroy(game, bears);
    expect(counters(game, ship, "charge")).toBe(10);
  });
});

describe("De-evolve", () => {
  it("makes the creature a -4/-0 Salamander, and exiles it at an upkeep once you have threshold", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "De-evolve"), { targets: [ref(bears)] });
    expect(subtypes(game, bears)).toEqual(["Salamander"]);
    expect(pt(game, bears)).toEqual({ power: -2, toughness: 2 });
    for (let i = 0; i < 6; i++) toGraveyard(game, "Wastes");
    nextTurn(game, "draw");
    expect(zone(game, bears)).toBe("battlefield");
    toGraveyard(game, "Wastes");
    nextTurn(game, "draw");
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("I'm a Doctor, Not a . . .", () => {
  it("counters and untaps the creature, which is a 4/4 Doctor until end of turn", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    cast(game, toHand(game, "I'm a Doctor, Not a . . ."), { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(subtypes(game, bears)).toEqual(["Doctor"]);
    nextTurn(game);
    expect(subtypes(game, bears)).toEqual(["Bear"]);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Kirk, Commanding Officer", () => {
  it("exiles the top card to play only when you attack with total power 8 or greater", () => {
    const { game, a } = table();
    spawn(game, "Kirk, Commanding Officer");
    const first = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    const shock = toLibrary(game, "Shock");
    attack(game, a, [first]);
    expect(zone(game, shock)).toBe("library");

    nextTurn(game);
    nextTurn(game);
    spawn(game, "Grizzly Bears");
    const top = toLibrary(game, "Divination");
    attack(game, a, [first]);
    expect(zone(game, top)).toBe("exile");
  });
});

describe("Sickbay", () => {
  it("puts one plus the life you gained this turn in +1/+1 counters on the target", () => {
    const { game, a } = table();
    spawn(game, "Sickbay");
    const bears = enter(game, "Grizzly Bears");
    expect(life(game)).toBe(21);
    pickTargets(a, bears);
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, bears)).toBe(2);
  });
});

describe("Tasha Yar, Out of Time", () => {
  it("exiles herself from the graveyard for a token copy sacrificed at the next end step", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const tasha = toGraveyard(game, "Tasha Yar, Out of Time");
    activate(game, tasha, 0);
    expect(zone(game, tasha)).toBe("exile");
    expect(tokensNamed(game, "Tasha Yar, Out of Time", A)).toBe(1);
    nextTurn(game);
    expect(tokensNamed(game, "Tasha Yar, Out of Time", A)).toBe(0);
  });
});

describe("Storied Veteran", () => {
  it("enters with a finality counter only when cast from the graveyard", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const fromGraveyard = toGraveyard(game, "Storied Veteran");
    cast(game, fromGraveyard, { via: "graveyard-permission" });
    expect(counters(game, fromGraveyard, "finality")).toBe(1);
    const fromHand = toHand(game, "Storied Veteran");
    cast(game, fromHand);
    expect(counters(game, fromHand, "finality")).toBe(0);
  });
});

describe("Cloak and Phaser", () => {
  it("costs {1} less for each differently named land you control", () => {
    const { game } = table();
    for (const land of ["Island", "Plains", "Swamp", "Mountain", "Forest"]) spawn(game, land);
    cast(game, toHand(game, "Cloak and Phaser"));
    expect(tokensNamed(game, "Romulan Token", A)).toBe(2);
  });
});

describe("Guidance Failure", () => {
  it("can put a Spacecraft that isn't a creature into its owner's library", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const cruiser = spawn(game, "D-7 Battle Cruiser", B);
    cast(game, toHand(game, "Guidance Failure"), { targets: [ref(cruiser)] });
    expect(zone(game, cruiser)).toBe("library");
  });
});

describe("Dahar Master", () => {
  it("sacrifices another nonland permanent to deal 2 damage", () => {
    const { game, a } = table();
    const ornithopter = spawn(game, "Ornithopter");
    pickModes(a, 0);
    a.choosePermanentsFn = () => [ornithopter];
    a.chooseSacrificesFn = () => [ornithopter];
    pickTargets(a, B);
    enter(game, "Dahar Master");
    expect(zone(game, ornithopter)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });
});

describe("Wesley Crusher, Starfleet Cadet", () => {
  it("chooses two modes: bounce a cheap creature and loot a player", () => {
    const { game, a } = table();
    const ornithopter = spawn(game, "Ornithopter", B);
    a.chooseTargetsFn = (_view, _source, _specs, legal) =>
      legal.map((slot) => {
        const object = slot.find((t) => t.kind === "object" && t.object === ornithopter);
        return object ?? slot.find((t) => t.kind === "player" && t.player === A) ?? null;
      });
    // With no spell to counter, the first mode isn't offered: pick by text.
    a.chooseModesFn = (_view, _min, _max, texts) =>
      ["Return target creature", "Target player draws"].map((start) => texts.findIndex((t) => t.startsWith(start)));
    const before = hand(game).length;
    const libraryBefore = library(game);
    enter(game, "Wesley Crusher, Starfleet Cadet");
    expect(zone(game, ornithopter)).toBe("hand");
    expect(library(game)).toBe(libraryBefore - 2);
    expect(hand(game).length).toBe(before);
  });
});

describe("Year of Hell", () => {
  it("draws each player a card and deals each 2 damage", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 1);
    const saga = toHand(game, "Year of Hell");
    const before = [hand(game, A).length - 1, hand(game, B).length];
    cast(game, saga);
    expect([hand(game, A).length, hand(game, B).length]).toEqual([before[0] + 1, before[1] + 1]);
    expect([life(game, A), life(game, B)]).toEqual([18, 18]);
  });
});

describe("Grand Nagus Zek", () => {
  it("makes one Treasure a turn and grows with each Treasure", () => {
    const { game } = table();
    const zek = spawn(game, "Grand Nagus Zek");
    destroy(game, spawn(game, "Grizzly Bears", B));
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(pt(game, zek)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Vash, Freelance Archaeologist", () => {
  it("draws once a turn as cards leave your graveyard", () => {
    const { game, a } = table();
    spawn(game, "Vash, Freelance Archaeologist");
    lands(game, "Forest", 2);
    const first = toGraveyard(game, "Wastes");
    const second = toGraveyard(game, "Wastes");
    pickModes(a, 0);
    const before = hand(game).length;
    cast(game, toHand(game, "Test of Courage"), { modes: [0], targets: [ref(first)] });
    expect(zone(game, first)).toBe("exile");
    expect(hand(game).length).toBe(before + 1);
    cast(game, toHand(game, "Test of Courage"), { modes: [0], targets: [ref(second)] });
    expect(zone(game, second)).toBe("exile");
    expect(hand(game).length).toBe(before + 1);
    expect(life(game)).toBe(24);
  });
});

describe("MACO Strike Team", () => {
  it("makes a tapped Officer when an opponent's ability targets your creature", () => {
    const { game, b } = table();
    spawn(game, "MACO Strike Team");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(b, bears);
    enter(game, "Vexing Drone", B);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(tokensNamed(game, "Officer Token", A)).toBe(1);
    const officer = game.battlefield.find((id) => game.state.objects[id].cardName === "Officer Token")!;
    expect(game.state.objects[officer].tapped).toBe(true);
  });
});

describe("Stray from History", () => {
  it("returns a creature card and a Spacecraft card to your hand", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const bears = toGraveyard(game, "Grizzly Bears");
    const cruiser = toGraveyard(game, "D-7 Battle Cruiser");
    cast(game, toHand(game, "Stray from History"), { modes: [0], targets: [ref(bears), ref(cruiser)] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, cruiser)).toBe("hand");
  });
});

describe("General Chang, Cold Warrior", () => {
  it("sacrifices a creature to put a counter on each Klingon you control", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const chang = spawn(game, "General Chang, Cold Warrior");
    const klingon = spawn(game, "Munitions Enthusiast");
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    activate(game, chang, 0, { sacrifice: elves });
    expect(zone(game, elves)).toBe("graveyard");
    expect([counters(game, chang), counters(game, klingon), counters(game, bears)]).toEqual([1, 1, 0]);
  });
});

describe("Khan, Despot by Design", () => {
  it("deals 1 damage to each opponent and each creature they control", () => {
    const { game } = table();
    const theirs = spawn(game, "Llanowar Elves", B);
    const mine = spawn(game, "Llanowar Elves");
    enter(game, "Khan, Despot by Design");
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });
});

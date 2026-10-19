/**
 * Streets of New Capenna (and New Capenna Commander), group e. One test (or
 * two) per card, on its riskiest clause and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

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
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

const library = (game: Game, player = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

/** `n` each of Mountain, Forest and Plains. */
const naya = (game: Game, n = 1): void => {
  for (const land of ["Mountain", "Forest", "Plains"]) lands(game, land, n);
};

describe("Cabaretti Charm", () => {
  it("deals damage equal to the creatures you control to target creature or planeswalker", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    naya(game);
    cast(game, toHand(game, "Cabaretti Charm"), { modes: [0], targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("pumps and grants trample to your creatures, or makes two Citizens", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    naya(game, 2);
    cast(game, toHand(game, "Cabaretti Charm"), { modes: [1] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    cast(game, toHand(game, "Cabaretti Charm"), { modes: [2] });
    expect(tokensNamed(game, "Citizen Token", A)).toBe(2);
  });
});

describe("Rob the Archives", () => {
  it("exiles the top two cards, which you may play this turn", () => {
    const { game } = table();
    const second = toLibrary(game, "Mountain");
    const top = toLibrary(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Rob the Archives"));
    expect(zone(game, top)).toBe("exile");
    expect(zone(game, second)).toBe("exile");
    cast(game, top, { via: "impulse" });
    expect(zone(game, top)).toBe("battlefield");
  });

  it("with casualty paid, the copy exiles two more", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a, bears);
    const before = library(game).length;
    cast(game, toHand(game, "Rob the Archives"));
    expect(zone(game, bears)).toBe("graveyard");
    expect(library(game).length).toBe(before - 4);
  });
});

describe("Make Disappear", () => {
  it("counters a spell whose controller can't pay {2}", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Island", 3);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    // The rest of alice's mana goes on Make Disappear; nothing is left for {2}.
    cast(game, toHand(game, "Make Disappear"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Sky Crier", () => {
  it("{3}{W}: you and target opponent each draw a card", () => {
    const { game } = table();
    const crier = spawn(game, "Sky Crier");
    lands(game, "Plains", 4);
    const mine = hand(game, A).length;
    const theirs = hand(game, B).length;
    activate(game, crier, 0, { targets: [ref(B)] });
    expect(hand(game, A).length).toBe(mine + 1);
    expect(hand(game, B).length).toBe(theirs + 1);
  });
});

describe("Mayhem Patrol", () => {
  it("blitzed for {1}{R}, it has haste and pumps a target creature as it attacks", () => {
    const { game, a } = table();
    const patrol = toHand(game, "Mayhem Patrol");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    cast(game, patrol, { via: "blitz" });
    expect(keywords(game, patrol).has("haste")).toBe(true);
    a.chooseTargetsFn = () => [ref(bears)];
    attack(game, a, [patrol]);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("Speakeasy Server", () => {
  it("gains 1 life for each other creature you control", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    enter(game, "Speakeasy Server");
    expect(life(game, A)).toBe(22);
  });
});

describe("Darling of the Masses", () => {
  it("other Citizens you control get +1/+0, and an attack makes a Citizen", () => {
    const { game, a } = table();
    const darling = spawn(game, "Darling of the Masses");
    const crier = spawn(game, "Sky Crier");
    const theirs = spawn(game, "Sky Crier", B);
    expect(pt(game, darling)).toEqual({ power: 2, toughness: 4 });
    expect(pt(game, crier)).toEqual({ power: 2, toughness: 1 });
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
    attack(game, a, [darling]);
    expect(tokensNamed(game, "Citizen Token", A)).toBe(1);
    const token = game.battlefield.find((id) => game.state.objects[id].cardName === "Citizen Token")!;
    expect(pt(game, token)).toEqual({ power: 2, toughness: 1 });
  });
});

describe("Raffine's Silencer", () => {
  it("connives on entering, and on death gives -X/-X with X its last power", () => {
    const { game, a } = table();
    toLibrary(game, "Grizzly Bears");
    // Discards the Grizzly Bears it drew: a nonland card, so a counter.
    a.chooseDiscardsFn = (cards) => [cards.find((o) => o.cardName === "Grizzly Bears")!.id];
    const silencer = enter(game, "Raffine's Silencer");
    expect(counters(game, silencer)).toBe(1);
    expect(pt(game, silencer).power).toBe(2);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    a.chooseTargetsFn = () => [ref(giant)];
    destroy(game, silencer);
    expect(zone(game, giant)).toBe("battlefield");
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Most Wanted", () => {
  it("gives +2/+1, and two Treasures when the enchanted creature dies", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Most Wanted"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
    destroy(game, bears);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
  });
});

describe("Fatal Grudge", () => {
  it("each opponent sacrifices a permanent sharing a card type with the sacrificed one, then you draw", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    const relic = spawn(game, "Darksteel Relic");
    const theirBears = spawn(game, "Grizzly Bears", B);
    const theirRelic = spawn(game, "Darksteel Relic", B);
    const theirLand = spawn(game, "Forest", B);
    const before = hand(game, A).length;
    const grudge = toHand(game, "Fatal Grudge");
    cast(game, grudge, { sacrifice: relic });
    expect(zone(game, relic)).toBe("graveyard");
    expect(zone(game, theirRelic)).toBe("graveyard");
    expect(zone(game, theirBears)).toBe("battlefield");
    expect(zone(game, theirLand)).toBe("battlefield");
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("an artifact creature shares a type with both artifacts and creatures", () => {
    const { game, b } = table();
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    const construct = spawn(game, "Scuttling Butler");
    const theirBears = spawn(game, "Grizzly Bears", B);
    const theirRelic = spawn(game, "Darksteel Relic", B);
    spawn(game, "Forest", B);
    let offered: readonly ObjectId[] = [];
    b.chooseSacrificesFn = (_view, eligible) => {
      offered = eligible;
      return [theirBears];
    };
    cast(game, toHand(game, "Fatal Grudge"), { sacrifice: construct });
    expect([...offered].sort()).toEqual([theirBears, theirRelic].sort());
    expect(zone(game, theirBears)).toBe("graveyard");
    expect(zone(game, theirRelic)).toBe("battlefield");
  });
});

describe("Torch Breath", () => {
  it("costs {2} less targeting a blue permanent, and deals X damage", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const crier = spawn(game, "Sky Crier", B); // white
    const blue = spawn(game, "Aven Wind Mage", B);
    const breath = toHand(game, "Torch Breath");
    expect(() => cast(game, breath, { targets: [ref(crier)], x: 3 })).toThrow(/cannot pay/);
    cast(game, breath, { targets: [ref(blue)], x: 3 });
    expect(zone(game, blue)).toBe("graveyard");
  });

  it("can't be countered", () => {
    const { game } = table();
    const def = game.registry.get("Torch Breath");
    expect(def.cantBeCountered).toBe(true);
  });
});

describe("Majestic Metamorphosis", () => {
  it("makes an artifact a 4/4 flying Angel artifact creature until end of turn, keeping its subtypes, and draws", () => {
    const { game } = table();
    const relic = spawn(game, "Darksteel Relic");
    lands(game, "Island", 3);
    const before = hand(game, A).length;
    cast(game, toHand(game, "Majestic Metamorphosis"), { targets: [ref(relic)] });
    expect(types(game, relic)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, relic)).toContain("Angel");
    expect(pt(game, relic)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, relic).has("flying")).toBe(true);
    expect(keywords(game, relic).has("indestructible")).toBe(true);
    expect(hand(game, A).length).toBe(before + 1);
    toStep(game, "upkeep", B);
    expect(types(game, relic)).not.toContain("creature");
  });

  it("replaces a creature's creature types with Angel", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 3);
    cast(game, toHand(game, "Majestic Metamorphosis"), { targets: [ref(bears)] });
    expect(subtypes(game, bears)).toEqual(["Angel"]);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Scuttling Butler", () => {
  it("gains double strike at your beginning of combat with two multicolored permanents", () => {
    const { game } = table();
    const butler = spawn(game, "Scuttling Butler");
    spawn(game, "Darling of the Masses");
    spawn(game, "Darling of the Masses", B);
    toStep(game, "begin-combat");
    settle(game);
    expect(keywords(game, butler).has("double-strike")).toBe(false);
    spawn(game, "Darling of the Masses");
    toStep(game, "begin-combat");
    settle(game);
    expect(keywords(game, butler).has("double-strike")).toBe(true);
  });
});

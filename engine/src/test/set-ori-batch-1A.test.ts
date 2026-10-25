/**
 * Magic Origins, group A. One test per clause most likely to be wrong:
 * Patron of the Valiant's counters-only filter, Graveblade Marauder's
 * graveyard count, Nissa's Revelation's power-and-toughness payoff,
 * Necromantic Summons' spell mastery, Faerie Miscreant's intervening if,
 * Infernal Scarring's granted dies trigger (whose controller draws, and the
 * simultaneous-destruction ruling), Hixus's entered-this-turn exile and
 * return, Despoiler of Souls' "two other" creature cards, Erebos's Titan's
 * graveyard trigger and static, Throwing Knife's sacrifice-then-damage and
 * Ramroller's "another artifact".
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
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
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
  zone,
} from "./harness.js";

describe("Patron of the Valiant", () => {
  it("puts a counter only on creatures you control that already have one", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const foe = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].counters["+1/+1"] = 1;
    game.state.objects[foe].counters["+1/+1"] = 1;
    enter(game, "Patron of the Valiant");
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, giant)).toBe(0);
    expect(counters(game, foe)).toBe(1);
  });
});

describe("Graveblade Marauder", () => {
  it("makes the damaged player lose life equal to the creature cards in your graveyard", () => {
    const { game, a } = table();
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Grizzly Bears", B);
    const marauder = spawn(game, "Graveblade Marauder");
    attack(game, a, [marauder]);
    expect(life(game, B)).toBe(20 - 1 - 2);
  });
});

describe("Nissa's Revelation", () => {
  it("draws cards equal to the revealed creature's power and gains its toughness in life", () => {
    const { game } = table();
    lands(game, "Forest", 7);
    toLibrary(game, "Hill Giant");
    const revelation = toHand(game, "Nissa's Revelation");
    const before = hand(game).length;
    cast(game, revelation);
    expect(hand(game).length).toBe(before - 1 + 3);
    expect(life(game)).toBe(23);
  });

  it("does nothing more when the top card isn't a creature", () => {
    const { game } = table();
    lands(game, "Forest", 7);
    toLibrary(game, "Lightning Bolt");
    const revelation = toHand(game, "Nissa's Revelation");
    const before = hand(game).length;
    cast(game, revelation);
    expect(hand(game).length).toBe(before - 1);
    expect(life(game)).toBe(20);
  });
});

describe("Necromantic Summons", () => {
  it("returns an opponent's creature under your control with two counters with spell mastery", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Lightning Bolt");
    const giant = toGraveyard(game, "Hill Giant", B);
    cast(game, toHand(game, "Necromantic Summons"), { targets: [ref(giant)] });
    const [returned] = named(game, "Hill Giant", A);
    expect(returned).toBeDefined();
    expect(counters(game, returned)).toBe(2);
  });

  it("adds no counters without spell mastery", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    toGraveyard(game, "Lightning Bolt");
    const giant = toGraveyard(game, "Hill Giant", B);
    cast(game, toHand(game, "Necromantic Summons"), { targets: [ref(giant)] });
    const [returned] = named(game, "Hill Giant", A);
    expect(returned).toBeDefined();
    expect(counters(game, returned)).toBe(0);
  });
});

describe("Faerie Miscreant", () => {
  it("draws only if you control another Faerie Miscreant", () => {
    const { game } = table();
    const before = hand(game).length;
    enter(game, "Faerie Miscreant");
    expect(hand(game).length).toBe(before);
    enter(game, "Faerie Miscreant");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Infernal Scarring", () => {
  it("gives +2/+0, and the enchanted creature's controller draws when it dies", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Infernal Scarring"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    const mine = hand(game).length;
    const theirs = hand(game, B).length;
    destroy(game, bears);
    expect(hand(game, B).length).toBe(theirs + 1);
    expect(hand(game).length).toBe(mine);
  });

  it("still draws when the Aura and the creature are destroyed together", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears");
    const scarring = toHand(game, "Infernal Scarring");
    cast(game, scarring, { targets: [ref(bears)] });
    const before = hand(game).length;
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { typesAnyOf: ["creature", "enchantment"] } }, []);
    settle(game);
    expect(zone(game, scarring)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Hixus, Prison Warden", () => {
  it("exiles a creature that dealt you combat damage the turn it entered, until it leaves", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    const hixus = enter(game, "Hixus, Prison Warden");
    attack(game, b, [bears], A);
    expect(life(game)).toBe(18);
    expect(named(game, "Grizzly Bears", B)).toHaveLength(0);
    destroy(game, hixus);
    expect(named(game, "Grizzly Bears", B)).toHaveLength(1);
  });

  it("doesn't exile once the turn it entered has passed", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    enter(game, "Hixus, Prison Warden");
    nextTurn(game);
    attack(game, b, [bears], A);
    expect(life(game)).toBe(18);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Despoiler of Souls", () => {
  it("returns by exiling two other creature cards, and can't count itself", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const despoiler = toGraveyard(game, "Despoiler of Souls");
    const bears = toGraveyard(game, "Grizzly Bears");
    expect(() => activate(game, despoiler, 0)).toThrow();
    const giant = toGraveyard(game, "Hill Giant");
    activate(game, despoiler, 0);
    expect(zone(game, despoiler)).toBe("battlefield");
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, giant)).toBe("exile");
  });
});

describe("Erebos's Titan", () => {
  it("returns to hand from your graveyard by discarding when a creature card leaves an opponent's graveyard", () => {
    const { game, a } = table();
    const titan = toGraveyard(game, "Erebos's Titan");
    toGraveyard(game, "Grizzly Bears", B);
    pickModes(a, 0);
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "exile-graveyard", target: 0 }, [ref(B)]);
    settle(game);
    expect(zone(game, titan)).toBe("hand");
    expect(hand(game).length).toBe(before); // one discarded, the Titan returned
    expect(graveyard(game)).toHaveLength(1);
  });

  it("has indestructible only while your opponents control no creatures", () => {
    const { game } = table();
    const titan = spawn(game, "Erebos's Titan");
    expect(keywords(game, titan).has("indestructible")).toBe(true);
    spawn(game, "Grizzly Bears", B);
    expect(keywords(game, titan).has("indestructible")).toBe(false);
  });
});

describe("Throwing Knife", () => {
  it("may be sacrificed as the equipped creature attacks to deal 2 damage", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const bears = spawn(game, "Grizzly Bears");
    const knife = spawn(game, "Throwing Knife");
    activate(game, knife, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    pickTargets(a, B);
    pickModes(a, 0);
    attack(game, a, [bears]);
    expect(zone(game, knife)).toBe("graveyard");
    expect(life(game, B)).toBe(20 - 2 - 2);
  });
});

describe("Ramroller", () => {
  it("gets +2/+0 only with another artifact", () => {
    const { game } = table();
    const ramroller = spawn(game, "Ramroller");
    expect(pt(game, ramroller)).toEqual({ power: 2, toughness: 3 });
    spawn(game, "Sol Ring");
    expect(pt(game, ramroller)).toEqual({ power: 4, toughness: 3 });
  });
});

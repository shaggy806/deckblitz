/**
 * Commander 2018 and Core Set 2019, group A: the clause of each card most
 * likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  named,
  nextTurn,
  pickFromZone,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Fury Storm", () => {
  it("is copied once per commander cast, and each copy copies the targeted spell", () => {
    const { game } = table();
    game.state.players[A].commanderCastCounts["Some Commander"] = 1;
    lands(game, "Mountain", 5);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Fury Storm"), { targets: [ref(bolt)] });
    // The Bolt, Fury Storm's copy of it, and the copy of Fury Storm's copy.
    expect(life(game, B)).toBe(20 - 3 * 3);
  });
});

describe("Empyrial Storm", () => {
  it("makes an Angel for itself and one for each commander cast", () => {
    const { game } = table();
    game.state.players[A].commanderCastCounts["Some Commander"] = 2;
    lands(game, "Plains", 6);
    cast(game, toHand(game, "Empyrial Storm"));
    expect(tokensNamed(game, "4/4 Angel Token", A)).toBe(3);
  });
});

describe("Heroic Reinforcements", () => {
  it("the new Soldiers get +1/+1 and haste too", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Heroic Reinforcements"));
    const soldiers = named(game, "Soldier Token", A);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(2);
    for (const s of soldiers) {
      expect(pt(game, s)).toEqual({ power: 2, toughness: 2 });
      expect(keywords(game, s).has("haste")).toBe(true);
    }
  });
});

describe("Volley Veteran", () => {
  it("deals damage equal to the Goblins you control, itself included", () => {
    const { game, a } = table();
    const lone = spawn(game, "Grizzly Bears", B);
    pickTargets(a, lone);
    enter(game, "Volley Veteran");
    expect(zone(game, lone)).toBe("battlefield");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Volley Veteran");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Patient Rebuilding", () => {
  it("draws one card for each land card the opponent milled", () => {
    const { game } = table({ deck: "Grizzly Bears" });
    spawn(game, "Patient Rebuilding");
    nextTurn(game); // bob's turn: he has drawn already
    toLibrary(game, "Forest", B);
    toLibrary(game, "Grizzly Bears", B);
    toLibrary(game, "Forest", B);
    toGraveyard(game, "Forest", B); // already there: not milled this way
    const before = hand(game, A).length;
    toStep(game, "precombat-main");
    expect(graveyard(game, B).length).toBe(4);
    // The draw step's card, then one for each of the two Forests.
    expect(hand(game, A).length).toBe(before + 1 + 2);
  });
});

describe("Ajani, Wise Counselor", () => {
  it("+2 gains 1 life per creature; −9 puts counters equal to your life total", () => {
    const { game } = table();
    const ajani = spawn(game, "Ajani, Wise Counselor");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    loyalty(game, ajani, 2);
    expect(life(game)).toBe(22);
    const ajani2 = spawn(game, "Ajani, Wise Counselor");
    loyalty(game, ajani2, -9, { atLeast: 9, targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(22);
  });
});

describe("Ajani's Influence", () => {
  it("offers only a white card from the top five", () => {
    const { game, a } = table();
    const target = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 4);
    const green = toLibrary(game, "Grizzly Bears");
    const white = toLibrary(game, "Savannah Lions");
    const seen = pickFromZone(a, white);
    cast(game, toHand(game, "Ajani's Influence"), { targets: [ref(target)] });
    expect(counters(game, target)).toBe(2);
    expect(seen.offered).toContain(white);
    expect(seen.offered).not.toContain(green);
    expect(zone(game, white)).toBe("hand");
    expect(zone(game, green)).toBe("library");
  });
});

describe("Graveyard Marshal", () => {
  it("exiles a creature card, never another card, for a tapped Zombie", () => {
    const { game } = table();
    const marshal = spawn(game, "Graveyard Marshal");
    lands(game, "Swamp", 3);
    const land = toGraveyard(game, "Forest");
    const creature = toGraveyard(game, "Grizzly Bears");
    activate(game, marshal, 0);
    expect(zone(game, creature)).toBe("exile");
    expect(zone(game, land)).toBe("graveyard");
    const [zombie] = named(game, "Zombie Token", A);
    expect(game.state.objects[zombie].tapped).toBe(true);
  });
});

describe("Talons of Wildwood", () => {
  it("returns from the graveyard to the hand", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const talons = toGraveyard(game, "Talons of Wildwood");
    activate(game, talons, 0);
    expect(zone(game, talons)).toBe("hand");
  });
});

describe("Gearsmith Guardian", () => {
  it("gets +2/+0 only while you control a blue creature", () => {
    const { game } = table();
    const guardian = spawn(game, "Gearsmith Guardian");
    expect(pt(game, guardian)).toEqual({ power: 3, toughness: 5 });
    spawn(game, "Supreme Phantom", B);
    expect(pt(game, guardian)).toEqual({ power: 3, toughness: 5 });
    spawn(game, "Supreme Phantom");
    expect(pt(game, guardian)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Arisen Gorgon", () => {
  it("has deathtouch only with a Liliana planeswalker", () => {
    const { game } = table();
    const gorgon = spawn(game, "Arisen Gorgon");
    spawn(game, "Ajani, Wise Counselor");
    expect(keywords(game, gorgon).has("deathtouch")).toBe(false);
    spawn(game, "Liliana Vess");
    expect(keywords(game, gorgon).has("deathtouch")).toBe(true);
  });
});

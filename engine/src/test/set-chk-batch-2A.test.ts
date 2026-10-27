import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  cast,
  settle,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickPermanents,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

// Champions of Kamigawa (CHK), batch 212 group A.

describe("Thief of Hope", () => {
  it("drains a target opponent for 1 when you cast a Spirit spell", () => {
    const { game, a } = table();
    spawn(game, "Thief of Hope");
    lands(game, "Plains", 3);
    a.chooseTargetsFn = () => [ref(B)];
    cast(game, toHand(game, "Waxmane Baku"));
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
  });
});

describe("Kodama of the South Tree", () => {
  it("pumps and grants trample to each other creature you control, not itself", () => {
    const { game } = table();
    const kodama = spawn(game, "Kodama of the South Tree");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Waxmane Baku"));
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(pt(game, kodama)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, kodama).has("trample")).toBe(false);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Devouring Rage", () => {
  it("gives +3/+0 plus +3/+0 for each Spirit sacrificed as it's cast", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const bears = spawn(game, "Grizzly Bears");
    const spirits = [spawn(game, "Waxmane Baku"), spawn(game, "Waxmane Baku")];
    cast(game, toHand(game, "Devouring Rage"), { x: 2, targets: [ref(bears)] });
    expect(spirits.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard"]);
    expect(pt(game, bears)).toEqual({ power: 11, toughness: 2 });
  });
});

describe("Soratami Seer", () => {
  it("returns two lands as its cost, then discards the hand and draws that many", () => {
    const { game, a } = table();
    const seer = spawn(game, "Soratami Seer");
    const islands = lands(game, "Island", 6);
    pickPermanents(a, islands[4], islands[5]);
    const handBefore = hand(game).length;
    const graveBefore = graveyard(game).length;
    activate(game, seer, 0);
    // The two returned lands were in hand when it resolved, so were discarded too.
    expect(zone(game, islands[4])).toBe("graveyard");
    expect(zone(game, islands[5])).toBe("graveyard");
    expect(graveyard(game).length).toBe(graveBefore + handBefore + 2);
    expect(hand(game).length).toBe(handBefore + 2);
  });
});

describe("Kitsune Riftwalker", () => {
  it("can't be targeted by an Arcane spell, but can by a non-Arcane one", () => {
    const { game } = table();
    const fox = spawn(game, "Kitsune Riftwalker");
    lands(game, "Swamp", 3);
    expect(() => cast(game, toHand(game, "Swallowing Plague"), { x: 1, targets: [ref(fox)] })).toThrow();
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Heat Ray"), { x: 1, targets: [ref(fox)] });
    expect(zone(game, fox)).toBe("graveyard");
  });
});

describe("Villainous Ogre", () => {
  it("has its regeneration ability only while you control a Demon", () => {
    const { game } = table();
    const ogre = spawn(game, "Villainous Ogre");
    lands(game, "Swamp", 2);
    expect(() => activate(game, ogre, 0)).toThrow();
    spawn(game, "Abhorrent Overlord");
    activate(game, ogre, 0);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(ogre)]);
    settle(game);
    expect(zone(game, ogre)).toBe("battlefield");
  });
});

describe("Feral Deceiver", () => {
  it("gets +2/+2 and trample when the revealed top card is a land", () => {
    const { game } = table();
    const deceiver = spawn(game, "Feral Deceiver");
    lands(game, "Forest", 2);
    toLibrary(game, "Forest");
    activate(game, deceiver, 1);
    expect(pt(game, deceiver)).toEqual({ power: 5, toughness: 4 });
    expect(keywords(game, deceiver).has("trample")).toBe(true);
  });

  it("does nothing when the revealed card isn't a land", () => {
    const { game } = table();
    const deceiver = spawn(game, "Feral Deceiver");
    lands(game, "Forest", 2);
    const top = toLibrary(game, "Grizzly Bears");
    activate(game, deceiver, 1);
    expect(pt(game, deceiver)).toEqual({ power: 3, toughness: 2 });
    expect(zone(game, top)).toBe("library");
  });
});

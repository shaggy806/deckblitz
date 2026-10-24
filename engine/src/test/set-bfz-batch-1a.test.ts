/**
 * Battle for Zendikar, group A: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Rally (Kor Bladewhirl)", () => {
  it("triggers on another Ally entering, not on a non-Ally", () => {
    const { game } = table();
    spawn(game, "Kor Bladewhirl");
    const bears = spawn(game, "Grizzly Bears");
    enter(game, "Grizzly Bears");
    expect(keywords(game, bears).has("first-strike")).toBe(false);
    enter(game, "Reckless Cohort");
    expect(keywords(game, bears).has("first-strike")).toBe(true);
  });

  it("triggers on itself entering", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    enter(game, "Kor Bladewhirl");
    expect(keywords(game, bears).has("first-strike")).toBe(true);
  });
});

describe("Reckless Cohort", () => {
  it("attacks if able while you control no other Ally", () => {
    const { game, a } = table();
    const cohort = spawn(game, "Reckless Cohort");
    a.declareAttackersFn = () => [];
    toStep(game, "postcombat-main");
    expect(game.state.objects[cohort].attackedThisTurn).toBe(true);
  });

  it("isn't forced to attack beside another Ally", () => {
    const { game, a } = table();
    const cohort = spawn(game, "Reckless Cohort");
    spawn(game, "Kor Bladewhirl");
    a.declareAttackersFn = () => [];
    toStep(game, "postcombat-main");
    expect(game.state.objects[cohort].attackedThisTurn ?? false).toBe(false);
  });
});

describe("Angelic Captain", () => {
  it("gets +1/+1 for each other attacking Ally", () => {
    const { game, a } = table();
    const captain = spawn(game, "Angelic Captain");
    const allies = [spawn(game, "Kor Bladewhirl"), spawn(game, "Reckless Cohort")];
    spawn(game, "Grizzly Bears");
    attack(game, a, [captain, ...allies]);
    expect(pt(game, captain)).toEqual({ power: 6, toughness: 5 });
  });
});

describe("Ruination Guide", () => {
  it("pumps other colorless creatures and ingests", () => {
    const { game, a } = table();
    const guide = spawn(game, "Ruination Guide");
    const scion = spawn(game, "Eldrazi Scion Token");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, guide)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, scion)).toEqual({ power: 2, toughness: 1 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    const top = game.state.zones.perPlayer[B].library[0]!;
    attack(game, a, [guide]);
    expect(life(game, B)).toBe(17);
    expect(zone(game, top)).toBe("exile");
  });
});

describe("Ugin's Insight", () => {
  it("scries the greatest mana value among your permanents, then draws three", () => {
    const { game, a } = table();
    spawn(game, "Hill Giant");
    lands(game, "Island", 5);
    let looked = -1;
    a.chooseScryFn = (_view, cards) => {
      looked = cards.length;
      return [];
    };
    const insight = toHand(game, "Ugin's Insight");
    const before = hand(game).length;
    cast(game, insight);
    expect(looked).toBe(4);
    expect(hand(game).length).toBe(before - 1 + 3);
  });
});

describe("Serpentine Spike", () => {
  it("deals 2, 3 and 4, and exiles a creature it damaged that dies later this turn", () => {
    const { game } = table();
    lands(game, "Mountain", 7);
    const giant = spawn(game, "Hill Giant", B);
    const bears1 = spawn(game, "Grizzly Bears", B);
    const bears2 = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Serpentine Spike"), { targets: [ref(giant), ref(bears1), ref(bears2)] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(2);
    expect(zone(game, bears1)).toBe("exile");
    expect(zone(game, bears2)).toBe("exile");
    destroy(game, giant);
    expect(zone(game, giant)).toBe("exile");
    expect(graveyard(game, B)).toHaveLength(0);
  });
});

describe("Tandem Tactics", () => {
  it("gains the life when cast with no targets", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Tandem Tactics"), { targets: [null, null] });
    expect(life(game, A)).toBe(22);
  });

  it("gives up to two creatures +1/+2", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Tandem Tactics"), { targets: [ref(x), ref(y)] });
    expect(pt(game, x)).toEqual({ power: 3, toughness: 4 });
    expect(pt(game, y)).toEqual({ power: 3, toughness: 4 });
    expect(life(game, A)).toBe(22);
  });
});

describe("Akoum Stonewaker", () => {
  it("pays {2}{R} on landfall for a 3/1 that's exiled at the next end step", () => {
    const { game, a } = table();
    spawn(game, "Akoum Stonewaker");
    lands(game, "Mountain", 3);
    pickModes(a, 0);
    enter(game, "Mountain");
    expect(tokensNamed(game, "3/1 Red Elemental Token", A)).toBe(1);
    nextTurn(game);
    expect(tokensNamed(game, "3/1 Red Elemental Token", A)).toBe(0);
  });

  it("makes nothing when you decline", () => {
    const { game, a } = table();
    spawn(game, "Akoum Stonewaker");
    lands(game, "Mountain", 3);
    pickModes(a);
    enter(game, "Mountain");
    expect(tokensNamed(game, "3/1 Red Elemental Token", A)).toBe(0);
  });
});

describe("Skitterskin", () => {
  it("regenerates only while you control another colorless creature", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const skitterskin = spawn(game, "Skitterskin");
    expect(() => activate(game, skitterskin)).toThrow();
    spawn(game, "Eldrazi Scion Token");
    activate(game, skitterskin);
    destroy(game, skitterskin);
    expect(zone(game, skitterskin)).toBe("battlefield");
  });
});

describe("Deathless Behemoth", () => {
  it("returns from your graveyard to your hand for two Eldrazi Scions", () => {
    const { game } = table();
    const behemoth = toGraveyard(game, "Deathless Behemoth");
    spawn(game, "Eldrazi Scion Token");
    expect(() => activate(game, behemoth)).toThrow();
    spawn(game, "Eldrazi Scion Token");
    activate(game, behemoth);
    expect(zone(game, behemoth)).toBe("hand");
    expect(tokensNamed(game, "Eldrazi Scion Token", A)).toBe(0);
  });
});

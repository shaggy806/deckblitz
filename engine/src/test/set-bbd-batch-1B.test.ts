/**
 * Battlebond, group B: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  attack,
  cast,
  enter,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  spawn,
  subtypes,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Virtus the Veiled", () => {
  it("combat damage to a player makes them lose half their life, rounded up", () => {
    const { game, a } = table();
    const virtus = spawn(game, "Virtus the Veiled");
    attack(game, a, [virtus]);
    // 20 - 1 combat damage = 19; half of 19 rounded up is 10.
    expect(life(game, B)).toBe(9);
  });
});

describe("Azra Oddsmaker", () => {
  it("discarding a card makes the chosen creature's combat damage draw two cards", () => {
    const { game, a } = table();
    spawn(game, "Azra Oddsmaker");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    const seen = pickPermanents(a, bears);
    const before = hand(game).length;
    attack(game, a, [bears]);
    expect(seen.offered).toContain(bears);
    expect(hand(game).length).toBe(before - 1 + 2);
  });

  it("declining the discard chooses nothing and draws nothing", () => {
    const { game, a } = table();
    spawn(game, "Azra Oddsmaker");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a);
    const before = hand(game).length;
    attack(game, a, [bears]);
    expect(hand(game).length).toBe(before);
  });
});

describe("Thrasher Brute", () => {
  it("triggers on itself and on another Warrior, not on a non-Warrior", () => {
    const { game, a } = table();
    pickTargets(a, B);
    enter(game, "Thrasher Brute");
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
    enter(game, "Grizzly Bears");
    expect(life(game, B)).toBe(19);
    enter(game, "Warrior Token");
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });
});

describe("Inner Demon", () => {
  it("makes the enchanted creature a 4/4 flying Demon and shrinks every non-Demon creature", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 4);
    pickTargets(a, mine);
    cast(game, toHand(game, "Inner Demon"), { targets: [{ kind: "object", object: mine }] });
    expect(pt(game, mine)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, mine).has("flying")).toBe(true);
    expect(subtypes(game, mine)).toContain("Demon");
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("Impetuous Protege", () => {
  it("gets +X/+0 for the greatest power among tapped creatures opponents control", () => {
    const { game, a } = table();
    const protege = spawn(game, "Impetuous Protege");
    spawn(game, "Grizzly Bears", B, { tapped: true });
    spawn(game, "Turret Ogre", B);
    spawn(game, "Turret Ogre", A, { tapped: true });
    attack(game, a, [protege]);
    expect(pt(game, protege)).toEqual({ power: 2, toughness: 4 });
  });
});

describe("Nimbus Champion", () => {
  it("returns the target only if its power is at most the number of Warriors you control", () => {
    const { game, a } = table();
    const champion = spawn(game, "Nimbus Champion");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    attack(game, a, [champion]);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("with a second Warrior, a 2-power creature goes back", () => {
    const { game, a } = table();
    const champion = spawn(game, "Nimbus Champion");
    spawn(game, "Sickle Dancer");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    attack(game, a, [champion]);
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Sickle Dancer and Rushblade Commander", () => {
  it("Sickle Dancer gets +1/+1 only with another Warrior; Rushblade gives Warriors haste", () => {
    const { game, a } = table();
    const lone = spawn(game, "Sickle Dancer");
    attack(game, a, [lone]);
    expect(pt(game, lone)).toEqual({ power: 3, toughness: 2 });

    const { game: g2, a: a2 } = table();
    const dancer = spawn(g2, "Sickle Dancer", A, { sick: true });
    const bears = spawn(g2, "Grizzly Bears", A, { sick: true });
    spawn(g2, "Rushblade Commander");
    expect(keywords(g2, dancer).has("haste")).toBe(true);
    expect(keywords(g2, bears).has("haste")).toBe(false);
    attack(g2, a2, [dancer]);
    expect(pt(g2, dancer)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Regna, the Redeemer", () => {
  it("makes two Warriors at the end step only if you gained life this turn", () => {
    const { game } = table();
    spawn(game, "Regna, the Redeemer");
    nextTurn(game);
    expect(tokensNamed(game, "Warrior Token", A)).toBe(0);

    const { game: g2 } = table();
    spawn(g2, "Regna, the Redeemer");
    g2.debugApplyEffect(A, { kind: "gain-life", amount: 1 }, []);
    nextTurn(g2);
    expect(tokensNamed(g2, "Warrior Token", A)).toBe(2);
  });
});

/**
 * Shadowmoor (SHM), batch 2, group C — the clauses most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import { computeCharacteristics } from "../characteristics.js";
import {
  A,
  B,
  cast,
  controller,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Dawnglow Infusion", () => {
  it("gains X with only {G} spent", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Dawnglow Infusion"), { x: 3 });
    expect(life(game)).toBe(23);
  });

  it("gains X + X in one gain with {G} and {W} spent", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Plains", 2);
    const pridemate = spawn(game, "Ajani's Pridemate");
    cast(game, toHand(game, "Dawnglow Infusion"), { x: 3 });
    expect(life(game)).toBe(26);
    expect(counters(game, pridemate)).toBe(1);
  });
});

describe("Repel Intruders", () => {
  it("with only {W} spent makes two Kithkin Soldiers and leaves the creature spell alone", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    cast(game, toHand(game, "Repel Intruders"), { targets: [ref(bears)] });
    expect(tokensNamed(game, "Kithkin Soldier Token", A)).toBe(2);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("with {U} spent counters the targeted creature spell and makes no tokens without {W}", () => {
    const { game } = table();
    lands(game, "Island", 4);
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    cast(game, toHand(game, "Repel Intruders"), { targets: [ref(bears)] });
    expect(tokensNamed(game, "Kithkin Soldier Token", A)).toBe(0);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Tyrannize", () => {
  it("discards the target's whole hand unless they pay 7 life", () => {
    const { game, b } = table();
    lands(game, "Swamp", 5);
    pickModes(b); // pay nothing
    cast(game, toHand(game, "Tyrannize"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(0);
    expect(life(game, B)).toBe(20);
  });

  it("keeps the hand when they pay 7 life", () => {
    const { game, b } = table();
    lands(game, "Swamp", 5);
    const before = hand(game, B).length;
    pickModes(b, 0); // pay 7 life
    cast(game, toHand(game, "Tyrannize"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before);
    expect(life(game, B)).toBe(13);
  });
});

describe("Briarberry Cohort", () => {
  it("gets +1/+1 only with another blue creature", () => {
    const { game } = table();
    const cohort = spawn(game, "Briarberry Cohort");
    expect(pt(game, cohort)).toEqual({ power: 1, toughness: 1 });
    spawn(game, "Briarberry Cohort", B);
    expect(pt(game, cohort)).toEqual({ power: 1, toughness: 1 });
    spawn(game, "Merfolk of the Pearl Trident");
    expect(pt(game, cohort)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Biting Tether", () => {
  it("steals the creature and shrinks it each of your upkeeps", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Island", 5);
    pickTargets(a, giant);
    cast(game, toHand(game, "Biting Tether"), { targets: [ref(giant)] });
    expect(controller(game, giant)).toBe(A);
    nextTurn(game); // bob's
    expect(counters(game, giant, "-1/-1")).toBe(0);
    nextTurn(game); // alice's
    expect(counters(game, giant, "-1/-1")).toBe(1);
  });
});

describe("Smolder Initiate", () => {
  it("makes the targeted player lose 1 life when its controller pays {1} for a black spell", () => {
    const { game, a } = table();
    spawn(game, "Smolder Initiate");
    lands(game, "Swamp", 2);
    pickTargets(a, B);
    pickModes(a, 0);
    cast(game, toHand(game, "Dark Ritual"));
    expect(life(game, B)).toBe(19);
  });
});

describe("Tattermunge Duo", () => {
  it("a red-green spell gives both +1/+1 and forestwalk", () => {
    const { game } = table();
    const duo = spawn(game, "Tattermunge Duo");
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Tattermunge Duo"));
    expect(pt(game, duo)).toEqual({ power: 3, toughness: 4 });
    expect(keywords(game, duo).has("forestwalk")).toBe(true);
  });
});

describe("Put Away", () => {
  it("counters the spell and shuffles the targeted graveyard card into the library", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    lands(game, "Forest", 2);
    const card = toGraveyard(game, "Grizzly Bears");
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    pickModes(a, 0);
    cast(game, toHand(game, "Put Away"), { targets: [ref(bears), ref(card)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, card)).toBe("library");
    expect(graveyard(game).includes(card)).toBe(false);
  });
});

describe("Poison the Well", () => {
  it("destroys the land and deals 2 damage to its controller", () => {
    const { game } = table();
    const [forest] = lands(game, "Forest", 1, B);
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Poison the Well"), { targets: [ref(forest)] });
    expect(zone(game, forest)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });
});

describe("Prismwake Merrow", () => {
  it("makes the target permanent the chosen colours until end of turn", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 5); // the first two-colour mode: White, Blue
    enter(game, "Prismwake Merrow");
    settle(game);
    expect([...computeCharacteristics(game.state, registryOf(game), bears).colors]).toEqual(["W", "U"]);
    nextTurn(game);
    expect([...computeCharacteristics(game.state, registryOf(game), bears).colors]).toEqual(["G"]);
  });
});

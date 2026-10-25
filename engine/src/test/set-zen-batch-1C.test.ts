/**
 * Zendikar (ZEN; B165) — group c: Allies, quests, kicker and the old
 * two-trigger exile.
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
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Journey to Nowhere", () => {
  it("exiles a creature and returns it when it leaves", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const journey = enter(game, "Journey to Nowhere");
    expect(zone(game, bears)).toBe("exile");
    destroy(game, journey);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(B);
  });
});

describe("Kor Skyfisher", () => {
  it("returns a permanent you control, itself among the choices", () => {
    const { game, a } = table();
    const [island] = lands(game, "Island", 1);
    const seen = pickPermanents(a, island);
    const before = hand(game).length;
    const fisher = enter(game, "Kor Skyfisher");
    expect(seen.offered).toContain(fisher);
    expect(zone(game, island)).toBe("hand");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Nissa Revane", () => {
  it("the second +1 gains 2 life for each Elf you control, only yours", () => {
    const { game } = table();
    spawn(game, "Llanowar Elves");
    spawn(game, "Llanowar Elves");
    spawn(game, "Llanowar Elves", B);
    const nissa = spawn(game, "Nissa Revane");
    game.state.objects[nissa].counters.loyalty = 2;
    activate(game, nissa, 1);
    expect(life(game)).toBe(24);
  });
});

describe("Hagra Diabolist", () => {
  it("another Ally entering makes target player lose life per Ally", () => {
    const { game, a } = table();
    spawn(game, "Hagra Diabolist");
    pickTargets(a, B);
    pickModes(a, 0);
    enter(game, "Nimana Sell-Sword");
    expect(life(game, B)).toBe(18);
  });
});

describe("Kalitas, Bloodchief of Ghet", () => {
  it("destroys a creature and makes a Vampire of its size", () => {
    const { game } = table();
    const kalitas = spawn(game, "Kalitas, Bloodchief of Ghet");
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, kalitas, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "X/X Vampire Token (Black)", A)).toBe(1);
    const [token] = Object.values(game.state.objects).filter(
      (o) => o.cardName === "X/X Vampire Token (Black)" && o.zone === "battlefield",
    );
    expect(pt(game, token.id)).toEqual({ power: 2, toughness: 2 });
  });

  it("makes no token when the creature doesn't die", () => {
    const { game } = table();
    const kalitas = spawn(game, "Kalitas, Bloodchief of Ghet");
    lands(game, "Swamp", 3);
    const myr = spawn(game, "Darksteel Myr", B);
    activate(game, kalitas, 0, { targets: [ref(myr)] });
    expect(zone(game, myr)).toBe("battlefield");
    expect(tokensNamed(game, "X/X Vampire Token (Black)")).toBe(0);
  });
});

describe("Sunspring Expedition", () => {
  it("three quest counters and a sacrifice gain 8 life", () => {
    const { game, a } = table();
    const exp = spawn(game, "Sunspring Expedition");
    pickModes(a, 0);
    enter(game, "Plains");
    enter(game, "Plains");
    enter(game, "Plains");
    expect(counters(game, exp, "quest")).toBe(3);
    activate(game, exp, 0);
    expect(zone(game, exp)).toBe("graveyard");
    expect(life(game)).toBe(28);
  });
});

describe("Vampire's Bite", () => {
  it("kicked, adds lifelink to the +3/+0", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Vampire's Bite"), { targets: [ref(bears)], kicked: true });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
    expect(keywords(game, bears).has("lifelink")).toBe(true);
  });

  it("unkicked, no lifelink", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Vampire's Bite"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
    expect(keywords(game, bears).has("lifelink")).toBe(false);
  });
});

describe("Guul Draz Vampire", () => {
  it("is a 3/2 with intimidate while an opponent is at 10 or less", () => {
    const { game } = table();
    const vamp = spawn(game, "Guul Draz Vampire");
    expect(pt(game, vamp)).toEqual({ power: 1, toughness: 1 });
    game.state.players[B].life = 10;
    expect(pt(game, vamp)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, vamp).has("intimidate")).toBe(true);
  });
});

describe("Makindi Shieldmate", () => {
  it("grows when another Ally enters", () => {
    const { game, a } = table();
    const mate = spawn(game, "Makindi Shieldmate");
    pickModes(a, 0);
    enter(game, "Tuktuk Grunts");
    expect(counters(game, mate)).toBe(1);
  });
});

describe("Quest for the Gemblades", () => {
  it("a creature dealing combat damage to a creature adds a quest counter; cashing it in gives four counters", () => {
    const { game, a, b } = table();
    const quest = spawn(game, "Quest for the Gemblades");
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Darksteel Myr", B);
    pickModes(a, 0);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: bears }];
    attack(game, a, [bears]);
    expect(counters(game, quest, "quest")).toBe(1);
    activate(game, quest, 0, { targets: [ref(bears)] });
    expect(zone(game, quest)).toBe("graveyard");
    expect(counters(game, bears)).toBe(4);
  });
});

describe("Bold Defense", () => {
  it("kicked, creatures you control get +2/+2 and first strike instead", () => {
    const { game } = table();
    lands(game, "Plains", 7);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Bold Defense"), { kicked: true });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

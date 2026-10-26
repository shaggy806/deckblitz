/**
 * Return to Ravnica, group C: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
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
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Wild Beastmaster", () => {
  it("gives each other creature you control +X/+X, X its power", () => {
    const { game, a } = table();
    const master = spawn(game, "Wild Beastmaster");
    game.state.objects[master].counters["+1/+1"] = 2;
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    attack(game, a, [master]);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, master)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Stab Wound", () => {
  it("shrinks the creature and its controller loses 2 life at their upkeep", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Stab Wound"), { targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
    nextTurn(game);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });
});

describe("Korozda Guildmage", () => {
  it("makes Saprolings equal to the sacrificed creature's toughness", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Forest", 2);
    const mage = spawn(game, "Korozda Guildmage");
    const giant = spawn(game, "Hill Giant");
    game.dispatch({ type: "activate-ability", player: A, source: mage, abilityIndex: 1, targets: [], sacrifice: giant });
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(tokensNamed(game, "Saproling Token", A)).toBe(3);
  });
});

describe("Cryptborn Horror", () => {
  it("enters with counters equal to the life opponents lost this turn", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    const horror = enter(game, "Cryptborn Horror");
    expect(counters(game, horror)).toBe(3);
    expect(pt(game, horror)).toEqual({ power: 3, toughness: 3 });
  });

  it("dies with no counters when no opponent lost life", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const horror = toHand(game, "Cryptborn Horror");
    cast(game, horror);
    expect(zone(game, horror)).toBe("graveyard");
  });
});

describe("Essence Backlash", () => {
  it("counters the creature spell and deals its power to its controller", () => {
    const { game } = table();
    lands(game, "Mountain", 8);
    lands(game, "Island", 4);
    const giant = toHand(game, "Hill Giant");
    cast(game, giant, { settle: false });
    cast(game, toHand(game, "Essence Backlash"), { targets: [ref(giant)] });
    expect(graveyard(game)).toContain(giant);
    expect(life(game, A)).toBe(17);
  });
});

describe("Slime Molding", () => {
  it("makes an X/X Ooze", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Slime Molding"), { x: 3 });
    const [ooze] = named(game, "Ooze Token (Convert to Slime)", A);
    expect(pt(game, ooze)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Downsize", () => {
  it("overloaded, gives each creature you don't control -4/-0", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const x = spawn(game, "Hill Giant", B);
    const y = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Downsize"), { overload: true });
    expect(pt(game, x)).toEqual({ power: -1, toughness: 3 });
    expect(pt(game, y)).toEqual({ power: -2, toughness: 2 });
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Skymark Roc", () => {
  it("may bounce a defending creature with toughness 2 or less", () => {
    const { game, a } = table();
    const roc = spawn(game, "Skymark Roc");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    attack(game, a, [roc]);
    expect(hand(game, B)).toContain(bears);
  });
});

describe("Ogre Jailbreaker", () => {
  it("attacks while you control a Gate", () => {
    const { game, a } = table();
    spawn(game, "Azorius Guildgate");
    const ogre = spawn(game, "Ogre Jailbreaker");
    attack(game, a, [ogre]);
    expect(life(game, B)).toBe(16);
  });
});

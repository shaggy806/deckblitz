/**
 * Prophecy (PCY; B222), group C. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  hand,
  lands,
  life,
  nextTurn,
  pickModes,
  pt,
  ref,
  enter,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Squirrel Wrangler", () => {
  it("makes two Squirrels, and pumps every Squirrel creature, an opponent's included, until end of turn", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const [spareA, spareB] = lands(game, "Plains", 2);
    const wrangler = spawn(game, "Squirrel Wrangler");
    const sacrificing = (abilityIndex: number, land: typeof spareA): void => {
      game.dispatch({ type: "activate-ability", player: A, source: wrangler, abilityIndex, targets: [], sacrifice: land } as Action);
      settle(game);
    };
    sacrificing(0, spareA);
    expect(zone(game, spareA)).toBe("graveyard");
    expect(tokensNamed(game, "Squirrel Token", A)).toBe(2);
    const theirs = spawn(game, "Squirrel Token", B);
    const bear = spawn(game, "Grizzly Bears");
    sacrificing(1, spareB);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 2 });
    nextTurn(game);
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Reveille Squad", () => {
  it("may untap your creatures when you're attacked, only while it is untapped", () => {
    const { game, a, b } = table();
    spawn(game, "Reveille Squad");
    const tired = spawn(game, "Grizzly Bears", A, { tapped: true });
    const raider = spawn(game, "Grizzly Bears", B);
    nextTurn(game); // bob's turn
    pickModes(a, 0);
    attack(game, b, [raider], A);
    expect(game.state.objects[tired].tapped).toBe(false);
  });

  it("does nothing while it is tapped", () => {
    const { game, a, b } = table();
    spawn(game, "Reveille Squad", A, { tapped: true });
    const tired = spawn(game, "Grizzly Bears", A, { tapped: true });
    const raider = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    pickModes(a, 0);
    attack(game, b, [raider], A);
    expect(game.state.objects[tired].tapped).toBe(true);
  });
});

describe("Fickle Efreet", () => {
  it("flips once at end of combat, and a lost flip hands it to an opponent", () => {
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      const { game, a } = table({ seed });
      const efreet = spawn(game, "Fickle Efreet");
      attack(game, a, [efreet]);
      expect(life(game, B)).toBe(15);
      const flips = game.eventsOfType("coin-flipped");
      expect(flips).toHaveLength(1);
      expect(flips[0].player).toBe(A);
      expect(controller(game, efreet)).toBe(flips[0].won ? A : B);
    }
  });
});

describe("Inflame", () => {
  it("deals 2 damage only to creatures dealt damage this turn", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const hurt = spawn(game, "Hill Giant", B);
    const fresh = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Shock"), { targets: [ref(hurt)] });
    cast(game, toHand(game, "Inflame"));
    expect(zone(game, hurt)).toBe("graveyard");
    expect(zone(game, fresh)).toBe("battlefield");
    expect(game.state.objects[fresh].damageMarked ?? 0).toBe(0);
  });
});

describe("Thresher Beast", () => {
  it("makes the defending player sacrifice a land when it becomes blocked", () => {
    const { game, a, b } = table();
    const beast = spawn(game, "Thresher Beast");
    const [forest] = lands(game, "Forest", 1, B);
    const wall = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: beast }];
    attack(game, a, [beast]);
    expect(zone(game, forest)).toBe("graveyard");
  });
});

describe("Death Charmer", () => {
  it("makes the damaged creature's controller lose 2 life unless they pay {2}", () => {
    const { game, a, b } = table();
    const charmer = spawn(game, "Death Charmer");
    const wall = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: charmer }];
    pickModes(b); // don't pay
    attack(game, a, [charmer]);
    expect(life(game, B)).toBe(18);
  });

  it("costs them nothing in life when they pay", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 2, B);
    const charmer = spawn(game, "Death Charmer");
    const wall = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: charmer }];
    pickModes(b, 0); // pay
    attack(game, a, [charmer]);
    expect(life(game, B)).toBe(20);
  });
});

describe("Rhystic Syphon", () => {
  it("drains 5 unless the target player pays {3}", () => {
    const { game, b } = table();
    lands(game, "Swamp", 10);
    pickModes(b);
    cast(game, toHand(game, "Rhystic Syphon"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(15);
    expect(life(game, A)).toBe(25);
    lands(game, "Swamp", 3, B);
    pickModes(b, 0);
    cast(game, toHand(game, "Rhystic Syphon"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(15);
    expect(life(game, A)).toBe(25);
  });
});

describe("Flay", () => {
  it("discards one at random, and another unless they pay {1}", () => {
    const { game, b } = table();
    lands(game, "Swamp", 8);
    const before = hand(game, B).length;
    pickModes(b);
    cast(game, toHand(game, "Flay"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before - 2);
    lands(game, "Swamp", 1, B);
    pickModes(b, 0);
    cast(game, toHand(game, "Flay"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before - 3);
  });
});

describe("Greel, Mind Raker", () => {
  it("discards two to make the target discard X at random", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const greel = spawn(game, "Greel, Mind Raker");
    const mine = hand(game, A).length;
    const theirs = hand(game, B).length;
    activate(game, greel, 0, { targets: [ref(B)], x: 2 });
    expect(hand(game, A).length).toBe(mine - 2);
    expect(hand(game, B).length).toBe(theirs - 2);
  });
});

describe("Silt Crawler and Scoria Cat", () => {
  it("Silt Crawler taps your lands, and Scoria Cat grows with no untapped land", () => {
    const { game } = table();
    const forests = lands(game, "Forest", 2);
    const theirs = lands(game, "Forest", 1, B);
    const cat = spawn(game, "Scoria Cat");
    expect(pt(game, cat)).toEqual({ power: 3, toughness: 3 });
    enter(game, "Silt Crawler");
    expect(forests.every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(game.state.objects[theirs[0]].tapped).toBe(false);
    expect(pt(game, cat)).toEqual({ power: 6, toughness: 6 });
  });
});

/**
 * Ravnica: City of Guilds (RAV), batch 1, group A (2026-10-27). Written on
 * the shared table in `harness.ts`, each from the card's Oracle text.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  tokensNamed,
  toStep,
  zone,
} from "./harness.js";

describe("Hunted Phantasm", () => {
  it("the targeted opponent creates the five Goblins", () => {
    const { game, a } = table();
    pickTargets(a, B);
    enter(game, "Hunted Phantasm");
    expect(tokensNamed(game, "Goblin Token", B)).toBe(5);
    expect(tokensNamed(game, "Goblin Token", A)).toBe(0);
  });
});

describe("Flame Fusillade", () => {
  it("a noncreature permanent you control gains the ping, fresh or not", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const kismet = spawn(game, "Kismet", A, { sick: true });
    cast(game, toHand(game, "Flame Fusillade"));
    activate(game, kismet, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
  });
});

describe("Phytohydra", () => {
  it("damage becomes that many +1/+1 counters", () => {
    const { game } = table();
    const hydra = spawn(game, "Phytohydra");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(hydra)] });
    expect(zone(game, hydra)).toBe("battlefield");
    expect(counters(game, hydra)).toBe(3);
    expect(pt(game, hydra)).toEqual({ power: 4, toughness: 4 });
    expect(game.state.objects[hydra].damageMarked).toBe(0);
  });
});

describe("Coalhauler Swine", () => {
  it("deals the damage it was dealt to each player", () => {
    const { game } = table();
    const swine = spawn(game, "Coalhauler Swine");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(swine)] });
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(17);
  });
});

describe("Oathsworn Giant", () => {
  it("others get +0/+2 and vigilance", () => {
    const { game } = table();
    const giant = spawn(game, "Oathsworn Giant");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 4 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 4 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
  });
});

describe("Dimir Cutpurse", () => {
  it("the damaged player discards and you draw", () => {
    const { game, a } = table();
    const cutpurse = spawn(game, "Dimir Cutpurse");
    const mine = hand(game, A).length;
    const theirs = hand(game, B).length;
    attack(game, a, [cutpurse]);
    expect(life(game, B)).toBe(18);
    expect(hand(game, B).length).toBe(theirs - 1);
    expect(hand(game, A).length).toBe(mine + 1);
  });
});

describe("Agrus Kos, Wojek Veteran", () => {
  it("attacking red get +2/+0, white +0/+2, both +2/+2", () => {
    const { game, a } = table();
    const kos = spawn(game, "Agrus Kos, Wojek Veteran");
    const goblin = spawn(game, "Raging Goblin");
    const lions = spawn(game, "Savannah Lions");
    const idle = spawn(game, "Savannah Lions");
    a.declareAttackersFn = () => [kos, goblin, lions].map((attacker) => ({ attacker, defender: B }));
    toStep(game, "declare-blockers");
    expect(pt(game, kos)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, goblin)).toEqual({ power: 3, toughness: 1 });
    expect(pt(game, lions)).toEqual({ power: 2, toughness: 3 });
    expect(pt(game, idle)).toEqual({ power: 2, toughness: 1 });
  });
});

describe("Pollenbright Wings", () => {
  it("flying, and that many Saprolings for its controller", () => {
    const { game, a } = table();
    const lions = spawn(game, "Savannah Lions");
    lands(game, "Plains", 3);
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Pollenbright Wings"), { targets: [ref(lions)] });
    expect(keywords(game, lions).has("flying")).toBe(true);
    attack(game, a, [lions]);
    expect(life(game, B)).toBe(18);
    expect(tokensNamed(game, "Saproling Token", A)).toBe(2);
  });
});

describe("Conclave's Blessing", () => {
  it("+0/+2 for each other creature you control", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Savannah Lions");
    spawn(game, "Savannah Lions");
    spawn(game, "Savannah Lions", B);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Conclave's Blessing"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 6 });
  });
});

describe("Tidewater Minion", () => {
  it("untaps a permanent, and can lose defender", () => {
    const { game } = table();
    const minion = spawn(game, "Tidewater Minion");
    const land = spawn(game, "Island", A, { tapped: true });
    activate(game, minion, 1, { targets: [ref(land)] });
    expect(game.state.objects[land].tapped).toBe(false);
    expect(keywords(game, minion).has("defender")).toBe(true);
    lands(game, "Island", 4);
    activate(game, minion, 0);
    expect(keywords(game, minion).has("defender")).toBe(false);
  });
});

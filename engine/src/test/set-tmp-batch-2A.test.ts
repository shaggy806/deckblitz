import { describe, expect, it } from "vitest";
import {
  A,
  B,
  cast,
  counters,
  enter,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

// Tempest (TMP), batch B181 group A.

describe("Magmasaur", () => {
  it("loses a counter when you remove one", () => {
    const { game, a } = table();
    const saur = enter(game, "Magmasaur");
    expect(counters(game, saur)).toBe(5);
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, saur)).toBe("battlefield");
    expect(counters(game, saur)).toBe(4);
  });

  it("if you don't, is sacrificed and deals its counters to each creature without flying and each player", () => {
    const { game, a } = table();
    const saur = enter(game, "Magmasaur");
    const bears = spawn(game, "Grizzly Bears", B);
    const drake = spawn(game, "Wind Drake", B);
    pickModes(a);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, saur)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, drake)).toBe("battlefield");
    expect(life(game, A)).toBe(15);
    expect(life(game, B)).toBe(15);
  });
});

describe("Deadshot and Bellowing Fiend", () => {
  it("taps the first creature, which deals its power to the second; the Fiend's damage hits both controllers", () => {
    const { game } = table();
    const fiend = spawn(game, "Bellowing Fiend", A, { tapped: true });
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Deadshot"), { targets: [ref(fiend), ref(bears)] });
    expect(game.state.objects[fiend].tapped).toBe(true);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(17);
  });
});

describe("Kezzerdrix", () => {
  it("deals 4 damage to you at upkeep only while your opponents control no creatures", () => {
    const { game } = table();
    spawn(game, "Kezzerdrix", A);
    toStep(game, "upkeep");
    settle(game);
    expect(life(game, A)).toBe(16);
    spawn(game, "Grizzly Bears", B);
    toStep(game, "upkeep");
    settle(game);
    expect(life(game, A)).toBe(16);
  });
});

describe("Flailing Drake", () => {
  it("gives the creature it blocks +1/+1 until end of turn", () => {
    const { game, a, b } = table();
    const drake = spawn(game, "Flailing Drake", A);
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
    a.declareBlockersFn = () => [{ blocker: drake, attacker: bears }];
    toStep(game, "postcombat-main", B);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, drake)).toBe("graveyard");
  });
});

describe("Krakilin", () => {
  it("enters with X +1/+1 counters", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    cast(game, toHand(game, "Krakilin"), { x: 3 });
    const [k] = named(game, "Krakilin", A);
    expect(counters(game, k)).toBe(3);
    expect(pt(game, k)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Serene Offering", () => {
  it("destroys an enchantment and gains life equal to its mana value", () => {
    const { game } = table();
    const ench = spawn(game, "No Mercy", B);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Serene Offering"), { targets: [ref(ench)] });
    expect(zone(game, ench)).toBe("graveyard");
    expect(life(game, A)).toBe(24);
  });
});

/**
 * Urza's Legacy and Portal Three Kingdoms (ULG, PTK; B203), group E. One test
 * per card whose behaviour is more than a stat line, on the clause most likely
 * to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  enter,
  hand,
  keywords,
  lands,
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
  types,
  subtypes,
  zone,
} from "./harness.js";

describe("Deranged Hermit", () => {
  it("makes four Squirrels and pumps every Squirrel creature, an opponent's too", () => {
    const { game } = table();
    const theirs = spawn(game, "Squirrel Token", B);
    enter(game, "Deranged Hermit");
    const mine = named(game, "Squirrel Token", A);
    expect(mine.length).toBeGreaterThan(0);
    expect(pt(game, mine[0])).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Ghitu Encampment", () => {
  it("becomes a 2/1 red Warrior with first strike that's still a land", () => {
    const { game } = table();
    const camp = spawn(game, "Ghitu Encampment");
    lands(game, "Mountain", 2);
    activate(game, camp, 1);
    expect(pt(game, camp)).toEqual({ power: 2, toughness: 1 });
    expect(types(game, camp)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(subtypes(game, camp)).toContain("Warrior");
    expect(keywords(game, camp).has("first-strike")).toBe(true);
  });
});

describe("Intervene", () => {
  it("counters a spell that targets a creature, and can't target one aimed at a player", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(bears)], settle: false });
    cast(game, toHand(game, "Intervene"), { targets: [ref(shock)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, shock)).toBe("graveyard");

    const face = toHand(game, "Shock");
    cast(game, face, { targets: [ref(B)], settle: false });
    expect(() => cast(game, toHand(game, "Intervene"), { targets: [ref(face)] })).toThrow();
  });
});

describe("Slow Motion", () => {
  it("makes the enchanted creature's controller pay {2} at their upkeep or sacrifice it, then returns", () => {
    const { game, b } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const aura = toHand(game, "Slow Motion");
    cast(game, aura, { targets: [ref(bears)] });
    pickModes(b);
    nextTurn(game, "draw");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, aura)).toBe("hand");
  });
});

describe("Brink of Madness", () => {
  it("with an empty hand at upkeep, is sacrificed and the target opponent discards their hand", () => {
    const { game } = table();
    const brink = spawn(game, "Brink of Madness");
    game.debugApplyEffect(A, { kind: "discard-hand", who: "you" }, []);
    settle(game);
    expect(hand(game, B).length).toBeGreaterThan(0);
    toStep(game, "draw");
    expect(zone(game, brink)).toBe("graveyard");
    expect(hand(game, B).length).toBe(0);
  });

  it("doesn't trigger with a card in hand", () => {
    const { game } = table();
    const brink = spawn(game, "Brink of Madness");
    toStep(game, "draw");
    expect(zone(game, brink)).toBe("battlefield");
  });
});

describe("Gang of Elk", () => {
  it("gets +2/+2 for each creature blocking it", () => {
    const { game, a, b } = table();
    const elk = spawn(game, "Gang of Elk");
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [
      { blocker: one, attacker: elk },
      { blocker: two, attacker: elk },
    ];
    attack(game, a, [elk]);
    expect(pt(game, elk)).toEqual({ power: 9, toughness: 8 });
  });
});

describe("Opal Avenger", () => {
  it("becomes a 3/5 Soldier creature, no longer an enchantment, at 10 or less life", () => {
    const { game } = table();
    const avenger = spawn(game, "Opal Avenger");
    game.debugApplyEffect(A, { kind: "lose-life", amount: 9, who: "you" }, []);
    settle(game);
    expect(types(game, avenger)).toEqual(["enchantment"]);
    game.debugApplyEffect(A, { kind: "lose-life", amount: 1, who: "you" }, []);
    toStep(game, "end");
    expect(types(game, avenger)).toEqual(["creature"]);
    expect(subtypes(game, avenger)).toEqual(["Soldier"]);
    expect(pt(game, avenger)).toEqual({ power: 3, toughness: 5 });
  });
});

describe("Subversion", () => {
  it("drains each opponent for 1 at your upkeep", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Subversion");
    nextTurn(game);
    nextTurn(game);
    toStep(game, "draw");
    expect(game.state.players[A].life).toBe(22);
    expect(game.state.players[B].life).toBe(19);
  });
});

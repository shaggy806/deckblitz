/**
 * Commander 2013 + Theros, group C: the clause of each card most likely to be
 * wrong.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  cast,
  counters,
  hand,
  keywords,
  lands,
  life,
  named,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Akroan Crusader", () => {
  it("makes a 1/1 red Soldier token with haste when its controller's spell targets it", () => {
    const { game } = table();
    const crusader = spawn(game, "Akroan Crusader");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(crusader)] });
    expect(tokensNamed(game, "1/1 Red Soldier Token", A)).toBe(1);
    const token = named(game, "1/1 Red Soldier Token", A)[0];
    expect(keywords(game, token).has("haste")).toBe(true);
    expect(pt(game, token)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Tormented Hero", () => {
  it("drains each opponent for 1 when targeted by its controller's spell", () => {
    const { game } = table();
    const hero = spawn(game, "Tormented Hero");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(hero)] });
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
  });
});

describe("Agent of the Fates", () => {
  it("makes each opponent sacrifice a creature when targeted by its controller's spell", () => {
    const { game } = table();
    const agent = spawn(game, "Agent of the Fates");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(agent)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, agent)).toBe("battlefield");
  });
});

describe("Rageblood Shaman", () => {
  it("pumps and grants trample to other Minotaurs only", () => {
    const { game } = table();
    const shaman = spawn(game, "Rageblood Shaman");
    const minotaur = spawn(game, "Hurloon Minotaur");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, minotaur)).toEqual({ power: 3, toughness: 4 });
    expect(keywords(game, minotaur).has("trample")).toBe(true);
    expect(pt(game, shaman)).toEqual({ power: 2, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Nemesis of Mortals", () => {
  it("monstrosity 5 costs {1} less for each creature card in its controller's graveyard", () => {
    const { game } = table();
    const nemesis = spawn(game, "Nemesis of Mortals");
    for (let i = 0; i < 4; i++) toGraveyard(game, "Grizzly Bears");
    lands(game, "Forest", 5);
    activate(game, nemesis, 0);
    expect(counters(game, nemesis)).toBe(5);
    expect(pt(game, nemesis)).toEqual({ power: 10, toughness: 10 });
  });
});

describe("Meletis Charlatan", () => {
  it("gives the copy to the controller of the spell, not to the Charlatan's controller", () => {
    const { game } = table();
    const charlatan = spawn(game, "Meletis Charlatan", B);
    lands(game, "Island", 3, A);
    lands(game, "Island", 3, B);
    const handA = hand(game, A).length;
    const handB = hand(game, B).length;
    const divination = toHand(game, "Divination");
    cast(game, divination, { settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    activate(game, charlatan, 0, { player: B, targets: [ref(divination)] });
    // Alice's Divination and its copy: four cards to alice, none to bob.
    expect(hand(game, A).length).toBe(handA + 4);
    expect(hand(game, B).length).toBe(handB);
  });
});

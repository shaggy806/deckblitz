/**
 * Guildpact, group C: the clauses most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  graveyard,
  lands,
  life,
  named,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Ghost Council of Orzhova", () => {
  it("sacrificing another creature exiles it until the next end step", () => {
    const { game } = table();
    const council = spawn(game, "Ghost Council of Orzhova");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 1);
    game.dispatch({ type: "activate-ability", player: A, source: council, abilityIndex: 0, targets: [], sacrifice: bears });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, council)).not.toBe("battlefield");
    expect(named(game, "Ghost Council of Orzhova")).toHaveLength(0);
    toStep(game, "end");
    settle(game);
    expect(named(game, "Ghost Council of Orzhova")).toHaveLength(1);
  });

  it("sacrificed to its own ability, it stays in the graveyard", () => {
    const { game } = table();
    const council = spawn(game, "Ghost Council of Orzhova");
    lands(game, "Wastes", 1);
    game.dispatch({ type: "activate-ability", player: A, source: council, abilityIndex: 0, targets: [], sacrifice: council });
    settle(game);
    expect(graveyard(game).some((id) => game.state.objects[id].cardName === "Ghost Council of Orzhova")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(named(game, "Ghost Council of Orzhova")).toHaveLength(0);
  });
});

describe("Burning-Tree Shaman", () => {
  it("damages its own controller for an ability they activate", () => {
    const { game } = table();
    spawn(game, "Burning-Tree Shaman");
    const rusalka = spawn(game, "Martyred Rusalka");
    const bears = spawn(game, "Grizzly Bears");
    const target = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    game.dispatch({ type: "activate-ability", player: A, source: rusalka, abilityIndex: 0, targets: [ref(target)], sacrifice: bears });
    settle(game);
    // The Plains' mana ability paid the cost and didn't trigger it.
    expect(life(game, A)).toBe(19);
  });

  it("damages an opponent who activates one", () => {
    const { game } = table();
    spawn(game, "Burning-Tree Shaman", B);
    const rusalka = spawn(game, "Martyred Rusalka");
    const bears = spawn(game, "Grizzly Bears");
    const target = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    game.dispatch({ type: "activate-ability", player: A, source: rusalka, abilityIndex: 0, targets: [ref(target)], sacrifice: bears });
    settle(game);
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(20);
  });
});

describe("Petrified Wood-Kin", () => {
  it("enters with a +1/+1 counter for each damage dealt to opponents this turn", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    pickTargets(a, B);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
    const kin = enter(game, "Petrified Wood-Kin");
    expect(counters(game, kin)).toBe(4);
    expect(pt(game, kin)).toEqual({ power: 7, toughness: 7 });
  });

  it("enters with none when no opponent was dealt damage", () => {
    const { game } = table();
    const kin = enter(game, "Petrified Wood-Kin");
    expect(counters(game, kin)).toBe(0);
  });
});

describe("Order of the Stars", () => {
  it("has protection from the chosen color only", () => {
    const { game } = table();
    const order = spawn(game, "Order of the Stars");
    game.state.objects[order].chosenOnEnter = "R";
    lands(game, "Mountain", 1);
    expect(() => cast(game, toHand(game, "Shock"), { targets: [ref(order)] })).toThrow();
  });

  it("can be targeted by a spell of another color", () => {
    const { game } = table();
    const order = spawn(game, "Order of the Stars");
    game.state.objects[order].chosenOnEnter = "B";
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(order)] });
    expect(zone(game, order)).toBe("graveyard");
  });
});

describe("Infiltrator's Magemark", () => {
  it("pumps every enchanted creature you control, not unenchanted ones", () => {
    const { game } = table();
    const enchanted = spawn(game, "Grizzly Bears");
    const plain = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 3);
    cast(game, toHand(game, "Infiltrator's Magemark"), { targets: [ref(enchanted)] });
    expect(pt(game, enchanted)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, plain)).toEqual({ power: 2, toughness: 2 });
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Holy Mantle"), { targets: [ref(plain)] });
    expect(pt(game, plain)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Rabble-Rouser", () => {
  it("gives attacking creatures +X/+0 where X is its power", () => {
    const { game, a } = table();
    const rouser = spawn(game, "Rabble-Rouser");
    game.state.objects[rouser].counters["+1/+1"] = 2;
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 1);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    activate(game, rouser);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
    expect(pt(game, rouser)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Steamcore Weird", () => {
  it("deals 2 damage when {R} was spent to cast it", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    lands(game, "Mountain", 1);
    pickTargets(a, B);
    cast(game, toHand(game, "Steamcore Weird"));
    expect(life(game, B)).toBe(18);
  });

  it("does nothing when no {R} was spent", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    pickTargets(a, B);
    cast(game, toHand(game, "Steamcore Weird"));
    expect(life(game, B)).toBe(20);
  });
});

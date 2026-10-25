/**
 * The set walk, Homelands batch 1, part C (2026-10-25). Written on the shared
 * table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  keywords,
  lands,
  life,
  nextTurn,
  pickTargets,
  pt,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Primal Order", () => {
  it("deals each player damage equal to the nonbasic lands they control, in their upkeep", () => {
    const { game } = table();
    spawn(game, "Primal Order");
    lands(game, "Command Tower", 2, B);
    lands(game, "Island", 3, B);
    nextTurn(game);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });
});

describe("Wall of Kelp", () => {
  it("makes a 0/1 blue Plant Wall named Kelp with defender", () => {
    const { game } = table();
    const wall = spawn(game, "Wall of Kelp");
    lands(game, "Island", 2);
    activate(game, wall);
    expect(tokensNamed(game, "Kelp Token", A)).toBe(1);
    const kelp = game.battlefield.find((id) => game.state.objects[id].cardName === "Kelp Token")!;
    expect(pt(game, kelp)).toEqual({ power: 0, toughness: 1 });
    expect(subtypes(game, kelp)).toEqual(["Plant", "Wall"]);
    expect(keywords(game, kelp).has("defender")).toBe(true);
  });
});

describe("An-Havva Inn", () => {
  it("gains X plus 1, counting every player's green creatures", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Llanowar Elves");
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Coral Merfolk", B);
    lands(game, "Forest", 3);
    cast(game, toHand(game, "An-Havva Inn"));
    expect(life(game, A)).toBe(24);
  });
});

describe("Coral Reef", () => {
  it("enters with four polyp counters; taps a blue creature and spends one for a +0/+1 counter; an Island buys two", () => {
    const { game } = table();
    const reef = enter(game, "Coral Reef");
    expect(counters(game, reef, "polyp")).toBe(4);
    const merfolk = spawn(game, "Coral Merfolk");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    activate(game, reef, 1, { targets: [{ kind: "object", object: bears }] });
    expect(counters(game, bears, "+0/+1")).toBe(1);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 3 });
    expect(game.state.objects[merfolk].tapped).toBe(true);
    expect(counters(game, reef, "polyp")).toBe(3);

    const island = spawn(game, "Island");
    game.dispatch({ type: "activate-ability", player: A, source: reef, abilityIndex: 0, targets: [], sacrifice: island });
    settle(game);
    expect(zone(game, island)).toBe("graveyard");
    expect(counters(game, reef, "polyp")).toBe(5);
  });
});

describe("Funeral March", () => {
  it("makes the enchanted creature's controller sacrifice a creature when it leaves", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const ogre = spawn(game, "Gray Ogre", B);
    const mine = spawn(game, "Hill Giant");
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Funeral March"), { targets: [{ kind: "object", object: bears }] });
    destroy(game, bears);
    settle(game);
    expect(zone(game, ogre)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Black Carriage", () => {
  it("stays tapped through the untap step, and untaps by a sacrifice in its controller's upkeep only", () => {
    const { game } = table();
    const carriage = spawn(game, "Black Carriage", A, { tapped: true });
    const bears = spawn(game, "Grizzly Bears");
    const sac = { type: "activate-ability", player: A, source: carriage, abilityIndex: 0, targets: [], sacrifice: bears } as const;
    expect(game.canDispatch(sac)).not.toBeNull();
    nextTurn(game);
    toStep(game, "upkeep");
    expect(game.state.objects[carriage].tapped).toBe(true);
    game.dispatch(sac);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[carriage].tapped).toBe(false);
  });
});

describe("Dark Maze", () => {
  it("attacks after its {0} ability and is exiled at the next end step", () => {
    const { game, a } = table();
    const maze = spawn(game, "Dark Maze");
    activate(game, maze);
    a.declareAttackersFn = () => [{ attacker: maze, defender: B }];
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(16);
    toStep(game, "end");
    settle(game);
    expect(zone(game, maze)).toBe("exile");
  });
});

describe("Rashka the Slayer", () => {
  it("gets +1/+2 blocking a black creature, and nothing blocking another", () => {
    const { game, a, b } = table();
    const rashka = spawn(game, "Rashka the Slayer", B);
    const corpse = spawn(game, "Walking Corpse");
    b.declareBlockersFn = () => [{ blocker: rashka, attacker: corpse }];
    a.declareAttackersFn = () => [{ attacker: corpse, defender: B }];
    toStep(game, "combat-damage");
    expect(pt(game, rashka)).toEqual({ power: 4, toughness: 5 });

    const { game: g2, a: a2, b: b2 } = table();
    const r2 = spawn(g2, "Rashka the Slayer", B);
    const lions = spawn(g2, "Grizzly Bears");
    b2.declareBlockersFn = () => [{ blocker: r2, attacker: lions }];
    a2.declareAttackersFn = () => [{ attacker: lions, defender: B }];
    toStep(g2, "combat-damage");
    expect(pt(g2, r2)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Evaporate", () => {
  it("deals 1 damage to each white and/or blue creature, once to one that's both", () => {
    const { game } = table();
    const trooper = spawn(game, "Talon Trooper", B);
    const lions = spawn(game, "Savannah Lions", B);
    const merfolk = spawn(game, "Coral Merfolk", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Evaporate"));
    expect(game.state.objects[trooper].damageMarked).toBe(1);
    expect(zone(game, lions)).toBe("graveyard");
    expect(zone(game, merfolk)).toBe("graveyard");
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });
});

describe("Heart Wolf", () => {
  it("pumps a Dwarf during combat only, and is sacrificed when that Dwarf leaves this turn", () => {
    const { game, a } = table();
    const wolf = spawn(game, "Heart Wolf");
    const dwarf = spawn(game, "Dwarven Warriors");
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, wolf, 0, { targets: [{ kind: "object", object: dwarf }] })).toThrow();
    toStep(game, "begin-combat");
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: wolf, abilityIndex: 0, targets: [{ kind: "object", object: bears }] }),
    ).not.toBeNull();
    pickTargets(a, dwarf);
    activate(game, wolf, 0, { targets: [{ kind: "object", object: dwarf }] });
    expect(pt(game, dwarf)).toEqual({ power: 3, toughness: 1 });
    expect(keywords(game, dwarf).has("first-strike")).toBe(true);
    destroy(game, dwarf);
    settle(game);
    expect(zone(game, wolf)).toBe("graveyard");
  });
});

describe("Faerie Noble and Root Spider", () => {
  it("Faerie Noble grants other Faeries +0/+1, and +1/+0 more on a tap", () => {
    const { game } = table();
    const noble = spawn(game, "Faerie Noble");
    const pixie = spawn(game, "Faerie Miscreant");
    const before = pt(game, pixie);
    expect(pt(game, noble)).toEqual({ power: 1, toughness: 2 });
    activate(game, noble);
    expect(pt(game, pixie)).toEqual({ power: before.power + 1, toughness: before.toughness });
    expect(pt(game, noble)).toEqual({ power: 1, toughness: 2 });
  });

  it("Root Spider gets +1/+0 and first strike as it blocks", () => {
    const { game, a, b } = table();
    const spider = spawn(game, "Root Spider", B);
    const ogre = spawn(game, "Gray Ogre");
    b.declareBlockersFn = () => [{ blocker: spider, attacker: ogre }];
    a.declareAttackersFn = () => [{ attacker: ogre, defender: B }];
    toStep(game, "combat-damage");
    expect(pt(game, spider)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, spider).has("first-strike")).toBe(true);
  });
});

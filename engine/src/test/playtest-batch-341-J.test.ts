/**
 * Playtest batch B341, group J: Bolshack Dragon, Believe in the Cleave,
 * Generated Horizons, Tarkiran Towelsbane, Cyclopean Titan, Devoted Abzan,
 * Emerin, MagicConsecrated Sphinx, The Master of Cuisine, Scaled Destruction,
 * Aetherflux Car, The Spike Cactus, Sawtooth Avenger, Phyrexian Esthetician,
 * Liliana's Other Contract.
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
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

describe("Bolshack Dragon", () => {
  it("gets +1/+0 for each red card in your graveyard only while attacking", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Bolshack Dragon");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Shock");
    toGraveyard(game, "Giant Growth");
    expect(pt(game, dragon).power).toBe(6);
    a.declareAttackersFn = () => [{ attacker: dragon, defender: B }];
    toStep(game, "declare-blockers");
    expect(pt(game, dragon)).toEqual({ power: 8, toughness: 6 });
    expect(keywords(game, dragon).has("double-strike")).toBe(true);
  });
});

describe("Believe in the Cleave", () => {
  it("costs {1} less for each attacking creature you control", () => {
    const { game, a } = table();
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    lands(game, "Mountain", 2);
    const spell = toHand(game, "Believe in the Cleave");
    a.declareAttackersFn = () => bears.map((attacker) => ({ attacker, defender: B }));
    toStep(game, "declare-blockers");
    cast(game, spell, { targets: [ref(bears[0])] });
    expect(pt(game, bears[0])).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears[0]).has("double-strike")).toBe(true);
    expect(keywords(game, bears[0]).has("trample")).toBe(true);
  });

  it("costs full price with nothing attacking", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    const spell = toHand(game, "Believe in the Cleave");
    expect(() => cast(game, spell, { targets: [ref(bear)] })).toThrow(/mana|pay|cost/i);
  });
});

describe("Generated Horizons", () => {
  it("makes a Forest land token at your upkeep", () => {
    const { game } = table();
    spawn(game, "Generated Horizons");
    toStep(game, "upkeep");
    settle(game);
    expect(tokensNamed(game, "Forest Token", A)).toBe(1);
    const forest = game.battlefield.find((id) => game.state.objects[id].cardName === "Forest Token")!;
    expect(types(game, forest)).toEqual(["land"]);
    expect(subtypes(game, forest)).toContain("Forest");
  });
});

describe("Tarkiran Towelsbane", () => {
  it("makes five Human Rebels, and gains 2 once however many Rebels connect", () => {
    const { game, a } = table();
    enter(game, "Tarkiran Towelsbane");
    expect(tokensNamed(game, "Human Rebel Token", A)).toBe(5);
    const rebels = [spawn(game, "Rebel Token"), spawn(game, "Rebel Token")];
    const before = life(game, A);
    attack(game, a, rebels);
    expect(life(game, A)).toBe(before + 2);
  });
});

describe("Cyclopean Titan", () => {
  it("dies: two target lands become Swamps and it's exiled", () => {
    const { game, a } = table();
    const titan = spawn(game, "Cyclopean Titan");
    const [x, y] = lands(game, "Forest", 2, B);
    pickTargets(a, x, y);
    destroy(game, titan);
    expect(subtypes(game, x)).toEqual(["Swamp"]);
    expect(subtypes(game, y)).toEqual(["Swamp"]);
    expect(graveyard(game, A).some((id) => game.state.objects[id].cardName === "Cyclopean Titan")).toBe(false);
  });

  it("taps a creature, then returns itself to hand", () => {
    const { game } = table();
    const titan = spawn(game, "Cyclopean Titan");
    lands(game, "Wastes", 3);
    const bear = spawn(game, "Grizzly Bears", B);
    activate(game, titan, 0, { targets: [ref(bear)] });
    expect(game.state.objects[bear].tapped).toBe(true);
    expect(hand(game, A).some((id) => game.state.objects[id].cardName === "Cyclopean Titan")).toBe(true);
  });
});

describe("Devoted Abzan", () => {
  it("costs X less, X your devotion to white, black and green", () => {
    const { game } = table();
    const dog = spawn(game, "Devoted Abzan");
    spawn(game, "Devoted Abzan");
    spawn(game, "Llanowar Elves");
    lands(game, "Wastes", 2);
    const before = hand(game, A).length;
    const lifeBefore = life(game, A);
    // {5} less three ({B}, {B}, {G}) is {2}.
    activate(game, dog, 0);
    expect(hand(game, A).length).toBe(before + 1);
    expect(life(game, A)).toBe(lifeBefore - 1);
  });

  it("can't be activated for less than its devotion allows", () => {
    const { game } = table();
    const dog = spawn(game, "Devoted Abzan");
    lands(game, "Wastes", 3);
    expect(() => activate(game, dog, 0)).toThrow(/mana|pay|cost/i);
  });
});

describe("Emerin, Shivan Angel", () => {
  it("gives Angels and Dragons lifelink and the pump, and Treasure sacrifices gain 2", () => {
    const { game } = table();
    const emerin = spawn(game, "Emerin, Shivan Angel");
    const dragon = spawn(game, "Shivan Dragon");
    const bear = spawn(game, "Grizzly Bears");
    expect(keywords(game, emerin).has("lifelink")).toBe(true);
    expect(keywords(game, dragon).has("lifelink")).toBe(true);
    expect(keywords(game, bear).has("lifelink")).toBe(false);
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 1 });
    const treasure = game.battlefield.find((id) => game.state.objects[id].cardName === "Treasure Token")!;
    const before = life(game, A);
    activate(game, treasure, 0);
    expect(life(game, A)).toBe(before + 2);
  });
});

describe("MagicConsecrated Sphinx", () => {
  it("never offers a mode it has already chosen", () => {
    const { game, a } = table();
    const sphinx = spawn(game, "MagicConsecrated Sphinx");
    let offered: readonly string[] = [];
    const choose = (prefix: string): void => {
      a.chooseModesFn = (_view, _min, _max, texts) => {
        offered = texts;
        return [texts.findIndex((t) => t.startsWith(prefix))];
      };
    };
    choose("Make Friends");
    game.debugApplyEffect(B, { kind: "draw", amount: 1 });
    settle(game);
    expect(offered).toHaveLength(4);
    expect(tokensNamed(game, "Gamer Token", A)).toBe(1);
    choose("Win Prize");
    game.debugApplyEffect(B, { kind: "draw", amount: 1 });
    settle(game);
    expect(offered).toHaveLength(3);
    expect(offered.some((t) => t.startsWith("Make Friends"))).toBe(false);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    // Go to Sleep: a new object, which may choose every mode again.
    choose("Go to Sleep");
    game.debugApplyEffect(B, { kind: "draw", amount: 1 });
    settle(game);
    expect(offered).toHaveLength(2);
    expect(game.battlefield.filter((id) => game.state.objects[id].cardName === "MagicConsecrated Sphinx")).toHaveLength(1);
    expect(sphinx).toBeDefined();
    choose("Make Friends");
    game.debugApplyEffect(B, { kind: "draw", amount: 1 });
    settle(game);
    expect(offered).toHaveLength(4);
    expect(tokensNamed(game, "Gamer Token", A)).toBe(2);
  });
});

describe("The Master of Cuisine", () => {
  it("sacrificing a Food lets you tap a creature", () => {
    const { game, a } = table();
    spawn(game, "The Master of Cuisine");
    game.debugApplyEffect(A, { kind: "create-token", token: "Food Token", count: 1 });
    const food = game.battlefield.find((id) => game.state.objects[id].cardName === "Food Token")!;
    lands(game, "Wastes", 2);
    const bear = spawn(game, "Grizzly Bears", B);
    pickModes(a, 2);
    pickTargets(a, bear);
    activate(game, food, 0);
    expect(game.state.objects[bear].tapped).toBe(true);
  });
});

describe("Scaled Destruction", () => {
  it("destroys the sizes chosen and spares the rest", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    const small = spawn(game, "Grizzly Bears", B);
    const medium = spawn(game, "Hill Giant", B);
    const large = spawn(game, "Craw Wurm", B);
    const spell = toHand(game, "Scaled Destruction");
    cast(game, spell, { modes: [0, 2] });
    expect(zone(game, small)).toBe("graveyard");
    expect(zone(game, medium)).toBe("battlefield");
    expect(zone(game, large)).toBe("graveyard");
  });
});

describe("Aetherflux Car", () => {
  it("gets four charge counters per mana value of each spell you cast", () => {
    const { game } = table();
    const car = spawn(game, "Aetherflux Car");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(counters(game, car, "charge")).toBe(8);
  });
});

describe("The Spike Cactus", () => {
  it("enters with a counter for each mana spent to cast it", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const cactus = toHand(game, "The Spike Cactus");
    cast(game, cactus);
    expect(counters(game, cactus)).toBe(3);
    expect(pt(game, cactus)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Sawtooth Avenger", () => {
  it("enters with two counters for each color spent", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Wastes", 3);
    const golem = toHand(game, "Sawtooth Avenger");
    cast(game, golem);
    expect(counters(game, golem)).toBe(4);
  });
});

describe("Phyrexian Esthetician", () => {
  it("oil scavenges from the graveyard: oil counters equal to its power", () => {
    const { game } = table();
    const card = toGraveyard(game, "Phyrexian Esthetician");
    lands(game, "Mountain", 4);
    const bear = spawn(game, "Grizzly Bears");
    activate(game, card, 0, { targets: [ref(bear)] });
    expect(counters(game, bear, "oil")).toBe(4);
    expect(counters(game, bear)).toBe(0);
    expect(game.state.objects[card]?.zone === "graveyard").toBe(false);
  });
});

describe("Liliana's Other Contract", () => {
  it("draws three and loses 3 as it enters", () => {
    const { game } = table();
    const before = hand(game, A).length;
    enter(game, "Liliana's Other Contract");
    expect(hand(game, A).length).toBe(before + 3);
    expect(life(game, A)).toBe(17);
  });

  it("instead of losing, comes back as Liliana's Undead Minion, and you don't lose", () => {
    const { game } = table();
    spawn(game, "Liliana's Other Contract");
    game.debugApplyEffect(A, { kind: "lose-life", amount: 25 });
    // State-based actions are checked as a player would next get priority.
    toStep(game, "postcombat-main");
    expect(life(game, A)).toBe(-5);
    expect(game.state.players[A].hasLost).toBe(false);
    const minion = game.battlefield.find((id) => game.state.objects[id].faces?.[0] === "Liliana's Other Contract")!;
    expect(minion).toBeDefined();
    expect(game.state.objects[minion].face).toBe(1);
    expect(types(game, minion)).toContain("planeswalker");
    expect(counters(game, minion, "loyalty")).toBe(5);
  });
});

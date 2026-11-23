/**
 * Batch 341, group F: playtest cards (Unknown Event, CMB2, MB2), authored on
 * the existing vocabulary only.
 */

import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  enter,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

describe("17-Year Cicadas", () => {
  it("makes ten Insects and exiles itself suspended with seventeen time counters; casting a spell removes one", () => {
    const { game } = table();
    lands(game, "Plains", 8);
    const cicadas = toHand(game, "17-Year Cicadas");
    cast(game, cicadas);
    expect(tokensNamed(game, "White Insect Token (Flying)", A)).toBe(10);
    expect(zone(game, cicadas)).toBe("exile");
    expect(counters(game, cicadas, "time")).toBe(17);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(counters(game, cicadas, "time")).toBe(16);
  });
});

describe("Plane-Merge Elf", () => {
  it("Kinfall: its own entry pumps the team; a creature sharing no type doesn't", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const elf = enter(game, "Plane-Merge Elf");
    expect(pt(game, elf)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    enter(game, "Grizzly Bears");
    expect(pt(game, elf)).toEqual({ power: 4, toughness: 4 });
    enter(game, "Llanowar Elves");
    expect(pt(game, elf)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Night Out in Vegas", () => {
  it("Go to Sleep: lose 15 life and sacrifice it", () => {
    const { game, a } = table();
    const vegas = spawn(game, "Night Out in Vegas");
    pickModes(a, 3);
    toStep(game, "draw");
    settle(game);
    expect(life(game, A)).toBe(5);
    expect(zone(game, vegas)).toBe("graveyard");
  });
});

describe("The Swamp Kitten", () => {
  it("turns a Swamp into a black 0/0 land creature with menace and a counter, which its lord bonus pumps", () => {
    const { game, a } = table({ step: "upkeep" });
    spawn(game, "The Swamp Kitten");
    const swamp = spawn(game, "Swamp");
    pickTargets(a, swamp);
    toStep(game, "begin-combat");
    settle(game);
    expect(types(game, swamp)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(keywords(game, swamp).has("menace")).toBe(true);
    expect(counters(game, swamp)).toBe(1);
    expect(pt(game, swamp)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("The Bird Champion", () => {
  it("with twelve Birds, its controller doesn't lose at 0 life", () => {
    const { game } = table();
    spawn(game, "The Bird Champion");
    for (let i = 0; i < 11; i++) spawn(game, "Birds of Paradise");
    game.state.players[A].life = 3;
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(A)] });
    expect(life(game, A)).toBe(0);
    expect(game.state.players[A].hasLost).toBe(false);
  });

  it("with eleven Birds, they lose", () => {
    const { game } = table();
    spawn(game, "The Bird Champion");
    for (let i = 0; i < 10; i++) spawn(game, "Birds of Paradise");
    game.state.players[A].life = 3;
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(A)] });
    expect(game.state.players[A].hasLost).toBe(true);
  });

  it("makes a Bird for each Bird at upkeep", () => {
    const { game } = table();
    spawn(game, "The Bird Champion");
    spawn(game, "Birds of Paradise");
    toStep(game, "draw");
    settle(game);
    expect(tokensNamed(game, "Green-Blue Bird Token (Flying)", A)).toBe(2);
  });
});

describe("Efteekay, Flame of the Kav", () => {
  it("deals damage equal to its power to target creature as it enters", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    enter(game, "Efteekay, Flame of the Kav");
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Hey, Has Anyone Seen Garruk?", () => {
  it("mills four and returns a creature card milled", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const bears = toLibrary(game, "Grizzly Bears");
    pickFromZone(a, bears);
    const wolf = toHand(game, "Garruk's Lost Wolf");
    cast(game, wolf, { face: 1 });
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Garruk's Lost Wolf", () => {
  it("puts a Huntsman Role on another creature: +1/+1 and {T}: Add {G}", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Garruk's Lost Wolf");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    activate(game, bears, 0);
    expect(game.state.players[A].manaPool.map((m) => m.type)).toEqual(["G"]);
  });
});

describe("Temur Elevator", () => {
  it("costs 1 life to tap without the city's blessing", () => {
    const { game } = table();
    const elevator = spawn(game, "Temur Elevator");
    activate(game, elevator, 0);
    expect(life(game, A)).toBe(19);
  });

  it("costs nothing with it", () => {
    const { game } = table();
    const elevator = spawn(game, "Temur Elevator");
    game.state.players[A].citysBlessing = true;
    activate(game, elevator, 0);
    expect(life(game, A)).toBe(20);
  });
});

describe("Gingerbehemoth", () => {
  it("costs {2} less for each Food sacrificed this turn", () => {
    const { game } = table();
    lands(game, "Wastes", 6);
    const foods = [spawn(game, "Food Token"), spawn(game, "Food Token")];
    for (const food of foods) activate(game, food, 0);
    expect(life(game, A)).toBe(26);
    const behemoth = toHand(game, "Gingerbehemoth");
    cast(game, behemoth);
    expect(zone(game, behemoth)).toBe("battlefield");
  });

  it("costs full price with none sacrificed", () => {
    const { game } = table();
    lands(game, "Wastes", 5);
    expect(() => cast(game, toHand(game, "Gingerbehemoth"))).toThrow();
  });
});

describe("Incisor Steed", () => {
  it("gets +3/+0 with three artifacts and a poisoned opponent", () => {
    const { game } = table();
    const steed = spawn(game, "Incisor Steed");
    spawn(game, "Ornithopter");
    spawn(game, "Ornithopter");
    expect(pt(game, steed)).toEqual({ power: 1, toughness: 4 });
    game.state.players[B].counters = { ...game.state.players[B].counters, poison: 3 };
    spawn(game, "Ornithopter");
    expect(pt(game, steed)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Kevin, Questing Dragon", () => {
  it("steals and untaps a land of the player it hits", () => {
    const { game, a } = table();
    const kevin = spawn(game, "Kevin, Questing Dragon");
    const land = spawn(game, "Mountain", B, { tapped: true });
    pickTargets(a, land);
    attack(game, a, [kevin]);
    expect(life(game, B)).toBe(12);
    expect(controller(game, land)).toBe(A);
    expect(game.state.objects[land].tapped).toBe(false);
  });
});

describe("Then, Dreadmaws Ate Everyone", () => {
  it("makes X 6/6 Colossal Dreadmaws", () => {
    const { game } = table();
    lands(game, "Forest", 8);
    cast(game, toHand(game, "Then, Dreadmaws Ate Everyone"), { x: 2 });
    expect(tokensNamed(game, "Colossal Dreadmaw Token", A)).toBe(2);
  });
});

describe("The Wiley Speedster", () => {
  it("makes a Treasure at the beginning of combat", () => {
    const { game, a } = table();
    spawn(game, "The Wiley Speedster");
    pickModes(a, 2);
    toStep(game, "begin-combat");
    settle(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });
});

describe("The Bearded Teakeeper", () => {
  it("gives its Food the Scald ability", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    enter(game, "The Bearded Teakeeper");
    const [food] = named(game, "Food Token", A);
    activate(game, food, 1, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(named(game, "Food Token", A)).toEqual([]);
  });
});

describe("Deep Dish Pizza", () => {
  it("gains 3, draws three and deals 3 to each opponent", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const pizza = spawn(game, "Deep Dish Pizza");
    const before = hand(game).length;
    activate(game, pizza, 0);
    expect(life(game, A)).toBe(23);
    expect(life(game, B)).toBe(17);
    expect(hand(game).length).toBe(before + 3);
  });
});

describe("Vazal, the Compleat", () => {
  it("has another permanent's activated ability", () => {
    const { game } = table();
    const vazal = spawn(game, "Vazal, the Compleat");
    spawn(game, "Prodigal Pyromancer");
    activate(game, vazal, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
  });
});

describe("Color Pie", () => {
  it("does each of its five things", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const pie = spawn(game, "Color Pie");
    const bolt = game.debugSpawn("Lightning Bolt", B, "graveyard");
    const before = hand(game).length;
    activate(game, pie, 0, { targets: [ref(bolt), ref(A)] });
    expect(life(game, A)).toBe(23);
    expect(hand(game).length).toBe(before + 1);
    expect(zone(game, bolt)).toBe("exile");
    expect(life(game, B)).toBe(19);
  });
});

import { describe, expect, it } from "vitest";
import {
  A,
  B,
  attack,
  cast,
  activate,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";
import { computeCharacteristics } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const colors = (game: Game, id: ObjectId): string[] =>
  [...computeCharacteristics(game.state, registryOf(game), id).colors];
const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped;

describe("Aphotic Wisps", () => {
  it("makes the target black with fear until end of turn, and draws a card", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const giant = spawn(game, "Hill Giant", B);
    const before = hand(game).length;
    const wisps = toHand(game, "Aphotic Wisps");
    cast(game, wisps, { targets: [ref(giant)] });
    expect(keywords(game, giant).has("fear")).toBe(true);
    expect(colors(game, giant)).toEqual(["B"]);
    expect(hand(game).length).toBe(before + 1);
    nextTurn(game);
    expect(keywords(game, giant).has("fear")).toBe(false);
    expect(colors(game, giant)).toEqual(["R"]);
  });
});

describe("Elemental Mastery", () => {
  it("grants a tap ability making power-many hasty Elementals, exiled at the next end step", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 3);
    const giant = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Elemental Mastery"), { targets: [ref(giant)] });
    activate(game, giant, 0);
    expect(tokensNamed(game, "Elemental Token", A)).toBe(3);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Elemental Token", A)).toBe(0);
  });
});

describe("Mirrorweave", () => {
  it("turns each other creature into a copy of the target until end of turn, counters kept", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    lands(game, "Wastes", 2);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    game.state.objects[giant].counters["+1/+1"] = 1;
    cast(game, toHand(game, "Mirrorweave"), { targets: [ref(bears)] });
    expect(subtypes(game, giant)).toContain("Bear");
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    nextTurn(game);
    expect(subtypes(game, giant)).toContain("Giant");
    expect(pt(game, giant)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Boartusk Liege", () => {
  it("gives +2/+2 to another creature that is both red and green", () => {
    const { game } = table();
    spawn(game, "Boartusk Liege");
    const goblin = spawn(game, "Raging Goblin");
    const elves = spawn(game, "Llanowar Elves");
    expect(pt(game, goblin)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, elves)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Seedcradle Witch", () => {
  it("pumps the target +3/+3 and untaps it", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    lands(game, "Wastes", 2);
    const witch = spawn(game, "Seedcradle Witch");
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    activate(game, witch, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(tapped(game, bears)).toBe(false);
  });
});

describe("Cinderhaze Wretch", () => {
  it("untaps by taking a -1/-1 counter, and makes a player discard on your turn", () => {
    const { game } = table();
    const wretch = spawn(game, "Cinderhaze Wretch");
    const before = hand(game, B).length;
    activate(game, wretch, 0, { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before - 1);
    expect(tapped(game, wretch)).toBe(true);
    activate(game, wretch, 1);
    expect(tapped(game, wretch)).toBe(false);
    expect(pt(game, wretch)).toEqual({ power: 2, toughness: 1 });
  });
});

describe("Fists of the Demigod", () => {
  it("gives a black creature +1/+1 and wither, but not first strike", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 1);
    const zombies = spawn(game, "Scathe Zombies");
    cast(game, toHand(game, "Fists of the Demigod"), { targets: [ref(zombies)] });
    expect(pt(game, zombies)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, zombies).has("wither")).toBe(true);
    expect(keywords(game, zombies).has("first-strike")).toBe(false);
  });

  it("gives a red creature +1/+1 and first strike, but not wither", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 1);
    const goblin = spawn(game, "Raging Goblin");
    cast(game, toHand(game, "Fists of the Demigod"), { targets: [ref(goblin)] });
    expect(pt(game, goblin)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, goblin).has("first-strike")).toBe(true);
    expect(keywords(game, goblin).has("wither")).toBe(false);
  });
});

describe("Curse of Chains", () => {
  it("taps the enchanted creature at the beginning of its controller's upkeep", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Wastes", 1);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Curse of Chains"), { targets: [ref(giant)] });
    expect(tapped(game, giant)).toBe(false);
    toStep(game, "upkeep", B);
    settle(game);
    expect(tapped(game, giant)).toBe(true);
  });
});

describe("Fate Transfer", () => {
  it("moves every kind of counter from one creature onto the other", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Wastes", 1);
    const from = spawn(game, "Hill Giant");
    const to = spawn(game, "Grizzly Bears", B);
    game.state.objects[from].counters["+1/+1"] = 2;
    game.state.objects[from].counters["charge"] = 1;
    cast(game, toHand(game, "Fate Transfer"), { targets: [ref(from), ref(to)] });
    expect(game.state.objects[to].counters["+1/+1"]).toBe(2);
    expect(game.state.objects[to].counters["charge"]).toBe(1);
    expect(game.state.objects[from].counters["+1/+1"] ?? 0).toBe(0);
    expect(game.state.objects[from].counters["charge"] ?? 0).toBe(0);
  });
});

describe("Augury Adept", () => {
  it("puts the top card into your hand on combat damage and gains life equal to its mana value", () => {
    const { game, a } = table();
    const adept = spawn(game, "Augury Adept");
    const top = toLibrary(game, "Hill Giant");
    attack(game, a, [adept]);
    expect(zone(game, top)).toBe("hand");
    expect(life(game, A)).toBe(24);
    expect(life(game, B)).toBe(18);
  });
});

describe("Spell Syphon", () => {
  it("counters a spell whose controller can't pay {1} for each blue permanent you control", () => {
    const { game } = table();
    spawn(game, "Merfolk of the Pearl Trident");
    spawn(game, "Merfolk of the Pearl Trident");
    spawn(game, "Merfolk of the Pearl Trident");
    lands(game, "Forest", 2);
    lands(game, "Island", 1);
    lands(game, "Wastes", 3);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    cast(game, toHand(game, "Spell Syphon"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("lets the spell resolve when its controller pays that much", () => {
    const { game, a } = table();
    spawn(game, "Merfolk of the Pearl Trident");
    spawn(game, "Merfolk of the Pearl Trident");
    lands(game, "Forest", 2);
    lands(game, "Island", 1);
    lands(game, "Wastes", 3);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    pickModes(a, 0);
    cast(game, toHand(game, "Spell Syphon"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Kithkin Rabble", () => {
  it("is as big as the number of white permanents you control", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const rabble = spawn(game, "Kithkin Rabble");
    spawn(game, "Savannah Lions");
    spawn(game, "Savannah Lions", B);
    expect(pt(game, rabble)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Drowner Initiate", () => {
  it("may pay {1} as a blue spell is cast to make the target player mill two", () => {
    const { game, a } = table();
    spawn(game, "Drowner Initiate");
    lands(game, "Island", 1);
    lands(game, "Wastes", 3);
    pickTargets(a, B);
    pickModes(a, 0);
    const before = graveyard(game, B).length;
    cast(game, toHand(game, "Wind Drake"));
    expect(graveyard(game, B).length).toBe(before + 2);
  });
});

/**
 * Modern Horizons (MH1; B122), group D. One test per card whose behaviour is
 * more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
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
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  types,
  zone,
} from "./harness.js";

const emptyHand = (game: Game): void => {
  for (const id of [...hand(game)]) game.debugMove(id, "graveyard");
};

describe("Aria of Flame", () => {
  it("gives each opponent 10 life, then grows a verse counter per instant and deals that much", () => {
    const { game, a } = table();
    enter(game, "Aria of Flame");
    expect(life(game, B)).toBe(30);
    const [aria] = named(game, "Aria of Flame", A);
    lands(game, "Mountain", 2);
    pickTargets(a, B);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(30 - 2 - 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(27 - 2 - 2);
    expect(counters(game, aria, "verse")).toBe(2);
  });
});

describe("Rotwidow Pack", () => {
  it("makes a Spider, then drains each opponent once per Spider you control", () => {
    const { game } = table();
    const pack = spawn(game, "Rotwidow Pack");
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Swamp", 2);
    lands(game, "Forest", 3);
    activate(game, pack, 0);
    expect(zone(game, bears)).toBe("exile");
    expect(named(game, "1/2 Green Spider Token (Reach)", A)).toHaveLength(1);
    expect(life(game, B)).toBe(18);
  });
});

describe("Munitions Expert", () => {
  it("deals damage equal to the Goblins you control, itself included", () => {
    const { game, a } = table();
    spawn(game, "Raging Goblin");
    spawn(game, "Raging Goblin");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    pickModes(a, 0);
    enter(game, "Munitions Expert");
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Lightning Skelemental", () => {
  it("makes the player it hits discard two cards", () => {
    const { game, a } = table();
    const skelemental = spawn(game, "Lightning Skelemental");
    const before = hand(game, B).length;
    attack(game, a, [skelemental]);
    expect(life(game, B)).toBe(14);
    expect(hand(game, B).length).toBe(before - 2);
  });
});

describe("Rime Tender", () => {
  it("untaps only another snow permanent", () => {
    const { game } = table();
    const tender = spawn(game, "Rime Tender");
    const snow = spawn(game, "Snow-Covered Forest", A, { tapped: true });
    const forest = spawn(game, "Forest", A, { tapped: true });
    expect(() => activate(game, tender, 0, { targets: [ref(forest)] })).toThrow();
    activate(game, tender, 0, { targets: [ref(snow)] });
    expect(game.state.objects[snow].tapped).toBe(false);
  });
});

describe("Abominable Treefolk", () => {
  it("counts the snow permanents you control, itself included", () => {
    const { game } = table();
    const treefolk = spawn(game, "Abominable Treefolk");
    lands(game, "Snow-Covered Forest", 2);
    spawn(game, "Snow-Covered Forest", B);
    expect(pt(game, treefolk)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Iceberg Cancrix", () => {
  it("mills the target player two when another snow permanent enters, not for a plain one", () => {
    const { game, a } = table();
    spawn(game, "Iceberg Cancrix");
    pickTargets(a, B);
    pickModes(a, 0);
    enter(game, "Snow-Covered Island");
    expect(graveyard(game, B)).toHaveLength(2);
    enter(game, "Island");
    expect(graveyard(game, B)).toHaveLength(2);
  });
});

describe("Glacial Revelation", () => {
  it("offers only the snow permanent cards and bins the rest", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const forest = toLibrary(game, "Forest");
    const walla = toLibrary(game, "Frostwalla");
    const snowLand = toLibrary(game, "Snow-Covered Forest");
    lands(game, "Forest", 3);
    const seen = pickFromZone(a, walla, snowLand);
    cast(game, toHand(game, "Glacial Revelation"));
    expect([...seen.offered].sort()).toEqual([walla, snowLand].sort());
    expect(zone(game, walla)).toBe("hand");
    expect(zone(game, snowLand)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, forest)).toBe("graveyard");
  });
});

describe("Answered Prayers", () => {
  it("gains a life and becomes a 3/3 flying Angel until end of turn", () => {
    const { game } = table();
    const prayers = spawn(game, "Answered Prayers");
    enter(game, "Grizzly Bears");
    expect(life(game, A)).toBe(21);
    expect(types(game, prayers)).toContain("creature");
    expect(subtypes(game, prayers)).toContain("Angel");
    expect(pt(game, prayers)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, prayers).has("flying")).toBe(true);
    enter(game, "Grizzly Bears");
    expect(life(game, A)).toBe(22);
  });
});

describe("Blizzard Strix", () => {
  it("does nothing without another snow permanent", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Blizzard Strix");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("with one, exiles the target until the next end step", () => {
    const { game, a } = table();
    spawn(game, "Snow-Covered Island");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Blizzard Strix");
    expect(zone(game, bears)).toBe("exile");
    toStep(game, "cleanup");
    expect(named(game, "Grizzly Bears", B)).toHaveLength(1);
  });
});

describe("Endling", () => {
  it("chooses +1/-1 or -1/+1 as the last ability resolves", () => {
    const { game, a } = table();
    const endling = spawn(game, "Endling");
    lands(game, "Swamp", 2);
    pickModes(a, 1);
    activate(game, endling, 3);
    expect(pt(game, endling)).toEqual({ power: 2, toughness: 4 });
    pickModes(a, 0);
    activate(game, endling, 3);
    expect(pt(game, endling)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Bladeback Sliver", () => {
  it("gives Slivers a ping only while your hand is empty", () => {
    const { game } = table();
    const sliver = spawn(game, "Bladeback Sliver");
    expect(() => activate(game, sliver, 0, { targets: [ref(B)] })).toThrow();
    emptyHand(game);
    activate(game, sliver, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
  });
});

describe("Bogardan Dragonheart", () => {
  it("sacrifices another creature to become a 4/4 flying, hasty Dragon", () => {
    const { game } = table();
    const heart = spawn(game, "Bogardan Dragonheart");
    const bears = spawn(game, "Grizzly Bears");
    game.dispatch({ type: "activate-ability", player: A, source: heart, abilityIndex: 0, targets: [], sacrifice: bears });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(pt(game, heart)).toEqual({ power: 4, toughness: 4 });
    expect(subtypes(game, heart)).toEqual(["Dragon"]);
    expect(keywords(game, heart).has("flying")).toBe(true);
    expect(keywords(game, heart).has("haste")).toBe(true);
  });
});

describe("Planebound Accomplice", () => {
  it("puts a planeswalker onto the battlefield and sacrifices it at the end step", () => {
    const { game, a } = table();
    const accomplice = spawn(game, "Planebound Accomplice");
    const jace = toHand(game, "Jace Beleren");
    lands(game, "Mountain", 1);
    pickFromZone(a, jace);
    activate(game, accomplice, 0);
    expect(zone(game, jace)).toBe("battlefield");
    toStep(game, "cleanup");
    expect(zone(game, jace)).toBe("graveyard");
  });
});

describe("Bellowing Elk", () => {
  it("has trample and indestructible once another creature entered under your control", () => {
    const { game } = table();
    const elk = spawn(game, "Bellowing Elk");
    expect(keywords(game, elk).has("indestructible")).toBe(false);
    enter(game, "Grizzly Bears");
    expect(keywords(game, elk).has("trample")).toBe(true);
    expect(keywords(game, elk).has("indestructible")).toBe(true);
  });
});

describe("Murasa Behemoth", () => {
  it("gets +3/+3 with a land card in your graveyard", () => {
    const { game } = table();
    const behemoth = spawn(game, "Murasa Behemoth");
    expect(pt(game, behemoth)).toEqual({ power: 5, toughness: 5 });
    toGraveyard(game, "Forest");
    expect(pt(game, behemoth)).toEqual({ power: 8, toughness: 8 });
  });
});

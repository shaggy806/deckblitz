/**
 * War of the Spark (WAR; B123), group B. One test per card whose behaviour
 * is more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  types,
  zone,
} from "./harness.js";

describe("Heartwarming Redemption", () => {
  it("draws one more than it discarded, then gains life for the hand it drew", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Plains", 2);
    const spell = toHand(game, "Heartwarming Redemption");
    const before = hand(game).length;
    cast(game, spell);
    // before − 1 discarded (the spell itself is on the stack), before drawn.
    expect(hand(game).length).toBe(before);
    expect(life(game)).toBe(20 + before);
  });
});

describe("Vivien's Arkbow", () => {
  it("offers only a creature card with mana value X or less among the top X", () => {
    const { game, a } = table();
    const arkbow = spawn(game, "Vivien's Arkbow");
    lands(game, "Forest", 2);
    const wurm = toLibrary(game, "Craw Wurm");
    const bears = toLibrary(game, "Grizzly Bears");
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible, min) => {
      if (eligible.includes(bears)) {
        offered = eligible;
        return [bears];
      }
      return eligible.slice(0, Math.max(min, 1));
    };
    activate(game, arkbow, 0, { x: 2 });
    expect(offered).toContain(bears);
    expect(offered).not.toContain(wurm);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, wurm)).toBe("library");
  });
});

describe("Bleeding Edge", () => {
  it("still amasses with no target chosen", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Bleeding Edge"), { targets: [null] });
    const [army] = named(game, "Army Token", A);
    expect(army).toBeDefined();
    expect(counters(game, army)).toBe(2);
  });
});

describe("Toll of the Invasion", () => {
  it("amasses even when the opponent has no nonland card", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const theirs = hand(game, B).length;
    cast(game, toHand(game, "Toll of the Invasion"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(theirs);
    const [army] = named(game, "Army Token", A);
    expect(counters(game, army)).toBe(1);
  });
});

describe("Invade the City", () => {
  it("amasses one for each instant and sorcery card in your graveyard", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Mountain", 2);
    toGraveyard(game, "Shock");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Shock", B);
    cast(game, toHand(game, "Invade the City"));
    const [army] = named(game, "Army Token", A);
    expect(counters(game, army)).toBe(2);
  });
});

describe("Mobilized District", () => {
  it("costs {1} less for each legendary creature and planeswalker you control", () => {
    const { game } = table();
    const district = spawn(game, "Mobilized District");
    spawn(game, "Isamaru, Hound of Konda");
    spawn(game, "Teyo, the Shieldmage");
    spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    activate(game, district, 1);
    expect(types(game, district)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(pt(game, district)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, district).has("vigilance")).toBe(true);
  });
});

describe("Storm the Citadel", () => {
  it("a creature that damages a planeswalker destroys an artifact its controller controls", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const teyo = spawn(game, "Teyo, the Shieldmage", B);
    const ring = spawn(game, "Sol Ring", B);
    lands(game, "Forest", 5);
    cast(game, toHand(game, "Storm the Citadel"));
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    pickTargets(a, ring);
    attack(game, a, [bears], teyo);
    expect(game.state.objects[teyo].counters.loyalty).toBe(1);
    expect(zone(game, ring)).toBe("graveyard");
  });
});

describe("Makeshift Battalion", () => {
  it("gets a counter attacking with two others, not with one", () => {
    const { game, a } = table();
    const battalion = spawn(game, "Makeshift Battalion");
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    attack(game, a, [battalion, bears]);
    expect(counters(game, battalion)).toBe(0);
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "precombat-main" && s.priority.holder === A);
    attack(game, a, [battalion, bears, other]);
    expect(counters(game, battalion)).toBe(1);
  });
});

describe("Eternal Taskmaster", () => {
  it("paying {2}{B} as it attacks returns the creature card", () => {
    const { game, a } = table();
    const taskmaster = spawn(game, "Eternal Taskmaster");
    lands(game, "Swamp", 3);
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bears);
    pickModes(a, 0);
    // It entered tapped; let it attack.
    expect(game.state.objects[taskmaster].tapped).toBe(true);
    game.state.objects[taskmaster].tapped = false;
    attack(game, a, [taskmaster]);
    expect(life(game, B)).toBe(18);
    expect(zone(game, bears)).toBe("hand");
    expect(graveyard(game)).not.toContain(bears);
  });
});

describe("Bond of Revival", () => {
  it("returns the creature with haste", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const wurm = toGraveyard(game, "Craw Wurm");
    cast(game, toHand(game, "Bond of Revival"), { targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("battlefield");
    expect(keywords(game, wurm).has("haste")).toBe(true);
  });
});

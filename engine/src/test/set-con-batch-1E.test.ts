/**
 * Conflux and Shards of Alara, batch 1E (B171 group E). One test per card on
 * its riskiest clause; stat lines and exact copies of tested patterns are
 * left to pool.test.
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
  enter,
  graveyard,
  keywords,
  lands,
  life,
  pickFromZone,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Kresh the Bloodbraided", () => {
  it("gets X +1/+1 counters, X the dead creature's power", () => {
    const { game, a } = table();
    a.chooseModesFn = () => [0];
    const kresh = spawn(game, "Kresh the Bloodbraided");
    const wurm = spawn(game, "Craw Wurm", B);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(wurm)]);
    settle(game);
    expect(counters(game, kresh)).toBe(6);
  });
});

describe("Goblin Assault", () => {
  it("makes a hasty Goblin at the beginning of your upkeep", () => {
    const { game } = table();
    spawn(game, "Goblin Assault");
    toStep(game, "draw");
    expect(tokensNamed(game, "Goblin Token (Haste)", A)).toBe(1);
  });
});

describe("Where Ancients Tread", () => {
  it("deals 5 for a creature with power 5 or greater, nothing for a smaller one", () => {
    const { game, a } = table();
    a.chooseModesFn = () => [0];
    pickTargets(a, B);
    spawn(game, "Where Ancients Tread");
    enter(game, "Grizzly Bears");
    expect(life(game, B)).toBe(20);
    enter(game, "Colossal Dreadmaw");
    expect(life(game, B)).toBe(15);
  });
});

describe("Paleoloth", () => {
  it("returns a creature card when another big creature enters", () => {
    const { game, a } = table();
    a.chooseModesFn = () => [0];
    spawn(game, "Paleoloth");
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Colossal Dreadmaw");
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Angelic Benediction", () => {
  it("a creature attacking alone gets exalted and taps a target creature", () => {
    const { game, a } = table();
    a.chooseModesFn = () => [0];
    spawn(game, "Angelic Benediction");
    const bears = spawn(game, "Grizzly Bears");
    const drake = spawn(game, "Wind Drake", B);
    pickTargets(a, drake);
    attack(game, a, [bears]);
    expect(game.state.objects[drake].tapped).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(life(game, B)).toBe(17);
  });
});

describe("Sigil of Distinction", () => {
  it("enters with X charge counters; equip removes one; +1/+1 per counter", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const sigil = toHand(game, "Sigil of Distinction");
    cast(game, sigil, { x: 3 });
    expect(counters(game, sigil, "charge")).toBe(3);
    const bears = spawn(game, "Grizzly Bears");
    activate(game, sigil, 0, { targets: [ref(bears)] });
    expect(counters(game, sigil, "charge")).toBe(2);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Mayael the Anima", () => {
  it("offers only a creature card with power 5 or greater, and puts it onto the battlefield", () => {
    const { game, a } = table();
    const mayael = spawn(game, "Mayael the Anima");
    for (const land of ["Mountain", "Forest", "Plains", "Wastes", "Wastes", "Wastes"]) spawn(game, land);
    const bears = toLibrary(game, "Grizzly Bears");
    const dreadmaw = toLibrary(game, "Colossal Dreadmaw");
    // The pick first, then the order of the four put on the bottom (any order).
    const asked: (readonly ObjectId[])[] = [];
    a.chooseFromZoneFn = (_view, eligible, min) => {
      asked.push(eligible);
      return asked.length === 1 ? [dreadmaw] : eligible.slice(0, min);
    };
    activate(game, mayael);
    expect(asked[0]).toEqual([dreadmaw]);
    expect(asked[1]).toHaveLength(4);
    expect(zone(game, dreadmaw)).toBe("battlefield");
    expect(zone(game, bears)).toBe("library");
  });
});

describe("Jund Charm", () => {
  it("deals 2 damage to each creature", () => {
    const { game } = table();
    for (const land of ["Swamp", "Mountain", "Forest"]) spawn(game, land);
    const bears = spawn(game, "Grizzly Bears");
    const wurm = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Jund Charm"), { modes: [1] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("battlefield");
  });
});

describe("Shard Convergence", () => {
  it("finds a Plains, an Island, a Swamp and a Mountain", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const forest = toLibrary(game, "Forest");
    const found = ["Plains", "Island", "Swamp", "Mountain"].map((n) => toLibrary(game, n));
    pickFromZone(a, ...found);
    cast(game, toHand(game, "Shard Convergence"));
    for (const card of found) expect(zone(game, card)).toBe("hand");
    expect(zone(game, forest)).toBe("library");
  });
});

describe("Sedraxis Alchemist", () => {
  it("bounces only if you control a blue permanent", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Sedraxis Alchemist");
    expect(zone(game, bears)).toBe("battlefield");
    spawn(game, "Storm Crow");
    enter(game, "Sedraxis Alchemist");
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Exploding Borders", () => {
  it("fetches a basic land tapped first, then counts it for domain", () => {
    const { game, a } = table();
    for (const land of ["Mountain", "Forest", "Wastes", "Wastes"]) spawn(game, land);
    const plains = toLibrary(game, "Plains");
    pickFromZone(a, plains);
    cast(game, toHand(game, "Exploding Borders"), { targets: [ref(B)] });
    expect(zone(game, plains)).toBe("battlefield");
    expect(game.state.objects[plains].tapped).toBe(true);
    expect(life(game, B)).toBe(17);
  });
});

describe("Corrupted Roots", () => {
  it("can't enchant a Swamp", () => {
    const { game } = table();
    spawn(game, "Swamp");
    const swamp = spawn(game, "Swamp", B);
    expect(() => cast(game, toHand(game, "Corrupted Roots"), { targets: [ref(swamp)] })).toThrow();
  });

  it("makes the enchanted land's controller lose 2 life when it becomes tapped", () => {
    const { game } = table();
    spawn(game, "Swamp");
    const forest = spawn(game, "Forest", B);
    const roots = toHand(game, "Corrupted Roots");
    cast(game, roots, { targets: [ref(forest)] });
    expect(game.state.objects[roots].attachedTo).toBe(forest);
    game.debugApplyEffect(B, { kind: "tap", target: 0 }, [ref(forest)]);
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(life(game)).toBe(20);
  });
});

describe("Wandering Goblins", () => {
  it("gets +1/+0 per basic land type", () => {
    const { game } = table();
    const goblins = spawn(game, "Wandering Goblins");
    for (const land of ["Mountain", "Island", "Wastes"]) spawn(game, land);
    activate(game, goblins);
    expect(pt(game, goblins)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Ignite Disorder", () => {
  it("divides 3 damage among white and/or blue creatures, and can't target a green one", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const vanguard = spawn(game, "Elite Vanguard", B);
    const crow = spawn(game, "Storm Crow", B);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, toHand(game, "Ignite Disorder"), { targets: [ref(bears)], division: [3] })).toThrow();
    cast(game, toHand(game, "Ignite Disorder"), { targets: [ref(vanguard), ref(crow)], division: [1, 2] });
    expect(zone(game, vanguard)).toBe("graveyard");
    expect(zone(game, crow)).toBe("graveyard");
    expect(graveyard(game, B)).toHaveLength(2);
  });
});

describe("Wild Nacatl", () => {
  it("gets +1/+1 for a Mountain and another for a Plains", () => {
    const { game } = table();
    const cat = spawn(game, "Wild Nacatl");
    expect(pt(game, cat)).toEqual({ power: 1, toughness: 1 });
    spawn(game, "Mountain");
    expect(pt(game, cat)).toEqual({ power: 2, toughness: 2 });
    spawn(game, "Plains");
    expect(pt(game, cat)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Cliffrunner Behemoth", () => {
  it("has lifelink with a white permanent, haste only with a red one", () => {
    const { game } = table();
    const rhino = spawn(game, "Cliffrunner Behemoth");
    expect(keywords(game, rhino).has("lifelink")).toBe(false);
    spawn(game, "Elite Vanguard");
    expect(keywords(game, rhino).has("lifelink")).toBe(true);
    expect(keywords(game, rhino).has("haste")).toBe(false);
  });
});

/**
 * Planeshift (PLS), group A. One test per card whose behaviour is more than a
 * stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  types,
  zone,
} from "./harness.js";

describe("Phyrexian Tyranny", () => {
  it("each card drawn costs its drawer 2 life when they can't pay {2}", () => {
    const { game } = table();
    spawn(game, "Phyrexian Tyranny");
    game.debugApplyEffect(B, { kind: "draw", amount: 2 }, []);
    settle(game);
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(20);
  });
});

describe("Pygmy Kavu", () => {
  it("draws one card per black creature the opponents control", () => {
    const { game } = table();
    spawn(game, "Walking Corpse", B);
    spawn(game, "Vampire Nighthawk", B);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Walking Corpse", A);
    const before = hand(game).length;
    enter(game, "Pygmy Kavu");
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Thornscape Familiar", () => {
  it("red and white spells cost {1} less", () => {
    const { game } = table();
    spawn(game, "Thornscape Familiar");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Searing Spear"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Raise the Alarm"));
    expect(game.state.zones.perPlayer[A].graveyard.length).toBe(2);
  });
});

describe("Ruby Medallion", () => {
  it("discounts only its controller's red spells", () => {
    const { game } = table();
    spawn(game, "Ruby Medallion", B);
    lands(game, "Mountain", 1);
    expect(() => cast(game, toHand(game, "Searing Spear"), { targets: [ref(B)] })).toThrow();
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Searing Spear"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
  });
});

describe("Tahngarth, Talruum Hero", () => {
  it("deals its power to a creature and takes that creature's power back", () => {
    const { game } = table();
    const tahngarth = spawn(game, "Tahngarth, Talruum Hero");
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, tahngarth, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[tahngarth].damageMarked).toBe(2);
  });
});

describe("Dralnu's Crusade", () => {
  it("makes Goblins black-only Zombies with +1/+1", () => {
    const { game } = table();
    spawn(game, "Dralnu's Crusade");
    const goblin = spawn(game, "Raging Goblin", B);
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, goblin)).toEqual({ power: 2, toughness: 2 });
    expect([...computeCharacteristics(game.state, registryOf(game), goblin).colors]).toEqual(["B"]);
    expect(subtypes(game, goblin)).toEqual(expect.arrayContaining(["Goblin", "Zombie"]));
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Sawtooth Loon", () => {
  it("can return itself, and still draws two then bottoms two", () => {
    const { game, a } = table();
    const before = hand(game).length;
    const seen = pickPermanents(a);
    a.choosePermanentsFn = (_view, eligible) => {
      seen.offered = eligible;
      return [eligible[0]];
    };
    const loon = enter(game, "Sawtooth Loon");
    expect(seen.offered).toEqual([loon]);
    expect(zone(game, loon)).toBe("hand");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Natural Emergence", () => {
  it("makes your lands 2/2 first strikers", () => {
    const { game } = table();
    const [forest] = lands(game, "Forest", 1);
    const theirs = spawn(game, "Forest", B);
    spawn(game, "Natural Emergence");
    expect(types(game, forest)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(pt(game, forest)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, forest).has("first-strike")).toBe(true);
    expect(types(game, theirs)).not.toContain("creature");
  });

  it("returns itself when it's your only red or green enchantment", () => {
    const { game } = table();
    const emergence = enter(game, "Natural Emergence");
    expect(zone(game, emergence)).toBe("hand");
  });
});

describe("Phyrexian Scuta", () => {
  it("kicked for 3 life, it enters with two +1/+1 counters", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const card = toHand(game, "Phyrexian Scuta");
    cast(game, card, { kicked: true });
    expect(life(game, A)).toBe(17);
    expect(counters(game, card)).toBe(2);
  });
});

describe("Nightscape Battlemage", () => {
  it("kicked with {2}{U} only, bounces up to two nonblack creatures and destroys no land", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    const land = spawn(game, "Forest", B);
    pickTargets(a, bears, elves);
    cast(game, toHand(game, "Nightscape Battlemage"), { kicked: true, kickCount: 1 });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, elves)).toBe("hand");
    expect(zone(game, land)).toBe("battlefield");
  });
});

describe("Escape Routes", () => {
  it("can target only your white or black creatures", () => {
    const { game } = table();
    const routes = spawn(game, "Escape Routes");
    lands(game, "Island", 3);
    const angel = spawn(game, "Serra Angel");
    const corpse = spawn(game, "Walking Corpse");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Walking Corpse", B);
    const refused = (id: Parameters<typeof ref>[0]): boolean =>
      game.canDispatch({ type: "activate-ability", player: A, source: routes, abilityIndex: 0, targets: [ref(id)] }) !== null;
    expect(refused(bears)).toBe(true);
    expect(refused(theirs)).toBe(true);
    expect(refused(corpse)).toBe(false);
    activate(game, routes, 0, { targets: [ref(angel)] });
    expect(zone(game, angel)).toBe("hand");
  });
});

describe("Disciple of Kangee", () => {
  it("gives flying and makes the creature blue until end of turn", () => {
    const { game } = table();
    const disciple = spawn(game, "Disciple of Kangee");
    lands(game, "Island", 1);
    const bears = spawn(game, "Grizzly Bears");
    activate(game, disciple, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect([...computeCharacteristics(game.state, registryOf(game), bears).colors]).toEqual(["U"]);
  });
});

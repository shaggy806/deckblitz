/**
 * Guildpact (GPT; B206), group A. One test per card whose behaviour is more
 * than a stat line or an exact copy of a tested pattern, on the clause most
 * likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  keywords,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

const permanentsOf = (game: Game, player: PlayerId): number =>
  game.battlefield.filter((id) => game.state.objects[id].controller === player).length;

describe("Spelltithe Enforcer", () => {
  it("makes an opponent who can't pay {1} sacrifice a permanent when they cast a spell", () => {
    const { game } = table();
    spawn(game, "Spelltithe Enforcer");
    nextTurn(game);
    spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1, B);
    const before = permanentsOf(game, B);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(A)] });
    expect(life(game, A)).toBe(18);
    expect(permanentsOf(game, B)).toBe(before - 1);
  });
});

describe("Leyline of Lightning", () => {
  it("may pay {1} as you cast a spell to deal 1 damage to target player", () => {
    const { game, a } = table();
    spawn(game, "Leyline of Lightning");
    lands(game, "Forest", 3);
    pickTargets(a, B);
    pickModes(a, 0);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(life(game, B)).toBe(19);
  });
});

describe("Witch-Maw Nephilim", () => {
  it("grows on your spells, and gains trample when it attacks with power 10 or more", () => {
    const { game, a } = table();
    const nephilim = spawn(game, "Witch-Maw Nephilim");
    lands(game, "Mountain", 1);
    pickModes(a, 0);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(counters(game, nephilim)).toBe(2);
    attack(game, a, [nephilim]);
    expect(keywords(game, nephilim).has("trample")).toBe(false);

    const big = spawn(game, "Witch-Maw Nephilim");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 9 }, [ref(big)]);
    settle(game);
    expect(pt(game, big).power).toBe(10);
    nextTurn(game);
    nextTurn(game);
    attack(game, a, [big]);
    expect(keywords(game, big).has("trample")).toBe(true);
  });
});

describe("Orzhov Guildmage", () => {
  it("gives target player 1 life, and makes each player lose 1", () => {
    const { game, a } = table();
    const mage = spawn(game, "Orzhov Guildmage");
    lands(game, "Plains", 3);
    pickTargets(a, B);
    activate(game, mage, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(21);
    lands(game, "Swamp", 3);
    activate(game, mage, 1);
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(20);
  });
});

describe("Skarrgan Pit-Skulk", () => {
  it("enters with a +1/+1 counter only after an opponent was dealt damage", () => {
    const { game } = table();
    const first = enter(game, "Skarrgan Pit-Skulk");
    expect(counters(game, first)).toBe(0);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    const second = enter(game, "Skarrgan Pit-Skulk");
    expect(counters(game, second)).toBe(1);
  });
});

describe("Feral Animist", () => {
  it("gets +X/+0 where X is its power as each activation resolves", () => {
    const { game } = table();
    const animist = spawn(game, "Feral Animist");
    lands(game, "Wastes", 6);
    activate(game, animist, 0);
    expect(pt(game, animist)).toEqual({ power: 4, toughness: 1 });
    activate(game, animist, 0);
    expect(pt(game, animist)).toEqual({ power: 8, toughness: 1 });
  });
});

describe("Killer Instinct", () => {
  it("puts a revealed creature onto the battlefield with haste and sacrifices it at end step; a noncreature stays on top", () => {
    const { game, a } = table();
    spawn(game, "Killer Instinct");
    const ogre = toLibrary(game, "Gray Ogre");
    pickFromZone(a, ogre);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, ogre)).toBe("battlefield");
    expect(keywords(game, ogre).has("haste")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(zone(game, ogre)).toBe("graveyard");

    const island = toLibrary(game, "Island");
    pickFromZone(a);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, island)).toBe("library");
    expect(game.state.zones.perPlayer[A].library[0]).toBe(island);
  });
});

describe("Crash Landing", () => {
  it("takes flying away and deals damage equal to the Forests you control", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Crash Landing"), { targets: [ref(angel)] });
    expect(keywords(game, angel).has("flying")).toBe(false);
    expect(game.state.objects[angel].damageMarked).toBe(3);
  });

  it("can't target a creature without flying", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 3);
    expect(() => cast(game, toHand(game, "Crash Landing"), { targets: [ref(bears)] })).toThrow();
  });
});

describe("Ogre Savant", () => {
  it("bounces a creature only if {U} was spent to cast it", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 5);
    pickTargets(a, bears);
    cast(game, toHand(game, "Ogre Savant"));
    expect(zone(game, bears)).toBe("battlefield");
    lands(game, "Island", 4);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Ogre Savant"));
    expect(zone(game, bears)).toBe("hand");
  });
});

/**
 * The set walk, batch 53, part a (2026-10-11): Reality Fracture's last cards, Reality Fracture
 * Commander's and The Hobbit's. Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  attack,
  cast,
  controller,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickTargets,
  pt,
  ref,
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

const jaceTokens = (game: Game, player = A): ObjectId[] =>
  game.state.zones.shared.battlefield.filter(
    (id) => game.state.objects[id].cardName === "Jace Token" && game.state.objects[id].controller === player,
  );

describe("Massacre Girl, Most Wanted", () => {
  it("pings a target opponent and gains 1 when another creature dies, and grows once per opponent dealt noncombat damage", () => {
    const { game, a } = table({ players: 3 });
    const girl = spawn(game, "Massacre Girl, Most Wanted");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, C);
    destroy(game, bears);
    expect(life(game, C)).toBe(19);
    expect(life(game, A)).toBe(21);
    // Her own 1 damage to Carol was noncombat damage to an opponent.
    expect(counters(game, girl)).toBe(1);

    // Bob's source dealing noncombat damage to each of his opponents: only
    // Carol is Alice's opponent, so one counter, not two.
    const bobs = spawn(game, "Hill Giant", B);
    game.debugApplyEffect(B, { kind: "damage", amount: 2, who: "each-opponent" }, [], { source: bobs });
    settle(game);
    expect(life(game, A)).toBe(19);
    expect(life(game, C)).toBe(17);
    expect(counters(game, girl)).toBe(2);
  });

  it("doesn't grow from combat damage", () => {
    const { game, a } = table();
    const girl = spawn(game, "Massacre Girl, Most Wanted");
    attack(game, a, [girl]);
    expect(life(game, B)).toBe(16);
    expect(counters(game, girl)).toBe(0);
  });
});

describe("Repurposed Enforcer", () => {
  it("empowers Jace by the number of creatures you control as it attacks", () => {
    const { game, a } = table();
    const enforcer = spawn(game, "Repurposed Enforcer");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    attack(game, a, [enforcer]);
    const [jace] = jaceTokens(game);
    expect(jace).toBeDefined();
    expect(counters(game, jace, "loyalty")).toBe(3);
  });
});

describe("Stingerquill Charm", () => {
  it("makes a Cadet with haste until end of turn", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Stingerquill Charm"), { modes: [2] });
    const [cadet] = named(game, "Cadet", A);
    expect(cadet).toBeDefined();
    expect(keywords(game, cadet).has("haste")).toBe(true);
    toStep(game, "upkeep", B);
    expect(keywords(game, cadet).has("haste")).toBe(false);
  });

  it("gives a creature first strike and deathtouch", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Stingerquill Charm"), { modes: [1], targets: [ref(bears)] });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
  });
});

describe("Avacyn, Angel of Horror", () => {
  it("returns Avacyn and another nontoken creature at the next end step, but not a token", () => {
    const { game } = table();
    const avacyn = spawn(game, "Avacyn, Angel of Horror");
    const bears = spawn(game, "Grizzly Bears");
    const token = spawn(game, "Soldier Token");
    game.state.objects[token].isToken = true;
    // Another token dying doesn't trigger her at all.
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(token)]);
    expect(game.state.pendingTriggers).toHaveLength(0);
    expect(game.state.zones.shared.stack).toHaveLength(0);
    settle(game);
    destroy(game, bears);
    destroy(game, avacyn);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, avacyn)).toBe("graveyard");
    toStep(game, "end");
    settle(game);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
    expect(named(game, "Avacyn, Angel of Horror", A)).toHaveLength(1);
    expect(named(game, "Soldier Token")).toHaveLength(0);
  });

  it("returns an opponent's creature card it controlled under its own control", () => {
    const { game } = table();
    spawn(game, "Avacyn, Angel of Horror");
    const stolen = spawn(game, "Hill Giant", B);
    game.state.objects[stolen].controller = A;
    destroy(game, stolen);
    expect(game.state.zones.perPlayer[B].graveyard).toContain(stolen);
    toStep(game, "end");
    settle(game);
    const [back] = named(game, "Hill Giant");
    expect(back).toBeDefined();
    expect(controller(game, back)).toBe(A);
  });
});

describe("Ob Nixilis, the Ascended", () => {
  it("destroys only opponents' tapped creatures, gains 1 life for each, and makes an Angel at the end step", () => {
    const { game } = table();
    const tappedTheirs = spawn(game, "Hill Giant", B, { tapped: true });
    const tappedTheirs2 = spawn(game, "Grizzly Bears", B, { tapped: true });
    const untappedTheirs = spawn(game, "Grizzly Bears", B);
    const tappedMine = spawn(game, "Grizzly Bears", A, { tapped: true });
    enter(game, "Ob Nixilis, the Ascended");
    expect(zone(game, tappedTheirs)).toBe("graveyard");
    expect(zone(game, tappedTheirs2)).toBe("graveyard");
    expect(zone(game, untappedTheirs)).toBe("battlefield");
    expect(zone(game, tappedMine)).toBe("battlefield");
    expect(life(game, A)).toBe(22);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "4/4 Angel Token", A)).toBe(1);
  });

  it("makes no Angel on a turn you gained no life", () => {
    const { game } = table();
    spawn(game, "Ob Nixilis, the Ascended");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "4/4 Angel Token")).toBe(0);
  });
});

describe("Dancing from Dark to Dawn", () => {
  it("puts counters equal to the cast creature spell's mana value on a target creature you control", () => {
    const { game, a } = table();
    spawn(game, "Dancing from Dark to Dawn");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 4);
    pickTargets(a, bears);
    cast(game, toHand(game, "Hill Giant"));
    expect(counters(game, bears)).toBe(4);
  });

  it("makes a Bear whenever a land you control enters", () => {
    const { game } = table();
    spawn(game, "Dancing from Dark to Dawn");
    enter(game, "Forest");
    enter(game, "Forest", B);
    expect(tokensNamed(game, "Bear Token", A)).toBe(1);
    expect(tokensNamed(game, "Bear Token", B)).toBe(0);
  });
});

describe("Through the Forest Gate", () => {
  it("puts the chosen lands from the top twenty onto the battlefield tapped, shuffles, and gains 8 life", () => {
    const { game, a } = table();
    lands(game, "Forest", 8);
    const bears = toLibrary(game, "Grizzly Bears");
    const island = toLibrary(game, "Island");
    const swamp = toLibrary(game, "Swamp");
    const seen = pickFromZone(a, island, swamp);
    cast(game, toHand(game, "Through the Forest Gate"));
    expect(seen.offered).toEqual(expect.arrayContaining([island, swamp]));
    expect(seen.offered).not.toContain(bears);
    expect(zone(game, island)).toBe("battlefield");
    expect(zone(game, swamp)).toBe("battlefield");
    expect(game.state.objects[island].tapped).toBe(true);
    expect(game.state.objects[swamp].tapped).toBe(true);
    expect(zone(game, bears)).toBe("library");
    expect(life(game, A)).toBe(28);
  });
});

describe("The Misty Mountains Cold", () => {
  // A spawned Saga enters with its first lore counter, chapter I waiting.
  it("makes a Treasure, and with four Treasures sacrifices itself for a 6/6 Dragon", () => {
    const { game } = table();
    for (let i = 0; i < 3; i++) game.state.objects[spawn(game, "Treasure Token")].isToken = true;
    const saga = spawn(game, "The Misty Mountains Cold");
    settle(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(4);
    expect(zone(game, saga)).toBe("graveyard");
    expect(tokensNamed(game, "6/6 Dragon Token", A)).toBe(1);
  });

  it("stays, and makes no Dragon, with fewer than four Treasures", () => {
    const { game } = table();
    const saga = spawn(game, "The Misty Mountains Cold");
    settle(game);
    toStep(game, "precombat-main");
    settle(game);
    expect(counters(game, saga, "lore")).toBe(2);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
    expect(zone(game, saga)).toBe("battlefield");
    expect(tokensNamed(game, "6/6 Dragon Token")).toBe(0);
  });
});

describe("Beorn the Fierce", () => {
  it("gives the target a trample counter, makes it a Bear for good, and draws two with three Bears", () => {
    const { game, a } = table();
    const beorn = spawn(game, "Beorn the Fierce");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const theirBears = spawn(game, "Grizzly Bears", B);
    const before = hand(game).length;
    pickTargets(a, giant);
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, giant, "trample")).toBe(1);
    expect(keywords(game, giant).has("trample")).toBe(true);
    expect(subtypes(game, giant)).toEqual(expect.arrayContaining(["Giant", "Bear"]));
    expect(pt(game, giant)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, beorn)).toEqual({ power: 6, toughness: 6 });
    expect(pt(game, theirBears)).toEqual({ power: 2, toughness: 2 });
    expect(hand(game).length).toBe(before + 2);
    // Still a Bear after Beorn has gone (the ruling).
    destroy(game, beorn);
    expect(subtypes(game, giant)).toContain("Bear");
  });

  it("draws nothing with fewer than three Bears", () => {
    const { game, a } = table();
    spawn(game, "Beorn the Fierce");
    const giant = spawn(game, "Hill Giant");
    const before = hand(game).length;
    pickTargets(a, giant);
    toStep(game, "begin-combat");
    settle(game);
    expect(subtypes(game, giant)).toContain("Bear");
    expect(hand(game).length).toBe(before);
  });
});

/**
 * Kaldheim (KHM), batch 1, part c (2026-10-20): foretell, sagas, Sarulf's
 * upkeep sweep and Cyclone Summoner's bounce. Written on the shared table in
 * `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const ANGEL = "Angel Warrior Token (Flying, Vigilance)";

describe("Cyclone Summoner", () => {
  it("cast from hand: returns everything but Giants, Wizards (a changeling too) and lands", () => {
    const { game } = table();
    const islands = lands(game, "Island", 7);
    const bears = spawn(game, "Grizzly Bears", B);
    const ring = spawn(game, "Sol Ring", B);
    const warden = spawn(game, "Littjara Glade-Warden");
    const summoner = toHand(game, "Cyclone Summoner");
    cast(game, summoner);
    expect(zone(game, summoner)).toBe("battlefield");
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, ring)).toBe("hand");
    expect(zone(game, warden)).toBe("battlefield");
    expect(islands.every((id) => zone(game, id) === "battlefield")).toBe(true);
  });

  it("put onto the battlefield without being cast: nothing returns", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    enter(game, "Cyclone Summoner");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Starnheim Unleashed", () => {
  it("cast from hand: one 4/4 Angel Warrior", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Starnheim Unleashed"));
    expect(tokensNamed(game, ANGEL, A)).toBe(1);
  });

  it("foretold, cast for {X}{X}{W} with X = 2: two of them", () => {
    const { game } = table();
    lands(game, "Plains", 7);
    const card = toHand(game, "Starnheim Unleashed");
    game.dispatch({ type: "foretell", player: A, card });
    expect(zone(game, card)).toBe("exile");
    toStep(game, "precombat-main");
    cast(game, card, { via: "foretell", x: 2 });
    expect(tokensNamed(game, ANGEL, A)).toBe(2);
  });
});

describe("Sarulf, Realm Eater", () => {
  it("grows when an opponent's permanent dies; at upkeep removes them all and exiles each other nonland permanent with mana value up to that", () => {
    const { game, a } = table();
    const sarulf = spawn(game, "Sarulf, Realm Eater");
    const victim = spawn(game, "Grizzly Bears", B);
    destroy(game, victim);
    expect(counters(game, sarulf)).toBe(1);
    destroy(game, spawn(game, "Sol Ring", B));
    expect(counters(game, sarulf)).toBe(2);

    const elves = spawn(game, "Llanowar Elves", B);
    const myBears = spawn(game, "Grizzly Bears");
    const wurm = spawn(game, "Craw Wurm", B);
    const myLand = spawn(game, "Forest");
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, elves)).toBe("exile");
    expect(zone(game, myBears)).toBe("exile");
    expect(zone(game, wurm)).toBe("battlefield");
    expect(zone(game, myLand)).toBe("battlefield");
    expect(zone(game, sarulf)).toBe("battlefield");
    expect(counters(game, sarulf)).toBe(0);
  });

  it("declining keeps the counters and exiles nothing", () => {
    const { game, a } = table();
    const sarulf = spawn(game, "Sarulf, Realm Eater");
    destroy(game, spawn(game, "Grizzly Bears", B));
    const elves = spawn(game, "Llanowar Elves", B);
    pickModes(a);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, elves)).toBe("battlefield");
    expect(counters(game, sarulf)).toBe(1);
  });
});

describe("Skull Raid", () => {
  it("an opponent with one card discards it, and you draw the difference", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    game.debugApplyEffect(B, { kind: "discard-hand", who: "you" }, []);
    toHand(game, "Wastes", B);
    const raid = toHand(game, "Skull Raid");
    const before = hand(game, A).length;
    cast(game, raid, { targets: [ref(B)] });
    expect(hand(game, B)).toHaveLength(0);
    expect(hand(game, A)).toHaveLength(before - 1 + 1);
  });

  it("an opponent with plenty discards two, and you draw nothing", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const raid = toHand(game, "Skull Raid");
    const before = hand(game, A).length;
    const bBefore = hand(game, B).length;
    cast(game, raid, { targets: [ref(B)] });
    expect(hand(game, B)).toHaveLength(bBefore - 2);
    expect(hand(game, A)).toHaveLength(before - 1);
  });
});

describe("Divine Gambit", () => {
  it("exiles the target, and its controller may put a permanent card from their hand onto the battlefield", () => {
    const { game, b } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const wurm = toHand(game, "Craw Wurm", B);
    b.chooseModesFn = () => [0];
    pickFromZone(b, wurm);
    cast(game, toHand(game, "Divine Gambit"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, wurm)).toBe("battlefield");
    expect(game.state.objects[wurm].controller).toBe(B);
  });
});

describe("Renegade Reaper", () => {
  it("gains 4 life only when an Angel card is milled", () => {
    const { game } = table();
    toLibrary(game, "Renegade Reaper");
    enter(game, "Renegade Reaper");
    expect(life(game, A)).toBe(24);
    enter(game, "Renegade Reaper");
    expect(life(game, A)).toBe(24);
  });
});

describe("Infernal Pet", () => {
  it("on your second spell each turn: a +1/+1 counter and flying", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const pet = spawn(game, "Infernal Pet");
    cast(game, toHand(game, "Opt"));
    expect(counters(game, pet)).toBe(0);
    cast(game, toHand(game, "Opt"));
    expect(counters(game, pet)).toBe(1);
    expect(keywords(game, pet).has("flying")).toBe(true);
  });
});

describe("Arni Slays the Troll", () => {
  it("I fights, II adds counters to up to one creature you control, III gains life equal to the greatest power", () => {
    const { game, a } = table();
    const wurm = spawn(game, "Craw Wurm");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, wurm, bears);
    enter(game, "Arni Slays the Troll");
    expect(zone(game, bears)).toBe("graveyard");

    pickTargets(a, wurm);
    toStep(game, "precombat-main");
    settle(game);
    expect(counters(game, wurm)).toBe(2);

    toStep(game, "precombat-main");
    settle(game);
    expect(life(game, A)).toBe(28);
  });
});

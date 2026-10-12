/**
 * The set walk, batch 59, part c (2026-10-11): Secrets of Strixhaven.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  hand,
  lands,
  life,
  pickFromZone,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  toLibrary,
  nextTurn,
  types,
  watchTargets,
  zone,
} from "./harness.js";

/** The prepare spell copies in exile (prepare.test.ts). */
const prepareCopies = (game: Game): ObjectId[] =>
  game.state.zones.shared.exile.filter((id) => game.state.objects[id].preparedFor !== undefined);
const enterPrepared = (game: Game, name: string, player: PlayerId = A): ObjectId => {
  const id = game.debugSpawn(name, player, "battlefield", { announceEntry: true, summoningSick: false });
  settle(game);
  return id;
};

describe("Quandrix, the Proof", () => {
  it("gives instant and sorcery spells cast from your hand cascade, not one cast from a graveyard", () => {
    const { game, a } = table();
    spawn(game, "Quandrix, the Proof");
    lands(game, "Island", 6);
    a.chooseCastNowFn = () => null;
    const revealed = (): number => game.eventsOfType("cascade-revealed").length;
    cast(game, toHand(game, "Divination"));
    expect(revealed()).toBe(1);
    // Think Twice by flashback, from the graveyard: no cascade.
    const twice = toGraveyard(game, "Think Twice");
    cast(game, twice, { via: "flashback" });
    expect(revealed()).toBe(1);
    expect(zone(game, twice)).toBe("exile");
  });
});

describe("Mind into Matter", () => {
  it("draws X, then offers a permanent card with mana value X or less from hand, which enters tapped", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    const bears = toHand(game, "Grizzly Bears");
    const giant = toHand(game, "Hill Giant");
    const bolt = toHand(game, "Lightning Bolt");
    const before = hand(game).length;
    const seen = pickFromZone(a, bears);
    cast(game, toHand(game, "Mind into Matter"), { x: 2 });
    // Two cards drawn (Wastes), the cast card gone, Bears put down.
    expect(hand(game).length).toBe(before + 2 - 1);
    expect(seen.offered).toContain(bears);
    expect(seen.offered).not.toContain(giant);
    expect(seen.offered).not.toContain(bolt);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Quandrix Charm", () => {
  it("sets a creature's base power and toughness to 5/5; its counters still apply", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 1;
    cast(game, toHand(game, "Quandrix Charm"), { modes: [2], targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Sanar, Unfinished Genius", () => {
  it("enters prepared with a copy of Wild Idea, and makes a Treasure only once you've cast an instant or sorcery", () => {
    const { game } = table();
    const sanar = enterPrepared(game, "Sanar, Unfinished Genius");
    const [copy] = prepareCopies(game);
    expect(game.state.objects[copy].cardName).toBe("Wild Idea");
    expect(() => activate(game, sanar, 0)).toThrow();
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    activate(game, sanar, 0);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });

  it("Wild Idea finds an instant or sorcery card", () => {
    const { game, a } = table();
    enterPrepared(game, "Sanar, Unfinished Genius");
    const [copy] = prepareCopies(game);
    lands(game, "Island", 3);
    lands(game, "Mountain", 2);
    const bolt = toLibrary(game, "Lightning Bolt");
    pickFromZone(a, bolt);
    cast(game, copy, { via: "prepared" });
    expect(zone(game, bolt)).toBe("hand");
  });
});

describe("Daydream", () => {
  it("blinks your creature back with a single +1/+1 counter, then again by flashback", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 2;
    const daydream = toHand(game, "Daydream");
    cast(game, daydream, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    // A new object: the old counters are gone, the new one is there.
    expect(counters(game, bears)).toBe(1);
    expect(zone(game, daydream)).toBe("graveyard");
    cast(game, daydream, { via: "flashback", targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    expect(zone(game, daydream)).toBe("exile");
  });
});

describe("Arnyn, Deathbloom Botanist", () => {
  it("drains for a creature of yours that died with power or toughness 1 or less, as it last existed", () => {
    const { game, a } = table();
    spawn(game, "Arnyn, Deathbloom Botanist");
    pickTargets(a, B);
    // Power 1 as it died, via a -1/-1 counter on a 2/2.
    const shrunk = spawn(game, "Grizzly Bears");
    game.state.objects[shrunk].counters["-1/-1"] = 1;
    destroy(game, shrunk);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
    // A 2/2 doesn't qualify, nor does an opponent's 1/1.
    destroy(game, spawn(game, "Grizzly Bears"));
    destroy(game, spawn(game, "Llanowar Elves", B));
    expect(life(game, B)).toBe(18);
    // Toughness alone counts: a 1/1 Elves pumped to 3/1 is "power or toughness 1 or less".
    const elves = spawn(game, "Llanowar Elves");
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" }, [
      ref(elves),
    ]);
    destroy(game, elves);
    expect(life(game, B)).toBe(16);
  });
});

describe("The Dawning Archaic", () => {
  it("costs {1} less for each instant and sorcery card in your graveyard", () => {
    const { game } = table();
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Divination");
    toGraveyard(game, "Think Twice");
    toGraveyard(game, "Grizzly Bears");
    const wastes = lands(game, "Wastes", 7);
    const archaic = toHand(game, "The Dawning Archaic");
    // {7}: the Bears isn't counted, so six lands aren't enough.
    game.state.objects[wastes[0]].tapped = true;
    expect(() => cast(game, archaic)).toThrow();
    game.state.objects[wastes[0]].tapped = false;
    cast(game, archaic);
    expect(zone(game, archaic)).toBe("battlefield");
  });

  it("attacks and casts an instant or sorcery card from your graveyard free, exiling it after", () => {
    const { game, a } = table();
    const archaic = spawn(game, "The Dawning Archaic");
    const divination = toGraveyard(game, "Divination");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const bears = toGraveyard(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [divination]);
    a.chooseCastNowFn = (_view, offer) => ({
      type: "cast-spell",
      player: A,
      card: divination,
      targets: [],
      via: offer.casts.find((c) => c.card === divination)!.via,
      ...(offer.free ? { free: true } : {}),
    });
    const before = hand(game).length;
    attack(game, a, [archaic]);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([divination, bolt]));
    expect(seen.offered[0]).not.toContain(bears);
    expect(hand(game).length).toBe(before + 2);
    expect(zone(game, divination)).toBe("exile");
  });
});

describe("Vastlands Scavenger", () => {
  it("enters prepared; Bind to Life mills seven and puts a creature card from among them onto the battlefield", () => {
    const { game, a } = table();
    enterPrepared(game, "Vastlands Scavenger");
    const [copy] = prepareCopies(game);
    expect(game.state.objects[copy].cardName).toBe("Bind to Life");
    // Top down: Hill Giant, seven Wastes, Grizzly Bears — the Bears isn't milled.
    const bears = toLibrary(game, "Grizzly Bears");
    for (let i = 0; i < 7; i += 1) toLibrary(game, "Wastes");
    const giant = toLibrary(game, "Hill Giant");
    lands(game, "Forest", 5);
    const seen = pickFromZone(a, giant);
    cast(game, copy, { via: "prepared" });
    expect(seen.offered).toEqual([giant]);
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, bears)).toBe("library");
  });
});

describe("Skycoach Conductor", () => {
  it("All Aboard blinks a non-Pilot creature you control, never a Pilot", () => {
    const { game } = table();
    const conductor = enterPrepared(game, "Skycoach Conductor");
    const [copy] = prepareCopies(game);
    expect(game.state.objects[copy].cardName).toBe("All Aboard");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 1;
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    // Not the Conductor (a Pilot), not an opponent's creature.
    expect(() => cast(game, copy, { via: "prepared", targets: [ref(conductor)] })).toThrow();
    expect(() => cast(game, copy, { via: "prepared", targets: [ref(theirs)] })).toThrow();
    cast(game, copy, { via: "prepared", targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Great Hall of the Biblioplex", () => {
  it("becomes a 2/4 Wizard land creature for good, pumped by instants and sorceries — and only once", () => {
    const { game } = table();
    const hall = spawn(game, "Great Hall of the Biblioplex");
    lands(game, "Wastes", 10);
    lands(game, "Island", 3);
    activate(game, hall, 2);
    expect(types(game, hall)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(subtypes(game, hall)).toContain("Wizard");
    expect(pt(game, hall)).toEqual({ power: 2, toughness: 4 });
    // Already a creature: a second activation does nothing (no second trigger).
    activate(game, hall, 2);
    cast(game, toHand(game, "Divination"));
    expect(pt(game, hall)).toEqual({ power: 3, toughness: 4 });
    nextTurn(game);
    expect(types(game, hall)).toContain("creature");
    expect(pt(game, hall)).toEqual({ power: 2, toughness: 4 });
  });
});

describe("Vicious Rivalry", () => {
  it("pays X life and destroys every artifact and creature with mana value X or less", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Forest", 2);
    const ring = spawn(game, "Sol Ring");
    const bears = spawn(game, "Grizzly Bears", B);
    const thopter = spawn(game, "Ornithopter", B);
    const giant = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Vicious Rivalry"), { x: 3 });
    expect(life(game, A)).toBe(17);
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, thopter)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
  });
});

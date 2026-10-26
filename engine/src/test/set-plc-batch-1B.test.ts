/**
 * Planar Chaos (PLC), batch 1, group B (2026-10-26). Written on the shared
 * table in `harness.ts`, each test from the card's Oracle text and rulings.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
  controller,
} from "./harness.js";

describe("Teneb, the Harvester", () => {
  it("pays {2}{B} to reanimate a creature card from an opponent's graveyard under your control", () => {
    const { game, a } = table();
    const teneb = spawn(game, "Teneb, the Harvester");
    lands(game, "Swamp", 3);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    attack(game, a, [teneb]);
    expect(life(game, B)).toBe(14);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
  });
});

describe("Stonecloaker", () => {
  it("returns itself when it's your only creature, and exiles a graveyard card", () => {
    const { game, a } = table();
    const card = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, card);
    const cloaker = enter(game, "Stonecloaker");
    expect(zone(game, cloaker)).toBe("hand");
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Reflex Sliver", () => {
  it("gives every player's Sliver creatures haste", () => {
    const { game } = table();
    spawn(game, "Reflex Sliver");
    const theirs = spawn(game, "Synchronous Sliver", B);
    expect(keywords(game, theirs).has("haste")).toBe(true);
    expect(keywords(game, theirs).has("vigilance")).toBe(true);
  });
});

describe("Magus of the Library", () => {
  it("draws only with exactly seven cards in hand", () => {
    const { game } = table();
    const magus = spawn(game, "Magus of the Library");
    while (hand(game).length > 7) game.state.zones.perPlayer[A].hand.pop();
    while (hand(game).length < 8) toHand(game, "Wastes");
    expect(() => activate(game, magus, 1)).toThrow(/refused/);
    game.state.zones.perPlayer[A].hand.pop();
    activate(game, magus, 1);
    expect(hand(game).length).toBe(8);
  });
});

describe("Pallid Mycoderm", () => {
  it("sacrificing a Saproling pumps each Fungus and Saproling you control", () => {
    const { game } = table();
    const mycoderm = spawn(game, "Pallid Mycoderm");
    const saproling = spawn(game, "Saproling Token");
    const other = spawn(game, "Saproling Token");
    const bears = spawn(game, "Grizzly Bears");
    game.dispatch({ type: "activate-ability", player: A, source: mycoderm, abilityIndex: 1, targets: [], sacrifice: saproling });
    settle(game);
    expect(zone(game, saproling)).not.toBe("battlefield");
    expect(pt(game, mycoderm)).toEqual({ power: 3, toughness: 5 });
    expect(pt(game, other)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Kavu Predator", () => {
  it("gets a +1/+1 counter for each life an opponent gains", () => {
    const { game } = table();
    const kavu = spawn(game, "Kavu Predator");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Swords to Plowshares"), { targets: [ref(giant)] });
    expect(life(game, B)).toBe(23);
    expect(counters(game, kavu)).toBe(3);
  });
});

describe("Deadly Grub", () => {
  it("makes the 6/1 shroud Insect only if it died with no time counters", () => {
    const { game } = table();
    const first = enter(game, "Deadly Grub");
    expect(counters(game, first, "time")).toBe(3);
    destroy(game, first);
    settle(game);
    expect(tokensNamed(game, "Insect Token (Green, 6/1, Shroud)", A)).toBe(0);
    const second = enter(game, "Deadly Grub");
    game.state.objects[second].counters.time = 0;
    destroy(game, second);
    settle(game);
    expect(tokensNamed(game, "Insect Token (Green, 6/1, Shroud)", A)).toBe(1);
  });
});

describe("Wistful Thinking", () => {
  it("target player draws two, then discards four", () => {
    const { game } = table();
    const before = hand(game, B).length;
    lands(game, "Island", 3);
    cast(game, toHand(game, "Wistful Thinking"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before - 2);
  });
});

describe("Sophic Centaur", () => {
  it("gains 2 life for each card left in hand after the discard", () => {
    const { game } = table();
    const centaur = spawn(game, "Sophic Centaur");
    lands(game, "Forest", 4);
    const before = hand(game).length;
    activate(game, centaur, 0);
    expect(life(game)).toBe(20 + 2 * (before - 1));
  });
});

describe("Sulfur Elemental", () => {
  it("gives white creatures +1/-1", () => {
    const { game } = table();
    const knight = spawn(game, "White Knight", B);
    spawn(game, "Sulfur Elemental");
    expect(pt(game, knight)).toEqual({ power: 3, toughness: 1 });
  });
});

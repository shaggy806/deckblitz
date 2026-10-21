/**
 * Batch 119, group A: cards that act on "enchanted creature" / "equipped
 * creature" (and "enchanted planeswalker") through the `"attached"` effect
 * reference.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  controller,
  counters,
  destroy,
  hand,
  keywords,
  lands,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Colossification", () => {
  it("taps the creature it enchants, which gets +20/+20", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 7);
    cast(game, toHand(game, "Colossification"), { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 22, toughness: 22 });
  });
});

describe("Junk Jet", () => {
  it("sacrificing another artifact doubles the equipped creature's power until end of turn", () => {
    const { game } = table();
    const jet = spawn(game, "Junk Jet");
    const bears = spawn(game, "Grizzly Bears");
    const junk = spawn(game, "Junk Token");
    lands(game, "Mountain", 4);
    activate(game, jet, 1, { targets: [ref(bears)] });
    game.dispatch({ type: "activate-ability", player: A, source: jet, abilityIndex: 0, targets: [], sacrifice: junk });
    settle(game);
    expect(zone(game, junk)).not.toBe("battlefield");
    expect(zone(game, jet)).toBe("battlefield");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
  });
});

describe("Kitnap", () => {
  it("no gift: steals and taps the creature, with three stun counters", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 4);
    const bobHand = hand(game, B).length;
    cast(game, toHand(game, "Kitnap"), { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, bears, "stun")).toBe(3);
    expect(hand(game, B)).toHaveLength(bobHand);
  });

  it("gift promised: the opponent draws, and no stun counters", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 4);
    const bobHand = hand(game, B).length;
    cast(game, toHand(game, "Kitnap"), { targets: [ref(bears)], kicked: true });
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, bears, "stun")).toBe(0);
    expect(hand(game, B)).toHaveLength(bobHand + 1);
  });
});

describe("Novel Nunchaku", () => {
  it("attaches to the target creature, then that creature fights the reflexive target", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant"); // 3/3, 4/4 equipped
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    a.chooseTargetsFn = (_view, _source, _specs, legal) =>
      legal.map(
        (slot) =>
          slot.find((t) => t.kind === "object" && t.object === giant) ??
          slot.find((t) => t.kind === "object" && t.object === bears) ??
          null,
      );
    lands(game, "Forest", 3);
    const nunchaku = toHand(game, "Novel Nunchaku");
    cast(game, nunchaku);
    expect(game.state.objects[nunchaku].attachedTo).toBe(giant);
    expect(keywords(game, giant).has("trample")).toBe(true);
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[giant].damageMarked).toBe(2);
  });
});

describe("Pemmin's Aura", () => {
  it("untaps the creature, and gives it -1/+1 when that's chosen", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Island", 5);
    const aura = toHand(game, "Pemmin's Aura");
    cast(game, aura, { targets: [ref(bears)] });
    activate(game, aura, 0);
    expect(game.state.objects[bears].tapped).toBe(false);
    pickModes(a, 1);
    activate(game, aura, 3);
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 3 });
  });
});

describe("Shattered Ego", () => {
  it("puts the creature it enchants third from the top of its owner's library", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 6);
    const ego = toHand(game, "Shattered Ego");
    cast(game, ego, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: -1, toughness: 2 });
    activate(game, ego, 0);
    expect(zone(game, bears)).toBe("library");
    expect(game.state.zones.perPlayer[B].library.indexOf(bears)).toBe(2);
    expect(zone(game, ego)).toBe("graveyard");
  });
});

describe("Sigarda's Imprisonment", () => {
  it("exiles the creature it enchants and makes a Blood token", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 8);
    const prison = toHand(game, "Sigarda's Imprisonment");
    cast(game, prison, { targets: [ref(bears)] });
    activate(game, prison, 0);
    expect(zone(game, bears)).toBe("exile");
    expect(tokensNamed(game, "Blood Token", A)).toBe(1);
  });
});

describe("Spiral into Solitude", () => {
  it("sacrificed with blight 1: the creature it enchanted is exiled", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Hill Giant");
    lands(game, "Plains", 4);
    const spiral = toHand(game, "Spiral into Solitude");
    cast(game, spiral, { targets: [ref(theirs)] });
    activate(game, spiral, 0);
    expect(zone(game, spiral)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("exile");
    expect(counters(game, mine, "-1/-1")).toBe(1);
  });
});

describe("Stark's Ingenuity", () => {
  it("pays X to draw X, and each card drawn puts a +1/+1 counter on the enchanted creature", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 5);
    const before = hand(game).length;
    cast(game, toHand(game, "Stark's Ingenuity"), { targets: [ref(bears)], settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 2 });
    settle(game);
    expect(hand(game)).toHaveLength(before + 2);
    expect(counters(game, bears)).toBe(2);
  });
});

describe("Tarrian's Soulcleaver", () => {
  it("another creature dying puts a +1/+1 counter on the equipped creature", () => {
    const { game } = table();
    const cleaver = spawn(game, "Tarrian's Soulcleaver");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 2);
    activate(game, cleaver, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    destroy(game, theirs);
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Vivien's Talent", () => {
  it("the enchanted planeswalker has the +1, and a nontoken creature entering adds loyalty", () => {
    const { game, a } = table();
    const vivien = spawn(game, "Vivien Reid");
    game.state.objects[vivien].counters.loyalty = 5;
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Vivien's Talent"), { targets: [ref(vivien)] });
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    const before = hand(game).length;
    activate(game, vivien, 3);
    expect(counters(game, vivien, "loyalty")).toBe(6);
    expect(hand(game)).toHaveLength(before + 1);
    game.debugSpawn("Grizzly Bears", A, "battlefield", { announceEntry: true });
    settle(game);
    expect(counters(game, vivien, "loyalty")).toBe(7);
  });
});

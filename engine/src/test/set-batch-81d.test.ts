/**
 * Set walk batch 81, part d (2026-10-15): Edge of Eternities (EOE), the rest of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  nextTurn,
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

/** Tap `id` through an effect, so "becomes tapped" sees it. */
function tapIt(game: Game, id: ObjectId, player = A): void {
  game.debugApplyEffect(player, { kind: "tap", target: 0 }, [ref(id)]);
  settle(game);
}

describe("Alpharael, Dreaming Acolyte", () => {
  it("draws two, then discards one artifact card instead of two cards", () => {
    const { game, a } = table();
    const thopter = toHand(game, "Ornithopter");
    toHand(game, "Lightning Bolt");
    const before = hand(game).length;
    a.chooseDiscardsFn = () => [thopter];
    enter(game, "Alpharael, Dreaming Acolyte");
    expect(hand(game)).toHaveLength(before + 2 - 1);
    expect(zone(game, thopter)).toBe("graveyard");
  });

  it("discards two cards when no artifact is discarded", () => {
    const { game } = table();
    toHand(game, "Lightning Bolt");
    toHand(game, "Lightning Bolt");
    const before = hand(game).length;
    enter(game, "Alpharael, Dreaming Acolyte");
    expect(hand(game)).toHaveLength(before + 2 - 2);
  });

  it("has deathtouch during your turn only", () => {
    const { game } = table();
    const alpharael = spawn(game, "Alpharael, Dreaming Acolyte");
    expect(keywords(game, alpharael).has("deathtouch")).toBe(true);
    nextTurn(game);
    expect(keywords(game, alpharael).has("deathtouch")).toBe(false);
  });
});

describe("Hemosymbic Mite", () => {
  it("gives another creature you control +X/+X as it becomes tapped, X its power", () => {
    const { game, a } = table();
    const mite = spawn(game, "Hemosymbic Mite");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[mite].counters = { "+1/+1": 2 };
    pickTargets(a, bears);
    tapIt(game, mite);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });

  it("targets only another creature you control", () => {
    const { game, a } = table();
    const mite = spawn(game, "Hemosymbic Mite");
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    spawn(game, "Grizzly Bears", B);
    const offered: ObjectId[][] = [];
    a.chooseTargetsFn = (_view, _source, _specs, legal) => {
      offered.push(...legal.map((slot) => slot.flatMap((t) => (t.kind === "object" ? [t.object] : []))));
      return [ref(elves)];
    };
    tapIt(game, mite);
    expect([...offered.flat()].sort()).toEqual([bears, elves].sort());
    expect(pt(game, mite)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, elves)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Invasive Maneuvers", () => {
  it("deals 3 damage, or 5 if you control a Spacecraft as it resolves", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const giant = spawn(game, "Hill Giant", B);
    const big = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Invasive Maneuvers"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    cast(game, toHand(game, "Invasive Maneuvers"), { targets: [ref(big)] });
    expect(zone(game, big)).toBe("battlefield");

    const { game: g2 } = table();
    lands(g2, "Mountain", 2);
    spawn(g2, "Atmospheric Greenhouse");
    const angel = spawn(g2, "Serra Angel", B);
    cast(g2, toHand(g2, "Invasive Maneuvers"), { targets: [ref(angel)] });
    expect(zone(g2, angel)).toBe("graveyard");
  });
});

describe("Memorial Team Leader", () => {
  it("gives other creatures you control +1/+0 during your turn only", () => {
    const { game } = table();
    const leader = spawn(game, "Memorial Team Leader");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, leader)).toEqual({ power: 4, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    nextTurn(game);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("can be cast for its warp cost", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const card = toHand(game, "Memorial Team Leader");
    const offer = game.legalActions(A).find((x) => x.kind === "cast-spell" && x.card === card && x.via === "warp");
    expect(offer).toBeDefined();
  });
});

describe("Selfcraft Mechan", () => {
  it("may sacrifice an artifact; when it does, a +1/+1 counter on target creature and a draw", () => {
    const { game, a } = table();
    const thopter = spawn(game, "Ornithopter");
    const bears = spawn(game, "Grizzly Bears");
    a.chooseSacrificesFn = (_view, eligible) => {
      expect(eligible).toContain(thopter);
      return [thopter];
    };
    pickModes(a, 0);
    pickTargets(a, bears);
    const before = hand(game).length;
    enter(game, "Selfcraft Mechan");
    expect(zone(game, thopter)).toBe("graveyard");
    expect(counters(game, bears)).toBe(1);
    expect(hand(game)).toHaveLength(before + 1);
  });

  it("does nothing when you don't sacrifice", () => {
    const { game, a } = table();
    const thopter = spawn(game, "Ornithopter");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a);
    a.chooseSacrificesFn = () => [];
    pickTargets(a, bears);
    const before = hand(game).length;
    enter(game, "Selfcraft Mechan");
    expect(zone(game, thopter)).toBe("battlefield");
    expect(counters(game, bears)).toBe(0);
    expect(hand(game)).toHaveLength(before);
  });
});

describe("Exosuit Savior", () => {
  it("returns up to one other permanent you control to its owner's hand", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    const savior = enter(game, "Exosuit Savior");
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, savior)).toBe("battlefield");
    expect(keywords(game, savior).has("flying")).toBe(true);
  });

  it("may return nothing", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, null);
    enter(game, "Exosuit Savior");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Monoist Circuit-Feeder", () => {
  it("gives your creature +X/+0 and theirs -0/-X, X the artifacts you control", () => {
    const { game, a } = table();
    spawn(game, "Ornithopter");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, bears, giant);
    enter(game, "Monoist Circuit-Feeder");
    // Two artifacts: the Ornithopter and the Circuit-Feeder itself.
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 1 });
  });
});

describe("Frontline War-Rager", () => {
  it("grows at your end step only with two or more tapped creatures", () => {
    const { game } = table();
    const rager = spawn(game, "Frontline War-Rager", A, { tapped: true });
    toStep(game, "end");
    settle(game);
    expect(counters(game, rager)).toBe(0);

    const { game: g2 } = table();
    const second = spawn(g2, "Frontline War-Rager", A, { tapped: true });
    spawn(g2, "Grizzly Bears", A, { tapped: true });
    toStep(g2, "end");
    settle(g2);
    expect(counters(g2, second)).toBe(1);
  });
});

describe("Thawbringer", () => {
  it("surveils 1 as it enters and as it dies", () => {
    const { game, a } = table();
    const top = toLibrary(game, "Lightning Bolt");
    a.chooseScryFn = (_view, cards) => [...cards];
    const bringer = enter(game, "Thawbringer");
    expect(zone(game, top)).toBe("graveyard");
    const next = toLibrary(game, "Grizzly Bears");
    destroy(game, bringer);
    expect(zone(game, next)).toBe("graveyard");
  });
});

describe("Mouth of the Storm", () => {
  it("gives the creatures opponents control as it enters -3/-0 until your next turn", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    enter(game, "Mouth of the Storm");
    const later = spawn(game, "Grizzly Bears", B);
    expect(pt(game, giant)).toEqual({ power: 0, toughness: 3 });
    expect(pt(game, later)).toEqual({ power: 2, toughness: 2 });
    nextTurn(game);
    expect(pt(game, giant)).toEqual({ power: 0, toughness: 3 });
    nextTurn(game);
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Sinister Cryologist", () => {
  it("gives an opponent's creature -3/-0 until end of turn", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    enter(game, "Sinister Cryologist");
    expect(pt(game, giant)).toEqual({ power: 0, toughness: 3 });
    nextTurn(game);
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
  });

  it("can be warped for {U}", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const card = toHand(game, "Sinister Cryologist");
    const offer = game.legalActions(A).find((x) => x.kind === "cast-spell" && x.card === card && x.via === "warp");
    expect(offer).toBeDefined();
  });
});

describe("Gigastorm Titan", () => {
  it("costs {3} less once you've cast another spell this turn", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const titan = toHand(game, "Gigastorm Titan");
    const castable = () => game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === titan);
    expect(castable()).toBe(false);
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)] });
    expect(castable()).toBe(true);
    cast(game, titan);
    expect(zone(game, titan)).toBe("battlefield");
  });
});

describe("Cloudsculpt Technician", () => {
  it("gets +1/+0 while you control an artifact", () => {
    const { game } = table();
    const tech = spawn(game, "Cloudsculpt Technician");
    expect(pt(game, tech)).toEqual({ power: 1, toughness: 4 });
    spawn(game, "Ornithopter", B);
    expect(pt(game, tech)).toEqual({ power: 1, toughness: 4 });
    spawn(game, "Ornithopter");
    expect(pt(game, tech)).toEqual({ power: 2, toughness: 4 });
  });
});

describe("Gravblade Heavy", () => {
  it("gets +1/+0 and deathtouch while you control an artifact", () => {
    const { game } = table();
    const heavy = spawn(game, "Gravblade Heavy");
    expect(pt(game, heavy)).toEqual({ power: 3, toughness: 4 });
    expect(keywords(game, heavy).has("deathtouch")).toBe(false);
    spawn(game, "Ornithopter");
    expect(pt(game, heavy)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, heavy).has("deathtouch")).toBe(true);
  });
});

describe("Vaultguard Trooper", () => {
  it("may discard your hand at your end step with two tapped creatures, then draws two", () => {
    const { game, a } = table();
    spawn(game, "Vaultguard Trooper", A, { tapped: true });
    spawn(game, "Grizzly Bears", A, { tapped: true });
    const bolt = toHand(game, "Lightning Bolt");
    const kept = hand(game).length;
    expect(kept).toBeGreaterThan(2);
    pickModes(a, 0);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(graveyard(game).length).toBe(kept);
    expect(hand(game)).toHaveLength(2);
  });

  it("doesn't trigger with fewer than two tapped creatures", () => {
    const { game, a } = table();
    spawn(game, "Vaultguard Trooper", A, { tapped: true });
    spawn(game, "Grizzly Bears");
    const bolt = toHand(game, "Lightning Bolt");
    pickModes(a, 0);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bolt)).toBe("hand");
  });
});

describe("Brightspear Zealot", () => {
  it("gets +2/+0 once you've cast two spells this turn, itself included", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)] });
    const zealot = toHand(game, "Brightspear Zealot");
    cast(game, zealot);
    expect(pt(game, zealot)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, zealot).has("vigilance")).toBe(true);
    nextTurn(game);
    expect(pt(game, zealot)).toEqual({ power: 2, toughness: 4 });
  });
});

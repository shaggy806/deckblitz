/**
 * Time Spiral (TSP; B205) — group B: Slivers, Mangara, Sprite Noble, Griffin
 * Guide and the split-second pump.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  keywords,
  lands,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Sidewinder Sliver", () => {
  it("gives every player's Slivers flanking, and its trigger shrinks a blocker without flanking", () => {
    const { game, a, b } = table();
    const sidewinder = spawn(game, "Sidewinder Sliver");
    const theirSliver = spawn(game, "Muscle Sliver", B);
    expect(keywords(game, theirSliver).has("flanking")).toBe(true);
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: sidewinder }];
    attack(game, a, [sidewinder]);
    // 2/2 bears got -1/-1 before damage, so the Sliver (2/2 with Muscle
    // Sliver) kills it and survives the 1 damage back.
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, sidewinder)).toBe("battlefield");
  });
});

describe("Mangara of Corondor", () => {
  it("exiles itself and the target permanent", () => {
    const { game } = table();
    const mangara = spawn(game, "Mangara of Corondor");
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, mangara, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, mangara)).toBe("exile");
  });
});

describe("Sprite Noble", () => {
  it("other flyers get +0/+1; the tap pump hits only the flyers there as it resolves", () => {
    const { game } = table();
    const noble = spawn(game, "Sprite Noble");
    const drake = spawn(game, "Wind Drake");
    const bears = spawn(game, "Grizzly Bears");
    const theirDrake = spawn(game, "Wind Drake", B);
    expect(pt(game, noble)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, drake)).toEqual({ power: 2, toughness: 3 });
    expect(pt(game, theirDrake)).toEqual({ power: 2, toughness: 2 });
    activate(game, noble, 0);
    expect(pt(game, drake)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, noble)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirDrake)).toEqual({ power: 2, toughness: 2 });
    const later = spawn(game, "Wind Drake");
    expect(pt(game, later)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Griffin Guide", () => {
  it("gives +2/+2 and flying, and makes a Griffin when the creature dies", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 3);
    pickTargets(a, bears);
    cast(game, toHand(game, "Griffin Guide"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    destroy(game, bears);
    expect(tokensNamed(game, "Griffin Token", A)).toBe(1);
  });
});

describe("Stonewood Invocation", () => {
  it("gives +5/+5 and shroud until end of turn", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Stonewood Invocation"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 7, toughness: 7 });
    expect(keywords(game, bears).has("shroud")).toBe(true);
  });
});

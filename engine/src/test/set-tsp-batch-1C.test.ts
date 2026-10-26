/**
 * Time Spiral, group C: the clauses most likely to be wrong.
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
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Phthisis", () => {
  it("destroys the creature and its controller loses its power plus toughness", () => {
    const { game } = table();
    lands(game, "Swamp", 7);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Phthisis"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(20);
  });
});

describe("Sulfurous Blast", () => {
  it("deals 3 to each creature and player when cast in your main phase", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Sulfurous Blast"));
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(17);
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("deals 2 when cast outside your main phase", () => {
    const { game } = table();
    const blast = toHand(game, "Sulfurous Blast");
    toStep(game, "upkeep");
    lands(game, "Mountain", 4);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, blast);
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(18);
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Coal Stoker", () => {
  it("adds {R}{R}{R} when cast from hand, nothing when put onto the battlefield", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Coal Stoker"));
    expect(game.state.players[A].manaPool.filter((u) => u.type === "R")).toHaveLength(3);
    game.state.players[A].manaPool = [];
    enter(game, "Coal Stoker");
    expect(game.state.players[A].manaPool).toHaveLength(0);
  });
});

describe("Sporesower Thallid", () => {
  it("puts a spore counter on each Fungus you control, not an opponent's", () => {
    const { game } = table();
    const sower = spawn(game, "Sporesower Thallid");
    const other = spawn(game, "Sporesower Thallid");
    const theirs = spawn(game, "Sporesower Thallid", B);
    // Through bob's upkeep (his one trigger) to alice's (her two).
    toStep(game, "precombat-main");
    expect(counters(game, sower, "spore")).toBe(2);
    expect(counters(game, other, "spore")).toBe(2);
    expect(counters(game, theirs, "spore")).toBe(1);
  });
});

describe("Firewake Sliver", () => {
  it("gives Slivers haste and a sacrifice-for-+2/+2 ability", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const firewake = spawn(game, "Firewake Sliver");
    const spinneret = spawn(game, "Spinneret Sliver", B);
    expect(keywords(game, spinneret).has("haste")).toBe(true);
    expect(keywords(game, firewake).has("reach")).toBe(true);
    const mine = spawn(game, "Spinneret Sliver");
    activate(game, mine, 0, { targets: [ref(firewake)] });
    expect(zone(game, mine)).toBe("graveyard");
    expect(graveyard(game)).toContain(mine);
    expect(pt(game, firewake)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Fool's Demise", () => {
  it("returns the creature under your control and the Aura to its owner's hand", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    const aura = toHand(game, "Fool's Demise");
    cast(game, aura, { targets: [ref(bears)] });
    expect(zone(game, aura)).toBe("battlefield");
    destroy(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(hand(game)).toContain(aura);
  });
});

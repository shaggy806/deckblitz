/**
 * Set walk batch 221, group D (2026-10-27): Planeshift (PLS).
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  enter,
  hand,
  lands,
  life,
  nextTurn,
  pickPermanents,
  pt,
  ref,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

describe("Planeshift, group D", () => {
  it("Dromar's Cavern returns a non-Lair land, or is sacrificed without one", () => {
    const { game, a } = table();
    const plains = spawn(game, "Plains");
    const otherLair = spawn(game, "Treva's Ruins");
    const seen = pickPermanents(a, plains);
    const cavern = enter(game, "Dromar's Cavern");
    expect(seen.offered).toContain(plains);
    expect(seen.offered).not.toContain(otherLair);
    expect(seen.offered).not.toContain(cavern);
    expect(zone(game, plains)).toBe("hand");
    expect(zone(game, cavern)).toBe("battlefield");

    const lone = table();
    pickPermanents(lone.a);
    const ruins = enter(lone.game, "Treva's Ruins");
    expect(zone(lone.game, ruins)).toBe("graveyard");
  });

  it("Fleetfoot Panther offers only green or white creatures you control", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const merfolk = spawn(game, "Coral Merfolk");
    const seen = pickPermanents(a, bears);
    const panther = enter(game, "Fleetfoot Panther");
    expect(seen.offered).toContain(bears);
    expect(seen.offered).toContain(panther);
    expect(seen.offered).not.toContain(merfolk);
    expect(zone(game, bears)).toBe("hand");
  });

  it("Destructive Flow makes the upkeep player sacrifice a nonbasic land", () => {
    const { game } = table();
    spawn(game, "Destructive Flow");
    const basic = spawn(game, "Forest", B);
    const nonbasic = spawn(game, "Treva's Ruins", B);
    nextTurn(game, "draw");
    expect(zone(game, nonbasic)).toBe("graveyard");
    expect(zone(game, basic)).toBe("battlefield");
  });

  it("Dark Suspicions drains the difference in hand sizes at an opponent's upkeep", () => {
    const { game } = table();
    spawn(game, "Dark Suspicions");
    toHand(game, "Wastes", B);
    toHand(game, "Wastes", B);
    toHand(game, "Wastes", B);
    const diff = hand(game, B).length - hand(game, A).length;
    expect(diff).toBeGreaterThan(0);
    const before = life(game, B);
    nextTurn(game, "draw");
    expect(life(game, B)).toBe(before - diff);
    expect(life(game, A)).toBe(20);
  });

  it("Rushing River kicked sacrifices a land and bounces two nonland permanents", () => {
    const { game } = table();
    const mine = lands(game, "Island", 3);
    const x = spawn(game, "Grizzly Bears", B);
    const y = spawn(game, "Destructive Flow", B);
    cast(game, toHand(game, "Rushing River"), { targets: [ref(x), ref(y)], kicked: true });
    expect(zone(game, x)).toBe("hand");
    expect(zone(game, y)).toBe("hand");
    expect(mine.filter((id) => zone(game, id) === "graveyard")).toHaveLength(1);
  });

  it("Lashknife Barrier reduces damage to your creatures by 1, not to an opponent's", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Lashknife Barrier"));
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Shock"), { targets: [ref(mine)] });
    expect(zone(game, mine)).toBe("battlefield");
    expect(game.state.objects[mine].damageMarked).toBe(1);
    cast(game, toHand(game, "Shock"), { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("Radiant Kavu prevents a blue creature's combat damage but not a green one's", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    const kavu = spawn(game, "Radiant Kavu");
    const merfolk = spawn(game, "Coral Merfolk");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, kavu);
    attack(game, a, [merfolk, bears]);
    expect(life(game, B)).toBe(20 - 2);
  });

  it("Ertai's Trickery counters a kicked spell and leaves an unkicked one", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const kicked = toHand(game, "Burst Lightning");
    cast(game, kicked, { targets: [ref(B)], kicked: true, settle: false });
    lands(game, "Island", 1);
    cast(game, toHand(game, "Ertai's Trickery"), { targets: [ref(kicked)] });
    expect(zone(game, kicked)).toBe("graveyard");
    expect(life(game, B)).toBe(20);

    lands(game, "Mountain", 1);
    const plain = toHand(game, "Burst Lightning");
    cast(game, plain, { targets: [ref(B)], settle: false });
    lands(game, "Island", 1);
    cast(game, toHand(game, "Ertai's Trickery"), { targets: [ref(plain)] });
    expect(life(game, B)).toBe(18);
  });

  it("Sleeping Potion taps its creature and is sacrificed when the creature is targeted", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    const potion = toHand(game, "Sleeping Potion");
    cast(game, potion, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(zone(game, potion)).toBe("battlefield");
    cast(game, toHand(game, "Gaea's Might"), { targets: [ref(bears)] });
    expect(zone(game, potion)).toBe("graveyard");
  });

  it("Gaea's Might and Exotic Disease count basic land types", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Gaea's Might"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    cast(game, toHand(game, "Exotic Disease"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(23);
  });

  it("Marsh Crocodile may return itself, and each player discards", () => {
    const { game, a } = table();
    a.choosePermanentsFn = (_view, eligible) =>
      eligible.filter((id) => game.state.objects[id]?.cardName === "Marsh Crocodile");
    const handB = hand(game, B).length;
    const croc = enter(game, "Marsh Crocodile");
    expect(zone(game, croc)).toBe("hand");
    expect(hand(game, B).length).toBe(handB - 1);
  });

  it("Mire Kavu gets +1/+1 with a Swamp", () => {
    const { game } = table();
    const kavu = spawn(game, "Mire Kavu");
    expect(pt(game, kavu)).toEqual({ power: 3, toughness: 2 });
    spawn(game, "Swamp");
    expect(pt(game, kavu)).toEqual({ power: 4, toughness: 3 });
  });
});

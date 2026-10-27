/**
 * Torment (TOR; B220), group E. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

describe("Llawan, Cephalid Empress", () => {
  it("bounces only opponents' blue creatures, and stops opponents casting blue creature spells", () => {
    const { game } = table();
    const theirDrake = spawn(game, "Wind Drake", B);
    const theirBears = spawn(game, "Grizzly Bears", B);
    const myDrake = spawn(game, "Wind Drake");
    enter(game, "Llawan, Cephalid Empress");
    expect(zone(game, theirDrake)).toBe("hand");
    expect(zone(game, theirBears)).toBe("battlefield");
    expect(zone(game, myDrake)).toBe("battlefield");
  });

  it("an opponent can't cast a blue creature spell but can cast others", () => {
    const { game } = table();
    spawn(game, "Llawan, Cephalid Empress", B);
    lands(game, "Island", 3);
    lands(game, "Forest", 2);
    expect(() => cast(game, toHand(game, "Wind Drake"))).toThrow();
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Mind Sludge", () => {
  it("the target player discards one card per Swamp you control", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    lands(game, "Swamp", 2, B);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Mind Sludge"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before - 5);
  });
});

describe("Nantuko Blightcutter", () => {
  it("with threshold, gets +1/+1 per black permanent your opponents control", () => {
    const { game } = table();
    const cutter = spawn(game, "Nantuko Blightcutter");
    spawn(game, "Walking Corpse", B);
    spawn(game, "Walking Corpse", B);
    spawn(game, "Walking Corpse");
    spawn(game, "Grizzly Bears", B);
    expect(pt(game, cutter)).toEqual({ power: 2, toughness: 2 });
    for (let i = 0; i < 7; i++) toGraveyard(game, "Grizzly Bears");
    expect(pt(game, cutter)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Gloomdrifter", () => {
  it("with threshold, entering gives nonblack creatures -2/-2", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const corpse = spawn(game, "Walking Corpse", B);
    for (let i = 0; i < 7; i++) toGraveyard(game, "Grizzly Bears");
    enter(game, "Gloomdrifter");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, corpse)).toBe("battlefield");
  });

  it("without threshold, entering does nothing", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    enter(game, "Gloomdrifter");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Pardic Arsonist", () => {
  it("with threshold, entering deals 3 damage to any target; without, nothing", () => {
    const { game, a } = table();
    enter(game, "Pardic Arsonist");
    expect(life(game, B)).toBe(20);
    for (let i = 0; i < 7; i++) toGraveyard(game, "Grizzly Bears");
    pickTargets(a, B);
    enter(game, "Pardic Arsonist");
    expect(life(game, B)).toBe(17);
  });
});

describe("Reborn Hero", () => {
  it("with seven other cards already in your graveyard, paying {W}{W} as it dies returns it", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    for (let i = 0; i < 7; i++) toGraveyard(game, "Grizzly Bears");
    const hero = spawn(game, "Reborn Hero");
    pickModes(a, 0);
    destroy(game, hero);
    expect(named(game, "Reborn Hero", A).filter((id) => zone(game, id) === "battlefield")).toHaveLength(1);
  });

  it("with six cards in your graveyard, its own death doesn't make threshold", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    for (let i = 0; i < 6; i++) toGraveyard(game, "Grizzly Bears");
    const hero = spawn(game, "Reborn Hero");
    pickModes(a, 0);
    destroy(game, hero);
    expect(named(game, "Reborn Hero", A).filter((id) => zone(game, id) === "battlefield")).toHaveLength(0);
    expect(graveyard(game).length).toBe(7);
  });
});

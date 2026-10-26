/**
 * Theros and Magic 2014, group A: Scholar of Athreos's drain, Battlewise
 * Hoplite's heroic scry setting off Flamespeaker Adept, Tenacious Dead's paid
 * return, Shadowborn Demon's upkeep sacrifice, Into the Wilds and Festering Newt.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  graveyard,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Scholar of Athreos", () => {
  it("each opponent loses 1 life and you gain what they lost", () => {
    const { game } = table({ players: 3 });
    const scholar = spawn(game, "Scholar of Athreos");
    lands(game, "Swamp", 3);
    activate(game, scholar, 0);
    expect([life(game, A), life(game, B)]).toEqual([22, 19]);
  });
});

describe("Battlewise Hoplite and Flamespeaker Adept", () => {
  it("a spell targeting the Hoplite gives it a counter and a scry, which pumps the Adept", () => {
    const { game } = table();
    const hoplite = spawn(game, "Battlewise Hoplite");
    const adept = spawn(game, "Flamespeaker Adept");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(hoplite)] });
    expect(counters(game, hoplite)).toBe(1);
    expect(pt(game, adept)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, adept).has("first-strike")).toBe(true);
  });
});

describe("Tenacious Dead", () => {
  it("paying {1}{B} as it dies returns it tapped", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const dead = spawn(game, "Tenacious Dead");
    pickModes(a, 0);
    destroy(game, dead);
    const back = named(game, "Tenacious Dead", A).filter((id) => zone(game, id) === "battlefield");
    expect(back).toHaveLength(1);
    expect(game.state.objects[back[0]].tapped).toBe(true);
  });
});

describe("Shadowborn Demon", () => {
  it("with fewer than six creature cards in your graveyard, your upkeep makes you sacrifice a creature", () => {
    const { game, a } = table();
    spawn(game, "Shadowborn Demon");
    const bears = spawn(game, "Grizzly Bears");
    a.chooseSacrificesFn = () => [bears];
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("with six creature cards in your graveyard, it doesn't trigger", () => {
    const { game } = table();
    const demon = spawn(game, "Shadowborn Demon");
    for (let i = 0; i < 6; i++) toGraveyard(game, "Grizzly Bears");
    const before = graveyard(game, A).length;
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, demon)).toBe("battlefield");
    expect(graveyard(game, A).length).toBe(before);
  });
});

describe("Into the Wilds", () => {
  it("puts a land from the top of your library onto the battlefield untapped at your upkeep", () => {
    const { game, a } = table();
    spawn(game, "Into the Wilds");
    const forest = toLibrary(game, "Forest");
    pickFromZone(a, forest);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(false);
  });
});

describe("Festering Newt", () => {
  it("dying without a Bogbrew Witch gives the target -1/-1", () => {
    const { game, a } = table();
    const newt = spawn(game, "Festering Newt");
    const ogre = spawn(game, "Hill Giant", B);
    pickTargets(a, ogre);
    destroy(game, newt);
    expect(pt(game, ogre)).toEqual({ power: 2, toughness: 2 });
  });
});

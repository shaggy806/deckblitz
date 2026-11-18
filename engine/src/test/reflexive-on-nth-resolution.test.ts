/**
 * "When this ability resolves for the third time this turn, …" — a reflexive
 * ability (rule 603.12) set off inside the resolution of the Nth one (the
 * `resolved-this-turn` condition around a `reflexive-trigger`), and a static
 * "as long as two or more creatures died under your control this turn" (a
 * `turn-history` condition on a static): Gimli, Mournful Avenger.
 */
import { describe, expect, it } from "vitest";

import { B, counters, destroy, keywords, nextTurn, pickTargets, pt, settle, spawn, table, zone } from "./harness.js";

describe("Gimli, Mournful Avenger", () => {
  it("has indestructible once two creatures died under your control this turn — and not for an opponent's", () => {
    const { game } = table();
    const gimli = spawn(game, "Gimli, Mournful Avenger");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const theirs = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    for (const id of theirs) destroy(game, id);
    expect(keywords(game, gimli).has("indestructible")).toBe(false);
    destroy(game, bears[0]);
    expect(keywords(game, gimli).has("indestructible")).toBe(false);
    destroy(game, bears[1]);
    expect(keywords(game, gimli).has("indestructible")).toBe(true);
    // The count is this turn's.
    nextTurn(game);
    expect(keywords(game, gimli).has("indestructible")).toBe(false);
  });

  it("counts creatures that died before it was on the battlefield (its ruling)", () => {
    const { game } = table();
    destroy(game, spawn(game, "Grizzly Bears"));
    destroy(game, spawn(game, "Grizzly Bears"));
    const gimli = spawn(game, "Gimli, Mournful Avenger");
    expect(keywords(game, gimli).has("indestructible")).toBe(true);
    // Neither death was seen by its trigger.
    expect(counters(game, gimli)).toBe(0);
  });

  it("the third resolution this turn sets off the fight, its target chosen then", () => {
    const { game, a } = table();
    const gimli = spawn(game, "Gimli, Mournful Avenger");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const ogre = spawn(game, "Gray Ogre", B); // 2/2
    const giant = spawn(game, "Hill Giant", B); // 3/3
    destroy(game, bears[0]);
    destroy(game, bears[1]);
    expect(counters(game, gimli)).toBe(2);
    expect(zone(game, ogre)).toBe("battlefield");
    expect(zone(game, giant)).toBe("battlefield");
    pickTargets(a, giant);
    destroy(game, bears[2]);
    settle(game);
    expect(counters(game, gimli)).toBe(3);
    // 6/5 fights the 3/3: it dies, Gimli takes 3.
    expect(pt(game, gimli)).toEqual({ power: 6, toughness: 5 });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, ogre)).toBe("battlefield");
    expect(game.state.objects[gimli].damageMarked ?? 0).toBe(3);
  });

  it("the fourth resolution fights nothing, and the count starts again next turn", () => {
    const { game, a } = table();
    const gimli = spawn(game, "Gimli, Mournful Avenger");
    const ogre = spawn(game, "Gray Ogre", B);
    for (let i = 0; i < 4; i++) destroy(game, spawn(game, "Grizzly Bears"));
    settle(game);
    expect(counters(game, gimli)).toBe(4);
    // The third resolution's "up to one" target: the default seat chose the ogre.
    expect(zone(game, ogre)).toBe("graveyard");
    const giant = spawn(game, "Hill Giant", B);
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(counters(game, gimli)).toBe(5);
    expect(zone(game, giant)).toBe("battlefield");
    nextTurn(game);
    nextTurn(game);
    pickTargets(a, giant);
    for (let i = 0; i < 3; i++) destroy(game, spawn(game, "Grizzly Bears"));
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("with no creature to fight, the reflexive ability does nothing", () => {
    const { game } = table();
    const gimli = spawn(game, "Gimli, Mournful Avenger");
    for (let i = 0; i < 3; i++) destroy(game, spawn(game, "Grizzly Bears"));
    settle(game);
    expect(counters(game, gimli)).toBe(3);
    expect(zone(game, gimli)).toBe("battlefield");
  });
});

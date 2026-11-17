/**
 * `bottom-of-library`: the bottom card of a library handed to `then` as
 * target 0, "it" followed to wherever a move put it — Grenzo, Dungeon
 * Warden's "put the bottom card of your library into your graveyard. If it's
 * a creature card with power less than or equal to Grenzo's power, put it
 * onto the battlefield", Cellar Door's for a target player. Not a mill (rule
 * 701.17a).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { A, B, activate, cast, counters, destroy, lands, ref, settle, spawn, table, toHand, toLibrary, tokensNamed, zone } from "./harness.js";

/** `name` on the bottom of `player`'s library. */
function toLibraryBottom(game: Game, name: string, player: PlayerId = A): ObjectId {
  const id = toLibrary(game, name, player);
  const library = game.state.zones.perPlayer[player].library;
  library.splice(library.indexOf(id), 1);
  library.push(id);
  return id;
}

/** Grenzo, cast for X. */
function castGrenzo(game: Game, x: number): ObjectId {
  lands(game, "Swamp", 1);
  lands(game, "Mountain", 1 + x);
  const grenzo = toHand(game, "Grenzo, Dungeon Warden");
  cast(game, grenzo, { x });
  return grenzo;
}

describe("Grenzo, Dungeon Warden", () => {
  it("enters with X +1/+1 counters", () => {
    const { game } = table();
    const grenzo = castGrenzo(game, 2);
    expect(counters(game, grenzo)).toBe(2);
  });

  it("puts the bottom card into the graveyard, then a creature card of power up to Grenzo's onto the battlefield", () => {
    const { game } = table();
    const grenzo = castGrenzo(game, 1);
    const giant = toLibraryBottom(game, "Hill Giant");
    lands(game, "Swamp", 2);
    activate(game, grenzo, 0);
    expect(zone(game, giant)).toBe("battlefield");
    // Not a mill: nothing was milled.
    expect(game.eventsOfType("cards-milled")).toEqual([]);
  });

  it("leaves a creature card with greater power in the graveyard", () => {
    const { game } = table();
    const grenzo = castGrenzo(game, 0);
    const giant = toLibraryBottom(game, "Hill Giant");
    lands(game, "Swamp", 2);
    activate(game, grenzo, 0);
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("leaves a noncreature card in the graveyard", () => {
    const { game } = table();
    const grenzo = castGrenzo(game, 3);
    const opt = toLibraryBottom(game, "Opt");
    lands(game, "Swamp", 2);
    activate(game, grenzo, 0);
    expect(zone(game, opt)).toBe("graveyard");
  });

  it("uses Grenzo's last known power once it has left the battlefield", () => {
    const { game } = table();
    const grenzo = castGrenzo(game, 1);
    const giant = toLibraryBottom(game, "Hill Giant");
    lands(game, "Swamp", 2);
    activate(game, grenzo, 0, { settle: false });
    destroy(game, grenzo);
    settle(game);
    expect(zone(game, grenzo)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("puts it onto the battlefield from exile when a replacement exiled it instead (the ruling)", () => {
    const { game } = table();
    spawn(game, "Leyline of the Void", B);
    const grenzo = castGrenzo(game, 1);
    const giant = toLibraryBottom(game, "Hill Giant");
    lands(game, "Swamp", 2);
    activate(game, grenzo, 0);
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Cellar Door", () => {
  it("target player puts their bottom card into their graveyard; a creature card makes you a Zombie", () => {
    const { game } = table();
    const door = spawn(game, "Cellar Door");
    const bears = toLibraryBottom(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3);
    activate(game, door, 0, { targets: [ref(B)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
    expect(tokensNamed(game, "Zombie Token", B)).toBe(0);
  });

  it("makes no Zombie for a noncreature card", () => {
    const { game } = table();
    const door = spawn(game, "Cellar Door");
    const opt = toLibraryBottom(game, "Opt");
    lands(game, "Swamp", 3);
    activate(game, door, 0, { targets: [ref(A)] });
    expect(zone(game, opt)).toBe("graveyard");
    expect(tokensNamed(game, "Zombie Token")).toBe(0);
  });
});

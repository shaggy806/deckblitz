/**
 * "Unless either one is a color the other isn't" — `CardFilter.sameColorsAs`:
 * exactly the same color or colors as a reference's objects (rule 105.2),
 * bound as a resolution applies (`sameColorsBound`). Dead Ringers is the
 * proving card: both destroyed when their colors match exactly (two
 * colorless ones included), neither when one has a color the other lacks,
 * and, with one target gone illegal, the other alone (rule 608.2b: the
 * illegal one's colors can't be determined, so nothing shows they differ).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, lands, ref, settle, spawn, table, toHand } from "./harness.js";

const castRingers = (game: Game, first: ObjectId, second: ObjectId): void => {
  lands(game, "Swamp", 5);
  cast(game, toHand(game, "Dead Ringers"), { targets: [ref(first), ref(second)] });
};

const zone = (game: Game, id: ObjectId): string => game.state.objects[id].zone;

describe("Dead Ringers", () => {
  it("destroys two creatures of exactly the same color", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    castRingers(game, bears, elves);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, elves)).toBe("graveyard");
  });

  it("destroys two colorless creatures", () => {
    const { game } = table();
    const thopter = spawn(game, "Ornithopter", B);
    const memnite = spawn(game, "Memnite", A);
    castRingers(game, thopter, memnite);
    expect(zone(game, thopter)).toBe("graveyard");
    expect(zone(game, memnite)).toBe("graveyard");
  });

  it("does nothing when one is a color the other isn't, either way round", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const wolf = spawn(game, "Watchwolf", B);
    castRingers(game, bears, wolf);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, wolf)).toBe("battlefield");
    const giant = spawn(game, "Hill Giant", B);
    castRingers(game, wolf, bears);
    expect(zone(game, wolf)).toBe("battlefield");
    castRingers(game, giant, bears);
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("two multicolored creatures of the same pair are destroyed; colorless and colored are not", () => {
    const { game } = table();
    const wolf = spawn(game, "Watchwolf", B);
    const pridemage = spawn(game, "Qasali Pridemage", B);
    const thopter = spawn(game, "Ornithopter", B);
    const bears = spawn(game, "Grizzly Bears", B);
    castRingers(game, thopter, bears);
    expect(zone(game, thopter)).toBe("battlefield");
    castRingers(game, wolf, pridemage);
    expect(zone(game, wolf)).toBe("graveyard");
    expect(zone(game, pridemage)).toBe("graveyard");
  });

  it("with one target gone illegal, destroys the other", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 5);
    // Hold priority with the spell on the stack, then remove the Giant.
    cast(game, toHand(game, "Dead Ringers"), { targets: [ref(bears), ref(giant)], settle: false });
    game.debugMove(giant, "graveyard");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

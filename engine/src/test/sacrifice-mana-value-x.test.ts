/**
 * A sacrifice cost whose filter reads X — "Sacrifice a creature you control
 * with mana value X other than Sidisi: Return target creature card with mana
 * value X plus 1 from your graveyard to the battlefield" (Sidisi, Regent of
 * the Mire). X is announced as the ability is activated though its cost has
 * no {X} (rules 602.2b, 601.2b); the target is chosen at that X (601.2c) and
 * only a creature with that mana value pays (601.2h). The ability is offered
 * once per X that has both.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, activate, ref, spawn, table, toGraveyard } from "./harness.js";

const offers = (game: Game, source: ObjectId) =>
  game.legalActions(A).flatMap((a) => (a.kind === "activate-ability" && a.source === source ? [a] : []));

describe("sacrifice a creature with mana value X", () => {
  it("Sidisi: offered at each X with a creature to sacrifice and a card one above it", () => {
    const { game } = table();
    const sidisi = spawn(game, "Sidisi, Regent of the Mire");
    const elves = spawn(game, "Llanowar Elves");
    const bears = spawn(game, "Grizzly Bears");
    const otherBears = spawn(game, "Grizzly Bears");
    const ogre = toGraveyard(game, "Gray Ogre");
    toGraveyard(game, "Hill Giant");
    const got = offers(game, sidisi);
    // X=1 has Elves but no two-drop card; X=2 has the Bears and the Ogre;
    // X=3 has the Hill Giant's X but nothing to sacrifice (Sidisi is "other
    // than"… and is a 2 anyway).
    expect(got.map((o) => o.xCost)).toEqual([{ minX: 2, maxX: 2 }]);
    expect([...(got[0].sacrifice?.choices ?? [])].sort()).toEqual([bears, otherBears].sort());
    expect(got[0].targetOptions[0]).toEqual([ref(ogre)]);
    expect(got[0].sacrifice?.choices).not.toContain(elves);
  });

  it("returns the card, sacrificing the creature named", () => {
    const { game } = table();
    const sidisi = spawn(game, "Sidisi, Regent of the Mire");
    const bears = spawn(game, "Grizzly Bears");
    const ogre = toGraveyard(game, "Gray Ogre");
    activate(game, sidisi, 0, { x: 2, sacrifice: bears, targets: [ref(ogre)] });
    expect(game.state.objects[bears].zone).toBe("graveyard");
    expect(game.state.objects[ogre].zone).toBe("battlefield");
    expect(game.state.objects[sidisi].tapped).toBe(true);
  });

  it("refuses a creature of another mana value, a card not one above X, and Sidisi itself", () => {
    const { game } = table();
    const sidisi = spawn(game, "Sidisi, Regent of the Mire");
    const elves = spawn(game, "Llanowar Elves");
    const bears = spawn(game, "Grizzly Bears");
    const ogre = toGraveyard(game, "Gray Ogre");
    const giant = toGraveyard(game, "Hill Giant");
    // Elves are a 1, not the X of 2 the Ogre needs.
    expect(() => activate(game, sidisi, 0, { x: 2, sacrifice: elves, targets: [ref(ogre)] })).toThrow();
    // The Hill Giant is a 4: not X plus 1 at X=2.
    expect(() => activate(game, sidisi, 0, { x: 2, sacrifice: bears, targets: [ref(giant)] })).toThrow();
    // Bears at an X of 1.
    expect(() => activate(game, sidisi, 0, { x: 1, sacrifice: bears, targets: [ref(ogre)] })).toThrow();
    // Sidisi is a 2 too, but "other than Sidisi".
    expect(() => activate(game, sidisi, 0, { x: 2, sacrifice: sidisi, targets: [ref(ogre)] })).toThrow();
    expect(game.state.objects[ogre].zone).toBe("graveyard");
  });

  it("a token is a 0: it brings back a one-drop", () => {
    const { game } = table();
    const sidisi = spawn(game, "Sidisi, Regent of the Mire");
    game.debugApplyEffect(A, { kind: "create-token", token: "Clown Robot Token", count: 1 });
    const robot = game.battlefield.find((id) => game.state.objects[id].cardName === "Clown Robot Token") as ObjectId;
    const elves = toGraveyard(game, "Llanowar Elves");
    const got = offers(game, sidisi);
    expect(got.map((o) => o.xCost)).toEqual([{ minX: 0, maxX: 0 }]);
    activate(game, sidisi, 0, { x: 0, sacrifice: robot, targets: [ref(elves)] });
    expect(game.state.objects[elves].zone).toBe("battlefield");
  });
});

/**
 * "Each opponent who controls more creatures than you can't cast creature
 * spells. The same is true for artifacts and enchantments. Each opponent who
 * controls more lands than you can't play lands." (Ward of Bones): a static
 * prohibition's `{ who, controlsMore }` (`PlayersWhoControlMore`), each
 * opponent compared with the source's controller as the gate is read.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, destroy, lands, nextTurn, spawn, table, toHand, toStep } from "./harness.js";

const canCast = (game: Game, card: ObjectId, player: PlayerId): boolean =>
  game.legalActions(player).some((a) => a.kind === "cast-spell" && a.card === card);
const canPlayLand = (game: Game, card: ObjectId, player: PlayerId): boolean =>
  game.legalActions(player).some((a) => a.kind === "play-land" && a.card === card);

describe("Ward of Bones", () => {
  it("stops each opponent with more creatures from casting creature spells, and only them", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Ward of Bones", A);
    spawn(game, "Grizzly Bears", A);
    lands(game, "Plains", 4, A);
    const bobBears = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    lands(game, "Forest", 4, B);
    spawn(game, "Grizzly Bears", C);
    lands(game, "Forest", 4, C);
    const bobs = toHand(game, "Grizzly Bears", B);
    const stone = toHand(game, "Mind Stone", B);
    const carols = toHand(game, "Grizzly Bears", C);
    nextTurn(game);
    expect(canCast(game, bobs, B)).toBe(false);
    // Bob controls no artifact, fewer than Ward of Bones' controller.
    expect(canCast(game, stone, B)).toBe(true);
    // Down to as many creatures as Ward's controller: free again.
    destroy(game, bobBears[0]);
    expect(canCast(game, bobs, B)).toBe(true);
    // Carol has as many creatures as Alice.
    nextTurn(game);
    expect(canCast(game, carols, C)).toBe(true);
  });

  it("does the same for artifacts — an artifact creature too — and enchantments", () => {
    const { game } = table();
    spawn(game, "Ward of Bones", A);
    lands(game, "Plains", 5, A);
    spawn(game, "Mind Stone", B);
    spawn(game, "Sol Ring", B);
    spawn(game, "Glorious Anthem", B);
    lands(game, "Forest", 5, B);
    const stone = toHand(game, "Mind Stone", B);
    const thopter = toHand(game, "Ornithopter", B);
    const anthem = toHand(game, "Glorious Anthem", B);
    const bears = toHand(game, "Grizzly Bears", B);
    nextTurn(game);
    expect(canCast(game, stone, B)).toBe(false);
    expect(canCast(game, thopter, B)).toBe(false);
    expect(canCast(game, anthem, B)).toBe(false);
    expect(canCast(game, bears, B)).toBe(true);
  });

  it("stops an opponent with more lands from playing lands", () => {
    const { game } = table();
    spawn(game, "Ward of Bones", A);
    lands(game, "Plains", 2, A);
    const bobLands = lands(game, "Forest", 3, B);
    const forest = toHand(game, "Forest", B);
    nextTurn(game);
    expect(canPlayLand(game, forest, B)).toBe(false);
    destroy(game, bobLands[0]);
    expect(canPlayLand(game, forest, B)).toBe(true);
  });

  it("never binds its controller", () => {
    const { game } = table();
    spawn(game, "Ward of Bones", A);
    spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 3, B);
    lands(game, "Forest", 2, A);
    toStep(game, "precombat-main", A);
    expect(canCast(game, toHand(game, "Grizzly Bears", A), A)).toBe(true);
    expect(canPlayLand(game, toHand(game, "Forest", A), A)).toBe(true);
  });
});

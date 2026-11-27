/**
 * Keywords shared with every exiled card matching a filter, whoever exiled it
 * (`sharesKeywords.from: { exile }`): "as long as an exiled creature card with
 * a blood counter on it has flying, Rayami has flying. The same is true for …".
 *
 * Proving card: Rayami, First of the Fallen (its dies-replacement is
 * `would-be-put-into-graveyard` with `withCounters`, already built).
 */
import { describe, expect, it } from "vitest";

import { A, B, counters, keywords, settle, spawn, table, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const destroy = (game: Game, id: ObjectId): void => {
  game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [{ kind: "object", object: id }]);
  settle(game);
};

describe("keywords from exiled cards with a counter", () => {
  it("Rayami: a dying nontoken creature is exiled with a blood counter, and Rayami has its keywords", () => {
    const { game } = table();
    const rayami = spawn(game, "Rayami, First of the Fallen", A);
    expect(keywords(game, rayami).has("flying")).toBe(false);
    const angel = spawn(game, "Serra Angel", B);
    destroy(game, angel);
    expect(zone(game, angel)).toBe("exile");
    expect(counters(game, angel, "blood")).toBe(1);
    expect(keywords(game, rayami).has("flying")).toBe(true);
    expect(keywords(game, rayami).has("vigilance")).toBe(true);
    expect(keywords(game, rayami).has("trample")).toBe(false);
  });

  it("an exiled card without a blood counter gives nothing", () => {
    const { game } = table();
    const rayami = spawn(game, "Rayami, First of the Fallen", A);
    game.debugSpawn("Serra Angel", B, "exile");
    settle(game);
    expect(keywords(game, rayami).has("flying")).toBe(false);
  });

  it("a card exiled with a blood counter before Rayami arrived counts too, whoever exiled it", () => {
    const { game } = table();
    const first = spawn(game, "Rayami, First of the Fallen", A);
    const angel = spawn(game, "Serra Angel", B);
    destroy(game, angel);
    // The first Rayami dies too, and is exiled with a blood counter itself.
    destroy(game, first);
    expect(zone(game, first)).toBe("exile");
    const second = spawn(game, "Rayami, First of the Fallen", B);
    expect(keywords(game, second).has("flying")).toBe(true);
  });
});

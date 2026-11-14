/**
 * `opponent-controls-more`'s `by` — "an opponent controls at least two more
 * lands than you" (Isolated Watchtower's activation condition, rule 602.5b):
 * some one opponent, each compared on their own (the ruling).
 */
import { describe, expect, it } from "vitest";

import { A, B, C, activate, lands, spawn, table, toLibrary } from "./harness.js";
import { staticConditionMet } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const canActivate = (game: Game, source: ObjectId, index: number): boolean =>
  game.legalActions(A).some((x) => x.kind === "activate-ability" && x.source === source && x.abilityIndex === index);

describe("opponent-controls-more by — Isolated Watchtower", () => {
  it("activates only while some one opponent controls at least two more lands", () => {
    const { game, a } = table({ players: 3 });
    const tower = spawn(game, "Isolated Watchtower");
    lands(game, "Wastes", 2); // alice: 3 lands with the tower
    lands(game, "Plains", 4, B); // one more than alice
    lands(game, "Plains", 4, C);
    expect(canActivate(game, tower, 1)).toBe(false);
    // Bob and Carol together have far more, but neither has two more on their own.
    spawn(game, "Plains", C); // carol: 5, two more
    expect(canActivate(game, tower, 1)).toBe(true);

    const forest = toLibrary(game, "Forest");
    a.chooseModesFn = () => [0];
    activate(game, tower, 1);
    expect(game.state.objects[forest].zone).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
  });

  it("puts only a basic land card onto the battlefield", () => {
    const { game, a } = table();
    const tower = spawn(game, "Isolated Watchtower");
    lands(game, "Wastes", 2);
    lands(game, "Plains", 5, B);
    const bayou = toLibrary(game, "Bayou");
    a.chooseModesFn = () => [0];
    activate(game, tower, 1);
    expect(game.state.objects[bayou].zone).toBe("library");
  });

  it("still reads one more by default — Land Tax's condition", () => {
    const { game } = table();
    const tax = spawn(game, "Land Tax");
    const more = (by?: number): boolean =>
      staticConditionMet(game.state, game.registry, game.state.objects[tax], {
        kind: "opponent-controls-more",
        filter: { type: "land" },
        ...(by !== undefined ? { by } : {}),
      });
    expect(more()).toBe(false);
    spawn(game, "Plains", B);
    expect(more()).toBe(true);
    expect(more(2)).toBe(false);
    spawn(game, "Plains", B);
    expect(more(2)).toBe(true);
  });
});

/**
 * "Repeat this process once", with one shuffle at the end: a search-library's
 * `shufflesLater` and a closing `shuffle-library` `searchers`. The gap in lands
 * is read before each search, after the last one has closed it (the ruling).
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import { A, B, C, enter, lands, named, table } from "./harness.js";

const shuffles = (game: Game, player: PlayerId = A): number =>
  game.eventsOfType("library-shuffled").filter((e) => e.player === player).length;
const plains = (game: Game): number => named(game, "Plains", A).length;

/** The seat answers each "may" in turn from `answers`, counting what it's asked,
 * and takes the first Plains it's offered. */
function answering(seat: ScriptedController, ...answers: readonly boolean[]): { asked: number } {
  const seen = { asked: 0 };
  seat.chooseModesFn = () => {
    const yes = answers[seen.asked] ?? false;
    seen.asked += 1;
    return yes ? [0] : [];
  };
  seat.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
  return seen;
}

describe("Claim Jumper", () => {
  it("doesn't trigger when no opponent has more lands", () => {
    const { game, a } = table({ deck: "Plains" });
    lands(game, "Wastes", 1, B);
    lands(game, "Wastes", 1, A);
    const seen = answering(a, true, true);
    enter(game, "Claim Jumper");
    expect(seen.asked).toBe(0);
    expect(shuffles(game)).toBe(0);
  });

  it("searches twice while the gap lasts, each Plains tapped, and shuffles once", () => {
    const { game, a } = table({ deck: "Plains" });
    lands(game, "Wastes", 3, B);
    const seen = answering(a, true, true);
    enter(game, "Claim Jumper");
    expect(seen.asked).toBe(2);
    const found = named(game, "Plains", A);
    expect(found).toHaveLength(2);
    expect(found.every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(shuffles(game)).toBe(1);
  });

  it("stops after one when that search closes the gap", () => {
    const { game, a } = table({ deck: "Plains" });
    lands(game, "Wastes", 1, B);
    const seen = answering(a, true, true);
    enter(game, "Claim Jumper");
    expect(seen.asked).toBe(1);
    expect(plains(game)).toBe(1);
    expect(shuffles(game)).toBe(1);
  });

  it("repeats only once, however large the gap", () => {
    const { game, a } = table({ deck: "Plains" });
    lands(game, "Wastes", 6, B);
    const seen = answering(a, true, true, true);
    enter(game, "Claim Jumper");
    expect(seen.asked).toBe(2);
    expect(plains(game)).toBe(2);
  });

  it("declining the first still asks the second, and one search is still a shuffle", () => {
    const { game, a } = table({ deck: "Plains" });
    lands(game, "Wastes", 3, B);
    const seen = answering(a, false, true);
    enter(game, "Claim Jumper");
    expect(seen.asked).toBe(2);
    expect(plains(game)).toBe(1);
    expect(shuffles(game)).toBe(1);
  });

  it("declining both is no search and no shuffle", () => {
    const { game, a } = table({ deck: "Plains" });
    lands(game, "Wastes", 3, B);
    const seen = answering(a, false, false);
    enter(game, "Claim Jumper");
    expect(seen.asked).toBe(2);
    expect(plains(game)).toBe(0);
    expect(shuffles(game)).toBe(0);
  });

  it("a search that finds nothing still shuffles", () => {
    const { game, a } = table();
    lands(game, "Wastes", 1, B);
    const seen = answering(a, true);
    enter(game, "Claim Jumper");
    expect(seen.asked).toBe(2);
    expect(plains(game)).toBe(0);
    expect(shuffles(game)).toBe(1);
  });

  it("any one opponent's lands will do, and only yours shuffles", () => {
    const { game, a } = table({ players: 3, deck: "Plains" });
    lands(game, "Wastes", 2, C);
    answering(a, true, true);
    enter(game, "Claim Jumper");
    expect(plains(game)).toBe(2);
    expect(shuffles(game, C)).toBe(0);
    expect(shuffles(game, B)).toBe(0);
  });
});

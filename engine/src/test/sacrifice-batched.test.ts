/**
 * The `sacrifice` trigger's `batched` — "whenever you sacrifice one or more
 * Foods" (Camellia, the Seedmiser): one trigger per simultaneous event
 * (rule 603.2c), however many Foods it took; each separate sacrifice is its
 * own event.
 */
import { describe, expect, it } from "vitest";

import { A, B, pickPermanents, quiet, settle, spawn, table, tokensNamed } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const foodsLeft = (game: Game): number =>
  game.battlefield.filter((id) => game.state.objects[id].cardName === "Food Token").length;
/** The queued sacrifice is done on the game's next pass. */
const sacrificeFoods = (game: Game, player: typeof A, count: number): void => {
  const before = foodsLeft(game);
  game.debugApplyEffect(player, { kind: "sacrifice", who: "you", filter: { subtype: "Food" }, count }, []);
  game.advanceUntil((s) => foodsLeft(game) === before - count && quiet(s));
};
const food = (game: Game, player = A): ObjectId => {
  const before = new Set(game.battlefield);
  game.debugApplyEffect(player, { kind: "create-token", token: "Food Token", count: 1 }, []);
  settle(game);
  const made = game.battlefield.find((id) => !before.has(id));
  if (made === undefined) throw new Error("no Food");
  return made;
};

describe("sacrifice batched — Camellia, the Seedmiser", () => {
  it("makes one Squirrel for two Foods sacrificed at once, and one for each lone sacrifice", () => {
    const { game, a } = table();
    spawn(game, "Camellia, the Seedmiser");
    const foods = [food(game), food(game), food(game)];
    pickPermanents(a, foods[0], foods[1]);
    sacrificeFoods(game, A, 2);
    expect(tokensNamed(game, "Squirrel Token")).toBe(1);
    sacrificeFoods(game, A, 1);
    expect(tokensNamed(game, "Squirrel Token")).toBe(2);
  });

  it("doesn't see an opponent's sacrifice", () => {
    const { game } = table();
    spawn(game, "Camellia, the Seedmiser");
    food(game, B);
    sacrificeFoods(game, B, 1);
    expect(tokensNamed(game, "Squirrel Token")).toBe(0);
  });
});

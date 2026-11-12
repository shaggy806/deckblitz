/**
 * `shuffle-library`'s `exceptTop` (the rest of the library shuffled under its
 * top cards) and `repeat`'s `mayAgain` paid in life — Lim-Dûl's Vault: look at
 * the top five; as many times as you choose, pay 1 life, put them on the
 * bottom in any order and look at the next five; then shuffle and put the
 * last five looked at on top in any order.
 */
import { describe, expect, it } from "vitest";

import { A, cast, lands, life, settle, table, toHand, toLibrary } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const library = (game: Game): readonly ObjectId[] => game.state.zones.perPlayer[A].library;

/** Ten known cards on top of the 40 Wastes, `top[0]` on top. */
function stack(game: Game): ObjectId[] {
  const names = ["Grizzly Bears", "Hill Giant", "Lightning Bolt", "Counterspell", "Llanowar Elves",
    "Giant Growth", "Shock", "Opt", "Duress", "Ponder"];
  return names.reverse().map((n) => toLibrary(game, n)).reverse();
}

describe("Lim-Dûl's Vault", () => {
  it("paying no life keeps the five on top and shuffles the rest", () => {
    const { game, a } = table({ seed: 7 });
    a.chooseModesFn = () => [];
    lands(game, "Underground Sea", 2);
    const top = stack(game);
    const shuffled = game.state.eventLog.length;
    cast(game, toHand(game, "Lim-Dûl's Vault"));
    settle(game);
    expect(life(game)).toBe(20);
    expect(new Set(library(game).slice(0, 5))).toEqual(new Set(top.slice(0, 5)));
    expect(game.state.eventLog.slice(shuffled).some((e) => e.type === "library-shuffled")).toBe(true);
    expect(library(game)).toHaveLength(42);
  });

  it("each life paid moves the five to the bottom and shows the next five", () => {
    const { game, a } = table({ seed: 7 });
    let asked = 0;
    a.chooseModesFn = () => (++asked <= 1 ? [0] : []);
    lands(game, "Underground Sea", 2);
    const top = stack(game);
    cast(game, toHand(game, "Lim-Dûl's Vault"));
    settle(game);
    expect(asked).toBe(2); // the first "you may", then once "again?"
    expect(life(game)).toBe(19);
    expect(new Set(library(game).slice(0, 5))).toEqual(new Set(top.slice(5, 10)));
  });

  it("twice costs 2 life and shows the five under those", () => {
    const { game, a } = table({ seed: 7 });
    let asked = 0;
    a.chooseModesFn = () => (++asked <= 2 ? [0] : []);
    lands(game, "Underground Sea", 2);
    const top = stack(game);
    cast(game, toHand(game, "Lim-Dûl's Vault"));
    settle(game);
    expect(life(game)).toBe(18);
    // Under the ten known cards are Wastes: the third look's five are those.
    expect(library(game).slice(0, 5).some((id) => top.includes(id))).toBe(false);
  });
});

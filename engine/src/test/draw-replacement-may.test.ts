/**
 * An optional draw replacement: "If you would draw a card, you may instead
 * choose land or nonland and reveal cards from the top of your library until
 * you reveal a card of the chosen kind. Put that card into your hand and put
 * all other cards revealed this way on the bottom of your library in any
 * order." (Abundance — `would-draw`'s `instead: { effect, may: true }`).
 * The drawing player is asked as each draw happens (rule 616.1, the rulings),
 * a draw of several one at a time (614.11a), and it applies to a draw from an
 * empty library (614.11).
 */

import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import { A, hand, lands, settle, spawn, table, toLibrary } from "./harness.js";

const library = (game: Game) => game.state.zones.perPlayer[A].library;
const names = (game: Game, ids: readonly string[]) => ids.map((id) => game.state.objects[id as never].cardName);

/** The seat answers the "draw or Abundance" question with `replace`, then
 * "Land" or "Nonland" with `kind`, recording every question's options. */
function answer(seat: ScriptedController, replace: boolean, kind: "Land" | "Nonland" = "Land"): string[][] {
  const asked: string[][] = [];
  seat.chooseModesFn = (_view, _min, _max, texts) => {
    asked.push([...texts]);
    if (texts.includes("Land")) return [texts.indexOf(kind)];
    const abundance = texts.findIndex((t) => t.startsWith("Abundance"));
    return [replace ? abundance : texts.indexOf("Draw a card")];
  };
  return asked;
}

describe("a draw you may replace (Abundance)", () => {
  it("replaced: land chosen, revealed until a land; it goes to hand, the rest to the bottom, nothing drawn", () => {
    const { game, a } = table();
    spawn(game, "Abundance");
    // The last put on top: Grizzly Bears, then Shock, then Forest.
    for (const name of ["Forest", "Shock", "Grizzly Bears"]) toLibrary(game, name);
    const asked = answer(a, true, "Land");
    const drawnBefore = game.state.players[A].cardsDrawnThisTurn;
    const handBefore = hand(game).length;
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(asked).toEqual([["Draw a card", "Abundance: choose land or nonland and reveal instead"], ["Land", "Nonland"]]);
    expect(hand(game).length).toBe(handBefore + 1);
    expect(names(game, hand(game))).toContain("Forest");
    const lib = library(game);
    expect(names(game, lib.slice(lib.length - 2)).sort()).toEqual(["Grizzly Bears", "Shock"]);
    // Put into the hand, not drawn (the ruling).
    expect(game.state.players[A].cardsDrawnThisTurn).toBe(drawnBefore);
  });

  it("nonland chosen: the first nonland card is taken", () => {
    const { game, a } = table();
    spawn(game, "Abundance");
    for (const name of ["Shock", "Forest", "Island"]) toLibrary(game, name);
    answer(a, true, "Nonland");
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(names(game, hand(game))).toContain("Shock");
    const lib = library(game);
    expect(names(game, lib.slice(lib.length - 2)).sort()).toEqual(["Forest", "Island"]);
  });

  it("declined: the card is drawn", () => {
    const { game, a } = table();
    spawn(game, "Abundance");
    toLibrary(game, "Shock");
    answer(a, false);
    const drawnBefore = game.state.players[A].cardsDrawnThisTurn;
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(names(game, hand(game))).toContain("Shock");
    expect(game.state.players[A].cardsDrawnThisTurn).toBe(drawnBefore + 1);
  });

  it("a draw of two is asked about twice, each draw on its own (the ruling)", () => {
    const { game, a } = table();
    spawn(game, "Abundance");
    for (const name of ["Forest", "Shock", "Grizzly Bears"]) toLibrary(game, name);
    let n = 0;
    const asked: string[][] = [];
    // Replace the first draw (land: the Forest), draw the second.
    a.chooseModesFn = (_view, _min, _max, texts) => {
      asked.push([...texts]);
      if (texts.includes("Land")) return [texts.indexOf("Land")];
      n += 1;
      return [n === 1 ? 1 : 0];
    };
    const handBefore = hand(game).length;
    game.debugApplyEffect(A, { kind: "draw", amount: 2 });
    settle(game);
    expect(asked.map((texts) => texts[0])).toEqual(["Draw a card", "Land", "Draw a card"]);
    expect(hand(game).length).toBe(handBefore + 2);
    // The Forest, then the top card once the Bears and Shock went to the bottom.
    expect(names(game, hand(game))).toContain("Forest");
    expect(names(game, hand(game))).not.toContain("Shock");
  });

  it("with nothing of the chosen kind, every card revealed goes back and none to hand", () => {
    const { game, a } = table();
    spawn(game, "Abundance");
    // The whole library is lands (Wastes), but for one.
    for (const id of [...library(game)].slice(5)) game.debugMove(id, "exile");
    expect(names(game, library(game))).toEqual(["Wastes", "Wastes", "Wastes", "Wastes", "Wastes"]);
    toLibrary(game, "Shock");
    answer(a, true, "Nonland");
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    const handBefore = hand(game).length;
    answer(a, true, "Nonland");
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    // The second found no nonland card among the five Wastes left.
    expect(hand(game).length).toBe(handBefore);
    expect(library(game)).toHaveLength(5);
  });

  it("applies to a draw from an empty library, which then isn't a loss (the ruling)", () => {
    const { game, a } = table();
    spawn(game, "Abundance");
    for (const id of [...library(game)]) game.debugMove(id, "exile");
    const asked = answer(a, true, "Land");
    game.debugApplyEffect(A, { kind: "draw", amount: 2 });
    settle(game);
    // Each of the two draws asked about.
    expect(asked.filter((texts) => texts[0] === "Draw a card")).toHaveLength(2);
    expect(game.state.players[A].attemptedDrawFromEmptyLibrary).not.toBe(true);
    expect(game.state.players[A].hasLost).toBe(false);
  });

  it("Pavel Chekov, First Posting: the same, the rest to the bottom in a random order", () => {
    const { game, a } = table();
    spawn(game, "Pavel Chekov, First Posting");
    for (const name of ["Forest", "Shock", "Grizzly Bears"]) toLibrary(game, name);
    a.chooseModesFn = (_view, _min, _max, texts) => [texts.includes("Land") ? texts.indexOf("Land") : 1];
    // Never asked to order them.
    a.chooseFromZoneFn = () => {
      throw new Error("asked to order the rest");
    };
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(names(game, hand(game))).toContain("Forest");
    const lib = library(game);
    expect(names(game, lib.slice(lib.length - 2)).sort()).toEqual(["Grizzly Bears", "Shock"]);
  });

  it("Obstinate Familiar: a draw skipped is no draw at all, and declined is drawn", () => {
    const { game, a } = table();
    spawn(game, "Obstinate Familiar");
    toLibrary(game, "Shock");
    const asked: string[][] = [];
    let skip = true;
    a.chooseModesFn = (_view, _min, _max, texts) => {
      asked.push([...texts]);
      return [skip ? 1 : 0];
    };
    const handBefore = hand(game).length;
    const drawnBefore = game.state.players[A].cardsDrawnThisTurn;
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(asked).toEqual([["Draw a card", "Obstinate Familiar: skip that draw"]]);
    expect(hand(game).length).toBe(handBefore);
    expect(game.state.players[A].cardsDrawnThisTurn).toBe(drawnBefore);
    skip = false;
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(names(game, hand(game))).toContain("Shock");
  });

  it("Obstinate Familiar: skipping every draw from an empty library isn't a loss", () => {
    const { game, a } = table();
    spawn(game, "Obstinate Familiar");
    for (const id of [...library(game)]) game.debugMove(id, "exile");
    a.chooseModesFn = () => [1];
    game.debugApplyEffect(A, { kind: "draw", amount: 3 });
    settle(game);
    expect(game.state.players[A].attemptedDrawFromEmptyLibrary).not.toBe(true);
    expect(game.state.players[A].hasLost).toBe(false);
  });

  it("beside Underrealm Lich the draw is replaced either way: no plain draw offered", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    spawn(game, "Underrealm Lich");
    spawn(game, "Abundance");
    for (const name of ["Forest", "Shock"]) toLibrary(game, name);
    const asked = answer(a, true, "Land");
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(asked[0]).toEqual(["Underrealm Lich's replacement", "Abundance: choose land or nonland and reveal instead"]);
    expect(names(game, hand(game))).toContain("Forest");
  });
});

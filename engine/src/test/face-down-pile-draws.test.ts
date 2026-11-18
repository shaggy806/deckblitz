/**
 * "Search your library for seven cards, exile them in a face-down pile, and
 * shuffle that pile" and "put the top card of the pile you exiled into your
 * hand" (Parallel Thoughts, Mangara's Tome): a `search-library` to
 * `exile-face-down` with `faceDownLooks: "nobody"` (rule 406.3) and
 * `shufflePile` (rule 701.24a — the pile's order random), linked to its
 * source (rule 607.2a), and `return-exiled-by-source`'s `top`, the first of
 * the linked cards still in exile, as a draw's replacement (rule 614.11).
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { viewFor } from "../view.js";
import { A, B, activate, destroy, enter, hand, lands, settle, table, toLibrary, turnTotal } from "./harness.js";

const NAMES = ["Shock", "Forest", "Island", "Swamp", "Mountain", "Plains", "Opt"] as const;

/** Seven distinct cards on top of alice's library, picked by her search. */
function stock(game: Game, seat: ScriptedController, names: readonly string[] = NAMES): ObjectId[] {
  const ids = names.map((name) => toLibrary(game, name));
  seat.chooseFromZoneFn = (_view, eligible) => ids.filter((id) => eligible.includes(id));
  return ids;
}

/** The cards in exile linked to `source`, in exile order — the pile, top first. */
function pile(game: Game, source: ObjectId): ObjectId[] {
  return game.state.zones.shared.exile.filter((id) => game.state.objects[id]?.exiledWith?.source === source);
}

/** Answers each "draw or the pile" question with `replace`, recording them. */
function replaceDraws(seat: ScriptedController, replace: boolean): string[][] {
  const asked: string[][] = [];
  seat.chooseModesFn = (_view, _min, _max, texts) => {
    asked.push([...texts]);
    const draw = texts.indexOf("Draw a card");
    return [replace ? texts.findIndex((_t, i) => i !== draw) : draw];
  };
  return asked;
}

describe("Parallel Thoughts", () => {
  it("exiles the seven cards found face down, linked to it, where nobody may look", () => {
    const { game, a } = table();
    const found = stock(game, a);
    const thoughts = enter(game, "Parallel Thoughts");
    const exiled = pile(game, thoughts);
    expect([...exiled].sort()).toEqual([...found].sort());
    for (const id of exiled) {
      expect(game.state.objects[id].zone).toBe("exile");
      expect(game.state.objects[id].exiledFaceDown).toMatchObject({ lookers: [], lookersOnly: true });
      // Its owner included (the ruling: "You can't look at the face down cards").
      expect(viewFor(game.state, game.registry, A).objects[id]).toBeUndefined();
      expect(viewFor(game.state, game.registry, B).objects[id]).toBeUndefined();
    }
  });

  it("shuffles the pile: its order isn't the order the cards were found in", () => {
    // Over a few seeds, the pile comes out in some order other than the
    // search's at least once (rule 701.24a) — and every seed's view lists
    // those hidden cards in one fixed order, whatever the pile's.
    const orders = new Set<string>();
    for (const seed of [1, 2, 3, 4, 5]) {
      const { game, a } = table({ seed });
      const found = stock(game, a);
      const thoughts = enter(game, "Parallel Thoughts");
      const exiled = pile(game, thoughts);
      orders.add(exiled.map((id) => found.indexOf(id)).join(","));
      expect(viewFor(game.state, game.registry, A).zones.exile).toEqual([...exiled].sort());
    }
    expect(orders.size).toBeGreaterThan(1);
  });

  it("with fewer than seven cards in the library, exiles them all", () => {
    const { game, a } = table({ deck: "Wastes" });
    const library = game.state.zones.perPlayer[A].library;
    library.splice(3);
    const left = [...library];
    a.chooseFromZoneFn = (_view, eligible) => [...eligible];
    const thoughts = enter(game, "Parallel Thoughts");
    expect([...pile(game, thoughts)].sort()).toEqual([...left].sort());
    expect(game.state.zones.perPlayer[A].library).toEqual([]);
  });

  it("a draw may instead take the pile's top card, which isn't drawn", () => {
    const { game, a } = table();
    stock(game, a);
    const thoughts = enter(game, "Parallel Thoughts");
    const top = pile(game, thoughts)[0];
    const libraryTop = game.state.zones.perPlayer[A].library[0];
    const asked = replaceDraws(a, true);
    const drawnBefore = turnTotal(game.state, A, "card-drawn");
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(asked[0]).toContain("Draw a card");
    expect(hand(game)).toContain(top);
    expect(hand(game)).not.toContain(libraryTop);
    expect(game.state.objects[top].exiledFaceDown).toBeUndefined();
    expect(pile(game, thoughts)).toHaveLength(6);
    expect(turnTotal(game.state, A, "card-drawn")).toBe(drawnBefore);
  });

  it("declined, the card is drawn and the pile stays", () => {
    const { game, a } = table();
    stock(game, a);
    const thoughts = enter(game, "Parallel Thoughts");
    const libraryTop = game.state.zones.perPlayer[A].library[0];
    replaceDraws(a, false);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(hand(game)).toContain(libraryTop);
    expect(pile(game, thoughts)).toHaveLength(7);
  });

  it("with the pile empty, taking it still replaces the draw — nothing comes", () => {
    const { game, a } = table();
    a.chooseFromZoneFn = () => [];
    const library = game.state.zones.perPlayer[A].library;
    library.splice(0);
    const thoughts = enter(game, "Parallel Thoughts");
    expect(pile(game, thoughts)).toEqual([]);
    toLibrary(game, "Forest");
    const asked = replaceDraws(a, true);
    const handBefore = hand(game).length;
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(asked).toHaveLength(1);
    expect(hand(game)).toHaveLength(handBefore);
    expect(game.state.zones.perPlayer[A].library).toHaveLength(1);
  });

  it("an opponent's draw isn't replaced", () => {
    const { game, a, b } = table();
    stock(game, a);
    enter(game, "Parallel Thoughts");
    const asked = replaceDraws(b, true);
    const top = game.state.zones.perPlayer[B].library[0];
    game.debugApplyEffect(B, { kind: "draw", amount: 1 });
    settle(game);
    expect(asked).toEqual([]);
    expect(hand(game, B)).toContain(top);
  });
});

describe("Mangara's Tome", () => {
  it("exiles five cards in a face-down pile; {2}: the next draw this turn is its top card instead", () => {
    const { game, a } = table();
    stock(game, a, NAMES.slice(0, 5));
    const tome = enter(game, "Mangara's Tome");
    expect(pile(game, tome)).toHaveLength(5);
    const top = pile(game, tome)[0];
    lands(game, "Wastes", 2);
    activate(game, tome);
    const libraryTop = game.state.zones.perPlayer[A].library[0];
    game.debugApplyEffect(A, { kind: "draw", amount: 2 });
    settle(game);
    // The first draw only: the next one is a draw.
    expect(hand(game)).toContain(top);
    expect(hand(game)).toContain(libraryTop);
    expect(pile(game, tome)).toHaveLength(4);
  });

  it("the replacement still takes from the pile once the Tome has left the battlefield (rule 607.2a)", () => {
    const { game, a } = table();
    stock(game, a, NAMES.slice(0, 5));
    const tome = enter(game, "Mangara's Tome");
    const top = pile(game, tome)[0];
    lands(game, "Wastes", 2);
    activate(game, tome);
    destroy(game, tome);
    settle(game);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(hand(game)).toContain(top);
    expect(game.state.objects[top].zone).toBe("hand");
  });
});

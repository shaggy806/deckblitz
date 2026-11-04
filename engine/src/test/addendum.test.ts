/**
 * Addendum: "if you cast this spell during your main phase". Unbreakable
 * Formation, whose bonus reaches the same creatures as its first sentence, in
 * each of the ways it doesn't apply: another step, another player's main phase,
 * a copy (the rulings), and it being countered.
 */
import { describe, expect, it } from "vitest";
import type { ObjectId } from "../primitives.js";
import type { Game } from "../game.js";
import { activePlayerOf } from "../state.js";
import {
  A,
  B,
  cast,
  counters,
  keywords,
  lands,
  nextTurn,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const formation = (game: Game, opts: { settle?: boolean } = {}): ObjectId => {
  lands(game, "Plains", 3);
  const card = toHand(game, "Unbreakable Formation");
  cast(game, card, { settle: opts.settle ?? true });
  return card;
};

describe("Unbreakable Formation", () => {
  it("in your main phase: indestructible, a counter and vigilance on each creature you control, and no other's", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const also = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    formation(game);
    for (const id of [mine, also]) {
      expect(keywords(game, id).has("indestructible")).toBe(true);
      expect(keywords(game, id).has("vigilance")).toBe(true);
      expect(counters(game, id)).toBe(1);
      expect(pt(game, id)).toEqual({ power: 3, toughness: 3 });
    }
    expect(keywords(game, theirs).has("indestructible")).toBe(false);
    expect(counters(game, theirs)).toBe(0);
  });

  it("in your second main phase too", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    toStep(game, "postcombat-main");
    formation(game);
    expect(counters(game, mine)).toBe(1);
  });

  it("outside a main phase: indestructible alone", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    toStep(game, "begin-combat");
    formation(game);
    expect(keywords(game, mine).has("indestructible")).toBe(true);
    expect(keywords(game, mine).has("vigilance")).toBe(false);
    expect(counters(game, mine)).toBe(0);
  });

  it("in another player's main phase: indestructible alone", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    lands(game, "Plains", 3);
    const card = toHand(game, "Unbreakable Formation");
    game.dispatch({ type: "pass-priority", player: B });
    cast(game, card);
    expect(keywords(game, mine).has("indestructible")).toBe(true);
    expect(counters(game, mine)).toBe(0);
  });

  it("a copy wasn't cast, so it gives no counters; the spell itself does", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const card = formation(game, { settle: false });
    lands(game, "Island", 2);
    cast(game, toHand(game, "Twincast"), { targets: [ref(card)], settle: false });
    // Twincast resolves, its copy resolves: one set of indestructible, no counter yet.
    game.advanceUntil((s) => s.zones.shared.stack.at(-1) === card && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(counters(game, mine)).toBe(0);
    expect(keywords(game, mine).has("indestructible")).toBe(true);
    settle(game);
    expect(counters(game, mine)).toBe(1);
  });

  it("gives nothing if it's countered", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const card = formation(game, { settle: false });
    lands(game, "Island", 2, B);
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, toHand(game, "Counterspell", B), { player: B, targets: [ref(card)] });
    expect(zone(game, card)).toBe("graveyard");
    expect(keywords(game, mine).has("indestructible")).toBe(false);
    expect(counters(game, mine)).toBe(0);
  });

  it("doesn't reach a creature you get later (the ruling)", () => {
    const { game } = table();
    formation(game);
    const later = spawn(game, "Grizzly Bears");
    expect(keywords(game, later).has("indestructible")).toBe(false);
    expect(counters(game, later)).toBe(0);
  });
});

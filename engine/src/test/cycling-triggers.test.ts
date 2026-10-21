/**
 * "Whenever you cycle a card" / "another card" (rule 702.29 — the `cycles`
 * trigger) and "a card with a cycling ability" (`hasCycling`): Ikoria's
 * cycling payoffs (batch 117).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  cast,
  hand,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
} from "./harness.js";

const cycle = (game: Game, card: ObjectId): void => {
  game.dispatch({ type: "cycle", player: A, card });
  settle(game);
};

describe("whenever you cycle a card", () => {
  it("triggers on each card you cycle", () => {
    const { game } = table();
    const marmoset = spawn(game, "Prickly Marmoset");
    spawn(game, "Drannith Healer");
    lands(game, "Wastes", 2);
    const base = pt(game, marmoset);
    const card = toHand(game, "Startling Development");
    const before = hand(game).length;
    cycle(game, card);
    expect(pt(game, marmoset)).toEqual({ power: base.power + 2, toughness: base.toughness });
    expect(life(game, A)).toBe(21);
    expect(hand(game).length).toBe(before - 1 + 1); // discarded to cycle, then drew
  });

  it("doesn't trigger for an opponent's cycling", () => {
    const { game } = table();
    spawn(game, "Drannith Healer");
    spawn(game, "Drannith Healer", B);
    lands(game, "Wastes", 1);
    cycle(game, toHand(game, "Startling Development"));
    expect(life(game, A)).toBe(21);
    expect(life(game, B)).toBe(20);
  });

  it("Savai Thundermane: pay {2} when you cycle, and it deals 2 to target creature as you gain 2", () => {
    const { game, a } = table();
    spawn(game, "Savai Thundermane");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 3);
    pickModes(a, 0);
    pickTargets(a, bears);
    cycle(game, toHand(game, "Startling Development"));
    expect(game.state.objects[bears].zone).toBe("graveyard");
    expect(life(game, A)).toBe(22);
  });
});

describe("a card with a cycling ability", () => {
  it("Zenith Flare counts the cycling cards in your graveyard", () => {
    const { game } = table();
    toGraveyard(game, "Startling Development");
    toGraveyard(game, "Void Beckoner");
    toGraveyard(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Zenith Flare"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });
});

/**
 * A static permission's filter comparing against an amount (`PlayTerms
 * .filter`'s `{ amount }` operand, counted from the permission's source,
 * live): Arcade Gannon's "you may cast an artifact or Human spell from your
 * graveyard with mana value less than or equal to the number of quest
 * counters on Arcade Gannon", once during each of your turns.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, activate, counters, hand, lands, ref, settle, spawn, table, toGraveyard, zone } from "./harness.js";

const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card);

/** Cast `card` from the graveyard under the permission the offer names. */
function castFromGraveyard(game: Game, card: ObjectId): void {
  const offer = game.legalActions(A).find((a) => a.kind === "cast-spell" && a.card === card);
  if (offer?.kind !== "cast-spell") throw new Error("not offered from the graveyard");
  game.dispatch({ type: "cast-spell", player: A, card, targets: [], ...(offer.via !== undefined ? { via: offer.via } : {}) });
  settle(game);
}

const addQuest = (game: Game, id: ObjectId, n: number): void => {
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "quest", amount: n }, [ref(id)]);
};

describe("Arcade Gannon", () => {
  it("{T}: draws a card, then discards a card, and gets a quest counter", () => {
    const { game, a } = table();
    const arcade = spawn(game, "Arcade Gannon");
    const ring = game.debugSpawn("Sol Ring", A, "hand");
    const before = hand(game).length;
    a.chooseDiscardsFn = () => [ring];
    activate(game, arcade);
    expect(hand(game).length).toBe(before);
    expect(zone(game, ring)).toBe("graveyard");
    expect(counters(game, arcade, "quest")).toBe(1);
  });

  it("casts an artifact or Human spell from the graveyard only with mana value up to its quest counters", () => {
    const { game } = table();
    const arcade = spawn(game, "Arcade Gannon");
    lands(game, "Plains", 3);
    const thopter = toGraveyard(game, "Ornithopter");
    const splitter = toGraveyard(game, "Bonesplitter");
    const inspector = toGraveyard(game, "Thraben Inspector");
    const bears = toGraveyard(game, "Grizzly Bears");
    // No quest counters: only mana value 0.
    expect(castable(game, thopter)).toBe(true);
    expect(castable(game, splitter)).toBe(false);
    expect(castable(game, inspector)).toBe(false);
    // One: mana value 1 too, read live; a Bear is neither artifact nor Human.
    addQuest(game, arcade, 1);
    expect(castable(game, splitter)).toBe(true);
    expect(castable(game, inspector)).toBe(true);
    addQuest(game, arcade, 1);
    expect(castable(game, bears)).toBe(false);
  });

  it("once during each of your turns", () => {
    const { game } = table();
    const arcade = spawn(game, "Arcade Gannon");
    lands(game, "Plains", 3);
    addQuest(game, arcade, 2);
    const splitter = toGraveyard(game, "Bonesplitter");
    const inspector = toGraveyard(game, "Thraben Inspector");
    castFromGraveyard(game, splitter);
    expect(zone(game, splitter)).toBe("battlefield");
    expect(castable(game, inspector)).toBe(false);
  });
});

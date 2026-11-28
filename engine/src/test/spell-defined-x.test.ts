/**
 * A spell's X defined by its own text, read as it's cast (rule 107.3c) —
 * Spoils of War's "X is the number of artifact and/or creature cards in an
 * opponent's graveyard as you cast this spell": the caster names the
 * opponent, so it's offered once per X an opponent gives, and any other X is
 * refused.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { A, B, C, cast, counters, lands, ref, settle, spawn, table, toGraveyard, toHand } from "./harness.js";

type CastOffer = Extract<ReturnType<Game["legalActions"]>[number], { kind: "cast-spell" }>;

const offersFor = (game: Game, card: string): CastOffer[] =>
  game.legalActions(A).filter((o): o is CastOffer => o.kind === "cast-spell" && o.cardName === card);

describe("Spoils of War", () => {
  it("is offered at exactly each opponent's count, artifacts and creatures alike", () => {
    const { game } = table({ players: 3, openingHandSize: 0 });
    lands(game, "Swamp", 6);
    toHand(game, "Spoils of War");
    toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Sol Ring", B);
    toGraveyard(game, "Ornithopter", B); // an artifact creature: one card
    toGraveyard(game, "Swamp", B); // neither
    toGraveyard(game, "Grizzly Bears", C);
    toGraveyard(game, "Grizzly Bears", A); // the caster's own: never
    toGraveyard(game, "Grizzly Bears", A);
    toGraveyard(game, "Grizzly Bears", A);
    toGraveyard(game, "Grizzly Bears", A);
    const xs = offersFor(game, "Spoils of War").map((o) => o.xCost);
    expect(xs).toEqual([
      { maxX: 1, minX: 1 },
      { maxX: 3, minX: 3 },
    ]);
  });

  it("only as high as the mana goes", () => {
    const { game } = table({ openingHandSize: 0 });
    lands(game, "Swamp", 2);
    toHand(game, "Spoils of War");
    for (let i = 0; i < 3; i += 1) toGraveyard(game, "Grizzly Bears", B);
    expect(offersFor(game, "Spoils of War")).toEqual([]);
  });

  it("distributes that many counters, and refuses any other X", () => {
    const { game } = table({ openingHandSize: 0 });
    lands(game, "Swamp", 4);
    const spoils = toHand(game, "Spoils of War");
    toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Sol Ring", B);
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    expect(() => cast(game, spoils, { x: 1, targets: [ref(bears)] })).toThrow(/X can't be 1/);
    expect(() => cast(game, spoils, { x: 3, targets: [ref(bears)] })).toThrow(/X can't be 3/);
    cast(game, spoils, { x: 2, targets: [ref(bears), ref(elves)], division: [1, 1] });
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, elves)).toBe(1);
  });

  it("is fixed as it's cast: a card that leaves the graveyard afterwards changes nothing", () => {
    const { game } = table({ openingHandSize: 0 });
    lands(game, "Swamp", 4);
    const spoils = toHand(game, "Spoils of War");
    toGraveyard(game, "Grizzly Bears", B);
    const gone = toGraveyard(game, "Grizzly Bears", B);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, spoils, { x: 2, targets: [ref(bears)], settle: false });
    game.debugMove(gone, "exile");
    settle(game);
    expect(counters(game, bears)).toBe(2);
  });

  it("at X 0 with an empty graveyard opposite: cast for {B}, no targets", () => {
    const { game } = table({ openingHandSize: 0 });
    lands(game, "Swamp", 1);
    toHand(game, "Spoils of War");
    expect(offersFor(game, "Spoils of War").map((o) => o.xCost)).toEqual([{ maxX: 0, minX: 0 }]);
  });
});

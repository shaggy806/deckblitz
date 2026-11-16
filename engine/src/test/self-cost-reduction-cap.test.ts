/**
 * A self cost reduction with a cap (rule 601.2f): Valiant Changeling's "{1}
 * less for each creature type among creatures you control. This effect can't
 * reduce the amount of mana this spell costs by more than {5}" is the lesser
 * of the different creature types (a changeling every one, rule 702.73a) and
 * 5 — so a cost increase past {5} generic still leaves that much to pay.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, cast, lands, spawn, table, toHand, zone } from "./harness.js";

const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card);

describe("Valiant Changeling", () => {
  it("costs {1} less for each different creature type among your creatures", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Savannah Lions");
    const changeling = toHand(game, "Valiant Changeling");
    // A Bear and a Cat: {3}{W}{W}, one more than three Plains.
    expect(castable(game, changeling)).toBe(false);
    spawn(game, "Walking Corpse");
    // And a Zombie: {2}{W}{W}… still four.
    expect(castable(game, changeling)).toBe(false);
    lands(game, "Plains", 1);
    cast(game, changeling);
    expect(zone(game, changeling)).toBe("battlefield");
  });

  it("a changeling is every type, but it takes off no more than {5}", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    spawn(game, "Changeling Outcast");
    const changeling = toHand(game, "Valiant Changeling");
    expect(castable(game, changeling)).toBe(true);
    cast(game, changeling);
    expect(zone(game, changeling)).toBe("battlefield");
  });

  it("a cost increase past {5} generic still leaves mana to pay", () => {
    const { game } = table();
    spawn(game, "Sphere of Resistance");
    spawn(game, "Changeling Outcast");
    lands(game, "Plains", 2);
    const changeling = toHand(game, "Valiant Changeling");
    // {6}{W}{W} less {5}: {1}{W}{W}.
    expect(castable(game, changeling)).toBe(false);
    lands(game, "Plains", 1);
    cast(game, changeling);
    expect(zone(game, changeling)).toBe("battlefield");
  });
});

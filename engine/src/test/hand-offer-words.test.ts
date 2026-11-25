/**
 * The words a hand card's offers carry for a client to label them by. A sweep
 * of every way to play or use a card from the hand (2026-11-24) found rows
 * that said nothing of what they'd do: A.I.M. Scientists' basic landcycling
 * was "Cycle {2}", Lashknife's "tap an untapped creature you control rather
 * than pay" was "{0}", a Bringer's {W}{U}{B}{R}{G} wasn't marked as its
 * alternative cost, and the Ninja's pill said "Can't pay its cost" with no
 * attacker to return.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { A, B, lands, spawn, table, toHand } from "./harness.js";
import type { ObjectId } from "../primitives.js";

const casts = (game: Game, card: ObjectId) =>
  game.legalActions(A).flatMap((l) => (l.kind === "cast-spell" && l.card === card ? [l] : []));

describe("a cycling offer names its keyword", () => {
  it("plain cycling, basic landcycling, a subtype's cycling", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const names = ["Airship Crash", "A.I.M. Scientists", "Daggermaw Megalodon"].map((name) => {
      const card = toHand(game, name);
      const offer = game.legalActions(A).find((l) => l.kind === "cycle" && l.card === card);
      return offer?.kind === "cycle" ? offer.name : undefined;
    });
    expect(names).toEqual(["Cycling", "Basic landcycling", "Islandcycling"]);
  });
});

describe("an alternative cost's row says what it costs", () => {
  it("Lashknife: the creature it taps", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    spawn(game, "Savannah Lions", A);
    const card = toHand(game, "Lashknife");
    expect(casts(game, card).map((c) => c.altCostText)).toEqual([undefined, "tap an untapped creature you control"]);
  });

  it("Sephara: the mana and the four fliers", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    for (let i = 0; i < 4; i++) spawn(game, "Serra Angel", A);
    const card = toHand(game, "Sephara, Sky's Blade");
    expect(casts(game, card).find((c) => c.altCost === true)?.altCostText).toBe(
      "pay {W}, tap four untapped creatures you control with flying",
    );
  });

  it("a Bringer's five colours are its alternative cost", () => {
    const { game } = table();
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) lands(game, land, 2);
    const card = toHand(game, "Bringer of the Black Dawn");
    expect(casts(game, card).map((c) => c.altCostText)).toEqual([undefined, "alternative cost"]);
  });
});

describe("a ninjutsu pill with no attacker to return", () => {
  it("says so", () => {
    const { game } = table();
    lands(game, "Island", 2);
    spawn(game, "Grizzly Bears", B);
    toHand(game, "Ninja of the Deep Hours");
    expect(game.unavailableHandAbilities(A).map((u) => u.why)).toEqual(["No unblocked attacker to return"]);
  });
});

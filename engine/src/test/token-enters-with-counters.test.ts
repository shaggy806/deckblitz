/**
 * `create-token`'s `withCounters`: a token that enters with counters (rule
 * 122.6), so whatever sees it enter sees them — Printlifter Ooze's "the token
 * enters with X +1/+1 counters on it". Written from the Oracle text.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, cast, counters, hand, keywords, lands, named, pt, settle, spawn, table, toHand } from "./harness.js";

const faceDownCast = (game: Game, card: ObjectId): void => cast(game, card, { via: "face-down" });
const turnUp = (game: Game, permanent: ObjectId): void => {
  game.dispatch({ type: "turn-face-up", player: A, permanent, morph: true } as Action);
  settle(game);
};
const ooze = (game: Game): ObjectId => {
  const [token] = named(game, "0/0 Trample Ooze Token", A);
  if (token === undefined) throw new Error("no Ooze token");
  return token;
};

/** Printlifter Ooze cast face down and turned face up with its disguise. */
const disguiseThenTurnUp = (game: Game): ObjectId => {
  lands(game, "Wastes", 3);
  const lifter = toHand(game, "Printlifter Ooze");
  faceDownCast(game, lifter);
  lands(game, "Forest", 4);
  turnUp(game, lifter);
  return lifter;
};

describe("Printlifter Ooze", () => {
  it("turned face up, makes a trampling Ooze with a counter for each other creature you control", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    disguiseThenTurnUp(game);
    const token = ooze(game);
    // Two Bears and Printlifter Ooze itself.
    expect(counters(game, token)).toBe(3);
    expect(pt(game, token)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, token).has("trample")).toBe(true);
  });

  it("triggers for another creature you control turned face up", () => {
    const { game } = table();
    spawn(game, "Printlifter Ooze");
    lands(game, "Wastes", 3);
    const alchemist = toHand(game, "Aphetto Alchemist");
    faceDownCast(game, alchemist);
    lands(game, "Island", 1);
    turnUp(game, alchemist);
    expect(counters(game, ooze(game))).toBe(2);
  });

  it("enters with them: an enters trigger sees its power (Garruk's Uprising)", () => {
    const { game } = table();
    spawn(game, "Garruk's Uprising");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    const before = hand(game, A).length;
    disguiseThenTurnUp(game);
    // Four creatures: the Ooze enters a 4/4, and Garruk's Uprising draws.
    expect(counters(game, ooze(game))).toBe(4);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("they're put on it, so Hardened Scales adds one (rule 122.6)", () => {
    const { game } = table();
    spawn(game, "Hardened Scales");
    disguiseThenTurnUp(game);
    expect(counters(game, ooze(game))).toBe(2);
  });
});

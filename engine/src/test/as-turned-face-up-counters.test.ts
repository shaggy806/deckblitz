/**
 * "As this creature enters or is turned face up, put X +1/+1 counters on it,
 * where X is the number of other creatures you control" (Crowd-Control
 * Warden): `asTurnedFaceUp`'s counters as a count, read as it's turned face
 * up (rule 708.8 — it doesn't enter), beside the entering half's
 * `enters-battlefield` replacement.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, counters, lands, pt, spawn, table, toHand } from "./harness.js";

const turnUp = (game: Game, permanent: ObjectId): void => {
  game.dispatch({ type: "turn-face-up", player: A, permanent, morph: true } as Action);
};

describe("Crowd-Control Warden", () => {
  it("turned face up, it gets a counter for each other creature you control then", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    lands(game, "Forest", 5);
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    const warden = toHand(game, "Crowd-Control Warden");
    cast(game, warden, { via: "face-down" });
    // Face down it has no abilities (708.2a): no counters as it entered.
    expect(counters(game, warden)).toBe(0);
    spawn(game, "Llanowar Elves");
    turnUp(game, warden);
    expect(counters(game, warden)).toBe(2);
    expect(pt(game, warden)).toEqual({ power: 6, toughness: 6 });
  });

  it("cast face up, it enters with them", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    lands(game, "Plains", 2);
    spawn(game, "Grizzly Bears");
    spawn(game, "Llanowar Elves");
    spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Crowd-Control Warden"));
    const warden = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Crowd-Control Warden")!;
    expect(counters(game, warden)).toBe(2);
  });
});

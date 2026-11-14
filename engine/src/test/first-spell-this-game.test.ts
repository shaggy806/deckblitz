/**
 * The `first-spell-this-game` condition: "if this spell is the first spell
 * you've cast this game". Asked as a spell is cast (a `freeCastIf`, rule
 * 601.2b — Once Upon a Time), you've cast none yet; asked on resolution
 * (First Contact), the spell was cast before any other of yours, a spell cast
 * in response changing nothing. Another player's spells don't count.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, cast, hand, lands, life, nextTurn, pickFromZone, ref, settle, spawn, table, toHand } from "./harness.js";

const freeOffered = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card && a.free === true);

describe("Once Upon a Time", () => {
  it("is cast free as your first spell this game, and finds a land", () => {
    const { game, a } = table();
    const once = toHand(game, "Once Upon a Time");
    expect(freeOffered(game, once)).toBe(true);
    const top = game.state.zones.perPlayer[A].library[0];
    const seen = pickFromZone(a, top);
    cast(game, once, { free: true });
    expect(seen.offered.length).toBe(5);
    expect(hand(game, A)).toContain(top);
  });

  it("isn't free once you've cast a spell, this turn or an earlier one", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears", A);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    const once = toHand(game, "Once Upon a Time");
    expect(freeOffered(game, once)).toBe(false);
    expect(() => cast(game, once, { free: true })).toThrow(/free-cast condition/);
    nextTurn(game);
    nextTurn(game);
    expect(freeOffered(game, once)).toBe(false);
  });

  it("is still free after an opponent's spell", () => {
    const { game } = table();
    nextTurn(game);
    lands(game, "Forest", 1, B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Giant Growth", B), { player: B, targets: [ref(bears)] });
    nextTurn(game);
    expect(freeOffered(game, toHand(game, "Once Upon a Time"))).toBe(true);
  });
});

describe("First Contact", () => {
  it("gains 2 life as your first spell, a spell cast in response notwithstanding", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears", A);
    cast(game, toHand(game, "First Contact"), { settle: false });
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)], settle: false });
    settle(game);
    expect(life(game, A)).toBe(22);
  });

  it("gains nothing as your second spell", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears", A);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    cast(game, toHand(game, "First Contact"));
    expect(life(game, A)).toBe(20);
  });
});

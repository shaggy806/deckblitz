/**
 * "Whenever this creature evolves" (rule 702.100b): a creature evolves when
 * one or more +1/+1 counters are put on it as a result of its evolve ability
 * resolving — the `evolves` trigger, off the counter `evolve()` marks.
 * Watchful Radstag: "create a token that's a copy of it".
 */

import { describe, expect, it } from "vitest";

import { A, counters, enter, pt, ref, settle, spawn, table } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const RADSTAG = "Watchful Radstag";

/** Alice's Radstags on the battlefield, tokens or not. */
const radstags = (game: Game, token?: boolean): ObjectId[] =>
  game.battlefield.filter((id) => {
    const o = game.state.objects[id];
    return (o.copyOf ?? o.cardName) === RADSTAG && (token === undefined || o.isToken === token);
  });

describe("Watchful Radstag", () => {
  it("evolves when a bigger creature enters, and makes a token copy of itself", () => {
    const { game } = table();
    const stag = spawn(game, RADSTAG);
    enter(game, "Hill Giant");
    expect(counters(game, stag)).toBe(1);
    const tokens = radstags(game, true);
    expect(tokens).toHaveLength(1);
    // A copy of the card: 2/2, no counter (rule 707.2), and it didn't evolve
    // for itself or make the original evolve again.
    expect(pt(game, tokens[0])).toEqual({ power: 2, toughness: 2 });
    expect(counters(game, tokens[0])).toBe(0);
    expect(pt(game, stag)).toEqual({ power: 3, toughness: 3 });
  });

  it("the token has both abilities: each Radstag that evolves makes its own copy", () => {
    const { game } = table();
    spawn(game, RADSTAG);
    enter(game, "Hill Giant");
    expect(radstags(game)).toHaveLength(2);
    // A 6/4: bigger than the 3/3 original and the 2/2 token.
    enter(game, "Craw Wurm");
    // Both evolved, and each made a copy: 2 + 2. The new 2/2 tokens then
    // evolve nobody (nothing they're bigger than).
    expect(radstags(game)).toHaveLength(4);
    expect(radstags(game, true)).toHaveLength(3);
  });

  it("doesn't evolve for a creature no bigger, or for a counter put any other way", () => {
    const { game } = table();
    const stag = spawn(game, RADSTAG);
    enter(game, "Grizzly Bears");
    expect(counters(game, stag)).toBe(0);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(stag)]);
    settle(game);
    expect(counters(game, stag)).toBe(1);
    expect(radstags(game, true)).toHaveLength(0);
  });

  it("evolves once, however many counters a replacement makes of the one (the ruling)", () => {
    const { game } = table();
    spawn(game, "Hardened Scales");
    const stag = spawn(game, RADSTAG);
    enter(game, "Hill Giant");
    expect(counters(game, stag)).toBe(2);
    expect(radstags(game, true)).toHaveLength(1);
  });

  it("doesn't evolve when no counter is put on it (the ruling)", () => {
    const { game } = table();
    spawn(game, "Solemnity");
    const stag = spawn(game, RADSTAG);
    enter(game, "Hill Giant");
    expect(counters(game, stag)).toBe(0);
    expect(radstags(game, true)).toHaveLength(0);
  });
});

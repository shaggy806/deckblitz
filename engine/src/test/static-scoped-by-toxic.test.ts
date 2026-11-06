/**
 * A static scoped by toxic (rule 702.164) — "creatures you control with toxic
 * have lifelink" (Skrelv's Hive, under corrupted): toxic a creature prints and
 * toxic another layer-6 effect grants it both count (rule 613.8, the grant
 * depends on the toxic), and a creature that lost its abilities has none.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, keywords, lands, life, nextTurn, ref, spawn, table, toHand, tokensNamed } from "./harness.js";

const poison = (game: Game, n: number): void => {
  game.state.players[B].counters = { ...game.state.players[B].counters, poison: n };
};
const lifelink = (game: Game, id: ObjectId): boolean => keywords(game, id).has("lifelink");

describe("Skrelv's Hive", () => {
  it("gives lifelink to your creatures with toxic once an opponent has three poison counters", () => {
    const { game } = table();
    spawn(game, "Skrelv's Hive");
    const mite = spawn(game, "Phyrexian Mite Token");
    const bears = spawn(game, "Grizzly Bears");
    const theirMite = spawn(game, "Phyrexian Mite Token", B);
    poison(game, 2);
    expect(lifelink(game, mite)).toBe(false);
    poison(game, 3);
    expect(lifelink(game, mite)).toBe(true);
    expect(lifelink(game, bears)).toBe(false);
    expect(lifelink(game, theirMite)).toBe(false);
  });

  it("counts toxic a static grants (Karumonix's Rats, Necrogen Communion's Aura)", () => {
    const { game } = table();
    spawn(game, "Skrelv's Hive");
    poison(game, 3);
    const rats = spawn(game, "Typhoid Rats");
    expect(lifelink(game, rats)).toBe(false);
    const karumonix = spawn(game, "Karumonix, the Rat King");
    expect(lifelink(game, karumonix)).toBe(true);
    expect(lifelink(game, rats)).toBe(true);
    const bears = spawn(game, "Grizzly Bears");
    expect(lifelink(game, bears)).toBe(false);
    lands(game, "Swamp", 1);
    lands(game, "Forest", 2);
    const communion = toHand(game, "Necrogen Communion");
    cast(game, communion, { targets: [ref(bears)] });
    expect(lifelink(game, bears)).toBe(true);
  });

  it("gives nothing to a creature that lost its abilities, nor to the Rats its toxic reached", () => {
    const { game } = table();
    spawn(game, "Skrelv's Hive");
    poison(game, 3);
    const rats = spawn(game, "Typhoid Rats");
    const karumonix = spawn(game, "Karumonix, the Rat King");
    expect(lifelink(game, rats)).toBe(true);
    lands(game, "Island", 2);
    const frog = toHand(game, "Turn to Frog");
    cast(game, frog, { targets: [ref(karumonix)] });
    expect(lifelink(game, karumonix)).toBe(false);
    expect(lifelink(game, rats)).toBe(false);
  });

  it("makes a Mite and costs a life each upkeep", () => {
    const { game } = table();
    spawn(game, "Skrelv's Hive");
    nextTurn(game);
    nextTurn(game);
    expect(tokensNamed(game, "Phyrexian Mite Token", A)).toBe(1);
    expect(life(game, A)).toBe(19);
  });
});

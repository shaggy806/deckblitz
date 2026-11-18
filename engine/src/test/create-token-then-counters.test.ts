/**
 * `create-token`'s `thenCounters`: "create a token, then put N counters on
 * it". The counters go on the tokens this made and no others. Such tokens
 * are never folded into a token stack as they're made: an existing stack of
 * the same token would otherwise absorb the new one and take its counters
 * whole.
 */

import { describe, expect, it } from "vitest";

import { createDefaultRegistry } from "../cards/registry.js";
import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId } from "../primitives.js";
import { counters, keywords, named, nextTurn, pt, settle, spawn, table, toStep, zone } from "./harness.js";

const A = asPlayerId("alice");
const B = asPlayerId("bob");
const registry = createDefaultRegistry();

const makeGame = (): Game => {
  const game = Game.create({
    seed: 1,
    shuffle: false,
    registry,
    rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
    controllers: { [A]: new ScriptedController(A), [B]: new ScriptedController(B) },
    decks: [
      { player: A, cards: Array<string>(40).fill("Island") },
      { player: B, cards: Array<string>(40).fill("Island") },
    ],
  });
  game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main");
  return game;
};

const soldiers = (game: Game) =>
  game.state.zones.shared.battlefield
    .map((id) => game.state.objects[id])
    .filter((o) => o.cardName === "Soldier Token");

describe("create-token, then put counters on it", () => {
  it("puts them on the new token alone, beside a stack of the same token", () => {
    const game = makeGame();
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 10 });
    const stack = soldiers(game);
    expect(stack).toHaveLength(1);
    expect(stack[0].stackCount).toBe(10);

    game.debugApplyEffect(A, {
      kind: "create-token",
      token: "Soldier Token",
      count: 1,
      thenCounters: { kind: "+1/+1", amount: 2 },
    });
    const all = soldiers(game);
    const old = all.find((o) => o.id === stack[0].id)!;
    const fresh = all.filter((o) => o.id !== stack[0].id);
    expect(old.stackCount).toBe(10);
    expect(old.counters["+1/+1"]).toBeUndefined();
    expect(fresh).toHaveLength(1);
    expect(fresh[0].counters["+1/+1"]).toBe(2);
  });

  it("reads its amount as the effect resolves", () => {
    const game = makeGame();
    for (let i = 0; i < 3; i += 1) game.debugSpawn("Island", A, "battlefield");
    game.debugApplyEffect(A, {
      kind: "create-token",
      token: "Soldier Token",
      count: 2,
      thenCounters: { kind: "+1/+1", amount: { countOf: { type: "land", controlledBy: "you" } } },
    });
    const made = soldiers(game);
    expect(made).toHaveLength(2);
    for (const o of made) expect(o.counters["+1/+1"]).toBe(3);
  });
});

/**
 * The amount is read once the tokens are there (rules 608.2c, 608.2h): Gimbal,
 * Gremlin Prodigy's "create a 0/0 red Gremlin artifact creature token. Put X
 * +1/+1 counters on it, where X is the number of differently named artifact
 * tokens you control" counts the new Gremlin.
 */
describe("create-token's thenCounters, read after the tokens are made (Gimbal, Gremlin Prodigy)", () => {
  const gremlins = (game: Game): ObjectId[] => named(game, "Gremlin Artifact Token (0/0)");

  it("alone, the new Gremlin counts itself: one counter, and it lives", () => {
    const { game } = table();
    spawn(game, "Gimbal, Gremlin Prodigy");
    toStep(game, "end");
    settle(game);
    const [gremlin] = gremlins(game);
    expect(gremlin).toBeDefined();
    expect(zone(game, gremlin)).toBe("battlefield");
    expect(counters(game, gremlin)).toBe(1);
    expect(pt(game, gremlin)).toEqual({ power: 1, toughness: 1 });
  });

  it("counts each differently named artifact token once: a Treasure, two Clues and the Gremlin are three", () => {
    const { game } = table();
    spawn(game, "Gimbal, Gremlin Prodigy");
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 1 });
    game.debugApplyEffect(A, { kind: "create-token", token: "Clue Token", count: 2 });
    // Not an artifact: Release the Gremlins' 2/2 Gremlin isn't counted.
    game.debugApplyEffect(A, { kind: "create-token", token: "2/2 Gremlin Token", count: 1 });
    // An opponent's artifact token isn't either.
    game.debugApplyEffect(B, { kind: "create-token", token: "Food Token", count: 1 });
    toStep(game, "end");
    settle(game);
    const [gremlin] = gremlins(game);
    expect(counters(game, gremlin)).toBe(3);
  });

  it("a second Gremlin has the first's name: still counted once", () => {
    const { game } = table();
    spawn(game, "Gimbal, Gremlin Prodigy");
    toStep(game, "end");
    settle(game);
    nextTurn(game);
    nextTurn(game);
    toStep(game, "end");
    settle(game);
    const made = gremlins(game);
    expect(made).toHaveLength(2);
    expect(made.map((id) => counters(game, id)).sort()).toEqual([1, 1]);
  });

  it("with Parallel Lives, both Gremlins are made first, and each gets X", () => {
    const { game } = table();
    spawn(game, "Gimbal, Gremlin Prodigy");
    spawn(game, "Parallel Lives");
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 1 });
    toStep(game, "end");
    settle(game);
    const made = gremlins(game);
    expect(made).toHaveLength(2);
    // The Treasures (two, one name) and the Gremlins (two, one name).
    expect(made.map((id) => counters(game, id))).toEqual([2, 2]);
  });

  it("gives artifact creatures it controls trample, and no others", () => {
    const { game } = table();
    spawn(game, "Gimbal, Gremlin Prodigy");
    toStep(game, "end");
    settle(game);
    const [gremlin] = gremlins(game);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Ornithopter", B);
    expect(keywords(game, gremlin).has("trample")).toBe(true);
    expect(keywords(game, bears).has("trample")).toBe(false);
    expect(keywords(game, theirs).has("trample")).toBe(false);
  });
});

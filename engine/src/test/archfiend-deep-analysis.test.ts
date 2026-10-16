/**
 * Two more phase-E singles:
 *
 * - **`sacrifice-all-but`** — "each player chooses six lands they control,
 *   then sacrifices the rest" (Planetary Annihilation); with `upTo`, "that
 *   player chooses up to two creatures" (Archfiend of Depravity), where fewer
 *   may be kept. The inverse of `sacrifice`, which names how many to give up.
 * - **Flashback with a life cost** — "Flashback—{1}{U}, Pay 3 life" (Deep
 *   Analysis). Part of the cost, so it gates castability and is paid as the
 *   spell is cast.
 */

import { describe, expect, it } from "vitest";

import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { PlayerId } from "../primitives.js";

const A = asPlayerId("alice");
const B = asPlayerId("bob");

const makeGame = (players: readonly PlayerId[] = [A, B]) =>
  Game.create({
    seed: 1,
    shuffle: false,
    rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
    decks: players.map((player) => ({
      player,
      cards: Array<string>(40).fill("Island"),
    })),
  });

const creaturesOf = (game: Game, player: PlayerId) =>
  game.state.zones.shared.battlefield.filter(
    (id) =>
      game.state.objects[id].controller === player &&
      game.characteristics(id).types.includes("creature"),
  );

describe("sacrifice-all-but", () => {
  it("asks the affected player which to keep, exactly the keep count, and sacrifices the rest", () => {
    const game = makeGame();
    game.advanceUntil((s) => s.priority.holder === A);
    const bears = Array.from({ length: 4 }, () => game.debugSpawn("Grizzly Bears", B, "battlefield"));

    game.debugApplyEffect(A, {
      kind: "sacrifice-all-but",
      who: "each-opponent",
      keep: 2,
      filter: { type: "creature" },
    });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-permanents" || s.result.over);

    const awaiting = game.state.awaiting;
    expect(awaiting?.kind).toBe("choose-permanents");
    if (awaiting?.kind !== "choose-permanents") return;
    // Four creatures, keep two — B's choice, and exactly two.
    expect(awaiting.player).toBe(B);
    expect([awaiting.min, awaiting.max]).toEqual([2, 2]);
    game.dispatch({ type: "choose-permanents", player: B, permanents: [bears[1], bears[3]] });
    expect(creaturesOf(game, B).sort()).toEqual([bears[1], bears[3]].sort());
  });

  it("'up to': the player may keep fewer, even with no more than the limit", () => {
    const game = makeGame();
    game.advanceUntil((s) => s.priority.holder === A);
    const bears = Array.from({ length: 2 }, () => game.debugSpawn("Grizzly Bears", B, "battlefield"));

    game.debugApplyEffect(A, {
      kind: "sacrifice-all-but",
      who: "each-opponent",
      keep: 2,
      filter: { type: "creature" },
      upTo: true,
    });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-permanents" || s.result.over);
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind === "choose-permanents" && [awaiting.min, awaiting.max]).toEqual([0, 2]);
    game.dispatch({ type: "choose-permanents", player: B, permanents: [bears[0]] });
    expect(creaturesOf(game, B)).toEqual([bears[0]]);
  });

  it("does nothing when the player is already at or under the limit", () => {
    const game = makeGame();
    game.advanceUntil((s) => s.priority.holder === A);
    for (let i = 0; i < 2; i += 1) game.debugSpawn("Grizzly Bears", B, "battlefield");

    game.debugApplyEffect(A, {
      kind: "sacrifice-all-but",
      who: "each-opponent",
      keep: 2,
      filter: { type: "creature" },
    });
    game.advanceUntil((s) => s.awaiting !== null || s.priority.holder !== null);
    expect(game.state.awaiting?.kind).not.toBe("sacrifice");
    expect(creaturesOf(game, B).length).toBe(2);
  });

  it("leaves the controller's own creatures alone", () => {
    const game = makeGame();
    game.advanceUntil((s) => s.priority.holder === A);
    for (let i = 0; i < 4; i += 1) game.debugSpawn("Grizzly Bears", A, "battlefield");

    game.debugApplyEffect(A, {
      kind: "sacrifice-all-but",
      who: "each-opponent",
      keep: 2,
      filter: { type: "creature" },
    });
    game.advanceUntil((s) => s.awaiting !== null || s.priority.holder !== null);
    expect(creaturesOf(game, A).length).toBe(4);
  });
});

describe("Archfiend of Depravity's trigger", () => {
  it("fires on an opponent's end step, not the controller's", () => {
    const game = makeGame();
    game.advanceUntil((s) => s.priority.holder === A && s.turn.step === "precombat-main");
    game.debugSpawn("Archfiend of Depravity", A, "battlefield");
    for (let i = 0; i < 4; i += 1) game.debugSpawn("Grizzly Bears", B, "battlefield");

    // A's own end step: nothing happens.
    game.advanceUntil((s) => s.turn.step === "end" || s.result.over);
    const turn = game.state.turn.number;
    game.advanceUntil((s) => s.awaiting?.kind === "choose-permanents" || s.turn.number > turn);
    expect(game.state.awaiting?.kind).not.toBe("choose-permanents");
    expect(creaturesOf(game, B).length).toBe(4);
  });
});

describe("flashback with a life cost", () => {
  it("is not castable without the life to pay", () => {
    const game = makeGame();
    game.advanceUntil((s) => s.priority.holder === A && s.turn.step === "precombat-main");
    for (let i = 0; i < 4; i += 1) {
      const id = game.debugSpawn("Island", A, "battlefield");
      game.state.objects[id].tapped = false;
    }
    game.debugSpawn("Deep Analysis", A, "graveyard");
    // Rule 119.4: life can be paid only with at least that much — exactly 3
    // pays "Pay 3 life" (down to 0), 2 doesn't.
    const flashback = () =>
      game.legalActions(A).find((a) => a.kind === "cast-spell" && a.via === "flashback");
    game.state.players[A].life = 3;
    expect(flashback()).toBeDefined();
    game.state.players[A].life = 2;
    expect(flashback()).toBeUndefined();
  });

  it("pays the life as the spell is cast", () => {
    const game = makeGame();
    game.advanceUntil((s) => s.priority.holder === A && s.turn.step === "precombat-main");
    for (let i = 0; i < 4; i += 1) {
      const id = game.debugSpawn("Island", A, "battlefield");
      game.state.objects[id].tapped = false;
    }
    game.debugSpawn("Deep Analysis", A, "graveyard");
    const lifeBefore = game.state.players[A].life;

    const legal = game
      .legalActions(A)
      .find((a) => a.kind === "cast-spell" && a.via === "flashback");
    expect(legal).toBeDefined();
    if (legal === undefined || legal.kind !== "cast-spell") return;

    game.dispatch({
      type: "cast-spell",
      player: A,
      card: legal.card,
      via: "flashback",
      targets: [{ kind: "player", player: A }],
    });
    // Paid on cast, before the spell has even resolved.
    expect(game.state.players[A].life).toBe(lifeBefore - 3);
  });
});

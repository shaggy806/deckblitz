import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Game, HeuristicBotController, autoSettle, createDefaultRegistry } from "engine";
import type { ControllerView } from "engine";

import { ALICE, BOB, DECKS } from "../decks.js";
import { Room } from "../room.js";
import type { Connection, RoomTimers } from "../room.js";

const registry = createDefaultRegistry();

/** A bot that plays like v1 until its `failAt`th decision, then throws — an
 * engine bug, or a loop `Game.advance` gave up on, as a bot's move meets it. */
class FailingBot extends HeuristicBotController {
  private calls = 0;
  private readonly failAt: number;
  constructor(player: typeof ALICE, failAt: number) {
    super(player, registry);
    this.failAt = failAt;
  }
  override act(view: ControllerView) {
    this.calls += 1;
    if (this.calls >= this.failAt) throw new Error("Game.advance exceeded its budget; likely an engine bug");
    return super.act(view);
  }
}

describe("a game the engine throws on", () => {
  it("stops that room, says why, and refuses moves after, without throwing out of the room", () => {
    const game = Game.create({
      seed: 1,
      registry,
      decks: [
        { player: ALICE, cards: [...DECKS.alice] },
        { player: BOB, cards: [...DECKS.bob] },
      ],
    });
    autoSettle(game);
    const frames: (string | null)[] = [];
    const room = new Room("STOP1", game, {
      pacing: "immediate",
      onUpdate: (r) => frames.push(r.stopped),
      botController: (player) => new FailingBot(player, player === ALICE ? 3 : Infinity),
    });
    // A timer-driven bot move would surface here: nothing outside the room
    // may see the throw.
    expect(() => {
      room.addBot(ALICE);
      room.addBot(BOB);
    }).not.toThrow();

    expect(room.stopped).toMatch(/exceeded its budget/);
    expect(frames.at(-1)).toBe(room.stopped);
    const connection = { send: () => {} } as unknown as Connection;
    expect(() => room.dispatch(connection, { type: "pass-priority", player: BOB })).toThrow(/stopped/);
  });
});

/** A bot that plays like v1 but, on some of its priority windows, offers a
 * cast the engine refuses before anything is paid — the live crash's shape
 * (a convoke payment `castSpell` refused, 2026-11-10). */
class RefusedBot extends HeuristicBotController {
  refusals = 0;
  private windows = 0;
  override act(view: ControllerView) {
    if (view.state.awaiting === null) {
      this.windows += 1;
      if (this.windows % 3 === 0) {
        this.refusals += 1;
        return { type: "cast-spell" as const, player: this.playerId, card: "obj-nowhere" as never };
      }
    }
    return super.act(view);
  }
}

describe("a bot's move the engine refuses", () => {
  // Each refusal is logged; dozens of them here.
  beforeEach(() => void vi.spyOn(console, "error").mockImplementation(() => {}));
  afterEach(() => void vi.restoreAllMocks());
  const deal = () => {
    const game = Game.create({
      seed: 1,
      registry,
      decks: [
        { player: ALICE, cards: [...DECKS.alice] },
        { player: BOB, cards: [...DECKS.bob] },
      ],
    });
    autoSettle(game);
    return game;
  };

  it("is replaced by a pass, and the game plays on", () => {
    const game = deal();
    let refused: RefusedBot | null = null;
    const room = new Room("STOP2", game, {
      pacing: "immediate",
      onUpdate: () => {},
      botController: (player) =>
        player === ALICE ? (refused = new RefusedBot(player, registry)) : new HeuristicBotController(player, registry),
    });
    expect(() => {
      room.addBot(ALICE);
      room.addBot(BOB);
    }).not.toThrow();
    expect(refused!.refusals).toBeGreaterThan(3);
    expect(room.stopped).toBeNull();
    expect(game.state.result.over).toBe(true);
  });

  it("doesn't throw out of the gate's timer either, in real-time pacing", () => {
    const game = deal();
    const pending: (() => void)[] = [];
    const timers: RoomTimers = {
      setTimeout: (fn) => pending.push(fn),
      clearTimeout: (handle) => {
        pending[(handle as number) - 1] = () => {};
      },
    };
    let refused: RefusedBot | null = null;
    const room = new Room("STOP3", game, {
      timers,
      onUpdate: () => {},
      botController: (player) =>
        player === ALICE ? (refused = new RefusedBot(player, registry)) : new HeuristicBotController(player, registry),
    });
    room.addBot(ALICE);
    room.addBot(BOB);
    // Every timer the room sets, fired from outside it as the event loop
    // would: a throw here is the one that took the shard down.
    expect(() => {
      for (let i = 0; i < pending.length && i < 20_000 && !game.state.result.over; i += 1) pending[i]();
    }).not.toThrow();
    expect(refused!.refusals).toBeGreaterThan(3);
    expect(room.stopped).toBeNull();
  });
});

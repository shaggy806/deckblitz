/**
 * The take-back house rule (`RoomSettings.takeBacks`, the engine's
 * `take-back.ts`): a player puts the game back to the start of the turn in
 * progress or one of the few before it, a limited number of times a game.
 */

import { describe, expect, it } from "vitest";
import { Game, createDefaultRegistry, isSettled, stateDigest, stateFromJson, stateToJson } from "engine";
import type { PlayerId } from "engine";

import { ALICE, BOB } from "../decks.js";
import { Room } from "../room.js";
import type { Connection } from "../room.js";

const registry = createDefaultRegistry();
const conn = (): Connection => ({ send: () => {} }) as unknown as Connection;

interface Table {
  readonly room: Room;
  readonly a: Connection;
  readonly b: Connection;
}

function table(takeBacks?: number | "unlimited"): Table {
  const game = Game.create({
    seed: 7,
    registry,
    startingPlayer: ALICE,
    rules: { startingLife: 20 },
    ...(takeBacks !== undefined ? { takeBacks } : {}),
    decks: [
      { player: ALICE, cards: Array<string>(40).fill("Forest") },
      { player: BOB, cards: Array<string>(40).fill("Forest") },
    ],
  });
  game.advanceUntil(isSettled);
  const room = new Room("TAKE1", game, { pacing: "immediate" });
  const a = conn();
  const b = conn();
  room.claimSeat(ALICE, "a", a);
  room.claimSeat(BOB, "b", b);
  return { room, a, b };
}

const seats = (t: Table): Record<PlayerId, Connection> => ({ [ALICE]: t.a, [BOB]: t.b });

/** Whoever holds priority passes, until `done`. */
function passUntil(t: Table, done: () => boolean): void {
  for (let i = 0; i < 400 && !done(); i += 1) {
    const holder = t.room.game.state.priority.holder;
    if (holder === null) throw new Error("nobody holds priority");
    t.room.dispatch(seats(t)[holder], { type: "pass-priority", player: holder });
  }
  if (!done()) throw new Error("never got there");
}

const toMain = (t: Table, turn: number): void =>
  passUntil(t, () => t.room.game.state.turn.number === turn && t.room.game.state.turn.step === "precombat-main");

function playLand(t: Table, player: PlayerId): void {
  const card = t.room.game.state.zones.perPlayer[player].hand[0];
  t.room.dispatch(seats(t)[player], { type: "play-land", player, card });
}

const battlefield = (room: Room): number => room.game.state.zones.shared.battlefield.length;
const offered = (room: Room, player: PlayerId): number[] =>
  (room.game.viewFor(player).takeBacks?.turns ?? []).map((t) => t.turn);

describe("take-backs", () => {
  it("are refused in a game played without the house rule", () => {
    const t = table();
    toMain(t, 1);
    playLand(t, ALICE);
    expect(() => t.room.takeBack(t.a, 1)).toThrow(/doesn't allow take-backs/);
    expect(t.room.game.state.takeBacks).toBeUndefined();
    expect(t.room.game.viewFor(ALICE).takeBacks).toBeUndefined();
  });

  it("put the game back to the start of the turn, for either player", () => {
    const t = table(2);
    toMain(t, 1);
    playLand(t, ALICE);
    expect(battlefield(t.room)).toBe(1);
    expect(offered(t.room, BOB)).toEqual([1]);

    // Bob, on Alice's turn.
    t.room.takeBack(t.b, 1);
    const state = t.room.game.state;
    expect(battlefield(t.room)).toBe(0);
    expect(state.turn.number).toBe(1);
    expect(state.takeBacks?.used).toEqual({ [BOB]: 1 });
    expect(state.eventLog.filter((e) => e.type === "turn-taken-back")).toMatchObject([{ player: BOB, turn: 1 }]);
    // The log is the one from before the turn, with that line after it.
    expect(state.eventLog.some((e) => e.type === "game-started")).toBe(true);
    expect(t.room.replacements).toBe(1);
    expect(t.room.game.viewFor(ALICE).takeBacks).toMatchObject({ limit: 2, used: { [BOB]: 1 } });
  });

  it("reach a turn that has ended: the last one of each player's is kept", () => {
    const t = table("unlimited");
    toMain(t, 1);
    playLand(t, ALICE);
    toMain(t, 2);
    playLand(t, BOB);
    toMain(t, 3);
    // Two players: two turns kept, this one and Bob's before it.
    expect(offered(t.room, ALICE)).toEqual([2, 3]);
    expect(() => t.room.takeBack(t.a, 1)).toThrow(/isn't kept any more/);

    t.room.takeBack(t.a, 2);
    const state = t.room.game.state;
    expect(state.turn.number).toBe(2);
    expect(t.room.game.activePlayer).toBe(BOB);
    // Alice's land from turn 1 stands; Bob's from turn 2 is back in hand.
    expect(battlefield(t.room)).toBe(1);
    // Turn 3's start is gone with turn 3.
    expect(state.takeBacks?.turnStarts?.map((s) => s.turn)).toEqual([2]);
  });

  it("deal the same cards the second time", () => {
    const t = table("unlimited");
    toMain(t, 2);
    const drawn = [...t.room.game.state.zones.perPlayer[BOB].hand];
    playLand(t, BOB);
    t.room.takeBack(t.b, 2);
    toMain(t, 2);
    expect(t.room.game.state.zones.perPlayer[BOB].hand).toEqual(drawn);
  });

  it("run out, and the count survives the take-back itself", () => {
    const t = table(1);
    toMain(t, 1);
    playLand(t, ALICE);
    t.room.takeBack(t.a, 1);
    toMain(t, 1);
    playLand(t, ALICE);
    expect(() => t.room.takeBack(t.a, 1)).toThrow(/no take-backs left/);
    expect(offered(t.room, ALICE)).toEqual([]);
    expect(battlefield(t.room)).toBe(1);
    // Bob still has his.
    t.room.takeBack(t.b, 1);
    expect(battlefield(t.room)).toBe(0);
  });

  it("need something to take back", () => {
    const t = table(3);
    expect(() => t.room.takeBack(t.a, 1)).toThrow();
    expect(t.room.game.viewFor(ALICE).takeBacks?.cannot).toMatch(/nothing has happened/);
  });

  it("don't bring back a player who conceded, and aren't open to one", () => {
    const game = Game.create({
      seed: 7,
      registry,
      startingPlayer: ALICE,
      takeBacks: 3,
      decks: ["alice", "bob", "carol"].map((player) => ({
        player: player as PlayerId,
        cards: Array<string>(40).fill("Forest"),
      })),
    });
    game.advanceUntil(isSettled);
    const room = new Room("TAKE3", game, { pacing: "immediate" });
    const [a, b, c] = [conn(), conn(), conn()];
    room.claimSeat(ALICE, "a", a);
    room.claimSeat(BOB, "b", b);
    room.claimSeat("carol" as PlayerId, "c", c);
    const land = room.game.state.zones.perPlayer[ALICE].hand[0];
    for (let i = 0; i < 20 && room.game.state.turn.step !== "precombat-main"; i += 1) {
      const holder = room.game.state.priority.holder as PlayerId;
      room.dispatch(holder === ALICE ? a : holder === BOB ? b : c, { type: "pass-priority", player: holder });
    }
    room.dispatch(a, { type: "play-land", player: ALICE, card: land });
    expect(offered(room, ALICE)).toEqual([1]);
    room.concede(b);
    expect(() => room.takeBack(b, 1)).toThrow(/left the game/);
    expect(offered(room, ALICE)).toEqual([]);
    expect(() => room.takeBack(a, 1)).toThrow(/conceded since/);
  });

  it("leave a player's trigger-order setting as it is now (a bug report, 2026-11-25)", () => {
    const t = table(3);
    toMain(t, 1);
    playLand(t, ALICE);
    // Switched on after the turn's start was kept: the client goes on
    // showing it on, so the game must go on asking.
    const settings = { passToMain: false, passThroughCombat: false, stops: { mine: [], theirs: [] } };
    t.room.setPassSettings(t.a, { ...settings, orderTriggers: true });
    expect(t.room.game.state.ordersOwnTriggers).toEqual([ALICE]);
    t.room.takeBack(t.a, 1);
    expect(battlefield(t.room)).toBe(0);
    expect(t.room.game.state.ordersOwnTriggers).toEqual([ALICE]);
    // And one switched off since stays off.
    playLand(t, ALICE);
    t.room.setPassSettings(t.a, { ...settings, orderTriggers: false });
    t.room.takeBack(t.a, 1);
    expect(t.room.game.state.ordersOwnTriggers ?? []).toEqual([]);
  });

  it("keep the turn starts through a copy, the wire and the fingerprint", () => {
    const t = table(3);
    toMain(t, 2);
    const live = t.room.game.state;
    const copy = t.room.game.snapshot();
    // A copy shares the starts: a bot's simulations copy nothing of them.
    expect(copy.takeBacks?.turnStarts).toBe(live.takeBacks?.turnStarts);
    expect(stateDigest(copy)).toBe(stateDigest(live));
    // A device dealt the state as text can take back as the others can.
    const sent = stateFromJson(stateToJson(live));
    expect(stateDigest(sent)).toBe(stateDigest(live));
    expect(sent.takeBacks?.turnStarts?.map((s) => s.turn)).toEqual([1, 2]);
  });
});

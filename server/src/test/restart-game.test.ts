/**
 * A game restarted in a room (rule 727 — Karn Liberated's −14): the same
 * `Room`, seats and `Game` carry on into the new game, whose mulligans the
 * bots answer as at the start, and nothing a seat asked of the old game (an
 * auto-pass) carries over.
 */
import { describe, expect, it } from "vitest";
import { Game, viewFor } from "engine";
import type { ObjectId } from "engine";
import type { ServerMessage } from "protocol";
import { Room } from "../room.js";
import { ALICE, BOB } from "../decks.js";

/** Alice's turn 3, precombat main, with a Karn Liberated at 14 loyalty: a
 * game with mulligans, both hands kept, all-Forest decks. */
function karnGame(): { game: Game; karn: ObjectId } {
  const forests = Array<string>(40).fill("Forest");
  const game = Game.create({
    seed: 1,
    shuffle: false,
    mulligans: true,
    decks: [
      { player: ALICE, cards: forests },
      { player: BOB, cards: forests },
    ],
  });
  for (const player of [ALICE, BOB]) game.dispatch({ type: "mulligan", player, keep: true });
  game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "precombat-main" && s.priority.holder === ALICE);
  const karn = game.debugSpawn("Karn Liberated", ALICE, "battlefield", { summoningSick: false });
  game.state.objects[karn].counters.loyalty = 14;
  return { game, karn };
}

function fakeConnection(): { received: ServerMessage[]; connection: { send: (m: ServerMessage) => void } } {
  const received: ServerMessage[] = [];
  return { received, connection: { send: (m) => received.push(m) } };
}

/** Alice's Karn's −14, passed on until it resolves: the room passes for a
 * seat on its own ability where its settings say, so she may not need to. */
function ultimate(room: Room, alice: { send: (m: ServerMessage) => void }, karn: ObjectId): void {
  room.dispatch(alice, { type: "activate-ability", player: ALICE, source: karn, abilityIndex: 2, targets: [] });
  if ((room.game.state.restarts ?? 0) === 0) room.dispatch(alice, { type: "pass-priority", player: ALICE });
  expect(room.game.state.restarts).toBe(1);
}

describe("restarting the game in a room (rule 727)", () => {
  it("the bot answers the new game's mulligan, and the seat is shown the new game", () => {
    const { game, karn } = karnGame();
    const room = new Room("KARN1", game, { pacing: "immediate" });
    const alice = fakeConnection();
    room.claimSeat(ALICE, "alice-token", alice.connection);
    room.addBot(BOB);
    ultimate(room, alice.connection, karn);
    // The bot has kept (or mulliganed and kept); alice is still asked.
    const awaiting = room.game.state.awaiting;
    expect(awaiting?.kind).toBe("mulligan");
    expect(Object.keys(awaiting?.kind === "mulligan" ? awaiting.hands : {})).toEqual([ALICE]);
    const view = viewFor(room.game.state, room.game.registry, ALICE);
    expect(view.restarts).toBe(1);
    expect(view.turn.number).toBe(0);
    expect(view.objects[karn]).toBeUndefined();

    room.dispatch(alice.connection, { type: "mulligan", player: ALICE, keep: true });
    expect(room.game.state.turn.number).toBe(1);
    expect(room.game.activePlayer).toBe(ALICE);
  });

  it("an auto-pass armed in the old game is over: the seat stops in the new one", () => {
    const { game, karn } = karnGame();
    const room = new Room("KARN2", game, { pacing: "immediate" });
    const alice = fakeConnection();
    const bob = fakeConnection();
    room.claimSeat(ALICE, "alice-token", alice.connection);
    room.claimSeat(BOB, "bob-token", bob.connection);
    // Through alice's turn 3 and all of his own turn 4, as asked: in the new
    // game that would carry him through his own turn 2.
    room.requestAutoPass(bob.connection);
    ultimate(room, alice.connection, karn);

    for (const [connection, player] of [
      [alice.connection, ALICE],
      [bob.connection, BOB],
    ] as const) {
      room.dispatch(connection, { type: "mulligan", player, keep: true });
    }
    // Alice's turn 1; she passes the turn, and Bob's own turn 2 stops for
    // him at his land drop, where the old game's auto-pass would have
    // carried him through it.
    expect(room.game.state.turn.number).toBe(1);
    room.requestPassTurn(alice.connection);
    expect(room.game.state.turn).toMatchObject({ number: 2, step: "precombat-main" });
    expect(room.game.activePlayer).toBe(BOB);
    expect(room.game.state.priority.holder).toBe(BOB);
    expect(room.isAutoPassing(BOB)).toBe(false);
  });
});

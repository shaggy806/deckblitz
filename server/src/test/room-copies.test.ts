/**
 * A room as one copy of a game other rooms hold too: step 2 of
 * `docs/plans/replicated-rooms.md`. Several `Room`s in one process, each a
 * `RoomCopy` answering for one person's seat (and one of them for the bots),
 * wired through an in-memory order (`room-copies.ts`), must end up holding
 * the same game whatever is played — which only holds if every write a room
 * makes to its game is an input that leaves it (`Room.act`), and no copy
 * writes for a seat that isn't its own.
 */

import { describe, expect, it } from "vitest";
import { AutomaticController, stateDigest, stateFromJson, stateToJson } from "engine";
import type { PlayerId } from "engine";
import { ALICE, CAROL } from "../decks.js";
import { CopiesTable, playCopies } from "../room-copies.js";
import type { Copy } from "../room-copies.js";
import type { RoomInput } from "../room.js";

const TABLES: readonly (readonly ("person" | "bot")[])[] = [
  ["person", "person"],
  ["person", "bot"],
  ["person", "bot", "person", "bot"],
  ["person", "person", "person", "bot"],
  ["person", "person", "person", "person"],
];

/** For a test that plays a stretch of a game with bots in it: about a second
 * alone, several under the whole suite on a busy machine. */
const PLAYS = 30_000;

/** Whose move an input is. */
const inputPlayer = (input: RoomInput): PlayerId => (input.kind === "action" ? input.action.player : input.player);

/** Plays `steps` person-moves on `table`, each person passing or answering
 * as little as they may (the engine's `AutomaticController`): enough to move
 * a game along, turn after turn, through each person's own copy. */
function play(table: CopiesTable, steps: number): void {
  for (let i = 0; i < steps; i += 1) {
    const waiting = table.waitingOn();
    if (waiting === null) return;
    const { copy, asked } = waiting;
    copy.room.dispatch(copy.connection, new AutomaticController(asked).act(copy.room.game.controllerView(asked)));
    table.pump();
  }
}

describe("a room as a copy", () => {
  it("deals every copy the same game, and each plays only its own seat", () => {
    const table = new CopiesTable({ seed: 3, seats: ["person", "bot", "person", "bot"] });
    table.agree("once dealt");
    expect(table.copies.map((c) => c.player)).toEqual([ALICE, CAROL]);
    // The bots' opening hands are kept by the host's copy and nobody else's.
    const botInputs = table.log.filter((entry) => table.botSeats.has(inputPlayer(entry.input)));
    expect(botInputs.length).toBeGreaterThan(0);
    expect(new Set(botInputs.map((entry) => entry.from))).toEqual(new Set([table.host.index]));
    expect(table.log.filter((entry) => !table.botSeats.has(inputPlayer(entry.input)))).toEqual([]);

    play(table, 40);
    table.agree("after forty moves");
    expect(table.state.turn.number).toBeGreaterThanOrEqual(1);
    // Every input came from the copy that holds its seat.
    for (const entry of table.log) {
      const player = inputPlayer(entry.input);
      const sender = table.copies[entry.from];
      expect(table.botSeats.has(player) ? sender === table.host : sender.player === player).toBe(true);
    }
    // And every copy showed its page something as the game went on.
    for (const copy of table.copies) expect(copy.frames).toBeGreaterThan(5);
  }, PLAYS);

  it("refuses a move for a seat the copy doesn't hold", () => {
    const table = new CopiesTable({ seed: 4, seats: ["person", "person"] });
    const [alice, bob] = table.copies;
    // Bob's page can't claim to be Alice on Bob's copy, and Alice's copy has
    // no connection of Bob's to move him with.
    expect(() => bob.room.dispatch(alice.connection, { type: "mulligan", player: ALICE, keep: true })).toThrow(/claim a seat/);
    expect(() => bob.room.dispatch(bob.connection, { type: "mulligan", player: ALICE, keep: true })).toThrow(/cannot dispatch/);
    table.agree("after the refusals");
    expect(table.log).toEqual([]);
  });

  it("passes the bots to another copy when the host changes", () => {
    const table = new CopiesTable({ seed: 5, seats: ["person", "bot", "person", "bot"] });
    play(table, 30);
    const before = table.log.length;
    table.setHost(1);
    play(table, 60);
    table.agree("after the host changed");
    const after = table.log.slice(before).filter((entry) => table.botSeats.has(inputPlayer(entry.input)));
    expect(after.length).toBeGreaterThan(0);
    expect(new Set(after.map((entry) => entry.from))).toEqual(new Set([1]));
  }, PLAYS);

  it("carries a concession and a seat handed to a bot to every copy", () => {
    const table = new CopiesTable({ seed: 6, seats: ["person", "person", "person"] });
    const [alice, bob, carol] = table.copies;
    play(table, 12);
    expect(table.state.awaiting?.kind).not.toBe("mulligan");

    // Bob lets a bot play for him: his own copy plays it, the others just see moves.
    bob.room.setBotTakeover(bob.connection, true);
    table.pump();
    play(table, 30);
    table.agree("with a bot in Bob's seat");
    expect(table.log.some((entry) => entry.from === bob.index)).toBe(true);
    bob.room.setBotTakeover(bob.connection, false);
    table.pump();

    // Carol concedes, whoever's turn it is.
    carol.room.concede(carol.connection);
    table.pump();
    table.agree("after Carol conceded");
    for (const copy of [alice, bob, carol]) expect(copy.room.game.state.players[CAROL].hasLost).toBe(true);
    // One input, the concession and whatever she owed answered inside it.
    expect(table.log.at(-1)).toMatchObject({ from: carol.index, input: { kind: "concede", player: CAROL } });
    play(table, 20);
    table.agree("playing on without her");
    expect(table.state.result.over).toBe(false);
  }, PLAYS);

  it("sends a concession as one input, the decision the player owed answered with it", () => {
    // Sent as the answer and then the concession, the answer handed the move
    // on, and the host's bots moved before the concession reached them: the
    // copies parted (the copies fuzz, paced, seed 203).
    const table = new CopiesTable({ seed: 9, seats: ["person", "bot", "person", "bot"] });
    // Until a person owes a decision that isn't a priority window: passing
    // every turn, a hand soon runs past seven and cleanup asks for a discard.
    let owing: Copy | null = null;
    for (let i = 0; i < 600 && owing === null; i += 1) {
      const waiting = table.waitingOn();
      if (waiting === null) break;
      const awaiting = table.state.awaiting;
      if (awaiting !== null && awaiting.kind !== "mulligan" && awaiting.player === waiting.copy.player) owing = waiting.copy;
      else play(table, 1);
    }
    if (owing === null) throw new Error("nobody ever owed a decision");
    const before = table.log.length;
    owing.room.concede(owing.connection);
    table.pump();

    // Hers alone: if hers is the copy running the bots, their moves follow it.
    const sent = table.log.slice(before).filter((entry) => inputPlayer(entry.input) === owing.player);
    expect(sent).toHaveLength(1);
    expect(sent[0].from).toBe(owing.index);
    expect(table.log[before]).toBe(sent[0]);
    // Just the concession: each copy answers what she owed for itself, the
    // same way, where the input lands.
    expect(sent[0].input).toEqual({ kind: "concede", player: owing.player });
    table.agree("after the concession");
    // What she owed was answered on the way out, on every copy.
    for (const copy of table.copies) expect(copy.room.game.state.awaiting?.player).not.toBe(owing.player);
    for (const copy of table.copies) expect(copy.room.game.state.players[owing.player].hasLost).toBe(true);
    play(table, 20);
    table.agree("playing on");
  }, PLAYS);

  it("refuses a concession whole: nothing answered, nothing sent", () => {
    const table = new CopiesTable({ seed: 10, seats: ["person", "person"] });
    const [alice] = table.copies;
    // The opening hands: the game hasn't begun.
    expect(table.state.awaiting?.kind).toBe("mulligan");
    const digest = stateDigest(alice.room.game.state, { events: true });
    expect(() => alice.room.concede(alice.connection)).toThrow(/hasn't begun/);
    expect(stateDigest(alice.room.game.state, { events: true })).toBe(digest);
    expect(table.log).toEqual([]);
  });

  it("sends the one setting the engine reads, and only when it changes", () => {
    const table = new CopiesTable({ seed: 7, seats: ["person", "person"] });
    play(table, 6);
    const [alice] = table.copies;
    const settings = { passToMain: false, passThroughCombat: false, orderTriggers: true, skipManaOnly: true, stops: { mine: [], theirs: [] } };
    alice.room.setPassSettings(alice.connection, settings);
    table.pump();
    const orders = (): RoomInput[] => table.log.map((e) => e.input).filter((i) => i.kind === "orders-own-triggers");
    expect(orders()).toEqual([{ kind: "orders-own-triggers", player: ALICE, on: true }]);
    // The same again, and a setting that is only this seat's own: nothing sent.
    alice.room.setPassSettings(alice.connection, { ...settings, passToMain: true });
    table.pump();
    expect(orders()).toHaveLength(1);
    table.agree("after the settings");
    for (const copy of table.copies) expect(copy.room.game.state.ordersOwnTriggers).toEqual([ALICE]);
  });

  it("takes another copy's state and plays on from it", () => {
    const table = new CopiesTable({ seed: 8, seats: ["person", "bot", "person"] });
    play(table, 12);
    const [alice, carol] = table.copies as [Copy, Copy];
    const frames = carol.frames;
    // As it would arrive: through the wire's text.
    carol.room.replaceGame(stateFromJson(stateToJson(alice.room.game.snapshot())));
    table.pump();
    expect(carol.room.replacements).toBe(1);
    expect(alice.room.replacements).toBe(0);
    expect(carol.frames).toBeGreaterThan(frames);
    table.agree("after Carol took Alice's state");
    play(table, 8);
    table.agree("playing on from it");
    expect(table.state.result.over).toBe(false);

    // A copy that drifted is put right the same way. Carol's is set back to
    // where the game stood a few moves ago (a state that is no longer the
    // game), then sent where it stands.
    const earlier = stateFromJson(stateToJson(carol.room.game.snapshot()));
    play(table, 6);
    expect(table.state.result.over).toBe(false);
    carol.room.replaceGame(earlier);
    expect(stateDigest(carol.room.game.state)).not.toBe(stateDigest(alice.room.game.state));
    carol.room.replaceGame(stateFromJson(stateToJson(alice.room.game.snapshot())));
    table.pump();
    expect(carol.room.replacements).toBe(3);
    table.agree("after Carol was put right");
    play(table, 6);
    table.agree("and playing on");
  }, PLAYS);

  it.each(TABLES.map((seats) => [seats.map((s) => (s === "person" ? "P" : "b")).join(""), seats] as const))(
    "keeps every copy the same through a fuzzed game: %s",
    (_label, seats) => {
      for (const seed of [1, 2]) {
        const result = playCopies({ seed, seats, maxTurn: 8 });
        // It got somewhere: to the turn asked for, or to the end of the game.
        expect(result.over || result.turns > 8).toBe(true);
        expect(result.inputs).toBeGreaterThan(50);
        expect(result.checks).toBeGreaterThanOrEqual(2);
      }
    },
    120_000,
  );

  it.each(TABLES.map((seats) => [seats.map((s) => (s === "person" ? "P" : "b")).join(""), seats] as const))(
    "and paced as a live room is, a bot's move parked behind each frame: %s",
    (_label, seats) => {
      const result = playCopies({ seed: 3, seats, maxTurn: 8, pacing: "realtime" });
      expect(result.over || result.turns > 8).toBe(true);
      expect(result.inputs).toBeGreaterThan(50);
    },
    120_000,
  );
});

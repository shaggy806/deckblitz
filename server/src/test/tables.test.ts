/**
 * A table as the server keeps it (`tables.ts`; step 3 of
 * `docs/plans/replicated-rooms.md`): the recipe, the inputs in one order,
 * who is connected and whose device runs the bots. No game here, so these
 * are plain messages in and out.
 */

import { describe, expect, it } from "vitest";
import type { PlayerId } from "engine";
import type { RoomInput, ServerMessage, TableRecipe } from "protocol";
import { ALICE, BOB, CAROL, DAVE } from "../decks.js";
import { Tables } from "../tables.js";
import type { TableOpening } from "../tables.js";

const recipe: TableRecipe = {
  gameNumber: 1,
  config: { seed: 7, idSalt: "salt", decks: [], startingPlayer: ALICE },
  firstPlayer: "random",
  botSpeed: "normal",
  seats: [
    { player: ALICE, name: "Alice", bot: false },
    { player: BOB, name: "Bot Bob", bot: true },
    { player: CAROL, name: "Carol", bot: false },
    { player: DAVE, name: "Dave", bot: false },
  ],
};

/** Alice on connection 1 (the creator), Carol on 3, Dave on 4; 9 watches. */
const opening = (more: Partial<TableOpening> = {}): TableOpening => ({
  id: "TABLE",
  recipe,
  people: [
    { player: ALICE, token: "a", conn: 1 },
    { player: CAROL, token: "c", conn: 3 },
    { player: DAVE, token: "d", conn: 4 },
  ],
  watchers: [9],
  creator: ALICE,
  ...more,
});

const pass = (player: PlayerId): RoomInput => ({ kind: "action", action: { type: "pass-priority", player } });

function harness(hostGraceMs = 5_000) {
  const sent: { to: number; message: ServerMessage }[] = [];
  let due: (() => void) | null = null;
  const tables = new Tables((to, message) => sent.push({ to, message }), {
    hostGraceMs,
    timers: {
      setTimeout: (fn) => {
        due = fn;
        return fn;
      },
      clearTimeout: (handle) => {
        if (due === handle) due = null;
      },
    },
  });
  return {
    tables,
    /** Everything sent since last asked, as `to: type`. */
    take: (): { to: number; message: ServerMessage }[] => sent.splice(0),
    /** The grace runs out, if one is running. */
    elapse: (): boolean => {
      const fn = due;
      due = null;
      fn?.();
      return fn !== null;
    },
    waiting: (): boolean => due !== null,
  };
}

describe("a table on the server", () => {
  it("tells every device to deal its copy, each its own seat, the creator's device hosting", () => {
    const { tables, take } = harness();
    tables.open(opening());
    expect(tables.has("TABLE")).toBe(true);
    const starts = take();
    expect(starts.map((s) => s.to)).toEqual([1, 3, 4, 9]);
    for (const { message } of starts) {
      expect(message).toMatchObject({ type: "table-start", roomId: "TABLE", recipe, host: ALICE, from: 0, log: [] });
    }
    expect(starts.map((s) => (s.message.type === "table-start" ? s.message.seat : "?"))).toEqual([ALICE, CAROL, DAVE, null]);
  });

  it("puts inputs in one order and sends each to everyone, the sender too", () => {
    const { tables, take } = harness();
    tables.open(opening());
    take();
    tables.message(1, { type: "table-input", roomId: "TABLE", after: 0, input: pass(BOB) });
    tables.message(3, { type: "table-input", roomId: "TABLE", after: 1, input: pass(CAROL) });
    const out = take();
    expect(out.map((o) => o.to)).toEqual([1, 3, 4, 9, 1, 3, 4, 9]);
    // Alice's device sent the bot's move: it is hers by `from`.
    expect(out[0].message).toEqual({ type: "table-input", roomId: "TABLE", index: 0, from: ALICE, input: pass(BOB) });
    expect(out[4].message).toEqual({ type: "table-input", roomId: "TABLE", index: 1, from: CAROL, input: pass(CAROL) });
    expect(tables.summaries()).toMatchObject([{ id: "TABLE", inputs: 2, people: 3, connected: 3, watching: 1, host: ALICE }]);
  });

  it("refuses an input made on a log that has moved on, and takes nothing", () => {
    const { tables, take } = harness();
    tables.open(opening());
    take();
    // Two devices at once, each having seen an empty log.
    tables.message(3, { type: "table-input", roomId: "TABLE", after: 0, input: pass(CAROL) });
    tables.message(4, { type: "table-input", roomId: "TABLE", after: 0, input: pass(DAVE) });
    const out = take();
    expect(out.slice(0, 4).every((o) => o.message.type === "table-input")).toBe(true);
    expect(out.slice(4)).toEqual([{ to: 4, message: { type: "table-refused", roomId: "TABLE", after: 0, head: 1 } }]);
    // An input from the future is no better.
    tables.message(4, { type: "table-input", roomId: "TABLE", after: 5, input: pass(DAVE) });
    expect(take()).toEqual([{ to: 4, message: { type: "table-refused", roomId: "TABLE", after: 5, head: 1 } }]);
    expect(tables.summaries()[0].inputs).toBe(1);
  });

  it("takes an input made out of turn wherever it arrives", () => {
    const { tables, take } = harness();
    tables.open(opening());
    take();
    const concede: RoomInput = { kind: "concede", player: DAVE };
    tables.message(3, { type: "table-input", roomId: "TABLE", after: 0, input: pass(CAROL) });
    // Dave's device has seen none of it, and asks for no place.
    tables.message(4, { type: "table-input", roomId: "TABLE", after: null, input: concede });
    tables.message(4, { type: "table-input", roomId: "TABLE", after: null, input: { kind: "orders-own-triggers", player: DAVE, on: true } });
    const out = take();
    expect(out.every((o) => o.message.type === "table-input")).toBe(true);
    expect(out.filter((o) => o.to === 9).map((o) => o.message)).toMatchObject([
      { index: 0, from: CAROL },
      { index: 1, from: DAVE, input: concede },
      { index: 2, from: DAVE, input: { kind: "orders-own-triggers" } },
    ]);
  });

  it("refuses the rest of a run once one of it lost its place", () => {
    const { tables, take } = harness();
    tables.open(opening());
    take();
    // Alice's device (the bots' too) made three in a row on an empty log;
    // Dave's concession reaches the server after the first of them.
    tables.message(1, { type: "table-input", roomId: "TABLE", after: 0, mine: 0, input: pass(ALICE) });
    tables.message(4, { type: "table-input", roomId: "TABLE", after: null, input: { kind: "concede", player: DAVE } });
    take();
    tables.message(1, { type: "table-input", roomId: "TABLE", after: 1, mine: 1, input: pass(BOB) });
    // The third says the log ends at 2, and it does: but its second entry is
    // Dave's, not the one of Alice's this was made after.
    tables.message(1, { type: "table-input", roomId: "TABLE", after: 2, mine: 2, input: pass(BOB) });
    expect(take()).toEqual([
      { to: 1, message: { type: "table-refused", roomId: "TABLE", after: 1, head: 2 } },
      { to: 1, message: { type: "table-refused", roomId: "TABLE", after: 2, head: 2 } },
    ]);
    // Made again on the log as it is, a run is taken: each after the last.
    tables.message(1, { type: "table-input", roomId: "TABLE", after: 2, mine: 0, input: pass(BOB) });
    tables.message(1, { type: "table-input", roomId: "TABLE", after: 3, mine: 1, input: pass(BOB) });
    expect(take().filter((o) => o.to === 1).map((o) => o.message.type)).toEqual(["table-input", "table-input"]);
    // And a count of its own that reaches back past the log's start is no claim at all.
    tables.message(1, { type: "table-input", roomId: "TABLE", after: 4, mine: 9, input: pass(BOB) });
    expect(take()).toEqual([{ to: 1, message: { type: "table-refused", roomId: "TABLE", after: 4, head: 4 } }]);
    expect(tables.summaries()[0].inputs).toBe(4);
  });

  it("drops an input made in a game a rematch has dealt past, with no answer", () => {
    const { tables, take } = harness();
    tables.open(opening());
    tables.message(1, { type: "table-rematch", roomId: "TABLE" });
    take();
    // Still on their way when the new game was dealt: a move, and a
    // concession that would otherwise land in the new game's order.
    tables.message(3, { type: "table-input", roomId: "TABLE", game: 1, after: 0, mine: 0, input: pass(CAROL) });
    tables.message(4, { type: "table-input", roomId: "TABLE", game: 1, after: null, input: { kind: "concede", player: DAVE } });
    expect(take()).toEqual([]);
    expect(tables.summaries()[0].inputs).toBe(0);
    tables.message(3, { type: "table-input", roomId: "TABLE", game: 2, after: 0, mine: 0, input: pass(CAROL) });
    expect(tables.summaries()[0].inputs).toBe(1);
  });

  it("takes inputs only from a seat, and only ones shaped as inputs", () => {
    const { tables, take } = harness();
    tables.open(opening());
    take();
    tables.message(9, { type: "table-input", roomId: "TABLE", after: 0, input: pass(ALICE) });
    tables.message(77, { type: "table-input", roomId: "TABLE", after: 0, input: pass(ALICE) });
    tables.message(1, { type: "table-input", roomId: "TABLE", after: 0, input: { kind: "nonsense" } as unknown as RoomInput });
    tables.message(1, { type: "table-input", roomId: "TABLE", after: 0.5, input: pass(ALICE) });
    expect(take().map((o) => [o.to, o.message.type])).toEqual([
      [9, "error"],
      [77, "error"],
      [1, "error"],
      [1, "error"],
    ]);
    expect(tables.summaries()[0].inputs).toBe(0);
    // And a message a room would take isn't one a table does.
    tables.message(1, { type: "dispatch", roomId: "TABLE", action: { type: "pass-priority", player: ALICE } });
    expect(take()).toMatchObject([{ to: 1, message: { type: "error", message: /its players' own devices/ } }]);
  });

  it("gives a device back its seat by token, with the log from where it asks", () => {
    const { tables, take } = harness(0);
    tables.open(opening());
    for (let i = 0; i < 3; i += 1) tables.message(1, { type: "table-input", roomId: "TABLE", after: i, input: pass(BOB) });
    tables.close(3);
    take();
    // Carol's page reloads: a new connection, the same token, two inputs seen.
    tables.message(30, { type: "table-join", roomId: "TABLE", clientToken: "c", from: 2 });
    const [{ to, message }] = take();
    expect(to).toBe(30);
    expect(message).toMatchObject({ type: "table-start", seat: CAROL, host: ALICE, from: 2 });
    if (message.type !== "table-start") throw new Error("unreachable");
    expect(message.log.map((e) => e.index)).toEqual([2]);
    // She's at the table again: her inputs are taken, and she is sent everyone's.
    tables.message(30, { type: "table-input", roomId: "TABLE", after: 3, input: pass(CAROL) });
    expect(take().map((o) => o.to)).toEqual([1, 30, 4, 9]);
    // No token (or one the table doesn't know): the whole log, to watch.
    tables.message(40, { type: "table-join", roomId: "TABLE", clientToken: "nobody" });
    const [watching] = take();
    expect(watching.message).toMatchObject({ type: "table-start", seat: null, from: 0 });
    if (watching.message.type !== "table-start") throw new Error("unreachable");
    expect(watching.message.log).toHaveLength(4);
  });

  it("keeps the bots waiting for a host that dropped, then hands them to the next device", () => {
    const { tables, take, elapse, waiting } = harness();
    tables.open(opening());
    take();
    tables.close(1);
    // Nothing yet but that she is gone: a reload is back in a moment.
    expect(take()).toEqual(
      [3, 4, 9].map((to) => ({ to, message: { type: "table-seats", roomId: "TABLE", online: [CAROL, DAVE] } })),
    );
    expect(waiting()).toBe(true);
    expect(elapse()).toBe(true);
    expect(take()).toEqual([3, 4, 9].map((to) => ({ to, message: { type: "table-host", roomId: "TABLE", host: CAROL } })));

    // The creator comes back: the bots are hers again at once.
    tables.message(10, { type: "table-join", roomId: "TABLE", clientToken: "a", from: 0 });
    const back = take();
    expect(back.filter((o) => o.message.type === "table-host").map((o) => o.to)).toEqual([10, 3, 4, 9]);
    expect(back.find((o) => o.message.type === "table-start")).toMatchObject({
      to: 10,
      message: { type: "table-start", seat: ALICE, host: ALICE, online: [ALICE, CAROL, DAVE] },
    });
    // And everyone else is told she is back.
    expect(back.filter((o) => o.message.type === "table-seats")).toEqual(
      [3, 4, 9].map((to) => ({ to, message: { type: "table-seats", roomId: "TABLE", online: [ALICE, CAROL, DAVE] } })),
    );
  });

  it("answers a join by the room's code with an error a capable page reads as \"ask for the table\"", () => {
    const { tables, take } = harness();
    tables.open(opening());
    take();
    tables.message(20, { type: "join-room", roomId: "TABLE" });
    tables.message(21, { type: "spectate-room", roomId: "TABLE" });
    expect(take()).toMatchObject([
      { to: 20, message: { type: "error", code: "table" } },
      { to: 21, message: { type: "error", code: "table" } },
    ]);
    // Neither is at the table for having asked.
    expect(tables.summaries()[0]).toMatchObject({ connected: 3 });
  });

  it("leaves the bots where they are when the host is back within the grace", () => {
    const { tables, take, elapse, waiting } = harness();
    tables.open(opening({ creator: null }));
    take();
    // No creator at the table: the first person seated hosts.
    expect(tables.summaries()[0].host).toBe(ALICE);
    tables.close(1);
    expect(waiting()).toBe(true);
    tables.message(11, { type: "table-join", roomId: "TABLE", clientToken: "a", from: 0 });
    expect(waiting()).toBe(false);
    expect(elapse()).toBe(false);
    expect(take().map((o) => o.message.type).filter((type) => type !== "table-seats")).toEqual(["table-start"]);
    expect(tables.summaries()[0].host).toBe(ALICE);

    // With nobody at all connected there is no host; the first back has them.
    for (const conn of [11, 3, 4]) tables.close(conn);
    elapse();
    expect(tables.summaries()[0]).toMatchObject({ host: null, connected: 0 });
    take();
    tables.message(12, { type: "table-join", roomId: "TABLE", clientToken: "d", from: 0 });
    expect(take().find((o) => o.message.type === "table-start")).toMatchObject({
      to: 12,
      message: { type: "table-start", seat: DAVE, host: DAVE, online: [DAVE] },
    });
  });

  it("deals a rematch for the host: a new game number, seed and salt, an empty log", () => {
    const { tables, take } = harness();
    tables.open(opening());
    tables.message(1, { type: "table-input", roomId: "TABLE", after: 0, input: pass(BOB) });
    take();
    tables.message(3, { type: "table-rematch", roomId: "TABLE" });
    expect(take()).toMatchObject([{ to: 3, message: { type: "error", message: /only the host/ } }]);

    tables.message(1, { type: "table-rematch", roomId: "TABLE" });
    const starts = take();
    expect(starts.map((s) => s.to)).toEqual([1, 3, 4, 9]);
    const first = starts[0].message;
    if (first.type !== "table-start") throw new Error("unreachable");
    expect(first.recipe.gameNumber).toBe(2);
    expect(first.log).toEqual([]);
    expect(first.recipe.config.idSalt).not.toBe("salt");
    expect(typeof first.recipe.config.seed).toBe("number");
    expect(recipe.seats.map((s) => s.player)).toContain(first.recipe.config.startingPlayer);
    expect(first.recipe.config.decks).toBe(recipe.config.decks);
    // Everyone was dealt the same one.
    for (const { message } of starts) expect(message.type === "table-start" && message.recipe).toEqual(first.recipe);
    expect(tables.summaries()[0]).toMatchObject({ gameNumber: 2, inputs: 0 });
  });

  it("forgets a table nobody has been at for a while, and not one with someone at it", () => {
    const { tables } = harness(0);
    tables.open(opening());
    expect(tables.reapIdle(0)).toBe(0);
    for (const conn of [1, 3, 4, 9]) tables.close(conn);
    expect(tables.reapIdle(60_000)).toBe(0);
    expect(tables.reapIdle(0)).toBe(1);
    expect(tables.has("TABLE")).toBe(false);
    expect(tables.size).toBe(0);
  });
});

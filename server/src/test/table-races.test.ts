/**
 * Inputs that race at a table: step 5 of `docs/plans/replicated-rooms.md`.
 * Real device copies (`TableCopy`) over the server's real order (`Tables`),
 * their messages held in queues this file delivers by hand (`table-fuzz.ts`)
 * to set up one race at a time: a move made while someone's concession, or a
 * setting, is on its way; the host's run of bot moves cut in two; two
 * opening hands kept at once. Then the same harness delivering at random.
 */

import { describe, expect, it } from "vitest";
import { AutomaticController, stateDigest } from "engine";
import type { PlayerId } from "engine";
import type { ClientMessage, PassSettings } from "protocol";
import { ALICE, BOB, CAROL } from "../decks.js";
import { RacingTable, playTable } from "../table-fuzz.js";
import type { Device } from "../table-fuzz.js";

const PLAYS = 60_000;

const SETTINGS: PassSettings = {
  passToMain: false,
  passThroughCombat: false,
  orderTriggers: true,
  skipManaOnly: true,
  stops: { mine: [], theirs: [] },
};

type TableInput = Extract<ClientMessage, { type: "table-input" }>;
const inputsOf = (device: Device): TableInput[] => device.up.filter((m): m is TableInput => m.type === "table-input");

/** The person at `device` answers as little as they may, on their own copy. */
function move(table: RacingTable, device: Device): void {
  const { room } = table.copyOf(device);
  const state = room.game.state;
  const asked = state.awaiting !== null ? state.awaiting.player : state.priority.holder;
  if (asked === null) throw new Error("nobody is asked");
  room.dispatch(device.page, new AutomaticController(asked).act(room.game.controllerView(asked)));
}

/** Plays from rest to rest until the game is past the opening hands and
 * `ready` likes the person waiting; returns their device, the table at rest. */
function playTo(table: RacingTable, ready: (waiting: Device) => boolean = () => true): Device {
  for (let i = 0; i < 600; i += 1) {
    table.rest();
    const waiting = table.waitingOn();
    if (waiting === null) break;
    if (table.state.awaiting?.kind !== "mulligan" && ready(waiting)) return waiting;
    move(table, waiting);
  }
  throw new Error("the game never came to the position asked for");
}

const others = (table: RacingTable, device: Device): Device[] => table.devices.filter((d) => d !== device);
const undone = (table: RacingTable): Record<string, number> =>
  Object.fromEntries(table.devices.map((d) => [d.player, table.copyOf(d).undone]));

/** What the fuzzed games below add up to: read by the test after them. */
const raced = { refused: 0, undone: 0 };

describe("inputs racing at a table", () => {
  it("holds an opening-hand choice until the order gives it its place, each device's own included", () => {
    const table = new RacingTable({ seed: 31, seats: ["person", "person"] });
    const [alice, bob] = table.devices;
    // Each is told to deal, and nothing else has arrived.
    table.toDevice(alice);
    table.toDevice(bob);
    const dealt = stateDigest(table.state, { events: true });
    const keep = (player: PlayerId) => ({ type: "mulligan", player, keep: true }) as const;
    table.copyOf(alice).room.dispatch(alice.page, keep(ALICE));
    table.copyOf(bob).room.dispatch(bob.page, keep(BOB));
    // Sent, asking for no place, and not applied where it was made.
    expect(inputsOf(alice)).toMatchObject([{ after: null, input: { kind: "action", action: keep(ALICE) } }]);
    for (const device of [alice, bob]) {
      expect(stateDigest(table.copyOf(device).room.game.state, { events: true })).toBe(dealt);
    }
    // And until it lands, that device makes nothing more: a second click is
    // kept for after it.
    table.copyOf(alice).room.dispatch(alice.page, keep(ALICE));
    expect(inputsOf(alice)).toHaveLength(1);

    // Bob's reaches the server first.
    table.toServer(bob);
    table.toServer(alice);
    expect(table.log.map((entry) => entry.from)).toEqual([BOB, ALICE]);
    table.rest();
    table.agree("once both hands are kept");
    expect(table.refused).toBe(0);
    expect(undone(table)).toEqual({ [ALICE]: 0, [BOB]: 0 });
    expect(table.state.awaiting?.kind).not.toBe("mulligan");
    // The second click was tried once the first had landed, where the game
    // no longer asks for it: refused there, to the page, and never sent.
    expect(inputsOf(alice)).toHaveLength(0);
    const keeps = table.log.filter((entry) => entry.input.kind === "action" && entry.input.action.type === "mulligan");
    expect(keeps.map((entry) => entry.from)).toEqual([BOB, ALICE]);
    expect(table.toldTo(alice).map((m) => m.type)).toEqual(["error"]);
  });

  it("holds a move made while a setting of the person's own is on its way, and makes it once that has landed", () => {
    const table = new RacingTable({ seed: 35, seats: ["person", "person"] });
    const mover = playTo(table);
    const { room } = table.copyOf(mover);
    const before = table.log.length;
    room.setPassSettings(mover.page, SETTINGS);
    expect(inputsOf(mover)).toMatchObject([{ after: null, input: { kind: "orders-own-triggers", on: true } }]);
    // The move is the person's to make, and the copy can't make it yet: it
    // is neither refused nor sent.
    const asked = stateDigest(room.game.state, { events: true });
    move(table, mover);
    expect(inputsOf(mover)).toHaveLength(1);
    expect(stateDigest(room.game.state, { events: true })).toBe(asked);

    table.rest();
    table.agree("once the setting and the move have landed");
    // The setting, then the move made on the game with the setting in it.
    expect(table.log.slice(before, before + 2)).toMatchObject([
      { from: mover.player, input: { kind: "orders-own-triggers", player: mover.player, on: true } },
      { from: mover.player, input: { kind: "action" } },
    ]);
    expect(table.refused).toBe(0);
    expect(table.toldTo(mover)).toEqual([]);
  }, PLAYS);

  it("undoes a move made as someone else conceded, and leaves it to the person to make again", () => {
    const table = new RacingTable({ seed: 32, seats: ["person", "person", "person"] });
    const mover = playTo(table);
    const [leaver] = others(table, mover);
    const before = table.log.length;
    const asked = stateDigest(table.copyOf(mover).room.game.state, { events: true });

    move(table, mover);
    const made = inputsOf(mover);
    expect(made.length).toBeGreaterThan(0);
    expect(made[0]).toMatchObject({ after: before, mine: 0 });
    // It is in the mover's game already.
    expect(stateDigest(table.copyOf(mover).room.game.state, { events: true })).not.toBe(asked);
    table.copyOf(leaver).room.concede(leaver.page);

    // The concession reaches the server first: the move was made for its place.
    table.toServer(leaver);
    table.toServer(mover, made.length);
    expect(table.refused).toBe(made.length);
    expect(table.log.slice(before)).toMatchObject([{ index: before, from: leaver.player, input: { kind: "concede" } }]);

    table.rest();
    table.agree("after the race");
    expect(undone(table)).toEqual({ ...Object.fromEntries(table.devices.map((d) => [d.player, 0])), [mover.player]: 1 });
    for (const device of table.devices) {
      expect(table.copyOf(device).room.game.state.players[leaver.player].hasLost).toBe(true);
    }
    // Nothing of the mover's own was put back for them: whatever followed the
    // concession, their device sent after seeing it.
    expect(table.log.slice(before + 1).every((entry) => entry.index > before)).toBe(true);
    expect(table.copyOf(mover).settled).toBe(true);
    // They are told why the board isn't the one their move made, and only they.
    expect(table.toldTo(mover)).toEqual([
      { type: "notice", roomId: "RACES", message: expect.stringContaining(`${leaver.player} conceded just as you moved`) },
    ]);
    for (const device of others(table, mover)) expect(table.toldTo(device)).toEqual([]);

    // And the game goes on.
    for (let i = 0; i < 12; i += 1) {
      const waiting = table.waitingOn();
      if (waiting === null) break;
      move(table, waiting);
      table.rest();
    }
    table.agree("playing on");
  }, PLAYS);

  it("makes a person's move again when all that got in first was a setting", () => {
    const table = new RacingTable({ seed: 33, seats: ["person", "person", "person"] });
    const mover = playTo(table);
    const [setter] = others(table, mover);
    const before = table.log.length;

    move(table, mover);
    const made = inputsOf(mover);
    expect(made.length).toBeGreaterThan(0);
    table.copyOf(setter).room.setPassSettings(setter.page, SETTINGS);
    expect(inputsOf(setter)).toMatchObject([{ after: null, input: { kind: "orders-own-triggers", on: true } }]);

    table.toServer(setter);
    table.toServer(mover, made.length);
    expect(table.refused).toBe(made.length);
    table.rest();
    table.agree("after the race");

    expect(table.copyOf(mover).undone).toBe(1);
    // Made again for them: nothing to tell the person.
    expect(table.toldTo(mover)).toEqual([]);
    // The setting, then the same move, sent again for the place after it.
    expect(table.log.slice(before, before + 2)).toEqual([
      { index: before, from: setter.player, input: { kind: "orders-own-triggers", player: setter.player, on: true } },
      { index: before + 1, from: mover.player, input: made[0].input },
    ]);
    for (const device of table.devices) {
      expect(table.copyOf(device).room.game.state.ordersOwnTriggers).toEqual([setter.player]);
    }
  }, PLAYS);

  it("drops the rest of the host's run of bot moves when an input lands inside it, and the bots move again", () => {
    const table = new RacingTable({ seed: 34, seats: ["person", "bot", "person", "bot"] });
    const [host, carol] = table.devices;
    expect(host.player).toBe(ALICE);
    // Until the host's own move sets the bots going: a run of three or more
    // inputs made on her device before any is confirmed.
    let made: TableInput[] = [];
    let before = 0;
    for (let i = 0; i < 300 && made.length < 3; i += 1) {
      const waiting = playTo(table);
      before = table.log.length;
      move(table, waiting);
      made = waiting === host ? inputsOf(host) : [];
    }
    expect(made.length).toBeGreaterThanOrEqual(3);
    expect(made.map((m) => [m.after, m.mine])).toEqual(made.map((_, k) => [before + k, k]));
    const hostsOwn = made.filter((m) => m.input.kind === "action" && m.input.action.player === ALICE).length;
    expect(hostsOwn).toBeLessThan(made.length);

    // Carol's setting reaches the server after the first of the run.
    table.copyOf(carol).room.setPassSettings(carol.page, SETTINGS);
    table.toServer(host, 1);
    table.toServer(carol);
    table.toServer(host, made.length - 1);
    // Every one of the rest refused: the second by where the log ends, those
    // after it by whose entries stand before them.
    expect(table.refused).toBe(made.length - 1);

    table.rest();
    table.agree("after the race");
    expect(undone(table)).toEqual({ [ALICE]: 1, [CAROL]: 0 });
    expect(table.log.slice(before, before + 2)).toMatchObject([
      { from: ALICE, input: made[0].input },
      { from: CAROL, input: { kind: "orders-own-triggers" } },
    ]);
    // The setting changed nothing the bots were asked: the same moves, made
    // again by the room, each for its new place.
    expect(table.log.slice(before + 2, before + 1 + made.length).map((entry) => entry.input)).toEqual(
      made.slice(1).map((m) => m.input),
    );
    expect(table.refused).toBe(made.length - 1);
  }, PLAYS);

  it.each([
    ["PP", ["person", "person"]],
    ["PbPb", ["person", "bot", "person", "bot"]],
    ["PPPb", ["person", "person", "person", "bot"]],
    ["PPPP", ["person", "person", "person", "person"]],
  ] as const)(
    "keeps every copy the same with everything racing: %s",
    (_label, seats) => {
      for (const pacing of ["immediate", "realtime"] as const) {
        const result = playTable({ seed: 5, seats, maxTurn: 7, sideEvents: 0.08, stalls: 0.05, pacing });
        expect(result.over || result.turns > 7).toBe(true);
        expect(result.checks).toBeGreaterThan(3);
        raced.undone += result.undone;
        raced.refused += result.refused;
      }
    },
    180_000,
  );

  it("and across those games inputs did lose their place, and copies went back on them", () => {
    expect(raced.refused).toBeGreaterThan(8);
    expect(raced.undone).toBeGreaterThan(5);
  });
});

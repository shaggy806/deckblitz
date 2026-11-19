/**
 * A table played with everything racing: the check of step 5 of
 * `docs/plans/replicated-rooms.md`, and nothing a server or a page runs.
 *
 * The real order (`Tables`, as the server's main thread runs it) and a real
 * device copy a person (`TableCopy`), joined by two queues a device, one each
 * way, with nothing delivered until this harness says so. It delivers one
 * message at a time from a queue picked at random, so each device's messages
 * arrive in the order sent (a socket) while the devices fall behind one
 * another by any amount; a device may stall altogether for a while. Between
 * deliveries people act the moment their own copy asks them, whatever is
 * still on its way, and do the things done out of turn — a concession, a
 * setting, auto-pass, a seat handed to a bot — at any moment. That is what
 * makes inputs race: a bot's run of moves made on the host while a
 * concession is in flight, two opening hands kept at once, a move made on a
 * game a setting is about to land in.
 *
 * Whenever everything sent has arrived, every copy must hold the same game
 * (`agree`), have nothing unconfirmed, and never have stopped; at the end, a
 * copy dealt from nothing but the server's log must hold it too.
 *
 * Used by `test/table-races.test.ts` and `scripts/tables-fuzz.mjs`.
 */

import {
  COMMANDER_RULES,
  HeuristicBotController,
  RandomController,
  answeringPlayer,
  createRng,
  standInFor,
  stateDigest,
  stateToJson,
} from "engine/local";
import type { GameState, PlayerController, PlayerId } from "engine/local";
import type { ClientMessage, PassSettings, ServerMessage, TableEntry, TableRecipe } from "protocol";
import { cardRegistry } from "./card-registry.js";
import { SEATS } from "./decks.js";
import { FakeClock, differences } from "./room-copies.js";
import type { Connection } from "./room.js";
import { TableCopy } from "./table-copy.js";
import type { TableStart } from "./table-copy.js";
import { Tables } from "./tables.js";

export interface TableFuzzOptions {
  readonly seed: number;
  /** Who sits in each seat, in seating order (2-4). */
  readonly seats: readonly ("person" | "bot")[];
  /** What plays a bot's seat: v1 unless given. */
  readonly botController?: (player: PlayerId) => PlayerController;
  /** Each seat's deck: the server's own four Commander decks unless given. */
  readonly decks?: readonly { readonly cards: readonly string[]; readonly commanders?: readonly string[] }[];
  readonly rules?: "commander" | "plain";
  /** `"realtime"` paces each copy as a live room does, on a clock of its own
   * that runs when this harness picks it; `"immediate"` is the default. */
  readonly pacing?: "immediate" | "realtime";
  /** Stop once this turn has passed. */
  readonly maxTurn?: number;
  /** How likely each tick is to come with something done out of turn. */
  readonly sideEvents?: number;
  /** How likely each tick is to stall a device, or let a stalled one go. */
  readonly stalls?: number;
  /** How likely each tick is to have a device leave the table (its tab
   * closed: its copy gone, whatever was on its way to or from it lost), or
   * one that left come back and be dealt a new copy from the log. 0, the
   * default: nobody leaves. */
  readonly leaves?: number;
  /** Bring everything to rest and check the copies every this many moves by
   * people (and whenever the table comes to rest by itself, and at the end). */
  readonly checkEvery?: number;
  /** Handed the table once it is set up, for whoever reports a failure. */
  readonly watch?: (table: RacingTable) => void;
}

export interface TableFuzzResult {
  readonly devices: number;
  /** Moves people made. */
  readonly moves: number;
  /** Inputs the server put in order. */
  readonly inputs: number;
  /** Inputs it refused: made for a place something else took. */
  readonly refused: number;
  /** Times a copy went back on inputs of its own. */
  readonly undone: number;
  readonly checks: number;
  readonly turns: number;
  readonly over: boolean;
  readonly did: Readonly<Record<string, number>>;
  readonly digest: string;
}

/** One person's device: a connection to the server and, once dealt, a copy. */
export interface Device {
  readonly conn: number;
  readonly player: PlayerId;
  readonly page: Connection;
  copy: TableCopy | null;
  /** Sent by the device, not yet at the server. */
  readonly up: ClientMessage[];
  /** Sent by the server, not yet at the device. */
  readonly down: ServerMessage[];
  readonly clock: FakeClock | null;
  /** The last frame its page said it had shown (`"realtime"` pacing). */
  acked: number;
  /** What its page was told beyond frames: a refusal, a notice that a move
   * was taken back. */
  readonly told: ServerMessage[];
  /** Its tab is closed: no copy, no connection, until it comes `back`. */
  away: boolean;
}

const ROOM = "RACES";
/** A connection that only watches, and reads everything at once: the
 * server's order as it stands. */
const RECORDER = 99;

export class RacingTable {
  readonly devices: Device[] = [];
  /** The server's order. */
  readonly log: TableEntry[] = [];
  /** What was done out of turn, in words, for a failure's report. */
  readonly did: string[] = [];
  readonly botSeats: ReadonlySet<PlayerId>;
  readonly recipe: TableRecipe;
  refused = 0;
  private readonly tables: Tables;
  private readonly stalled = new Set<Device>();
  private readonly rng: ReturnType<typeof createRng>;
  private readonly botController: (player: PlayerId) => PlayerController;
  private readonly paced: boolean;
  /** The server's wait before it hands a departed host's bots on, pending. */
  private grace: (() => void) | null = null;
  private undoneGone = 0;

  constructor(options: TableFuzzOptions) {
    const players = options.seats.map((_, i) => SEATS[i].id);
    this.botSeats = new Set(players.filter((_, i) => options.seats[i] === "bot"));
    this.rng = createRng(options.seed * 104_729 + 7);
    this.paced = options.pacing === "realtime";
    this.botController =
      options.botController ?? ((player: PlayerId): PlayerController => new HeuristicBotController(player, cardRegistry()));
    this.recipe = {
      gameNumber: 1,
      config: {
        seed: options.seed,
        idSalt: `races-${options.seed}`,
        mulligans: true,
        ...(options.rules === "plain" ? {} : { rules: COMMANDER_RULES }),
        decks: players.map((player, i) => {
          const deck = options.decks?.[i] ?? SEATS[i];
          return { player, cards: deck.cards, ...(deck.commanders !== undefined ? { commanders: deck.commanders } : {}) };
        }),
      },
      firstPlayer: "random",
      botSpeed: "fast",
      seats: players.map((player) => ({ player, name: null, bot: this.botSeats.has(player) })),
    };
    players.forEach((player, i) => {
      if (options.seats[i] !== "person") return;
      const told: ServerMessage[] = [];
      this.devices.push({
        conn: i + 1,
        player,
        page: { send: (message) => told.push(message) },
        copy: null,
        up: [],
        down: [],
        clock: this.paced ? new FakeClock() : null,
        acked: 0,
        told,
        away: false,
      });
    });
    if (this.devices.length === 0) throw new Error("a table needs a person");
    this.tables = new Tables(
      (conn, message) => {
        if (message.type === "table-refused") this.refused += 1;
        if (conn === RECORDER) {
          if (message.type === "table-input") this.log.push({ index: message.index, from: message.from, input: message.input });
          return;
        }
        this.devices.find((d) => d.conn === conn)?.down.push(message);
      },
      // The host's grace, when a host's device leaves, is one more thing
      // that can happen next (`step`): it runs when the harness picks it.
      {
        timers: {
          setTimeout: (fn) => {
            this.grace = fn;
            return fn;
          },
          clearTimeout: (handle) => {
            if (this.grace === handle) this.grace = null;
          },
        },
      },
    );
    this.tables.open({
      id: ROOM,
      recipe: this.recipe,
      people: this.devices.map((d) => ({ player: d.player, token: `token-${d.conn}`, conn: d.conn })),
      watchers: [RECORDER],
      creator: this.devices[0].player,
    });
  }

  /** The device whose copy runs the bots. */
  get host(): Device | null {
    return this.devices.find((d) => d.copy?.isHost === true) ?? null;
  }

  /** The devices at the table now, each with its copy. */
  get present(): Device[] {
    return this.devices.filter((d) => d.copy !== null);
  }

  /** The game, as the first device at the table holds it. */
  get state(): GameState {
    const [first] = this.present;
    if (first === undefined) throw new Error("races: nobody is at the table to say how the game stands");
    return this.copyOf(first).room.game.state;
  }

  /** Times a copy went back on inputs of its own, copies since gone included. */
  get undone(): number {
    return this.undoneGone + this.present.reduce((n, d) => n + this.copyOf(d).undone, 0);
  }

  /**
   * `device`'s tab closes: its copy is gone, what it had sent that hasn't
   * reached the server never will, and what the server had sent it is lost.
   * The server is told at once, as a closed socket tells it.
   */
  leave(device: Device): void {
    if (device.away) return;
    device.away = true;
    this.stalled.delete(device);
    if (device.copy !== null) {
      this.undoneGone += device.copy.undone;
      device.copy.dispose();
    }
    device.copy = null;
    device.up.length = 0;
    device.down.length = 0;
    this.tables.close(device.conn);
  }

  /** `device` comes back: it asks for the table by its seat's token, and is
   * dealt a new copy from the log when the server's answer arrives. */
  back(device: Device): void {
    if (!device.away) return;
    device.away = false;
    device.up.push({ type: "table-join", roomId: ROOM, clientToken: `token-${device.conn}` });
  }

  copyOf(device: Device): TableCopy {
    if (device.copy === null) throw new Error(`races: ${device.player}'s device was never dealt its copy`);
    return device.copy;
  }

  /** Stalls a device (nothing reaches it or leaves it), or lets it go. */
  stall(device: Device): void {
    if (!this.stalled.delete(device)) this.stalled.add(device);
  }

  /**
   * Delivers one thing, picked at random from everything that could happen
   * next: a message reaching the server, one reaching a device, and (paced)
   * a page saying it has shown its frame, a device's next timer running.
   * `false` if there is nothing: the table is at rest.
   */
  step(): boolean {
    const next: (() => void)[] = [];
    const { grace } = this;
    if (grace !== null) {
      next.push(() => {
        this.grace = null;
        grace();
      });
    }
    for (const device of this.devices) {
      if (this.stalled.has(device)) continue;
      if (device.up.length > 0) next.push(() => void this.toServer(device));
      if (device.down.length > 0) next.push(() => void this.toDevice(device));
      const { copy, clock } = device;
      if (copy === null || clock === null) continue;
      if (device.acked < copy.room.frameSeq) {
        next.push(() => {
          device.acked = copy.room.frameSeq;
          copy.room.ack(device.page, device.acked);
        });
      }
      if (clock.waiting) next.push(() => void clock.fireNext());
    }
    if (next.length === 0) return false;
    next[this.rng.int(next.length)]();
    return true;
  }

  /** The oldest message `device` sent reaches the server (up to `count` of
   * them). Returns how many did. For a test that sets up one race by hand. */
  toServer(device: Device, count = 1): number {
    let sent = 0;
    for (; sent < count; sent += 1) {
      const message = device.up.shift();
      if (message === undefined) break;
      this.tables.message(device.conn, message);
    }
    return sent;
  }

  /** The oldest message the server sent `device` reaches it (up to `count`). */
  toDevice(device: Device, count = 1): number {
    let arrived = 0;
    for (; arrived < count; arrived += 1) {
      const message = device.down.shift();
      if (message === undefined) break;
      this.arrive(device, message);
    }
    return arrived;
  }

  /** Lets every device go and delivers until nothing is left to. */
  rest(): void {
    this.stalled.clear();
    for (let guard = 0; guard < 2_000_000; guard += 1) if (!this.step()) return;
    throw new Error("races: the table never came to rest");
  }

  /** Whether anything is still on its way, stalled devices' too. */
  get quiet(): boolean {
    return (
      this.stalled.size === 0 && this.grace === null && this.devices.every((d) => d.up.length === 0 && d.down.length === 0)
    );
  }

  private arrive(device: Device, message: ServerMessage): void {
    if (message.type === "table-start") {
      device.copy = this.deal(device, message);
      device.acked = 0;
      return;
    }
    device.copy?.handle(message);
  }

  private deal(device: Device, start: TableStart): TableCopy {
    const { clock } = device;
    const copy = new TableCopy(start, {
      send: (message) => device.up.push(message),
      room: {
        ...(clock === null
          ? { pacing: "immediate" as const }
          : { pacing: "realtime" as const, timers: clock.timers, settleSliceMs: Infinity }),
        botController: this.botController,
      },
      notice: (message) => device.told.push({ type: "notice", roomId: ROOM, message }),
    });
    if (start.seat !== null) copy.room.claimSeat(start.seat, `page-${device.conn}`, device.page);
    return copy;
  }

  /** What `device`'s page has been told beyond frames, oldest first. */
  toldTo(device: Device): readonly ServerMessage[] {
    return device.told;
  }

  /**
   * Throws unless, at rest, every copy holds the same game, the whole of the
   * server's order and nothing more, and none has stopped.
   */
  agree(when: string): void {
    if (!this.quiet) throw new Error(`races: asked whether the copies agree ${when} with messages still on their way`);
    // Whoever is at the table: a device that left holds nothing to compare.
    const present = this.present;
    if (present.length === 0) return;
    const copies = present.map((d) => this.copyOf(d));
    copies.forEach((copy, i) => {
      const who = present[i].player;
      if (copy.outOfStep !== null) throw new Error(`races: ${who}'s copy fell out of step ${when}: ${copy.outOfStep}`);
      if (copy.room.stopped !== null) throw new Error(`races: ${who}'s copy stopped ${when}: ${copy.room.stopped}`);
      if (!copy.settled || copy.head !== this.log.length) {
        throw new Error(
          `races: ${who}'s copy is at ${copy.head} of the server's ${this.log.length} inputs ${when}` +
            `${copy.settled ? "" : ", with inputs of its own unanswered"}`,
        );
      }
    });
    this.same(copies[0], present[0].player, copies.slice(1), present.slice(1).map((d) => d.player), when);
  }

  /** A copy dealt now from the server's log alone holds the game too: what a
   * device arriving late, or coming back, would build. */
  latecomer(): void {
    const late = new TableCopy(
      { type: "table-start", roomId: ROOM, recipe: this.recipe, seat: null, host: this.host?.player ?? null, from: 0, log: this.log },
      { send: () => {}, room: { pacing: "immediate", botController: this.botController } },
    );
    const [first] = this.present;
    if (first === undefined) return;
    this.same(this.copyOf(first), first.player, [late], ["a device dealt from the log"], "at the end");
  }

  private same(first: TableCopy, firstName: string, others: readonly TableCopy[], names: readonly string[], when: string): void {
    const digest = stateDigest(first.room.game.state, { events: true });
    const odd = others.findIndex((copy) => stateDigest(copy.room.game.state, { events: true }) !== digest);
    if (odd < 0) return;
    const plain = (copy: TableCopy): unknown => JSON.parse(stateToJson(copy.room.game.snapshot()));
    const lines = differences(plain(first), plain(others[odd])).map((line) => `  ${line}`);
    const { turn } = first.room.game.state;
    throw new Error(
      `races: ${names[odd]}'s copy differs from ${firstName}'s ${when}, after ${this.log.length} inputs, ` +
        `turn ${turn.number} (${turn.step}) (${firstName} | ${names[odd]}):\n${lines.join("\n")}`,
    );
  }

  /**
   * At rest: the device of the person the game is waiting on, or `null` once
   * it is over. Throws if it waits on a seat a copy should have moved for.
   * The device may be one that left: the game waits for that person, as a
   * room on the server would.
   */
  waitingOn(): Device | null {
    const state = this.state;
    if (state.result.over) return null;
    const asked = state.awaiting !== null ? state.awaiting.player : state.priority.holder;
    if (asked === null) throw new Error("races: the game is waiting on nobody");
    const answering = answeringPlayer(state, asked);
    const device = this.devices.find((d) => d.player === answering);
    if (device !== undefined && device.copy === null) return device;
    if (device === undefined || this.copyOf(device).room.isBotSeat(answering)) {
      const { turn } = state;
      throw new Error(
        `races: nobody moved for ${answering} (asked as ${asked}), turn ${turn.number} (${turn.step}), ` +
          `after ${this.log.length} inputs; the host is ${this.host?.player ?? "nobody"}`,
      );
    }
    return device;
  }
}

/**
 * Plays one game at a racing table with random people, checking whenever it
 * comes to rest that every copy holds the same game. Throws where one
 * doesn't.
 */
export function playTable(options: TableFuzzOptions): TableFuzzResult {
  const table = new RacingTable(options);
  options.watch?.(table);
  const rng = createRng(options.seed * 7919 + 31);
  const maxTurn = options.maxTurn ?? 12;
  const sideEvents = options.sideEvents ?? 0.03;
  const stalls = options.stalls ?? 0.02;
  const leaves = options.leaves ?? 0;
  const checkEvery = options.checkEvery ?? 25;
  const people = new Map<PlayerId, RandomController>(
    table.devices.map((d) => [d.player, new RandomController(d.player, () => rng.next())]),
  );
  const did: Record<string, number> = {};
  const note = (what: string): void => {
    did[what] = (did[what] ?? 0) + 1;
  };
  const chance = (p: number): boolean => rng.next() < p;
  const pick = <T>(items: readonly T[]): T => items[rng.int(items.length)];
  let conceded = 0;
  let moves = 0;
  let checks = 0;

  /** The person at `device` moves if their own copy, as it stands, asks
   * them and takes a move from them just now. */
  const move = (device: Device): boolean => {
    const copy = device.copy;
    if (copy === null) return false;
    const { room } = copy;
    const state = room.game.state;
    if (state.result.over) return false;
    const asked = state.awaiting !== null ? state.awaiting.player : state.priority.holder;
    if (asked === null || answeringPlayer(state, asked) !== device.player || room.isBotSeat(device.player)) return false;
    const person = people.get(device.player);
    if (person === undefined) throw new Error(`races: no player for ${device.player}`);
    const view = room.game.controllerView(asked);
    const action = asked === device.player ? person.act(view) : standInFor(person, asked).act(view);
    try {
      room.dispatch(device.page, action);
    } catch (error) {
      // Its copy plays nothing while a choice of its own made out of turn is
      // on its way. Anything else refused is a fault.
      if (error instanceof Error && /can't act from here just now/.test(error.message)) return false;
      throw error;
    }
    moves += 1;
    return true;
  };

  /** Something a person does out of turn, on their own copy, whatever is on
   * its way. What the room refuses is simply not done. */
  const sideEvent = (): void => {
    const device = pick(table.devices);
    const copy = device.copy;
    if (copy === null) return;
    const { room } = copy;
    const kind = pick(["auto-pass", "pass-turn", "resolve-all", "settings", "settings", "takeover", "concede"] as const);
    try {
      switch (kind) {
        case "auto-pass":
          room.requestAutoPass(device.page);
          break;
        case "pass-turn":
          room.requestPassTurn(device.page);
          break;
        case "resolve-all":
          room.requestResolveAll(device.page);
          break;
        case "settings": {
          const settings: PassSettings = {
            passToMain: chance(0.3),
            passThroughCombat: chance(0.3),
            orderTriggers: chance(0.5),
            skipManaOnly: chance(0.7),
            skipAbilityOnly: chance(0.7),
            stops: { mine: chance(0.3) ? ["upkeep", "end"] : [], theirs: chance(0.3) ? ["declare-attackers"] : [] },
          };
          room.setPassSettings(device.page, settings);
          break;
        }
        case "takeover":
          room.setBotTakeover(device.page, !room.isBotSeat(device.player));
          break;
        case "concede": {
          // Leave two in the game as this device sees it, so it goes on.
          const state = room.game.state;
          if (state.turnOrder.filter((p) => state.players[p]?.hasLost !== true).length <= 2) return;
          if (conceded >= table.devices.length - 1) return;
          room.concede(device.page);
          conceded += 1;
          break;
        }
      }
      note(kind);
      table.did.push(`${device.player} ${kind} (after ${table.log.length} inputs)`);
    } catch {
      note(`${kind} refused`);
    }
  };

  const check = (when: string): void => {
    table.rest();
    table.agree(when);
    checks += 1;
  };

  check("once dealt");
  let sinceCheck = 0;
  for (let tick = 0; ; tick += 1) {
    if (tick > 5_000_000) throw new Error("races: the game never ended");
    if (sideEvents > 0 && chance(sideEvents)) sideEvent();
    if (stalls > 0 && chance(stalls)) table.stall(pick(table.devices));
    // A tab closes, or one that closed is opened again: about as often each
    // way, so most of the time most people are there.
    if (leaves > 0 && chance(leaves)) {
      const device = pick(table.devices);
      if (device.away) {
        table.back(device);
        note("came back");
      } else {
        table.leave(device);
        note("left");
      }
    }
    // Whoever's own copy asks them answers at once about half the time,
    // whatever hasn't reached them yet.
    if (chance(0.5)) {
      const first = rng.int(table.devices.length);
      for (let k = 0; k < table.devices.length; k += 1) {
        if (move(table.devices[(first + k) % table.devices.length])) {
          sinceCheck += 1;
          break;
        }
      }
    }
    if (sinceCheck >= checkEvery) {
      check(`after ${moves} moves`);
      sinceCheck = 0;
    }
    if (table.step()) continue;
    // Nothing left to deliver. With a device stalled, let it go and carry on.
    if (!table.quiet) {
      table.rest();
      continue;
    }
    // Nobody at the table at all: someone has to come back for it to go on.
    if (table.present.length === 0) {
      table.back(pick(table.devices));
      note("came back");
      continue;
    }
    table.agree(`at rest after ${moves} moves`);
    checks += 1;
    const waiting = table.waitingOn();
    if (waiting === null || table.state.turn.number > maxTurn) break;
    // The game waits on a choice of someone whose tab is closed: nobody
    // makes it for them, so here they come back.
    if (waiting.away) {
      table.back(waiting);
      note("came back");
      continue;
    }
    if (!move(waiting)) {
      throw new Error(`races: the game waits on ${waiting.player}, whose copy takes no move, after ${table.log.length} inputs`);
    }
    sinceCheck += 1;
  }
  // Everyone back for the last look: every device's copy, however often it
  // was dealt, holds the game.
  for (const device of table.devices) table.back(device);
  check("at the end");
  table.latecomer();
  return {
    devices: table.devices.length,
    moves,
    inputs: table.log.length,
    refused: table.refused,
    undone: table.undone,
    checks,
    turns: table.state.turn.number,
    over: table.state.result.over,
    did,
    digest: stateDigest(table.state, { events: true }),
  };
}

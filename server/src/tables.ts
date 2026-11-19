/**
 * Tables: games played on their players' own devices
 * (`docs/plans/replicated-rooms.md`, step 3). Each device holds a copy of the
 * game (`Room` with `RoomOptions.copy`); what the server keeps of a table is
 * what every copy is dealt from (the recipe), the inputs the devices made in
 * the one order they all apply them in (the log), who is connected, and whose
 * device runs the bots (the host). No game, no engine, no card: main-side
 * (`test/main-imports.test.ts`), and the same for both hosts.
 *
 * **The order.** A device sends an input made in turn saying where it takes
 * the log to end (`after`) and how many of the last entries it counts as its
 * own (`mine`). The input takes the next place only if the log is as it
 * says; otherwise the device is told (`table-refused`) and nothing else
 * happens. An input made out of turn (`after: null`: a concession, a setting,
 * an opening-hand decision) takes whatever place it arrives at. Everyone at
 * the table, the sender too, is sent each input as it takes its place.
 *
 * **The host** is a seat, not a connection: the lobby's creator while their
 * device is connected, else the first person connected in seating order
 * (`host.ts`'s rule for a room). When the host's device goes, the bots wait
 * `hostGraceMs` for it (a reload is a few seconds) before the next takes
 * them; the creator takes them back the moment they return.
 *
 * Nothing a device sends is checked against the game (there is none here):
 * a seat's device is trusted with its own moves and, as host, the bots'.
 */

import { randomBytes } from "node:crypto";

import type { PlayerId } from "engine";
import type { ClientMessage, ServerMessage, TableEntry, TableRecipe } from "protocol";

import type { ConnId } from "./room-host.js";

/** A person at a table as the waiting room hands them over. */
export interface TablePerson {
  readonly player: PlayerId;
  /** What reclaims the seat after a reload or a dropped connection. */
  readonly token: string;
  /** Their connection, if they have one right now. */
  readonly conn: ConnId | null;
}

/** A waiting room that starts as a table: what `Tables.open` is given. */
export interface TableOpening {
  readonly id: string;
  readonly recipe: TableRecipe;
  readonly people: readonly TablePerson[];
  /** Connections watching the waiting room: they watch the table. */
  readonly watchers: readonly ConnId[];
  /** The seat of whoever created the room, if they sat down. */
  readonly creator: PlayerId | null;
}

export interface TableSummary {
  readonly id: string;
  readonly gameNumber: number;
  readonly inputs: number;
  readonly people: number;
  readonly connected: number;
  readonly watching: number;
  readonly host: PlayerId | null;
  readonly idleMs: number;
}

export interface TablesOptions {
  /** How long the bots wait for a host whose device dropped before the next
   * device takes them. 5 s unless given. */
  readonly hostGraceMs?: number;
  /** Told when a table is forgotten (`remove`, `reapIdle`): the host drops
   * what it kept under the code. */
  readonly onRemoved?: (id: string) => void;
  /** For tests: the clock the grace runs on. */
  readonly timers?: {
    readonly setTimeout: (fn: () => void, ms: number) => unknown;
    readonly clearTimeout: (handle: unknown) => void;
  };
}

const HOST_GRACE_MS = 5_000;
/**
 * The most inputs one game's log takes. A long four-player game is a few
 * thousand (every pass is one); this is twenty times that, and what stands
 * between a device that sends inputs without end and the server's memory,
 * since table inputs don't spend the transport's rate limit (`transport.ts`).
 */
export const MAX_TABLE_LOG = 100_000;
const INPUT_KINDS: ReadonlySet<string> = new Set(["action", "concede", "orders-own-triggers"]);
/** The messages a table answers; anything else about its code is refused. */
const SILENT: ReadonlySet<string> = new Set(["ack", "event-deltas", "table-capable"]);

interface Seat {
  readonly token: string;
  conn: ConnId | null;
}

interface Table {
  readonly id: string;
  recipe: TableRecipe;
  log: TableEntry[];
  readonly seats: Map<PlayerId, Seat>;
  readonly watchers: Set<ConnId>;
  readonly creator: PlayerId | null;
  host: PlayerId | null;
  /** Set while the bots wait for a host whose device dropped. */
  hostTimer: unknown;
  lastActivityAt: number;
}

export class Tables {
  private readonly tables = new Map<string, Table>();
  private readonly send: (conn: ConnId, message: ServerMessage) => void;
  private readonly hostGraceMs: number;
  private readonly timers: NonNullable<TablesOptions["timers"]>;
  private readonly onRemoved: (id: string) => void;

  constructor(send: (conn: ConnId, message: ServerMessage) => void, options: TablesOptions = {}) {
    this.send = send;
    this.hostGraceMs = options.hostGraceMs ?? HOST_GRACE_MS;
    this.onRemoved = options.onRemoved ?? (() => {});
    this.timers = options.timers ?? {
      setTimeout: (fn, ms) => {
        const handle = setTimeout(fn, ms);
        handle.unref();
        return handle;
      },
      clearTimeout: (handle) => clearTimeout(handle as NodeJS.Timeout),
    };
  }

  has(id: string): boolean {
    return this.tables.has(id);
  }

  /** How many tables there are. */
  get size(): number {
    return this.tables.size;
  }

  /** A waiting room starts as a table: every device there is told to deal
   * its copy. */
  open(opening: TableOpening): void {
    const table: Table = {
      id: opening.id,
      recipe: opening.recipe,
      log: [],
      seats: new Map(opening.people.map((p) => [p.player, { token: p.token, conn: p.conn }])),
      watchers: new Set(opening.watchers),
      creator: opening.creator,
      host: null,
      hostTimer: null,
      lastActivityAt: Date.now(),
    };
    table.host = this.hostFor(table);
    this.tables.set(table.id, table);
    this.start(table);
  }

  /**
   * One client message about a table (`has(roomId)` said it is one). Whatever
   * it can't do here is answered with an `error`, as a room would.
   */
  message(conn: ConnId, message: ClientMessage): void {
    const roomId = (message as { roomId?: unknown }).roomId;
    const table = typeof roomId === "string" ? this.tables.get(roomId) : undefined;
    if (table === undefined) return;
    table.lastActivityAt = Date.now();
    switch (message.type) {
      case "table-input":
        // Made in a game this table has dealt past (a rematch): the device
        // has the new game by now, and nothing of the old one is waiting.
        if (message.game !== undefined && message.game !== table.recipe.gameNumber) return;
        this.input(table, conn, message.after, message.mine, message.input);
        return;
      case "table-join":
        this.join(table, conn, message.clientToken, message.from);
        return;
      case "table-rematch":
        this.rematch(table, conn);
        return;
      case "leave-room":
        this.leave(table, conn);
        return;
      case "join-room":
      case "spectate-room":
        // A page that came by the room's code, not knowing its game is a
        // table: there is no game here to join. One that can hold a copy
        // reads the code and asks for the table (`table-join`); any other
        // shows the message.
        this.send(conn, {
          type: "error",
          code: "table",
          roomId: table.id,
          message: `room ${table.id}'s game is played on its players' own devices, which this page can't join`,
        });
        return;
      default:
        if (SILENT.has(message.type)) return;
        this.send(conn, { type: "error", message: `room ${table.id} is played on its players' own devices` });
    }
  }

  /** A socket closed: it leaves every table it was at. */
  close(conn: ConnId): void {
    for (const table of this.tables.values()) this.leave(table, conn);
  }

  /** Removes tables nobody has been connected to, or sent anything at, for
   * `idleMs`. Returns how many went. */
  reapIdle(idleMs: number): number {
    const now = Date.now();
    let reaped = 0;
    for (const table of [...this.tables.values()]) {
      const connected = [...table.seats.values()].some((s) => s.conn !== null) || table.watchers.size > 0;
      if (connected || now - table.lastActivityAt < idleMs) continue;
      this.remove(table.id);
      reaped += 1;
    }
    return reaped;
  }

  /** Forgets a table, its timer with it. */
  remove(id: string): boolean {
    const table = this.tables.get(id);
    if (table === undefined) return false;
    if (table.hostTimer !== null) this.timers.clearTimeout(table.hostTimer);
    this.tables.delete(id);
    this.onRemoved(id);
    return true;
  }

  summaries(): TableSummary[] {
    const now = Date.now();
    return [...this.tables.values()].map((table) => ({
      id: table.id,
      gameNumber: table.recipe.gameNumber,
      inputs: table.log.length,
      people: table.seats.size,
      connected: [...table.seats.values()].filter((s) => s.conn !== null).length,
      watching: table.watchers.size,
      host: table.host,
      idleMs: now - table.lastActivityAt,
    }));
  }

  // ---------------------------------------------------------------- inside

  /** The seat `conn` plays at `table`, if it plays one. */
  private seatOf(table: Table, conn: ConnId): PlayerId | null {
    for (const [player, seat] of table.seats) if (seat.conn === conn) return player;
    return null;
  }

  private everyone(table: Table): ConnId[] {
    const conns: ConnId[] = [];
    for (const seat of table.seats.values()) if (seat.conn !== null) conns.push(seat.conn);
    return [...conns, ...table.watchers];
  }

  /** Whose device should run the bots: the creator's while it's connected,
   * else the first person connected, in seating order. */
  private hostFor(table: Table): PlayerId | null {
    if (table.creator !== null && table.seats.get(table.creator)?.conn != null) return table.creator;
    for (const seat of table.recipe.seats) {
      if (!seat.bot && table.seats.get(seat.player)?.conn != null) return seat.player;
    }
    return null;
  }

  /** Tells every device to deal its copy: at the start, and at a rematch. */
  private start(table: Table): void {
    for (const [player, seat] of table.seats) {
      if (seat.conn !== null) this.send(seat.conn, this.startFor(table, player, 0));
    }
    for (const conn of table.watchers) this.send(conn, this.startFor(table, null, 0));
  }

  private startFor(table: Table, seat: PlayerId | null, from: number): ServerMessage {
    return {
      type: "table-start",
      roomId: table.id,
      recipe: table.recipe,
      seat,
      host: table.host,
      from,
      log: table.log.slice(from),
      online: this.online(table),
    };
  }

  /** The people whose devices are connected, in seating order. */
  private online(table: Table): PlayerId[] {
    return table.recipe.seats.filter((s) => table.seats.get(s.player)?.conn != null).map((s) => s.player);
  }

  /** Tells every device who is connected now, but `except`, which is being
   * told in its `table-start`. */
  private seatsChanged(table: Table, except?: ConnId): void {
    const message: ServerMessage = { type: "table-seats", roomId: table.id, online: this.online(table) };
    for (const to of this.everyone(table)) if (to !== except) this.send(to, message);
  }

  private input(table: Table, conn: ConnId, after: unknown, mine: unknown, input: unknown): void {
    const from = this.seatOf(table, conn);
    if (from === null) {
      this.send(conn, { type: "error", message: `you aren't seated at ${table.id}` });
      return;
    }
    const kind = (input as { kind?: unknown } | null)?.kind;
    const own = mine === undefined ? 0 : mine;
    const whole = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n >= 0;
    if ((after !== null && !whole(after)) || !whole(own) || typeof kind !== "string" || !INPUT_KINDS.has(kind)) {
      this.send(conn, { type: "error", message: "malformed table input" });
      return;
    }
    if (table.log.length >= MAX_TABLE_LOG) {
      this.send(conn, { type: "error", message: `room ${table.id}'s game has run too long to take another move` });
      return;
    }
    // An input made out of turn lands wherever it arrives. One made in turn
    // was applied where its device made it, so it is taken only if the log
    // is what the device took it to be: ending at `after`, the last `own`
    // entries the device's own. Without the second half, a run of three
    // whose second was refused could have its third taken, someone else's
    // input standing in the place the second was made for.
    if (after !== null) {
      let asMade = after === table.log.length && own <= after;
      for (let back = 1; asMade && back <= own; back += 1) asMade = table.log[after - back].from === from;
      if (!asMade) {
        this.send(conn, { type: "table-refused", roomId: table.id, after, head: table.log.length });
        return;
      }
    }
    const entry: TableEntry = { index: table.log.length, from, input: input as TableEntry["input"] };
    table.log.push(entry);
    const message: ServerMessage = { type: "table-input", roomId: table.id, ...entry };
    for (const to of this.everyone(table)) this.send(to, message);
  }

  private join(table: Table, conn: ConnId, token: unknown, from: unknown): void {
    // Wherever it was at this table before, it is where it says now.
    this.unbind(table, conn);
    let seat: PlayerId | null = null;
    if (typeof token === "string") {
      for (const [player, held] of table.seats) {
        if (held.token === token) {
          held.conn = conn;
          seat = player;
        }
      }
    }
    if (seat === null) table.watchers.add(conn);
    const start = typeof from === "number" && Number.isInteger(from) && from >= 0 ? Math.min(from, table.log.length) : 0;
    // A device back in its seat may be the host again (the creator), or the
    // one the bots were waiting for.
    this.rehost(table);
    this.send(conn, this.startFor(table, seat, start));
    if (seat !== null) this.seatsChanged(table, conn);
  }

  private rematch(table: Table, conn: ConnId): void {
    const seat = this.seatOf(table, conn);
    if (seat === null || (seat !== table.host && seat !== table.creator)) {
      this.send(conn, { type: "error", message: "only the host can start a rematch" });
      return;
    }
    const { recipe } = table;
    const people = recipe.seats.map((s) => s.player);
    table.recipe = {
      ...recipe,
      gameNumber: recipe.gameNumber + 1,
      // A fresh shuffle, fresh object ids, and (left to chance) a fresh first
      // player: plain data here, the devices deal from it.
      config: {
        ...recipe.config,
        seed: randomBytes(4).readUInt32BE(0),
        idSalt: randomBytes(6).toString("base64url"),
        startingPlayer:
          recipe.firstPlayer === "random" ? people[randomBytes(1)[0] % people.length] : recipe.firstPlayer,
      },
    };
    table.log = [];
    this.start(table);
  }

  private leave(table: Table, conn: ConnId): void {
    const seated = this.seatOf(table, conn) !== null;
    if (!this.unbind(table, conn)) return;
    this.rehost(table);
    if (seated) this.seatsChanged(table);
  }

  /** Lets go of `conn` at `table`; whether it was there. */
  private unbind(table: Table, conn: ConnId): boolean {
    let was = table.watchers.delete(conn);
    for (const seat of table.seats.values()) {
      if (seat.conn === conn) {
        seat.conn = null;
        was = true;
      }
    }
    return was;
  }

  /**
   * Names the host afresh after someone came or went. The creator back at
   * the table has the bots at once; a host that dropped keeps them for the
   * grace, in case it is back in a moment, and then the next device has them.
   */
  private rehost(table: Table): void {
    const wanted = this.hostFor(table);
    if (wanted === table.host) {
      this.cancelGrace(table);
      return;
    }
    const current = table.host;
    const dropped = current !== null && table.seats.get(current)?.conn == null;
    if (!dropped || wanted === table.creator || this.hostGraceMs <= 0) {
      this.setHost(table, wanted);
      return;
    }
    if (table.hostTimer !== null) return;
    table.hostTimer = this.timers.setTimeout(() => {
      table.hostTimer = null;
      if (!this.tables.has(table.id)) return;
      this.setHost(table, this.hostFor(table));
    }, this.hostGraceMs);
  }

  private cancelGrace(table: Table): void {
    if (table.hostTimer === null) return;
    this.timers.clearTimeout(table.hostTimer);
    table.hostTimer = null;
  }

  private setHost(table: Table, host: PlayerId | null): void {
    this.cancelGrace(table);
    if (host === table.host) return;
    table.host = host;
    const message: ServerMessage = { type: "table-host", roomId: table.id, host };
    for (const to of this.everyone(table)) this.send(to, message);
  }
}

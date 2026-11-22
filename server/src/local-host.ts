/**
 * Rooms for one player in their own browser: a solo game (a blitz, a lesson)
 * played in a Web Worker instead of on the server (`docs/plans/local-rooms.md`).
 * The same `RoomService` over the same `RoomManager` the server runs, with one
 * connection — the page — and nothing Node-side: no capture, no admission
 * caps (one player, their own machine), no reaper, no deck import (that stays a
 * request to the server, `POST /import-deck`). The worker hands over its card
 * registry (`provideCardRegistry`) before constructing this.
 *
 * And this device's copies of **tables** (`docs/plans/replicated-rooms.md`,
 * step 4): a multiplayer game played on its players' own devices. A copy
 * (`TableCopy`) is a `Room` like any here, so the page talks to it through
 * the same service, by the table's code; what the copy makes goes to the
 * server (`toServer`), and the server's order comes in through `tableMessage`.
 *
 * Part of the room code, so it imports nothing a browser can't run
 * (`test/room-core-imports.test.ts`).
 */

import { Game } from "engine/local";
import type { GameState, PlayerId } from "engine/local";
import type { BotSpeed, ClientMessage, ServerMessage } from "protocol";
import { cardRegistry } from "./card-registry.js";
import { Room } from "./room.js";
import type { GameRecipe } from "./room.js";
import { RoomManager } from "./room-manager.js";
import type { ConnId } from "./room-host.js";
import { RoomService } from "./room-service.js";
import { TableCopy } from "./table-copy.js";
import type { TableCopyOptions, TableStart } from "./table-copy.js";

/**
 * A local game as it stood, kept by the browser (the client's room worker
 * writes it to IndexedDB) so a reload can pick it up again — the game itself
 * (`Game.snapshot()`), and how the room around it was seated and set.
 * Plain data, for structured cloning. The bots' own memory isn't in it, which
 * costs a bot nothing worse than a fresh look at the board.
 */
export interface SavedLocalRoom {
  readonly id: string;
  readonly gameNumber: number;
  readonly frameSeq: number;
  readonly state: GameState;
  readonly recipe: GameRecipe | null;
  readonly botSpeed: BotSpeed;
  readonly firstPlayerChosen: boolean;
  readonly bots: readonly { readonly player: PlayerId; readonly displayName: string | null }[];
  readonly humans: readonly { readonly player: PlayerId; readonly clientToken: string; readonly displayName: string | null }[];
}

/** The page: the one connection a local host has. */
const PAGE: ConnId = 1;

/** How a table's copy is seated for the page (`LocalRoomHost.table`). */
export interface TableSeating {
  /** The token the page holds its seat by, if it has one: the page claims
   * the copy's seat with it, as it would a room's. */
  readonly token: string | null;
  /** The page's own `join-room`, when that is how it came to the table (a
   * reload, a link): answered once the copy is dealt, and the page takes its
   * seat or watches from there. Without it the page is already in the room
   * (the waiting room that just started) and is seated here. */
  readonly join: ClientMessage | null;
}

/** How many times a copy that fell out of step is dealt again from the
 * table's log before the player is told instead. */
const MAX_REDEALS = 3;

export class LocalRoomHost {
  readonly service: RoomService;
  private readonly send: (message: ServerMessage) => void;
  private readonly pacing: "realtime" | "immediate" | undefined;
  /** This device's copies of tables, by the table's code. */
  private readonly copies = new Map<string, TableCopy>();
  /** How many times each table's copy has asked to be dealt again. */
  private readonly redeals = new Map<string, number>();
  /** The token each copy's seat is held by (`TableSeating.token`), for
   * asking for its table again when the connection is back. */
  private readonly tokens = new Map<string, string | null>();
  /** The tables asked for from the place their copy holds (`serverUp`): the
   * next `table-start` for one is the answer, the log's tail for that copy. */
  private readonly resuming = new Set<string>();
  private readonly toServer: (message: ClientMessage) => void;
  private readonly tableRoom: TableCopyOptions["room"];

  /**
   * `send` delivers each message to the page, in order. `toServer` sends one
   * to the room server on the page's connection: what a table's copy makes.
   * A host given none holds no tables. `tableRoom` is for tests: options for
   * the rooms of the copies dealt here (their bots).
   */
  constructor(
    send: (message: ServerMessage) => void,
    options: {
      readonly pacing?: "realtime" | "immediate";
      readonly toServer?: (message: ClientMessage) => void;
      readonly tableRoom?: TableCopyOptions["room"];
    } = {},
  ) {
    const manager = new RoomManager(options.pacing !== undefined ? { pacing: options.pacing } : {});
    this.send = send;
    this.pacing = options.pacing;
    this.toServer = options.toServer ?? (() => {});
    this.tableRoom = options.tableRoom;
    this.service = new RoomService(manager, { send: (_conn, message) => send(message) });
  }

  /**
   * The server's word that a table's game starts, or where it stands
   * (`table-start`): the lobby started as a table, a rematch was dealt, or
   * this device came (back) to one. Deals this device's copy from the recipe
   * and the log, in place of any copy it held under that code, and seats the
   * page at it. Frames keep counting on from the copy before, as a rematch's
   * do in a room.
   */
  table(start: TableStart, seating: TableSeating): void {
    const manager = this.service.manager;
    const { roomId } = start;
    const before = this.copies.get(roomId);
    if (before === undefined && manager.get(roomId) !== undefined) {
      // A solo game here happens to have the table's code.
      this.send({ type: "error", message: `room ${roomId} can't be played here: a game in this tab already has that code` });
      return;
    }
    const asked = this.resuming.delete(roomId);
    if (before !== undefined && start.state === undefined && (asked || start.from > 0)) {
      // The answer to `serverUp`: what the table did while this device's
      // connection was down. The copy takes it in and carries on, with the
      // moves its person made meanwhile.
      if (before.resume(start)) return;
      // The same asked twice (a connection that came and went and came):
      // the copy has taken this in already.
      if (start.from > 0 && start.recipe.gameNumber === before.game && start.from < before.placed) return;
      // Not a game this copy can carry on from (a rematch was dealt, say):
      // the table is asked for afresh, and the copy dealt again below.
      if (start.from !== 0) {
        const token = this.tokens.get(roomId) ?? null;
        this.toServer({ type: "table-join", roomId, ...(token !== null ? { clientToken: token } : {}) });
        return;
      }
    }
    this.tokens.set(roomId, seating.token);
    const startSeq = before?.room.frameSeq ?? 0;
    let copy: TableCopy;
    try {
      copy = new TableCopy(start, {
        send: this.toServer,
        room: { ...this.tableRoom, startSeq, ...(this.pacing !== undefined ? { pacing: this.pacing } : {}) },
        notice: (message) => this.send({ type: "notice", roomId, message }),
        onOutOfStep: (why) => this.outOfStep(roomId, seating.token, why),
      });
    } catch (error) {
      if (start.state === undefined) throw error;
      // The game as another device holds it couldn't be read here: this
      // page's build knows another shape of state than the one the table is
      // being played on (a deploy since). Whatever copy it had stays.
      console.error(`table ${roomId}: couldn't start from another device's state`, error);
      this.send({
        type: "error",
        message:
          "This game is being played on another version of the site, and couldn't be picked up here. Reloading the page may help.",
      });
      return;
    }
    if (before !== undefined) {
      before.dispose();
      manager.remove(roomId);
    }
    this.copies.set(roomId, copy);
    const { seat } = start;
    const token = seating.token ?? "this device";
    if (seat !== null) {
      copy.room.reserveSeat(seat, token, start.recipe.seats.find((s) => s.player === seat)?.name ?? null);
    }
    manager.adopt(copy.room);
    if (seating.join !== null) this.message(seating.join);
    else if (seat !== null) this.message({ type: "claim-seat", roomId, seat, clientToken: token });
    else this.message({ type: "spectate-room", roomId });
    // Dealt again because this copy's game wasn't the host's (`table-digest`):
    // the board may have changed under the player with nothing done to it.
    if (start.resync === true) {
      this.send({
        type: "notice",
        roomId,
        message: "This device's game had drifted from the table's, and was put back in step with it.",
      });
    }
  }

  /**
   * A test's hook: makes this device's copy of the table under `roomId` hold
   * a game the table doesn't (each player a life more), as a browser that
   * computed something differently would, for checking that the copies
   * notice and this one is put right. Returns whether there was a copy.
   */
  corruptTable(roomId: string): boolean {
    const copy = this.copies.get(roomId);
    if (copy === undefined) return false;
    const state = copy.room.game.snapshot();
    for (const player of Object.values(state.players)) player.life += 1;
    copy.room.replaceGame(state);
    return true;
  }

  /** A message from the server about a table this device holds a copy of
   * (`table-input`, `table-refused`, `table-host`, `table-seats`). */
  tableMessage(message: ServerMessage): void {
    const roomId = "roomId" in message ? message.roomId : undefined;
    if (roomId !== undefined) this.copies.get(roomId)?.handle(message);
  }

  /**
   * The connection to the room server went down. Every copy stays, and its
   * person plays on (`TableCopy.linkDown`).
   */
  serverDown(): void {
    for (const copy of this.copies.values()) copy.linkDown();
  }

  /**
   * The connection is back: each table is asked for from the place this
   * device's copy holds, with its seat's token, and the answer is taken in
   * by the copy (`table`, `TableCopy.resume`). A copy that had already lost
   * its place is asked for whole.
   */
  serverUp(): void {
    for (const [roomId, copy] of this.copies) {
      const token = this.tokens.get(roomId) ?? null;
      const whole = copy.outOfStep !== null;
      if (!whole) this.resuming.add(roomId);
      this.toServer({
        type: "table-join",
        roomId,
        ...(token !== null ? { clientToken: token } : {}),
        ...(whole ? {} : { from: copy.placed }),
      });
    }
  }

  /** Whether this device holds a copy of the table under `roomId`. */
  hasTable(roomId: string): boolean {
    return this.copies.has(roomId);
  }

  /** The page left the table: its copy goes. */
  leaveTable(roomId: string): void {
    const copy = this.copies.get(roomId);
    if (copy === undefined) return;
    copy.dispose();
    this.copies.delete(roomId);
    this.redeals.delete(roomId);
    this.tokens.delete(roomId);
    this.resuming.delete(roomId);
    this.service.manager.remove(roomId);
  }

  /**
   * A copy holds a game the table doesn't and couldn't put itself right
   * (`TableCopy.outOfStep`). The table's log is the game: the copy is dealt
   * again from it, by asking the server for the table afresh, a few times
   * at most. After that the player is told, and a reload is theirs to try.
   */
  private outOfStep(roomId: string, token: string | null, why: string): void {
    const redeals = this.redeals.get(roomId) ?? 0;
    console.error(`table ${roomId}: this device's copy fell out of step: ${why}`);
    if (redeals >= MAX_REDEALS) {
      this.send({
        type: "error",
        message: "This device lost its place in the game and couldn't find it again. Reload the page to pick the game up.",
      });
      return;
    }
    this.redeals.set(roomId, redeals + 1);
    this.toServer({ type: "table-join", roomId, ...(token !== null ? { clientToken: token } : {}) });
  }

  /** One message from the page. A create needs no code from here: the
   * manager allocates one, there being no other host to route by it. */
  message(message: ClientMessage): void {
    this.service.handle(PAGE, message);
  }

  /** The page went away (or reconnected): what a closed socket does. */
  close(): void {
    this.service.close(PAGE);
  }

  /** Stops the service's timers. */
  stop(): void {
    this.service.stop();
  }

  /**
   * Every game worth picking up after a reload: a running game (a blitz, or a
   * table the player seated with bots) that isn't over. Not a waiting room,
   * nor a lesson — a lesson is short, and starts again.
   */
  save(): SavedLocalRoom[] {
    const manager = this.service.manager;
    const out: SavedLocalRoom[] = [];
    for (const room of manager.all()) {
      if (!(room instanceof Room)) continue;
      // A table's copy is dealt again from the table's log, not from here.
      if (room.isCopy) continue;
      const kind = manager.kindOf(room.id);
      if (kind !== "lobby" && kind !== "adopted") continue;
      if (room.game.state.result.over) continue;
      out.push({
        id: room.id,
        gameNumber: room.gameNumber,
        frameSeq: room.frameSeq,
        state: room.game.snapshot(),
        recipe: room.recipe,
        botSpeed: room.botSpeed,
        firstPlayerChosen: room.firstPlayerChosen,
        bots: room.botSeats(),
        humans: room.humanClaims().map(({ player, clientToken, displayName }) => ({ player, clientToken, displayName })),
      });
    }
    return out;
  }

  /**
   * Seats the saved games again, each under its own code, before the page's
   * first message: the page then rejoins and reclaims its seat by its token,
   * as after any reconnect. A save that won't load is skipped, not fatal.
   */
  restore(saved: readonly SavedLocalRoom[]): string[] {
    const manager = this.service.manager;
    const restored: string[] = [];
    for (const s of saved) {
      if (manager.get(s.id) !== undefined) continue;
      try {
        const game = Game.fromSnapshot(s.state, { registry: cardRegistry() });
        const room = new Room(s.id, game, {
          gameNumber: s.gameNumber,
          startSeq: s.frameSeq,
          botSpeed: s.botSpeed,
          firstPlayerChosen: s.firstPlayerChosen,
          ...(s.recipe !== null ? { recipe: s.recipe } : {}),
        });
        for (const human of s.humans) room.reserveSeat(human.player, human.clientToken, human.displayName);
        manager.adopt(room);
        // As a rematch seats them: bots last, once every human is bound.
        for (const { player, displayName } of s.bots) room.addBot(player, undefined, displayName ?? undefined);
        room.start();
        restored.push(s.id);
      } catch (error) {
        console.error(`local rooms: couldn't restore ${s.id}`, error);
      }
    }
    return restored;
  }
}

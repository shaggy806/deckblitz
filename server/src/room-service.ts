/**
 * The rooms' side of the wire: takes each connection's `ClientMessage`s,
 * dispatches them to the matching `Room`/`PendingRoom`/`RoomManager` call, and
 * pushes `ServerMessage`s back through an outbox. Knows nothing of sockets — a
 * connection is a `ConnId` — so the same service runs on the main thread
 * (`InProcessRoomHost`) or, per the shard design (`docs/plans/room-shards.md`),
 * inside a worker that owns a share of the rooms.
 *
 * Everything it keeps per connection — the room it's bound to, what it
 * spectates, what of each room's event log and art it has been sent — is an
 * instance field, so two services never share any of it.
 */

import { COMMANDER_RULES, SPECTATOR } from "engine";
import type { ArtManifestEntry, PlayerId, PlayerView } from "engine";
import type { ClientMessage, SeatStatus, ServerMessage } from "protocol";
import type { RoomManager } from "./room-manager.js";
import type { Room, Connection } from "./room.js";
import type { CaptureLog } from "./capture.js";
import { PendingRoom } from "./pending-room.js";
import type { BuilderSession } from "./builder.js";
import type { TutorialSession } from "./tutorial-session.js";
import type { ConnId } from "./room-host.js";

/** Where a service's messages go. */
export interface ServiceOutbox {
  /** One message for one connection. */
  send(conn: ConnId, message: ServerMessage): void;
}

/** What a server offers beyond the public game. */
export interface RoomServerOptions {
  /** The scenario builder's messages (`builder.ts`): a developer's server
   * only, since it lets a client put any card anywhere. */
  readonly builder?: boolean;
}

/** Throws unless `connection` holds `room`'s host role — see `HostRole`. */
function requireHost(room: Room | PendingRoom, connection: Connection, what: string): void {
  if (!room.isHost(connection)) throw new Error(`only the host can ${what}`);
}

/** A `room-joined` for one connection — `isHost` differs per recipient. */
function roomJoined(room: Room | PendingRoom, connection: Connection): Extract<ServerMessage, { type: "room-joined" }> {
  return {
    type: "room-joined",
    roomId: room.id,
    seats: room.seatStatuses(),
    isHost: room.isHost(connection),
    botSpeed: room.botSpeed,
    ...(room instanceof PendingRoom ? { settings: room.settings } : {}),
    seat: room.seatOf(connection),
    pending: room instanceof PendingRoom,
  };
}

export class RoomService {
  readonly manager: RoomManager;
  private readonly outbox: ServiceOutbox;
  private readonly builderEnabled: boolean;

  /** One stable `Connection` per `ConnId`: rooms tell connections apart by
   * identity. */
  private readonly connections = new Map<ConnId, Connection>();

  /** The room each connection last joined, claimed a seat in or started —
   * what its closing disconnects from. */
  private readonly boundRoom = new Map<ConnId, Room | PendingRoom>();

  /**
   * The connections that said they keep the event log themselves
   * (`event-deltas`), so a frame can carry only the events they haven't had.
   * Any other connection — a client from before the message existed, a script
   * — gets the whole log in every frame, as it always did.
   */
  private readonly eventDeltas = new WeakSet<Connection>();

  /**
   * How much of each room's event log each connection has been sent, by room
   * code: the `Room` it was sent from and the log's length then. A rematch, a
   * builder's rebuild and a tutorial's retry or next board all put a new `Room`
   * under the same code, whose log has nothing to do with the old one's, so a
   * record from another `Room` counts for nothing. A new connection (a reload,
   * a reconnect) has no record at all.
   */
  private readonly sentEvents = new WeakMap<Connection, Map<string, { readonly room: Room; readonly count: number }>>();

  /**
   * The connections watching each room without a seat (`spectate-room`), by
   * room code: a waiting room's promotion and a rematch both put a new room
   * under the same code, so spectators carry across them. They get every
   * frame, never ack (so never hold up a bot), and go when they leave or drop.
   */
  private readonly spectators = new Map<string, Set<Connection>>();

  /** The connections that have had this game's art manifest — each gets it
   * with its first frame, a reconnecting one (a new connection) again. Not
   * again for a rematch: it deals the same decks, so the art is already in. */
  private readonly sentArtManifest = new WeakSet<Connection>();
  private readonly artManifests = new WeakMap<Room, readonly ArtManifestEntry[]>();

  constructor(manager: RoomManager, outbox: ServiceOutbox, options: RoomServerOptions = {}) {
    this.manager = manager;
    this.outbox = outbox;
    this.builderEnabled = options.builder === true;
    // Every frame a promoted room publishes — whether it came from a message
    // just handled or from a bot the room released on its own clock — goes out
    // through here.
    manager.onRoomUpdate = this.broadcast;
  }

  /** The `Connection` standing for `conn` in every room it's in. */
  connection(conn: ConnId): Connection {
    let connection = this.connections.get(conn);
    if (connection === undefined) {
      connection = { send: (message) => this.outbox.send(conn, message) };
      this.connections.set(conn, connection);
    }
    return connection;
  }

  /** One message from `conn`. Whatever it throws goes back to `conn` as an
   * `error`. */
  handle(conn: ConnId, message: ClientMessage): void {
    const connection = this.connection(conn);
    try {
      this.dispatch(conn, connection, message);
    } catch (err) {
      connection.send({ type: "error", message: err instanceof Error ? err.message : String(err) });
    }
  }

  /** `conn` closed: it stops watching, and leaves the room it's bound to. */
  close(conn: ConnId): void {
    const connection = this.connections.get(conn);
    if (connection === undefined) return;
    this.connections.delete(conn);
    this.stopSpectating(connection);
    const bound = this.boundRoom.get(conn);
    this.boundRoom.delete(conn);
    if (bound === undefined) return;
    // A scenario builder has replaced the room this connection first bound
    // to with each rebuild: the one under the code now is the one it's in.
    const room = this.manager.get(bound.id) ?? bound;
    room.disconnect(connection);
    // The host leaving hands the role to someone still here. A finished
    // game publishes no more frames of its own, so it says so with one:
    // otherwise whoever holds the role now would never be offered the
    // rematch.
    if (room instanceof PendingRoom) this.broadcastPending(room);
    else if (room.game.state.result.over) room.publish();
  }

  /**
   * Turns one published frame into one `state` message per connected seat.
   * Never called directly by a message handler: a room publishes its own
   * frames (it paces bot moves against the clients' animations, so pushes
   * don't line up one-to-one with incoming messages any more), and this is
   * wired up as `RoomManager.onRoomUpdate`. Anything that wants a push asks
   * the room for one via `room.publish()`.
   */
  private readonly broadcast = (room: Room): void => {
    const seats = room.seatStatuses();
    for (const { seat, connection } of room.connectedSeats()) connection.send(this.seatFrame(room, seat, connection, seats));
    for (const connection of this.spectatorsOf(room.id)) connection.send(this.spectatorFrame(room, connection));
  };

  /** One frame of `room`'s game for the connection seated at `seat`. */
  private seatFrame(
    room: Room,
    seat: PlayerId,
    connection: Connection,
    seats: readonly SeatStatus[] = room.seatStatuses(),
  ): ServerMessage {
    const firstFrame = !this.sentArtManifest.has(connection);
    if (firstFrame) this.sentArtManifest.add(connection);
    return {
      type: "state",
      roomId: room.id,
      seq: room.frameSeq,
      game: room.gameNumber,
      seat,
      ...this.newEvents(room, room.game.viewFor(seat), connection),
      actions: room.frozen ? [] : room.game.legalActions(seat),
      seats,
      autoPassing: room.isAutoPassing(seat),
      autoPassPaused: room.isAutoPassPaused(seat),
      isHost: room.isHost(connection),
      botSpeed: room.botSpeed,
      botsPaused: room.botsPaused,
      ...(room.firstPlayerChosen ? { firstPlayerChosen: true as const } : {}),
      ...(room.recipe !== null ? { canRematch: true as const } : {}),
      ...(room.stopped !== null ? { stopped: room.stopped } : {}),
      ...(room.captures !== null ? { capture: true as const } : {}),
      ...(room.builder !== null ? { builder: room.builder } : {}),
      ...(room.tutorial !== null ? { tutorial: room.tutorial } : {}),
      ...(firstFrame ? { artManifest: this.artManifestFor(room) } : {}),
    };
  }

  /** Forgets what `connection` was sent of `roomId`'s log, so its next frame
   * carries the whole of it — on joining, claiming a seat, spectating, or its
   * own `resync`. */
  private forgetSentEvents(connection: Connection, roomId: string): void {
    this.sentEvents.get(connection)?.delete(roomId);
  }

  /**
   * `view` as `connection` should get it: with only the events after the ones
   * it was last sent of this room's log, and `eventsFrom` saying where in the
   * log they start — or the whole log (`eventsFrom: 0`) on its first frame of
   * this `Room`, to a connection that doesn't keep the log, or if the log is
   * somehow shorter than what was sent. The engine's log only ever grows within
   * one `Game`, and every seat's view carries the same one (`viewFor`), so the
   * events a connection has had are the log's first `count`, whichever seat or
   * spectator it was watching from. Never touches `view` itself.
   */
  private newEvents(room: Room, view: PlayerView, connection: Connection): { view: PlayerView; eventsFrom: number } {
    const total = view.events.length;
    let sent = this.sentEvents.get(connection);
    if (sent === undefined) this.sentEvents.set(connection, (sent = new Map()));
    const last = sent.get(room.id);
    const from =
      this.eventDeltas.has(connection) && last !== undefined && last.room === room && last.count <= total ? last.count : 0;
    sent.set(room.id, { room, count: total });
    return from === 0 ? { view, eventsFrom: 0 } : { view: { ...view, events: view.events.slice(from) }, eventsFrom: from };
  }

  private spectatorsOf(roomId: string): readonly Connection[] {
    return [...(this.spectators.get(roomId) ?? [])];
  }

  /** Stops `connection` watching anything — it left, or dropped. Returns
   * whether it was watching `roomId`. */
  private stopSpectating(connection: Connection, roomId?: string): boolean {
    let was = false;
    for (const [id, set] of this.spectators) {
      if (!set.delete(connection)) continue;
      if (id === roomId) was = true;
      if (set.size === 0) this.spectators.delete(id);
    }
    return was;
  }

  /** One frame of `room`'s game for a spectator: every hand hidden
   * (`SPECTATOR`'s view), no actions, the first seat nearest. */
  private spectatorFrame(room: Room, connection: Connection): ServerMessage {
    const firstFrame = !this.sentArtManifest.has(connection);
    if (firstFrame) this.sentArtManifest.add(connection);
    return {
      type: "state",
      roomId: room.id,
      seq: room.frameSeq,
      game: room.gameNumber,
      seat: room.game.state.turnOrder[0],
      ...this.newEvents(room, room.game.viewFor(SPECTATOR), connection),
      actions: [],
      seats: room.seatStatuses(),
      autoPassing: false,
      autoPassPaused: false,
      isHost: false,
      botSpeed: room.botSpeed,
      botsPaused: room.botsPaused,
      ...(room.firstPlayerChosen ? { firstPlayerChosen: true as const } : {}),
      ...(room.stopped !== null ? { stopped: room.stopped } : {}),
      spectating: true,
      ...(firstFrame ? { artManifest: this.artManifestFor(room) } : {}),
    };
  }

  /** Every card in the room's decks, worked out once: the cards are all there
   * from the start, and none join a deck later. */
  private artManifestFor(room: Room): readonly ArtManifestEntry[] {
    let manifest = this.artManifests.get(room);
    if (manifest === undefined) {
      manifest = room.game.artManifest();
      this.artManifests.set(room, manifest);
    }
    return manifest;
  }

  /** The capture log of a room that keeps one, for its host — see
   * `capture.ts`. */
  private requireCaptures(roomId: string, connection: Connection): CaptureLog {
    const room = this.requireActiveRoom(roomId);
    requireHost(room, connection, "capture positions");
    if (room.captures === null) throw new Error("this server isn't capturing (start it with --capture)");
    return room.captures;
  }

  /** Every currently-connected seat of a still-waiting room gets a refreshed
   * seat list (no `state` — there's no `Game` yet), same as `broadcast` does
   * for a real `Room`. */
  private broadcastPending(room: PendingRoom, except?: Connection): void {
    const connections = room.connectedSeats().map((s) => s.connection);
    // A host who hasn't picked a seat yet is running the table from the seat
    // picker, and needs to see it change as much as anyone seated.
    const host = room.unseatedHost();
    if (host !== null) connections.push(host);
    for (const connection of connections) {
      if (connection !== except) connection.send(roomJoined(room, connection));
    }
    for (const connection of this.spectatorsOf(room.id)) {
      if (connection !== except) connection.send({ ...roomJoined(room, connection), spectating: true });
    }
  }

  private requireRoom(roomId: string): Room | PendingRoom {
    const room = this.manager.get(roomId);
    if (room === undefined) throw new Error(`no such room: ${roomId}`);
    // Bind this service to the room's frames if nobody has. Rooms this
    // manager promoted are wired at construction; one built by hand and served
    // through a bare manager (the repo-root `scratch.mjs` pattern) is wired
    // here instead. Idempotent, so it doesn't matter which came first.
    if (!(room instanceof PendingRoom)) room.onUpdate = this.broadcast;
    return room;
  }

  /** Like `requireRoom`, but for messages (`dispatch`/`pass-turn`/etc.) that
   * only make sense once the room's `Game` actually exists — a client
   * shouldn't be able to send these before its first `state` message arrives,
   * but this guards it with a clear error instead of a confusing crash if it
   * somehow does. */
  private requireActiveRoom(roomId: string): Room {
    const room = this.requireRoom(roomId);
    if (room instanceof PendingRoom) {
      throw new Error(`room ${roomId} hasn't started yet — still waiting on seats`);
    }
    return room;
  }

  /** The inverse of `requireActiveRoom` — for messages (`set-ready`/
   * `start-game`) that only make sense before the room's `Game` exists. */
  private requirePendingRoom(roomId: string): PendingRoom {
    const room = this.requireRoom(roomId);
    if (!(room instanceof PendingRoom)) {
      throw new Error(`room ${roomId} has already started`);
    }
    return room;
  }

  /** Promotes a ready `PendingRoom` and broadcasts the result, or reports why
   * not without taking the whole room down — a bad deck only surfaces here,
   * at promotion time (see `manager.promote`). Returns the new `Room` on
   * success so the caller can update its own bound room, or `null` if
   * promotion failed (the room is left pending). */
  private tryPromote(connection: Connection, room: PendingRoom): Room | null {
    try {
      // `promote` settles the new room and publishes its opening frame itself,
      // so there's nothing to broadcast here on the way out.
      return this.manager.promote(room.id);
    } catch (err) {
      connection.send({
        type: "error",
        message: `could not start the game: ${err instanceof Error ? err.message : String(err)}`,
      });
      this.broadcastPending(room);
      return null;
    }
  }

  /** The scenario builder serving `roomId`, or why there isn't one. */
  private requireBuilder(roomId: string): BuilderSession {
    if (!this.builderEnabled) throw new Error("this server wasn't started with --builder");
    const session = this.manager.builder(roomId);
    if (session === undefined) throw new Error(`room ${roomId} isn't a scenario builder`);
    // As `requireRoom` does: bind this service to the room's frames.
    session.room.onUpdate = this.broadcast;
    return session;
  }

  /** The tutorial serving `roomId`, or why there isn't one. Any server: a
   * tutorial room is part of the public site. */
  private requireTutorial(roomId: string): TutorialSession {
    const session = this.manager.tutorial(roomId);
    if (session === undefined) throw new Error(`room ${roomId} isn't a tutorial`);
    // As `requireRoom` does: bind this service to the room's frames.
    session.room.onUpdate = this.broadcast;
    return session;
  }

  private dispatch(conn: ConnId, connection: Connection, message: ClientMessage): void {
    const manager = this.manager;
    switch (message.type) {
      case "create-room": {
        const numPlayers = Math.min(4, Math.max(2, message.players ?? 2));
        // A real room should shuffle freshly every time — only fall back
        // to Game.create's fixed internal default (meant for scripts/tests
        // that omit a seed on purpose) when nobody asked for a specific
        // one. Without this, every "Create Room" click reused that same
        // constant and every game opened with an identical shuffle.
        const seed = message.seed ?? Math.floor(Math.random() * 0x100000000);
        const room = manager.createPending(
          numPlayers,
          {
            seed,
            mulligans: true,
            rules: COMMANDER_RULES,
          },
          message.hostToken,
        );
        connection.send({ type: "room-created", roomId: room.id });
        return;
      }
      case "join-room": {
        const room = this.requireRoom(message.roomId);
        this.boundRoom.set(conn, room);
        this.forgetSentEvents(connection, room.id);
        room.bindHost(connection, message.hostToken);
        connection.send(roomJoined(room, connection));
        // The host coming back takes the role back from whoever was
        // standing in, which everyone else's seat board shows.
        if (room instanceof PendingRoom) this.broadcastPending(room, connection);
        return;
      }
      case "claim-seat": {
        const room = this.requireRoom(message.roomId);
        try {
          room.claimSeat(
            message.seat,
            message.clientToken,
            connection,
            message.displayName,
            message.deck,
            message.ready,
          );
        } catch (err) {
          // Rejected claim (seat taken by someone else, etc.) — tell the
          // client why *and* re-send the current seat list so its picker
          // isn't stuck on a stale view.
          connection.send({
            type: "error",
            message: err instanceof Error ? err.message : String(err),
          });
          connection.send(roomJoined(room, connection));
          return;
        }
        this.boundRoom.set(conn, room);
        this.forgetSentEvents(connection, room.id);
        if (room instanceof PendingRoom) this.broadcastPending(room);
        else room.publish();
        return;
      }
      case "take-seat": {
        const room = this.requirePendingRoom(message.roomId);
        try {
          room.takeSeat(message.clientToken, connection, message.displayName, message.deck);
        } catch (err) {
          connection.send({
            type: "error",
            message: err instanceof Error ? err.message : String(err),
          });
          connection.send(roomJoined(room, connection));
          return;
        }
        this.boundRoom.set(conn, room);
        this.broadcastPending(room);
        return;
      }
      case "add-bot": {
        const room = this.requireRoom(message.roomId);
        try {
          requireHost(room, connection, "add bots");
          room.addBot(message.seat, message.deck);
        } catch (err) {
          connection.send({
            type: "error",
            message: err instanceof Error ? err.message : String(err),
          });
          return;
        }
        // An active room already published a frame from inside `addBot`
        // (it settles), so only a pending one needs a push here.
        if (room instanceof PendingRoom) this.broadcastPending(room);
        // A caller who hasn't claimed a seat yet (still on the seat
        // picker) isn't in `connectedSeats()`, so the broadcast above
        // never reaches them — refresh their picker directly, same as a
        // rejected `claim-seat` does.
        if (room.seatOf(connection) === null && !(room instanceof PendingRoom && room.unseatedHost() === connection)) {
          connection.send(roomJoined(room, connection));
        }
        return;
      }
      case "set-bot-deck": {
        const room = this.requireRoom(message.roomId);
        try {
          requireHost(room, connection, "choose a bot's deck");
          room.setBotDeck(message.seat, message.deck);
        } catch (err) {
          connection.send({
            type: "error",
            message: err instanceof Error ? err.message : String(err),
          });
          return;
        }
        // `setBotDeck` throws outright on an active room, so this is only
        // ever the pending case.
        if (room instanceof PendingRoom) this.broadcastPending(room);
        // Same as `add-bot` above — a caller still on the seat picker
        // isn't in `connectedSeats()`, so refresh them directly.
        if (room.seatOf(connection) === null && !(room instanceof PendingRoom && room.unseatedHost() === connection)) {
          connection.send(roomJoined(room, connection));
        }
        return;
      }
      case "add-seat":
      case "remove-seat": {
        // Sizing the table is a waiting-room decision by construction —
        // once there's a `Game`, its turn order is dealt and fixed.
        const room = this.requirePendingRoom(message.roomId);
        try {
          requireHost(room, connection, "change the table size");
          if (message.type === "add-seat") room.addSeat();
          else room.removeSeat(message.seat);
        } catch (err) {
          connection.send({
            type: "error",
            message: err instanceof Error ? err.message : String(err),
          });
          return;
        }
        this.broadcastPending(room);
        // Same as `add-bot` above: whoever resized the table may not hold a
        // seat here yet, so they aren't in `connectedSeats()` and the
        // broadcast above never reaches them.
        if (room.seatOf(connection) === null && room.unseatedHost() !== connection) {
          connection.send(roomJoined(room, connection));
        }
        return;
      }
      case "set-ready": {
        const room = this.requirePendingRoom(message.roomId);
        try {
          room.setReady(connection, message.ready);
        } catch (err) {
          connection.send({
            type: "error",
            message: err instanceof Error ? err.message : String(err),
          });
          return;
        }
        this.broadcastPending(room);
        return;
      }
      case "spectate-room": {
        const room = this.requireRoom(message.roomId);
        if (room.seatOf(connection) !== null) throw new Error("you have a seat in this room — play it");
        this.stopSpectating(connection);
        let set = this.spectators.get(room.id);
        if (set === undefined) this.spectators.set(room.id, (set = new Set()));
        set.add(connection);
        this.forgetSentEvents(connection, room.id);
        if (room instanceof PendingRoom) connection.send({ ...roomJoined(room, connection), spectating: true });
        else connection.send(this.spectatorFrame(room, connection));
        return;
      }
      case "leave-room": {
        // A spectator walking away from a game just stops watching.
        if (this.stopSpectating(connection, message.roomId) && !(manager.get(message.roomId) instanceof PendingRoom)) {
          return;
        }
        const room = this.requirePendingRoom(message.roomId);
        room.leave(connection);
        this.boundRoom.delete(conn);
        this.broadcastPending(room);
        return;
      }
      case "start-game": {
        const room = this.requirePendingRoom(message.roomId);
        requireHost(room, connection, "start the game");
        if (!room.allReady()) {
          connection.send({ type: "error", message: "not everyone is ready yet" });
          return;
        }
        const activeRoom = this.tryPromote(connection, room);
        if (activeRoom !== null) this.boundRoom.set(conn, activeRoom);
        return;
      }
      case "rematch": {
        const room = this.requireActiveRoom(message.roomId);
        requireHost(room, connection, message.restart === true ? "restart the game" : "start a rematch");
        // Deals the new game and publishes its opening frame to every seat.
        this.boundRoom.set(conn, manager.rematch(room.id, { restart: message.restart === true }));
        return;
      }
      case "set-bot-speed": {
        const room = this.requireRoom(message.roomId);
        requireHost(room, connection, "set the bot speed");
        if (!["fast", "normal", "slow"].includes(message.speed)) {
          throw new Error(`unknown bot speed: ${String(message.speed)}`);
        }
        room.setBotSpeed(message.speed);
        if (room instanceof PendingRoom) this.broadcastPending(room);
        else room.publish();
        return;
      }
      case "set-room-settings": {
        const room = this.requirePendingRoom(message.roomId);
        requireHost(room, connection, "change the room settings");
        room.setSettings(message.settings ?? {});
        this.broadcastPending(room);
        return;
      }
      case "set-bots-paused": {
        const room = this.requireActiveRoom(message.roomId);
        requireHost(room, connection, "pause the bots");
        room.setBotsPaused(message.paused === true);
        room.publish();
        return;
      }
      case "step-bots": {
        const room = this.requireActiveRoom(message.roomId);
        requireHost(room, connection, "step the bots");
        room.stepBots();
        return;
      }
      // Each of these settles the room, and settling publishes its own
      // frame (one per bot action, in `"realtime"` pacing) — so none of
      // them broadcasts on the way out.
      case "dispatch": {
        this.requireActiveRoom(message.roomId).dispatch(connection, message.action);
        return;
      }
      case "set-pass-settings": {
        this.requireActiveRoom(message.roomId).setPassSettings(connection, message.settings);
        return;
      }
      case "concede": {
        this.requireActiveRoom(message.roomId).concede(connection);
        return;
      }
      case "bot-takeover": {
        this.requireActiveRoom(message.roomId).setBotTakeover(connection, message.on);
        return;
      }
      case "pass-turn": {
        this.requireActiveRoom(message.roomId).requestPassTurn(connection);
        return;
      }
      case "auto-pass": {
        this.requireActiveRoom(message.roomId).requestAutoPass(connection);
        return;
      }
      case "resolve-all": {
        this.requireActiveRoom(message.roomId).requestResolveAll(connection);
        return;
      }
      case "capture-list": {
        const log = this.requireCaptures(message.roomId, connection);
        connection.send({ type: "capture-list", entries: log.list() });
        return;
      }
      case "capture-options": {
        const log = this.requireCaptures(message.roomId, connection);
        connection.send({ type: "capture-options", id: message.id, ...log.options(message.id) });
        return;
      }
      case "capture-save": {
        const log = this.requireCaptures(message.roomId, connection);
        const file = log.save(message.id, message.expect, message.note ?? "", message.name);
        connection.send({ type: "capture-saved", file });
        return;
      }
      case "capture-report": {
        const log = this.requireCaptures(message.roomId, connection);
        const room = this.requireActiveRoom(message.roomId);
        const file = log.report(
          room.game.state,
          room.seatOf(connection),
          message.title ?? "",
          message.description ?? "",
          message.image,
        );
        connection.send({ type: "capture-saved", file });
        return;
      }
      case "builder-create": {
        if (!this.builderEnabled) throw new Error("this server wasn't started with --builder");
        const session = manager.createBuilder(message.hostToken);
        connection.send({ type: "room-created", roomId: session.id });
        return;
      }
      case "builder-update": {
        const session = this.requireBuilder(message.roomId);
        requireHost(session.room, connection, "change the board");
        session.update(message.spec);
        return;
      }
      case "builder-start": {
        const session = this.requireBuilder(message.roomId);
        requireHost(session.room, connection, "start play");
        session.start();
        return;
      }
      case "builder-stop": {
        const session = this.requireBuilder(message.roomId);
        requireHost(session.room, connection, "stop play");
        session.stop();
        return;
      }
      case "builder-snapshot": {
        const session = this.requireBuilder(message.roomId);
        requireHost(session.room, connection, "stop play");
        session.snapshot();
        return;
      }
      case "builder-seat": {
        this.requireBuilder(message.roomId).switchSeat(connection, message.seat);
        return;
      }
      case "tutorial-create": {
        // Only a lesson's id comes off the wire; an unknown one throws.
        const session = manager.createTutorial(
          message.lesson,
          typeof message.hostToken === "string" ? message.hostToken : undefined,
        );
        connection.send({ type: "room-created", roomId: session.id, seat: session.seat });
        return;
      }
      case "tutorial-next": {
        const session = this.requireTutorial(message.roomId);
        requireHost(session.room, connection, "move the lesson on");
        session.next(String(message.step));
        return;
      }
      case "tutorial-retry": {
        const session = this.requireTutorial(message.roomId);
        requireHost(session.room, connection, "rewind the lesson");
        session.retry();
        return;
      }
      case "ack": {
        // Purely a pacing signal, and one the client sends on its own
        // schedule — a stale room id here means the game is over or the
        // server restarted, which is nothing to report back about.
        const room = manager.get(message.roomId);
        if (room instanceof PendingRoom || room === undefined) return;
        room.ack(connection, message.seq);
        return;
      }
      case "event-deltas": {
        this.eventDeltas.add(connection);
        return;
      }
      case "resync": {
        // The client's log doesn't line up with what this connection was
        // sent: the frame that's current again, with the whole log, to it
        // alone — same `seq`, so it acks it as it would have the frame it
        // couldn't use. Nothing to send for a room with no game, or one
        // this connection isn't watching.
        const room = manager.get(message.roomId);
        if (room instanceof PendingRoom || room === undefined) return;
        this.forgetSentEvents(connection, room.id);
        const seat = room.connectedSeats().find((s) => s.connection === connection)?.seat;
        if (seat !== undefined) connection.send(this.seatFrame(room, seat, connection));
        else if (this.spectators.get(room.id)?.has(connection) === true) connection.send(this.spectatorFrame(room, connection));
        return;
      }
    }
  }
}

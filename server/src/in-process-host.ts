/**
 * Rooms on this thread: a `RoomHost` that hands every message straight to a
 * `RoomService` over a `RoomManager` it was given, and sends what the service
 * sends back as JSON text. What the server has always been, and what tests,
 * scripts and dev-rooms run (`--shards 0` in the shard design,
 * `docs/plans/room-shards.md`).
 */

import type { ClientMessage, ServerMessage } from "protocol";
import type { ClientLink, ConnId, RoomHost } from "./room-host.js";
import type { RoomManager } from "./room-manager.js";
import { RoomService } from "./room-service.js";
import type { RoomServerOptions } from "./room-service.js";

export class InProcessRoomHost implements RoomHost {
  readonly service: RoomService;
  /** The open sockets, by id: a message the service sends to one that has
   * closed since goes nowhere. */
  private readonly links = new Map<ConnId, ClientLink>();

  constructor(manager: RoomManager, options: RoomServerOptions = {}) {
    this.service = new RoomService(
      manager,
      { send: (conn: ConnId, message: ServerMessage) => this.links.get(conn)?.send(JSON.stringify(message)) },
      options,
    );
  }

  open(link: ClientLink): void {
    this.links.set(link.id, link);
  }

  message(link: ClientLink, message: ClientMessage): void {
    this.service.handle(link.id, message);
  }

  close(link: ClientLink): void {
    this.service.close(link.id);
    this.links.delete(link.id);
  }

  async stop(): Promise<void> {
    this.service.stop();
  }
}

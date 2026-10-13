/**
 * Rooms on this thread: a `RoomHost` that hands every message straight to a
 * `RoomService` over a `RoomManager` it was given, and sends what the service
 * sends back as JSON text. What the server has always been, and what tests,
 * scripts and dev-rooms run (`--shards 0` in the shard design,
 * `docs/plans/room-shards.md`).
 */

import { createDefaultRegistry } from "engine";
import type { ClientMessage, ServerMessage } from "protocol";
import type { ClientLink, ConnId, RoomHost } from "./room-host.js";
import type { RoomManager } from "./room-manager.js";
import { BOT_DECISIONS } from "./room.js";
import { RoomService } from "./room-service.js";
import type { RoomServerOptions } from "./room-service.js";
import { statusParts } from "./status.js";
import type { StatusParts } from "./status-server.js";
import { importDeps, runImportJob } from "./import-deck.js";
import type { ImportDeps } from "./import-deck.js";
import type { ImportSink } from "./import-route.js";

export interface InProcessHostOptions extends RoomServerOptions {
  /** What `/import-deck` jobs read; a registry of its own, built on the
   * first import, if absent. */
  readonly importDeps?: ImportDeps;
}

export class InProcessRoomHost implements RoomHost {
  readonly service: RoomService;
  readonly decisions = BOT_DECISIONS;
  /** The open sockets, by id: a message the service sends to one that has
   * closed since goes nowhere. */
  private readonly links = new Map<ConnId, ClientLink>();
  private deps: ImportDeps | null;

  constructor(manager: RoomManager, options: InProcessHostOptions = {}) {
    this.service = new RoomService(
      manager,
      { send: (conn: ConnId, message: ServerMessage) => this.links.get(conn)?.send(JSON.stringify(message)) },
      options,
    );
    this.deps = options.importDeps ?? null;
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

  async status(): Promise<StatusParts> {
    return statusParts(this.service.manager);
  }

  importDeck(text: string, sink: ImportSink): void {
    this.deps ??= importDeps(createDefaultRegistry());
    void runImportJob(text, this.deps, sink);
  }

  async stop(): Promise<void> {
    this.service.stop();
  }
}

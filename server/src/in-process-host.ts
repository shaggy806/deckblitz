/**
 * Rooms on this thread: a `RoomHost` that hands every message straight to a
 * `RoomService` over a `RoomManager` it was given, and sends what the service
 * sends back as JSON text. What the server has always been, and what tests,
 * scripts and dev-rooms run (`--shards 0` in the shard design,
 * `docs/plans/room-shards.md`).
 */

import { createDefaultRegistry } from "engine";
import type { ClientMessage, ServerMessage } from "protocol";
import { CREATES, capKey, initialStage, placeRoom } from "./admission.js";
import type { AdmissionLimits, RoomRecord, ShardCandidate } from "./admission.js";
import type { ClientLink, ConnId, RoomEvent, RoomHost } from "./room-host.js";
import { allocateRoomCode } from "./room-code.js";
import { sendMessage } from "./transport.js";
import type { RoomManager } from "./room-manager.js";
import { BOT_DECISIONS } from "./room.js";
import { RoomService } from "./room-service.js";
import type { RoomServerOptions } from "./room-service.js";
import { statusParts } from "./status.js";
import type { StatusParts } from "./status-server.js";
import { importDeps, runImportJob } from "./import-deck.js";
import type { ImportDeps } from "./import-deck.js";
import type { ImportSink } from "./import-route.js";
import { roomsFor } from "./shard.js";
import type { ShardConfig } from "./shard-protocol.js";

export interface InProcessHostOptions extends RoomServerOptions {
  /** What `/import-deck` jobs read; a registry of its own, built on the
   * first import, if absent. */
  readonly importDeps?: ImportDeps;
  /** The caps on creates (`admission.ts`), this thread counted as one
   * shard; none if absent. */
  readonly admission?: AdmissionLimits;
}

/** The server's rooms on this thread, set up from the same settings a shard
 * gets (`index.ts` with `--shards 0`): one registry, a manager over it, the
 * reaper and the deck importer. */
export function createInProcessHost(
  settings: Omit<ShardConfig, "index" | "importJobs" | "loadReportMs">,
  admission: AdmissionLimits = {},
): InProcessRoomHost {
  const { registry, manager } = roomsFor(settings);
  return new InProcessRoomHost(manager, {
    builder: settings.builder,
    ...(settings.reapIdleMs !== undefined ? { reapIdleMs: settings.reapIdleMs } : {}),
    ...(settings.reapIntervalMs !== undefined ? { reapIntervalMs: settings.reapIntervalMs } : {}),
    importDeps: importDeps(registry),
    admission,
  });
}

/** This thread as the one shard placement sees. */
const ONE_SHARD: readonly ShardCandidate[] = [{ index: 0, up: true, elu: null, delayP99Ms: null }];

export class InProcessRoomHost implements RoomHost {
  readonly service: RoomService;
  readonly decisions = BOT_DECISIONS;
  /** The open sockets, by id: a message the service sends to one that has
   * closed since goes nowhere. */
  private readonly links = new Map<ConnId, ClientLink>();
  private deps: ImportDeps | null;
  private readonly admission: AdmissionLimits;
  /** Every room, kept current by the service's room events, with the
   * address that created it — what admission counts, as a worker host's
   * routes are. */
  private readonly rooms = new Map<string, RoomRecord>();

  constructor(manager: RoomManager, options: InProcessHostOptions = {}) {
    this.service = new RoomService(
      manager,
      {
        send: (conn: ConnId, message: ServerMessage) => this.links.get(conn)?.send(JSON.stringify(message)),
        roomChanged: (event) => this.roomChanged(event),
      },
      options,
    );
    this.deps = options.importDeps ?? null;
    this.admission = options.admission ?? {};
  }

  open(link: ClientLink): void {
    this.links.set(link.id, link);
  }

  message(link: ClientLink, message: ClientMessage): void {
    const kind = CREATES[message.type];
    if (kind === undefined) {
      this.service.handle(link.id, message);
      return;
    }
    // A create: admitted (or refused) and given its code here, exactly as
    // the worker host does, so both modes keep the same caps.
    const ip = capKey(link.ip, link.forwarded === true);
    const placed = placeRoom(ONE_SHARD, this.rooms.values(), this.admission, ip);
    if ("refused" in placed) {
      sendMessage(link, { type: "error", message: placed.refused.message, code: placed.refused.code });
      return;
    }
    const manager = this.service.manager;
    const code = allocateRoomCode((c) => this.rooms.has(c) || manager.get(c) !== undefined);
    this.rooms.set(code, { shard: 0, kind, stage: initialStage(kind), ip });
    this.service.handle(link.id, message, code);
  }

  private roomChanged(event: RoomEvent): void {
    if (event.stage === "gone") {
      this.rooms.delete(event.id);
      return;
    }
    const room = this.rooms.get(event.id);
    this.rooms.set(event.id, { shard: 0, kind: event.kind, stage: event.stage, ip: room?.ip ?? null });
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

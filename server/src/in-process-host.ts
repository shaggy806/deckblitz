/**
 * Rooms on this thread: a `RoomHost` that hands every message straight to a
 * `RoomService` over a `RoomManager` it was given, and sends what the service
 * sends back as JSON text. What the server has always been, and what tests,
 * scripts and dev-rooms run (`--shards 0` in the shard design,
 * `docs/plans/room-shards.md`).
 */

import { cardRegistry } from "./card-registry.js";
import type { ClientMessage, ServerMessage } from "protocol";
import { CREATES, capKey, initialBots, initialStage, placeRoom } from "./admission.js";
import type { AdmissionLimits, RoomRecord, ShardCandidate } from "./admission.js";
import type { ClientLink, ConnId, RoomEvent, RoomHost } from "./room-host.js";
import { allocateRoomCode } from "./room-code.js";
import { sendMessage } from "./transport.js";
import type { RoomManager } from "./room-manager.js";
import { botDecisions, botDecisionTotals } from "./bot-decisions.js";
import { RoomService } from "./room-service.js";
import type { RoomServerOptions } from "./room-service.js";
import { statusParts } from "./status.js";
import type { StatusParts } from "./status-server.js";
import { importDeps, runImportJob } from "./import-deck.js";
import type { ImportDeps } from "./import-deck.js";
import type { ImportSink } from "./import-route.js";
import { roomsFor } from "./shard.js";
import type { ShardConfig } from "./shard-protocol.js";
import { Tables } from "./tables.js";
import type { TableOpening, TableSummary, TablesOptions } from "./tables.js";

export interface InProcessHostOptions extends RoomServerOptions {
  /** What `/import-deck` jobs read; a registry of its own, built on the
   * first import, if absent. */
  readonly importDeps?: ImportDeps;
  /** The caps on creates (`admission.ts`), this thread counted as one
   * shard; none if absent. */
  readonly admission?: AdmissionLimits;
  /** How tables are kept (`tables.ts`): the host's grace, a test's clock. */
  readonly tables?: TablesOptions;
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
  readonly decisions = botDecisions();
  readonly decisionTotals = botDecisionTotals;
  /** The open sockets, by id: a message the service sends to one that has
   * closed since goes nowhere. */
  private readonly links = new Map<ConnId, ClientLink>();
  private deps: ImportDeps | null;
  private readonly admission: AdmissionLimits;
  /** Every room, kept current by the service's room events, with the
   * address that created it — what admission counts, as a worker host's
   * routes are. */
  private readonly rooms = new Map<string, RoomRecord>();
  /** Games played on their players' own devices (`tables.ts`): the order
   * and the log are kept here, the game nowhere on the server. */
  readonly tables: Tables;
  private readonly tableReaper: ReturnType<typeof setInterval> | null;

  constructor(manager: RoomManager, options: InProcessHostOptions = {}) {
    const send = (conn: ConnId, message: ServerMessage): void => this.links.get(conn)?.send(JSON.stringify(message));
    this.tables = new Tables(send, { ...options.tables, onRemoved: (id) => this.rooms.delete(id) });
    this.service = new RoomService(
      manager,
      {
        send,
        roomChanged: (event) => this.roomChanged(event),
        tableStarted: (opening) => this.openTable(opening),
      },
      options,
    );
    this.deps = options.importDeps ?? null;
    this.admission = options.admission ?? {};
    const { reapIdleMs, reapIntervalMs } = options;
    if (reapIdleMs !== undefined && reapIntervalMs !== undefined) {
      this.tableReaper = setInterval(() => this.tables.reapIdle(reapIdleMs), reapIntervalMs);
      this.tableReaper.unref();
    } else {
      this.tableReaper = null;
    }
  }

  /** A waiting room started as a table: its code is the table's from here
   * (still counted against the address that opened it, weighing nothing). */
  private openTable(opening: TableOpening): void {
    const was = this.rooms.get(opening.id);
    this.rooms.set(opening.id, { shard: -1, kind: "table", stage: "playing", bots: 0, ip: was?.ip ?? null });
    this.tables.open(opening);
  }

  /** The tables kept here, for a status page. */
  tableSummaries(): TableSummary[] {
    return this.tables.summaries();
  }

  open(link: ClientLink): void {
    this.links.set(link.id, link);
  }

  message(link: ClientLink, message: ClientMessage): void {
    const kind = CREATES[message.type];
    if (kind === undefined) {
      const roomId = (message as { roomId?: unknown }).roomId;
      if (typeof roomId === "string" && this.tables.has(roomId)) this.tables.message(link.id, message);
      else this.service.handle(link.id, message);
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
    this.rooms.set(code, { shard: 0, kind, stage: initialStage(kind), bots: initialBots(kind), ip });
    this.service.handle(link.id, message, code);
  }

  private roomChanged(event: RoomEvent): void {
    if (event.stage === "gone") {
      // A waiting room that started as a table goes; its code stays, the table's.
      if (!this.tables.has(event.id)) this.rooms.delete(event.id);
      return;
    }
    const room = this.rooms.get(event.id);
    this.rooms.set(event.id, { shard: 0, kind: event.kind, stage: event.stage, bots: event.bots, ip: room?.ip ?? null });
  }

  close(link: ClientLink): void {
    this.service.close(link.id);
    this.tables.close(link.id);
    this.links.delete(link.id);
  }

  async status(): Promise<StatusParts> {
    return { ...statusParts(this.service.manager), tables: this.tables.summaries() };
  }

  importDeck(text: string, sink: ImportSink): void {
    this.deps ??= importDeps(cardRegistry());
    void runImportJob(text, this.deps, sink);
  }

  async stop(): Promise<void> {
    this.service.stop();
    if (this.tableReaper !== null) clearInterval(this.tableReaper);
  }
}

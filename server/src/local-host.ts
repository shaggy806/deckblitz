/**
 * Rooms for one player in their own browser: a solo game (a blitz, a lesson)
 * played in a Web Worker instead of on the server (`docs/plans/local-rooms.md`).
 * The same `RoomService` over the same `RoomManager` the server runs, with one
 * connection — the page — and nothing Node-side: no capture, no admission
 * caps (one player, their own machine), no reaper, no deck import (that stays a
 * request to the server, `POST /import-deck`). The worker hands over its card
 * registry (`provideCardRegistry`) before constructing this.
 *
 * Part of the room code, so it imports nothing a browser can't run
 * (`test/room-core-imports.test.ts`).
 */

import type { ClientMessage, ServerMessage } from "protocol";
import { RoomManager } from "./room-manager.js";
import type { ConnId } from "./room-host.js";
import { RoomService } from "./room-service.js";

/** The page: the one connection a local host has. */
const PAGE: ConnId = 1;

export class LocalRoomHost {
  readonly service: RoomService;

  /** `send` delivers each message to the page, in order. */
  constructor(send: (message: ServerMessage) => void, options: { readonly pacing?: "realtime" | "immediate" } = {}) {
    const manager = new RoomManager(options.pacing !== undefined ? { pacing: options.pacing } : {});
    this.service = new RoomService(manager, { send: (_conn, message) => send(message) });
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
}

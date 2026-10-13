/**
 * Wires a `WebSocketServer` to a `RoomManager` on this thread: the transport
 * (`transport.ts`) in front of an `InProcessRoomHost`, whose `RoomService`
 * (`room-service.ts`) handles every message. Kept as the one call tests,
 * scripts and dev-rooms make, against an in-process server on an ephemeral
 * port if they like.
 */

import type { WebSocketServer } from "ws";
import type { RoomManager } from "./room-manager.js";
import { InProcessRoomHost } from "./in-process-host.js";
import type { RoomServerOptions } from "./room-service.js";
import { attachTransport } from "./transport.js";

export { COMPRESSION } from "./transport.js";
export type { RoomServerOptions } from "./room-service.js";

export function attachRoomServer(
  wss: WebSocketServer,
  manager: RoomManager,
  options: RoomServerOptions = {},
): InProcessRoomHost {
  const host = new InProcessRoomHost(manager, options);
  attachTransport(wss, host);
  wss.once("close", () => void host.stop());
  return host;
}

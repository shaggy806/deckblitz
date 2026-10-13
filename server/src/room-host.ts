/**
 * The seam between the transport (`transport.ts`: sockets, the rate limit)
 * and wherever the rooms live. `InProcessRoomHost` (`in-process-host.ts`)
 * runs them on this thread, as the server always has; the shard design
 * (`docs/plans/room-shards.md`) adds one that runs them on worker threads.
 *
 * Main-side: types only, no engine, so the main thread can hold a host
 * without loading a game.
 */

import type { ClientMessage } from "protocol";

/** A socket's id, given by the transport: incrementing, never reused, so a
 * late message about a closed socket can't reach its successor. */
export type ConnId = number;

/** One client socket as a host sees it. */
export interface ClientLink {
  readonly id: ConnId;
  /** The client's address (`CF-Connecting-IP` behind the tunnel). */
  readonly ip: string;
  /** Sends one message, already serialised: a string as it is, or UTF-8
   * bytes — still a text frame. */
  send(data: string | Uint8Array): void;
  close(code?: number, reason?: string): void;
}

export interface RoomHost {
  /** A socket opened. */
  open(link: ClientLink): void;
  /** One parsed message from `link`, past the rate limit; `raw` is the text
   * it was parsed from, for a host that forwards rather than handles it. */
  message(link: ClientLink, message: ClientMessage, raw: string): void;
  /** The socket closed: whatever it held is let go. */
  close(link: ClientLink): void;
  /** Stops the host's own timers (and whatever else it runs). */
  stop(): Promise<void>;
}

/**
 * The sockets: wires a `WebSocketServer` to a `RoomHost`. Gives each socket a
 * `ConnId`, reads the client's address, parses each message as a
 * `ClientMessage`, applies the per-IP rate limit, and hands the rest to the
 * host — which pushes `ServerMessage`s back through the socket's `ClientLink`.
 *
 * Main-side (`docs/plans/room-shards.md`): no engine, so it can run on a
 * thread that holds no room.
 */

import type { IncomingMessage } from "node:http";
import type { PerMessageDeflateOptions, WebSocket, WebSocketServer } from "ws";
import type { ClientMessage, ServerMessage } from "protocol";
import type { ClientLink, ConnId, RoomHost } from "./room-host.js";

/**
 * permessage-deflate (RFC 7692), for every connection that offers it — every
 * browser does. Pass as `new WebSocketServer({ perMessageDeflate: COMPRESSION })`.
 *
 * A `state` frame is the whole board as JSON, and there's one per bot move:
 * 400-600 KB on a late four-player board, which deflates to about a tenth
 * (~5 ms at the default level). Measured on the live server (2026-10-07), whose
 * Wi-Fi uploads ~25 KB/s, an uncompressed frame took 1-20 s to arrive — and a
 * room's bots wait for each seat's `ack` before moving again, so the delay
 * read as slow bots. No context takeover in either direction: a frame is far
 * bigger than deflate's 32 KB window, so keeping one per connection would buy
 * little and hold zlib memory between messages. Small messages (acks, seat
 * lists) go as they are.
 */
export const COMPRESSION: PerMessageDeflateOptions = {
  serverNoContextTakeover: true,
  clientNoContextTakeover: true,
  threshold: 1024,
};

const RATE_LIMIT_WINDOW_MS = 5_000;
const RATE_LIMIT_MAX_MESSAGES = 40;

export function clientIp(req: IncomingMessage): string {
  const forwarded = req.headers["cf-connecting-ip"];
  if (typeof forwarded === "string") return forwarded;
  return req.socket.remoteAddress ?? "unknown";
}

/** Serialises one message for a link. */
export function sendMessage(link: ClientLink, message: ServerMessage): void {
  link.send(JSON.stringify(message));
}

/** Every socket `wss` accepts from now on goes to `host`. */
export function attachTransport(wss: WebSocketServer, host: RoomHost): void {
  // Keyed by client IP rather than per-connection, since nothing stops one
  // IP from opening many sockets — a fixed window is enough to blunt a bot
  // hammering `join-room`/`claim-seat` to brute-force room codes without
  // getting in the way of normal play (a real game is nowhere near this
  // chatty). Swept periodically so the map doesn't grow unbounded across
  // many distinct visitors over the life of the process; the sweep stops
  // once `wss` closes rather than outliving it.
  const rateLimitState = new Map<string, { count: number; resetAt: number }>();
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitState) {
      if (now >= entry.resetAt) rateLimitState.delete(ip);
    }
  }, RATE_LIMIT_WINDOW_MS * 10);
  sweep.unref();
  wss.once("close", () => clearInterval(sweep));

  function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitState.get(ip);
    if (entry === undefined || now >= entry.resetAt) {
      rateLimitState.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      return false;
    }
    entry.count += 1;
    return entry.count > RATE_LIMIT_MAX_MESSAGES;
  }

  let nextId: ConnId = 1;

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const ip = clientIp(req);
    const link: ClientLink = {
      id: nextId++,
      ip,
      forwarded: typeof req.headers["cf-connecting-ip"] === "string",
      // UTF-8 bytes go as a text frame all the same: a shard encodes each
      // frame once, and the transport never decodes it again.
      send: (data) => (typeof data === "string" ? ws.send(data) : ws.send(data, { binary: false })),
      close: (code, reason) => ws.close(code, reason),
    };
    host.open(link);

    ws.on("message", (data) => {
      const raw = data.toString();
      let message: ClientMessage;
      try {
        message = JSON.parse(raw) as ClientMessage;
      } catch {
        if (!isRateLimited(ip)) sendMessage(link, { type: "error", message: "malformed message" });
        return;
      }
      // Valid JSON that isn't an object (`null`, a number) has no `type` to
      // read — and reading one off `null` here, outside any try, would throw
      // out of the socket's listener and take the whole process down.
      if (typeof message !== "object" || message === null) {
        if (!isRateLimited(ip)) sendMessage(link, { type: "error", message: "malformed message" });
        return;
      }
      // `ack` is automatic traffic — one per frame the client finishes
      // showing, with no effect beyond releasing a bot — and a busy table
      // sends plenty of them, so it doesn't spend the budget meant for
      // someone hammering `join-room` to guess room codes.
      if (message.type !== "ack" && isRateLimited(ip)) {
        sendMessage(link, { type: "error", message: "too many requests, slow down" });
        return;
      }
      try {
        host.message(link, message, raw);
      } catch (err) {
        sendMessage(link, { type: "error", message: err instanceof Error ? err.message : String(err) });
      }
    });

    ws.on("close", () => host.close(link));
  });
}

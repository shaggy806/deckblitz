/**
 * The rooms' side of the operator status page: one summary per room a
 * `RoomManager` holds, worked out wherever the rooms run (this thread, or a
 * shard's worker). `status-server.ts` puts the pieces together and serves
 * them on the loopback-only status port — see the note at its top for why that
 * port is separate.
 */

import { activePlayerOf } from "engine";
import { Room } from "./room.js";
import type { RoomManager } from "./room-manager.js";
import { assembleStatus } from "./status-server.js";
import type { RoomSummary, SeatSummary, StatusParts, StatusSnapshot } from "./status-server.js";

export { renderStatus } from "./status-server.js";
export type { RoomSummary, SeatSummary, StatusSnapshot } from "./status-server.js";

/** One summary per live room, promoted or not. */
export function roomSummaries(manager: RoomManager): RoomSummary[] {
  const rooms: RoomSummary[] = [];

  for (const room of manager.all()) {
    const seats: SeatSummary[] = room.seatStatuses().map((s) => ({
      player: String(s.player),
      claimed: s.claimed,
      online: s.online,
      isBot: s.isBot ?? false,
      displayName: s.displayName,
    }));
    const bots = seats.filter((s) => s.isBot).length;
    const humansOnline = seats.filter((s) => s.online && !s.isBot).length;

    if (room instanceof Room) {
      const over = room.game.isOver;
      rooms.push({
        id: room.id,
        stage: over ? "finished" : "playing",
        seats,
        humansOnline,
        bots,
        turn: room.game.state.turn.number,
        step: room.game.state.turn.step,
        // A finished game has no one to act, and asking costs nothing but
        // means nothing either.
        activePlayer: over ? null : String(activePlayerOf(room.game.state)),
        winner: room.game.winner === null ? null : String(room.game.winner),
        idleMs: room.idleMs(),
      });
      continue;
    }

    rooms.push({
      id: room.id,
      stage: "waiting",
      seats,
      humansOnline,
      bots,
      turn: null,
      step: null,
      activePlayer: null,
      winner: null,
      idleMs: room.idleMs(),
    });
  }
  return rooms;
}

/** A manager's rooms as the status page's parts. */
export function statusParts(manager: RoomManager): StatusParts {
  return { rooms: roomSummaries(manager), roomsCreated: manager.roomsCreated };
}

/** The whole snapshot for one manager on this thread. */
export function statusSnapshot(manager: RoomManager): StatusSnapshot {
  return assembleStatus(statusParts(manager));
}

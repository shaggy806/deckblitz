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

import { Game } from "engine/local";
import type { GameState, PlayerId } from "engine/local";
import type { BotSpeed, ClientMessage, ServerMessage } from "protocol";
import { cardRegistry } from "./card-registry.js";
import { Room } from "./room.js";
import type { GameRecipe } from "./room.js";
import { RoomManager } from "./room-manager.js";
import type { ConnId } from "./room-host.js";
import { RoomService } from "./room-service.js";

/**
 * A local game as it stood, kept by the browser (the client's room worker
 * writes it to IndexedDB) so a reload can pick it up again — the game itself
 * (`Game.snapshot()`), and how the room around it was seated and set.
 * Plain data, for structured cloning. The bots' own memory isn't in it, which
 * costs a bot nothing worse than a fresh look at the board.
 */
export interface SavedLocalRoom {
  readonly id: string;
  readonly gameNumber: number;
  readonly frameSeq: number;
  readonly state: GameState;
  readonly recipe: GameRecipe | null;
  readonly botSpeed: BotSpeed;
  readonly firstPlayerChosen: boolean;
  readonly bots: readonly { readonly player: PlayerId; readonly displayName: string | null }[];
  readonly humans: readonly { readonly player: PlayerId; readonly clientToken: string; readonly displayName: string | null }[];
}

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

  /**
   * Every game worth picking up after a reload: a running game (a blitz, or a
   * table the player seated with bots) that isn't over. Not a waiting room,
   * nor a lesson — a lesson is short, and starts again.
   */
  save(): SavedLocalRoom[] {
    const manager = this.service.manager;
    const out: SavedLocalRoom[] = [];
    for (const room of manager.all()) {
      if (!(room instanceof Room)) continue;
      const kind = manager.kindOf(room.id);
      if (kind !== "lobby" && kind !== "adopted") continue;
      if (room.game.state.result.over) continue;
      out.push({
        id: room.id,
        gameNumber: room.gameNumber,
        frameSeq: room.frameSeq,
        state: room.game.snapshot(),
        recipe: room.recipe,
        botSpeed: room.botSpeed,
        firstPlayerChosen: room.firstPlayerChosen,
        bots: room.botSeats(),
        humans: room.humanClaims().map(({ player, clientToken, displayName }) => ({ player, clientToken, displayName })),
      });
    }
    return out;
  }

  /**
   * Seats the saved games again, each under its own code, before the page's
   * first message: the page then rejoins and reclaims its seat by its token,
   * as after any reconnect. A save that won't load is skipped, not fatal.
   */
  restore(saved: readonly SavedLocalRoom[]): string[] {
    const manager = this.service.manager;
    const restored: string[] = [];
    for (const s of saved) {
      if (manager.get(s.id) !== undefined) continue;
      try {
        const game = Game.fromSnapshot(s.state, { registry: cardRegistry() });
        const room = new Room(s.id, game, {
          gameNumber: s.gameNumber,
          startSeq: s.frameSeq,
          botSpeed: s.botSpeed,
          firstPlayerChosen: s.firstPlayerChosen,
          ...(s.recipe !== null ? { recipe: s.recipe } : {}),
        });
        for (const human of s.humans) room.reserveSeat(human.player, human.clientToken, human.displayName);
        manager.adopt(room);
        // As a rematch seats them: bots last, once every human is bound.
        for (const { player, displayName } of s.bots) room.addBot(player, undefined, displayName ?? undefined);
        room.start();
        restored.push(s.id);
      } catch (error) {
        console.error(`local rooms: couldn't restore ${s.id}`, error);
      }
    }
    return restored;
  }
}

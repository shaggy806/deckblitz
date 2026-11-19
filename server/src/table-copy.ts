/**
 * One device's copy of a table's game (`docs/plans/replicated-rooms.md`,
 * step 3): a `Room` dealt from the table's recipe, playing this device's seat
 * (and the bots' while it is the host), wired to the server's order.
 *
 * What the room does to its game it sends (`table-input`, saying how much of
 * the order it had seen); what the server puts in order comes back to
 * `handle`, the device's own inputs as their confirmation and everyone else's
 * to be applied. Part of the room code: a page's worker will run it (step 4),
 * and the server's tests run it as their scripted clients.
 *
 * **Not here yet.** A device applies its own input the moment it makes it,
 * so one that loses its place — someone else's input was put in order first,
 * or the server refused it — leaves this copy holding a game the table
 * doesn't. Undoing that is step 5; until then the copy stops playing and
 * says so (`outOfStep`). The server's order never produces it while one
 * device acts at a time, which is all the tests ask of it.
 */

import { Game } from "engine/local";
import type { PlayerId } from "engine/local";
import type { ClientMessage, RoomInput, ServerMessage } from "protocol";
import { cardRegistry } from "./card-registry.js";
import { Room } from "./room.js";
import type { RoomOptions } from "./room.js";

/** The server's word that a table's game starts (or where it stands). */
export type TableStart = Extract<ServerMessage, { type: "table-start" }>;

export interface TableCopyOptions {
  /** Sends a message to the server. */
  readonly send: (message: ClientMessage) => void;
  /** The room's own options beyond what the recipe decides: pacing, where
   * frames go, a test's bots. */
  readonly room?: Omit<RoomOptions, "copy" | "recipe" | "gameNumber" | "botSpeed" | "firstPlayerChosen" | "seatNames">;
  /** This copy has stopped playing: it holds a game the table doesn't. */
  readonly onOutOfStep?: (why: string) => void;
}

export class TableCopy {
  readonly roomId: string;
  /** The seat this device plays, or `null`: it watches. */
  readonly seat: PlayerId | null;
  readonly room: Room;
  /** Why this copy stopped playing, once it has. */
  outOfStep: string | null = null;
  private host: PlayerId | null;
  private readonly botSeats: ReadonlySet<PlayerId>;
  /** How many of the table's inputs this copy holds: everyone else's it has
   * applied, and its own that the server has confirmed. */
  private applied = 0;
  /** Its own inputs, applied here and sent, not yet given their place. */
  private readonly pending: RoomInput[] = [];
  /** Still taking in what the table had done before this copy was dealt:
   * nothing of its own to make yet. */
  private catchingUp = true;
  private readonly options: TableCopyOptions;

  constructor(start: TableStart, options: TableCopyOptions) {
    if (start.from !== 0) throw new Error("a copy is dealt from the start of a table's log");
    const { recipe } = start;
    this.options = options;
    this.roomId = start.roomId;
    this.seat = start.seat;
    this.host = start.host;
    this.botSeats = new Set(recipe.seats.filter((s) => s.bot).map((s) => s.player));
    const names: Record<string, string> = {};
    for (const seat of recipe.seats) if (seat.name !== null) names[seat.player] = seat.name;
    this.room = new Room(start.roomId, Game.create({ ...recipe.config, registry: cardRegistry() }), {
      ...options.room,
      copy: {
        answersFor: (player) =>
          !this.catchingUp &&
          this.outOfStep === null &&
          this.seat !== null &&
          (player === this.seat || (this.host === this.seat && this.botSeats.has(player))),
        sent: (input) => this.sent(input),
      },
      botSpeed: recipe.botSpeed,
      firstPlayerChosen: recipe.firstPlayer !== "random",
      recipe: { config: recipe.config, firstPlayer: recipe.firstPlayer },
      gameNumber: recipe.gameNumber,
      seatNames: names,
    });
    for (const seat of recipe.seats) if (seat.bot) this.room.addBot(seat.player, undefined, seat.name ?? undefined);
    this.room.start();
    // Whatever the table has already done, in its order; then this copy's
    // own seats are its to play.
    for (const entry of start.log) {
      if (entry.index !== this.applied) throw new Error(`a table's log skips from ${this.applied} to ${entry.index}`);
      this.applied += 1;
      this.room.receive(entry.input);
    }
    this.catchingUp = false;
    this.room.answersChanged();
  }

  /** How much of the table's order this copy holds, its own unconfirmed
   * inputs counted. */
  get head(): number {
    return this.applied + this.pending.length;
  }

  /** Whether every input this copy made has its place. */
  get settled(): boolean {
    return this.pending.length === 0;
  }

  /** Whether this device runs the table's bots. */
  get isHost(): boolean {
    return this.seat !== null && this.host === this.seat;
  }

  /** A message from the server about this table. Anything else is ignored. */
  handle(message: ServerMessage): void {
    if (!("roomId" in message) || message.roomId !== this.roomId) return;
    switch (message.type) {
      case "table-input":
        this.ordered(message.index, message.from, message.input);
        return;
      case "table-refused":
        this.stop(`the table refused an input made after ${message.after} (its log stood at ${message.head})`);
        return;
      case "table-host":
        this.host = message.host;
        this.room.answersChanged();
        return;
      default:
        return;
    }
  }

  /** The room made an input: it is applied here already; off it goes. */
  private sent(input: RoomInput): void {
    const after = this.applied + this.pending.length;
    this.pending.push(input);
    this.options.send({ type: "table-input", roomId: this.roomId, after, input });
  }

  /** An input took its place in the table's order. */
  private ordered(index: number, from: PlayerId, input: RoomInput): void {
    if (this.outOfStep !== null || index < this.applied) return;
    if (index !== this.applied) {
      this.stop(`the table's order skipped from ${this.applied} to ${index}`);
      return;
    }
    const own = this.pending[0];
    if (own !== undefined && from === this.seat) {
      // This device's own, confirmed where it was made: nothing to apply.
      if (JSON.stringify(own) !== JSON.stringify(input)) {
        this.stop(`the table confirmed input ${index} as something this device didn't send`);
        return;
      }
      this.pending.shift();
      this.applied += 1;
      return;
    }
    if (own !== undefined) {
      // Someone else's input has the place this device made its own for.
      this.stop(`${from}'s input took place ${index} ahead of ${this.pending.length} made here`);
      return;
    }
    // Counted before the room is given it: what the room makes in answer
    // (an auto-pass, a bot's move) follows this input in the order.
    this.applied += 1;
    this.room.receive(input);
  }

  private stop(why: string): void {
    if (this.outOfStep !== null) return;
    this.outOfStep = why;
    this.options.onOutOfStep?.(why);
  }
}

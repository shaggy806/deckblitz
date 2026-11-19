/**
 * One device's copy of a table's game (`docs/plans/replicated-rooms.md`,
 * steps 3 and 5): a `Room` dealt from the table's recipe, playing this
 * device's seat (and the bots' while it is the host), wired to the server's
 * order. Part of the room code: a page's worker will run it (step 4), and the
 * server's tests run it as their scripted clients.
 *
 * **In turn.** An action of the player the game waits on is applied here the
 * moment it is made, so the person sees their move with no trip to the
 * server, and sent with where this copy takes the log to end (`after`,
 * `mine`). Almost always the server puts it exactly there, and its echo is
 * only a confirmation.
 *
 * **The undo.** When it doesn't — someone's input made out of turn (a
 * concession, a setting) landed first — the server refuses this copy's
 * inputs from there on, and the other input arrives where one of them was
 * expected. The copy then goes back to the game as it stood before its
 * unconfirmed inputs (`base`, kept each time it starts making some), puts
 * back the ones the server did confirm since, applies the other input, and
 * lets the room carry on: a bot's move or an auto-pass the room makes again
 * for itself, on the game as it now is. A person's own action is theirs to
 * make again, seeing what changed — except after a setting, which changes
 * nothing they were asked: then the copy makes it again for them. The
 * refusals of what it dropped follow on the socket and are expected.
 *
 * **Out of turn.** A concession, the setting, an opening-hand decision are
 * not applied when made (`RoomCopy.sent`'s `applied: false`): they go out
 * with no place asked for and are applied when they come back, here as on
 * every device. Until its own has landed the copy plays nothing, since what
 * it made next would be made on a game without it.
 */

import { Game } from "engine/local";
import type { GameState, PlayerId } from "engine/local";
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
  /** This copy has stopped playing: it holds a game the table doesn't, and
   * couldn't put itself right. */
  readonly onOutOfStep?: (why: string) => void;
}

/** An input this copy made that the server hasn't given its place yet. */
interface Outstanding {
  readonly input: RoomInput;
  /** Made in turn and applied here already; `false` for one made out of
   * turn, applied when it comes back. */
  readonly applied: boolean;
  readonly by: "person" | "room";
}

export class TableCopy {
  readonly roomId: string;
  /** The seat this device plays, or `null`: it watches. */
  readonly seat: PlayerId | null;
  readonly room: Room;
  /** Why this copy stopped playing, once it has. */
  outOfStep: string | null = null;
  /** How many times it has gone back on inputs that lost their place. */
  undone = 0;
  private host: PlayerId | null;
  private readonly botSeats: ReadonlySet<PlayerId>;
  /** How many of the table's inputs this copy holds: everyone else's it has
   * applied, and its own that the server has confirmed. */
  private count = 0;
  /** Its own inputs, sent, not yet given their place: in the order sent. */
  private readonly pending: Outstanding[] = [];
  /** The game as it stood before the oldest of its applied inputs still
   * outstanding was made: where an undo goes back to. */
  private base: GameState | null = null;
  /** Its own applied inputs the server has confirmed since `base` was kept:
   * an undo puts these back. */
  private since: RoomInput[] = [];
  /** Refusals still to come for inputs an undo already dropped. */
  private refusalsDue = 0;
  /** The table's log is known to be at least this long: until this copy
   * holds that much of it, it plays nothing (`refused`). */
  private behind = 0;
  private readonly gameNumber: number;
  /** Taking in the table's inputs without making any of its own: while it is
   * dealt and catches up, and in the middle of an undo. */
  private catchingUp = true;
  private readonly options: TableCopyOptions;

  constructor(start: TableStart, options: TableCopyOptions) {
    if (start.from !== 0) throw new Error("a copy is dealt from the start of a table's log");
    const { recipe } = start;
    this.options = options;
    this.roomId = start.roomId;
    this.seat = start.seat;
    this.host = start.host;
    this.gameNumber = recipe.gameNumber;
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
          this.count >= this.behind &&
          // Nothing while an input of its own made out of turn is on its way.
          !this.pending.some((p) => !p.applied) &&
          (player === this.seat || (this.host === this.seat && this.botSeats.has(player))),
        sent: (input, how) => this.sent(input, how),
        making: () => this.making(),
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
      if (entry.index !== this.count) throw new Error(`a table's log skips from ${this.count} to ${entry.index}`);
      this.count += 1;
      this.room.receive(entry.input);
    }
    this.catchingUp = false;
    this.room.answersChanged();
  }

  /** How much of the table's order this copy holds, its own unconfirmed
   * inputs counted. */
  get head(): number {
    return this.count + this.pending.length;
  }

  /** Whether every input this copy made has its place, and every refusal it
   * is owed has come. */
  get settled(): boolean {
    return this.pending.length === 0 && this.refusalsDue === 0;
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
        this.refused(message.head);
        return;
      case "table-host":
        this.host = message.host;
        this.room.answersChanged();
        return;
      default:
        return;
    }
  }

  /** The room is about to make an input in turn. If it has none of those
   * outstanding, the game as it stands is where an undo would go back to. */
  private making(): void {
    if (this.pending.some((p) => p.applied)) return;
    this.base = this.room.game.snapshot();
    this.since = [];
  }

  /** The room made an input: off it goes, saying where this copy takes the
   * log to end, or (made out of turn) asking for no place at all. */
  private sent(input: RoomInput, how: { readonly applied: boolean; readonly by: "person" | "room" }): void {
    const mine = this.pending.length;
    this.pending.push({ input, applied: how.applied, by: how.by });
    const { roomId, gameNumber: game } = this;
    this.options.send(
      how.applied
        ? { type: "table-input", roomId, game, after: this.count + mine, mine, input }
        : { type: "table-input", roomId, game, after: null, input },
    );
  }

  /** An input took its place in the table's order. */
  private ordered(index: number, from: PlayerId, input: RoomInput): void {
    if (this.outOfStep !== null || index < this.count) return;
    if (index !== this.count) {
      this.stop(`the table's order skipped from ${this.count} to ${index}`);
      return;
    }
    const own = this.pending[0];
    if (own !== undefined && from === this.seat && JSON.stringify(own.input) === JSON.stringify(input)) {
      this.pending.shift();
      this.count += 1;
      if (own.applied) {
        // Made here, confirmed where it was made: nothing to apply.
        this.since.push(input);
      } else {
        // Made out of turn: it happens now, here as on every device. With
        // it landed, the room may play again, and looks as it takes this in.
        this.room.receive(input);
      }
      return;
    }
    // Someone else's. If this copy has inputs of its own applied and not
    // confirmed, this one has the place the first of them was made for.
    const lost = this.pending.some((p) => p.applied) ? this.goBack() : null;
    if (this.outOfStep !== null) return;
    if (lost === null) {
      // Counted before the room is given it: what the room makes in answer
      // (an auto-pass, a bot's move) follows this input in the order.
      this.count += 1;
      this.room.receive(input);
      return;
    }
    // Mid-undo: the other input goes in with nothing of this copy's made in
    // answer yet, and only then is the room free to carry on. What a person
    // answered is no longer what they'd be asked once someone has conceded;
    // a setting changes nothing but how its own player's triggers are put in
    // order later, so after one their action stands if the game takes it.
    this.count += 1;
    this.room.receive(input);
    this.carryOn(input.kind === "orders-own-triggers" ? lost : []);
  }

  /** The server didn't take an input of this copy's: the log ends at `head`. */
  private refused(head: number): void {
    if (this.outOfStep !== null) return;
    if (this.refusalsDue > 0) {
      // One the undo already dropped: the input that took its place came
      // down this socket first.
      this.refusalsDue -= 1;
      return;
    }
    if (!this.pending.some((p) => p.applied)) return;
    // Refused with nothing seen in its place. It shouldn't happen: whatever
    // moved the log on is sent to this device before its refusal. If the log
    // is longer than this copy knows, what it made goes, and it waits to be
    // sent the rest before it plays again; if it isn't, there is no telling
    // what the server holds.
    if (head <= this.count) {
      this.stop(`the table refused an input made where its log stands (${head})`);
      return;
    }
    const lost = this.goBack();
    if (lost === null) return;
    // This refusal was the first of theirs.
    this.refusalsDue -= 1;
    this.behind = head;
    this.carryOn([]);
  }

  /**
   * Goes back on every input this copy applied that the server hasn't
   * confirmed: the game as it stood before them, with the ones the server
   * did confirm since put back. Returns what was dropped, in the order made;
   * the room stays quiet (`catchingUp`) until `carryOn`.
   */
  private goBack(): Outstanding[] | null {
    const base = this.base;
    if (base === null) {
      this.stop("an input lost its place and there is no game to go back to");
      return null;
    }
    const lost = this.pending.filter((p) => p.applied);
    const kept = this.pending.filter((p) => !p.applied);
    this.pending.length = 0;
    this.pending.push(...kept);
    // The server refuses each of them, one message apiece.
    this.refusalsDue += lost.length;
    this.undone += 1;
    this.catchingUp = true;
    this.room.replaceGame(base);
    for (const input of this.since) this.room.receive(input);
    this.base = null;
    this.since = [];
    return lost;
  }

  /** After an undo: the person's own action again if it is to stand (`again`
   * holds what was dropped), it was the first thing dropped and the game
   * still takes it; then the room's own seats are its to play again (a bot's
   * move, an auto-pass, it makes afresh). */
  private carryOn(again: readonly Outstanding[]): void {
    this.catchingUp = false;
    const first = again[0];
    if (first !== undefined && first.by === "person" && first.input.kind === "action") {
      this.room.remake(first.input.action);
    }
    this.room.answersChanged();
  }

  private stop(why: string): void {
    if (this.outOfStep !== null) return;
    this.outOfStep = why;
    this.options.onOutOfStep?.(why);
  }
}

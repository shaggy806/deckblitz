/**
 * One device's copy of a table's game (`docs/plans/replicated-rooms.md`,
 * steps 3 and 5): a `Room` dealt from the table's recipe, playing this
 * device's seat (and the bots' while it is the host), wired to the server's
 * order. Part of the room code: a page's worker runs it (step 4,
 * `local-host.ts`), and the server's tests run it as their scripted clients.
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
 * it made next would be made on a game without it; a move the person makes
 * meanwhile is kept and made when it has (`RoomCopy.hold`).
 *
 * **Who is gone.** The host's device runs the bots, and it also answers for
 * a person whose device isn't connected (`away`): not their choices, which
 * nobody here can make, but what a room does for any seat by itself, above
 * all passing a priority window with nothing in it. A room on the server
 * does that for a player who dropped, and without it a table stopped at the
 * first empty window of whoever closed their tab. When they are back, their
 * own device answers again; a pass both made for the same place is settled
 * by the order like any two inputs.
 *
 * **The copies check each other** (step 7). Every `DIGEST_EVERY` inputs each
 * copy sends a fingerprint of the game as it stood with exactly that many
 * in (`table-digest`): taken as an input from elsewhere lands, or as one of
 * its own is made, and sent once the server has confirmed that one's place.
 * The server compares it with the host's, and a copy that differs is dealt
 * again from the host's state. A copy is asked for its state the same way
 * (`table-state-wanted`): it answers with the game as of the last input the
 * server has placed, never with moves of its own still on their way.
 *
 * **Dealt from a state.** `table-start` may carry the game as another device
 * holds it (`state`, with the first `from` inputs in): the copy starts from
 * that and applies the log's tail, in place of dealing from the recipe and
 * replaying everything. It is how a device joins late, comes back, or is put
 * right, and it costs a few milliseconds however long the game has run.
 *
 * **What the page sees.** An undo is one frame, where it ends (`quiet`), and
 * when it took back a move the person made and didn't make it again, they
 * are told why (`notice`). The copy also answers, for its room, whether
 * this device is the host and which other people are connected.
 */

import { Game, stateDigest, stateFromJson, stateToJson } from "engine/local";
import type { GameState, PlayerId } from "engine/local";
import type { ClientMessage, RoomInput, ServerMessage } from "protocol";
import { cardRegistry } from "./card-registry.js";
import { Room } from "./room.js";
import type { RoomOptions } from "./room.js";

/** The server's word that a table's game starts (or where it stands). */
export type TableStart = Extract<ServerMessage, { type: "table-start" }>;

/** A fingerprint of the game is taken, and sent, every this many inputs: at
 * the same places on every copy. Two to three milliseconds each. */
export const DIGEST_EVERY = 32;

/**
 * What the copies in this process have spent on being copies, beyond playing
 * the game: for measuring a slow machine (`docs/plans/replicated-rooms.md`,
 * step 8; the page's `deckblitzLocal.stats()`). Counts, and milliseconds in
 * total (and at worst, where one long one is what a player would feel).
 */
export interface TableCosts {
  /** Copies dealt, from a recipe and its log or from a state. */
  readonly deals: number;
  readonly dealMs: number;
  readonly dealMaxMs: number;
  /** The game kept before a run of the copy's own moves (`making`). */
  readonly snapshots: number;
  readonly snapshotMs: number;
  readonly snapshotMaxMs: number;
  /** Fingerprints taken. */
  readonly digests: number;
  readonly digestMs: number;
  readonly digestMaxMs: number;
  /** The game written out for another device. */
  readonly states: number;
  readonly stateMs: number;
  readonly stateMaxMs: number;
  /** Moves gone back on, each with the game put back and inputs applied again. */
  readonly undos: number;
  readonly undoMs: number;
  readonly undoMaxMs: number;
}

/** The number each copy dealt in this process names itself by
 * (`table-input`'s `copy`). */
let copies = 0;

type Cost = "deal" | "snapshot" | "digest" | "state" | "undo";
const spent: Record<Cost, { n: number; ms: number; max: number }> = {
  deal: { n: 0, ms: 0, max: 0 },
  snapshot: { n: 0, ms: 0, max: 0 },
  digest: { n: 0, ms: 0, max: 0 },
  state: { n: 0, ms: 0, max: 0 },
  undo: { n: 0, ms: 0, max: 0 },
};

/** Runs `work`, adding what it took to `what`'s account. */
function costed<T>(what: Cost, work: () => T): T {
  const from = performance.now();
  try {
    return work();
  } finally {
    const ms = performance.now() - from;
    const account = spent[what];
    account.n += 1;
    account.ms += ms;
    if (ms > account.max) account.max = ms;
  }
}

/** The accounts so far. */
export function tableCosts(): TableCosts {
  const round = (ms: number): number => Math.round(ms * 10) / 10;
  return {
    deals: spent.deal.n,
    dealMs: round(spent.deal.ms),
    dealMaxMs: round(spent.deal.max),
    snapshots: spent.snapshot.n,
    snapshotMs: round(spent.snapshot.ms),
    snapshotMaxMs: round(spent.snapshot.max),
    digests: spent.digest.n,
    digestMs: round(spent.digest.ms),
    digestMaxMs: round(spent.digest.max),
    states: spent.state.n,
    stateMs: round(spent.state.ms),
    stateMaxMs: round(spent.state.max),
    undos: spent.undo.n,
    undoMs: round(spent.undo.ms),
    undoMaxMs: round(spent.undo.max),
  };
}

export interface TableCopyOptions {
  /** Sends a message to the server. */
  readonly send: (message: ClientMessage) => void;
  /** The room's own options beyond what the recipe decides: pacing, where
   * frames go, a test's bots. */
  readonly room?: Omit<RoomOptions, "copy" | "recipe" | "gameNumber" | "botSpeed" | "firstPlayerChosen" | "seatNames">;
  /** This copy has stopped playing: it holds a game the table doesn't, and
   * couldn't put itself right. */
  readonly onOutOfStep?: (why: string) => void;
  /** Something to tell the person at this device: a move of theirs was
   * taken back. Seats are named by their ids, as a room's errors name them. */
  readonly notice?: (message: string) => void;
}

/** An input this copy made that the server hasn't given its place yet. */
interface Outstanding {
  readonly input: RoomInput;
  /** Made in turn and applied here already; `false` for one made out of
   * turn, applied when it comes back. */
  readonly applied: boolean;
  readonly by: "person" | "room";
  /** The game's fingerprint as this input left it, where its place is one
   * the copies compare at: sent once the server confirms the place. */
  readonly digest?: string;
}

export class TableCopy {
  readonly roomId: string;
  /** The seat this device plays, or `null`: it watches. */
  readonly seat: PlayerId | null;
  readonly room: Room;
  /** What this copy names itself by on the inputs it sends, so the server's
   * refusal of one comes back to the copy that made it: a device dealt again
   * on the same connection (put right after drifting) is still sent the
   * refusals of what its last copy had on the way. */
  private readonly id = (copies += 1);
  /** Why this copy stopped playing, once it has. */
  outOfStep: string | null = null;
  /** How many times it has gone back on inputs that lost their place. */
  undone = 0;
  private host: PlayerId | null;
  /** The people whose devices are connected to the table, as the server
   * last said; `null` from a server that doesn't say: everyone. */
  private online: ReadonlySet<PlayerId> | null;
  /** The person's actions that arrived while an input of this copy's made
   * out of turn was on its way: made, in order, once it has landed. */
  private readonly held: (() => void)[] = [];
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
  /** While it is dealt: where the log it was sent ends. Of the places it
   * passes on the way only the last is worth a fingerprint. `null` after. */
  private dealtTo: number | null;
  /** Putting back its own confirmed inputs in an undo: no place is passed
   * that it didn't pass before. */
  private replaying = false;
  private readonly options: TableCopyOptions;

  constructor(start: TableStart, options: TableCopyOptions) {
    if (start.from !== 0 && start.state === undefined) {
      throw new Error("a copy is dealt from the start of a table's log, or from a state");
    }
    const dealing = performance.now();
    const { recipe } = start;
    this.count = start.from;
    this.dealtTo = start.from + start.log.length;
    this.options = options;
    this.roomId = start.roomId;
    this.seat = start.seat;
    this.host = start.host;
    this.online = start.online === undefined ? null : new Set(start.online);
    this.gameNumber = recipe.gameNumber;
    this.botSeats = new Set(recipe.seats.filter((s) => s.bot).map((s) => s.player));
    const names: Record<string, string> = {};
    for (const seat of recipe.seats) if (seat.name !== null) names[seat.player] = seat.name;
    // From the game as another device holds it, where the server sent one:
    // the same game the recipe would deal and the log replay, with no replay.
    const game =
      start.state === undefined
        ? Game.create({ ...recipe.config, registry: cardRegistry() })
        : Game.fromSnapshot(stateFromJson(start.state), { registry: cardRegistry() });
    this.room = new Room(start.roomId, game, {
      ...options.room,
      copy: {
        answersFor: (player) =>
          !this.catchingUp &&
          this.outOfStep === null &&
          this.seat !== null &&
          this.count >= this.behind &&
          // Nothing while an input of its own made out of turn is on its way.
          !this.pending.some((p) => !p.applied) &&
          (player === this.seat || (this.host === this.seat && (this.botSeats.has(player) || this.away(player)))),
        sent: (input, how) => this.sent(input, how),
        making: () => this.making(),
        landed: () => this.landed(),
        hold: (again) => {
          if (!this.pending.some((p) => !p.applied)) return false;
          this.held.push(again);
          return true;
        },
        // One frame for an undo, where it ends: not the game put back and
        // then each input again.
        quiet: () => this.catchingUp,
        isHost: () => this.isHost,
        online: (player) => this.online === null || this.online.has(player),
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
    this.dealtTo = null;
    // Dealt: what the recipe (or the state) and the log took, before any
    // move of this copy's own.
    const took = performance.now() - dealing;
    spent.deal.n += 1;
    spent.deal.ms += took;
    if (took > spent.deal.max) spent.deal.max = took;
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
        this.ordered(message.index, message.from, message.input, message.copy);
        return;
      case "table-refused":
        // Of an input another copy on this device made, before this one was
        // dealt: nothing of this copy's.
        if (message.copy !== undefined && message.copy !== this.id) return;
        this.refused(message.head);
        return;
      case "table-host":
        if (this.host === message.host) return;
        this.host = message.host;
        this.room.answersChanged();
        // Whether or not a move was waiting on it: the page's host controls.
        this.room.publish();
        return;
      case "table-state-wanted":
        this.giveState(message.request);
        return;
      case "table-seats":
        this.online = new Set(message.online);
        // Someone gone is the host's to pass for; someone back is their own.
        this.room.answersChanged();
        this.room.publish();
        return;
      default:
        return;
    }
  }

  /** Whether `player` is a person whose device isn't connected to the table,
   * as the server last said. Never this device's own seat, nor a bot's. */
  private away(player: PlayerId): boolean {
    return this.online !== null && player !== this.seat && !this.botSeats.has(player) && !this.online.has(player);
  }

  /** The room is about to make an input in turn. If it has none of those
   * outstanding, the game as it stands is where an undo would go back to. */
  private making(): void {
    if (this.pending.some((p) => p.applied)) return;
    this.base = costed("snapshot", () => this.room.game.snapshot());
    this.since = [];
  }

  /** The room made an input: off it goes, saying where this copy takes the
   * log to end, or (made out of turn) asking for no place at all. */
  private sent(input: RoomInput, how: { readonly applied: boolean; readonly by: "person" | "room" }): void {
    const mine = this.pending.length;
    // Applied here already: the game stands as this input leaves it, at the
    // place it is asking for. If that is one the copies compare at, this is
    // the moment to take the fingerprint; it is sent if the place is given.
    const at = this.count + mine + 1;
    const digest =
      how.applied && at % DIGEST_EVERY === 0 ? costed("digest", () => stateDigest(this.room.game.state)) : undefined;
    this.pending.push({ input, applied: how.applied, by: how.by, ...(digest !== undefined ? { digest } : {}) });
    const { roomId, gameNumber: game, id: copy } = this;
    this.options.send(
      how.applied
        ? { type: "table-input", roomId, game, copy, after: this.count + mine, mine, input }
        : { type: "table-input", roomId, game, copy, after: null, input },
    );
  }

  /** An input took its place in the table's order. */
  private ordered(index: number, from: PlayerId, input: RoomInput, copy?: number): void {
    if (this.outOfStep !== null || index < this.count) return;
    if (index !== this.count) {
      this.stop(`the table's order skipped from ${this.count} to ${index}`);
      return;
    }
    const own = this.pending[0];
    // This copy's own input, back with its place: from this seat, the same
    // input, and made by this copy. The last is what tells it from one the
    // copy this device held before had on its way when this one was dealt:
    // that one is often the very move this copy made next (the same pass,
    // for the same place), and taking it for a confirmation left this
    // copy's own to be refused with nothing here expecting it.
    const mine =
      own !== undefined &&
      from === this.seat &&
      (copy === undefined || copy === this.id) &&
      JSON.stringify(own.input) === JSON.stringify(input);
    if (own !== undefined && mine) {
      this.pending.shift();
      this.count += 1;
      if (own.applied) {
        // Made here, confirmed where it was made: nothing to apply.
        this.since.push(input);
        if (own.digest !== undefined) this.report(this.count, own.digest);
      } else {
        // Made out of turn: it happens now, here as on every device. With
        // it landed, the room may play again, and looks as it takes this in.
        this.room.receive(input);
        this.release();
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
    this.carryOn(lost, input);
  }

  /** Makes the person's actions that were waiting for an input of this
   * copy's to land (`RoomCopy.hold`), unless another is on its way now. */
  private release(): void {
    while (this.held.length > 0 && !this.pending.some((p) => !p.applied)) {
      const again = this.held.shift();
      again?.();
    }
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
    this.carryOn(lost, null);
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
    costed("undo", () => {
      this.room.replaceGame(base);
      this.replaying = true;
      try {
        for (const input of this.since) this.room.receive(input);
      } finally {
        this.replaying = false;
      }
    });
    this.base = null;
    this.since = [];
    return lost;
  }

  /**
   * After an undo that dropped `lost` because `first` got in ahead of it
   * (`null`: the server refused them with nothing seen in their place). The
   * person's own action is made again if it is to stand: after a setting,
   * which changes nothing they were asked, where it was the first thing
   * dropped and the game still takes it. Otherwise they are told it was
   * taken back. Then the room's own seats are its to play again (a bot's
   * move, an auto-pass, it makes afresh).
   */
  private carryOn(lost: readonly Outstanding[], first: RoomInput | null): void {
    const mine = lost.find((p) => p.by === "person" && p.input.kind === "action");
    let remade = false;
    this.catchingUp = false;
    if (first !== null && first.kind === "orders-own-triggers" && mine !== undefined && mine === lost[0]) {
      if (mine.input.kind === "action") remade = this.room.remake(mine.input.action);
    }
    this.room.answersChanged();
    if (mine !== undefined && !remade) {
      this.options.notice?.(
        first !== null && first.kind === "concede"
          ? `${first.player} conceded just as you moved, so your move was taken back. The game is as it now stands.`
          : first !== null && first.kind === "take-back"
            ? "The game was taken back to the start of a turn just as you moved."
          : "The game changed just as you moved, so your move was taken back. The game is as it now stands.",
      );
    }
  }

  /** An input from elsewhere has just been applied (`RoomCopy.landed`): the
   * game stands with exactly `count` inputs in. */
  private landed(): void {
    if (this.replaying || this.count % DIGEST_EVERY !== 0) return;
    // Being dealt: only the last such place in what it was sent, which says
    // whether the copy it built is the table's.
    if (this.dealtTo !== null && this.count + DIGEST_EVERY <= this.dealtTo) return;
    this.report(this.count, costed("digest", () => stateDigest(this.room.game.state)));
  }

  private report(at: number, digest: string): void {
    this.options.send({ type: "table-digest", roomId: this.roomId, game: this.gameNumber, at, digest });
  }

  /**
   * Another device needs the game (`table-state-wanted`): this copy's, as of
   * the last input the server has placed. With moves of its own made and not
   * yet confirmed, that is the game as it stood before the oldest of them
   * (`base`), which is `since.length` confirmed inputs back from `count`.
   * A copy that isn't sure of its own game doesn't answer, and the server
   * asks the next.
   */
  private giveState(request: number): void {
    if (this.outOfStep !== null || this.catchingUp || this.room.stopped !== null) return;
    const ahead = this.pending.some((p) => p.applied);
    const text = costed("state", () => {
      const state = ahead ? this.base : this.room.game.snapshot();
      return state === null ? null : stateToJson(state);
    });
    if (text === null) return;
    this.options.send({
      type: "table-state",
      roomId: this.roomId,
      request,
      game: this.gameNumber,
      at: ahead ? this.count - this.since.length : this.count,
      state: text,
    });
  }

  /** Lets go of the room: its timers, and the bots' with them. */
  dispose(): void {
    this.held.length = 0;
    this.room.dispose();
  }

  private stop(why: string): void {
    if (this.outOfStep !== null) return;
    this.outOfStep = why;
    this.options.onOutOfStep?.(why);
  }
}

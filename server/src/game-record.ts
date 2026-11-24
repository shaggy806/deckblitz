/**
 * A game kept so it can be looked at afterwards: how it was dealt and every
 * input made to it, in order. A text log could be saved only by the player,
 * while the game was on screen, and hid what their seat never saw (a friend's
 * report of a bot's play, 2026-11-21, came with no log at all). From a record
 * the whole game is played again, to any point, every hand and library in it.
 *
 * **What is kept is what was done, not who decided it.** Playing a record
 * again feeds its inputs to a new game and asks no bot and no person
 * anything, so it comes out the same whoever held each seat, when a person
 * took a seat over from a bot or handed it back, and however the bots have
 * changed since. Each input does say who made it (`by`), and a bot's says how
 * it decided (`via`, `expired`: `DecisionAudit`), since the live bots play on
 * a clock and asking today's bot again won't always give the play it made.
 *
 * **A record plays again exactly only on the build it was played on**: a card
 * or a rule that has changed since can refuse an input or lead somewhere
 * else. So a record says its build (`build`, a commit), and how the game
 * stood when it ended (`end`: its turn, its events, its state's digest), which
 * a replay checks itself against.
 *
 * A room records itself (`Room`, where a sink is set: `recordGamesTo`), which
 * covers a game a browser plays alone and one the server runs. Nothing here
 * is Node-only: it runs in the browser's room worker too.
 */

import { Game, HeuristicBotController, isSettled, stateDigest, takeBackState } from "engine/local";
import type { CardRegistry, DecisionAudit, GameConfig, PlayerId } from "engine/local";
import type { RoomInput } from "protocol";

/** The record's shape. A reader refuses one it doesn't know. */
export const GAME_RECORD_VERSION = 1;

/** A game's config as plain data: everything `Game.create` took but the card
 * registry, which a replay supplies. */
export type DealtConfig = Omit<GameConfig, "registry">;

/** One input, with who made it: a person, a seat's bot, or the room itself
 * (a pass it makes for a seat, a forced choice). */
export interface RecordedInput {
  readonly input: RoomInput;
  readonly by: "person" | "bot" | "room";
  /** A bot's: which path answered (`DecisionAudit.via`). */
  readonly via?: string;
  /** A bot's: its clock ran out before the search finished. */
  readonly expired?: true;
}

/** A seat as the game ended. Who played it move by move is each input's `by`. */
export interface RecordedSeat {
  readonly player: PlayerId;
  readonly name: string | null;
  readonly bot: boolean;
}

/** What a room keeps as it plays, and what a saved game carries across a
 * reload (`SavedLocalRoom.record`). */
export interface RecordSoFar {
  readonly config: DealtConfig;
  readonly startedAt: number;
  readonly inputs: readonly RecordedInput[];
  /** How many of `inputs` whoever keeps records is known to hold already
   * (`GameRecorder.acked`), so a game seated again after a reload sends only
   * the rest. Absent: none. */
  readonly handed?: number;
}

export interface GameRecord extends Omit<RecordSoFar, "handed"> {
  readonly version: typeof GAME_RECORD_VERSION;
  /** The commit this was played on, where the build knows it. */
  readonly build: string | null;
  /** Where the game ran: a player's browser alone, a room on the server, or
   * a table (every player's device, the server keeping only the order:
   * `tables.ts`, whose record has no game to say how it ended). */
  readonly where: "browser" | "server" | "table";
  readonly roomId: string;
  readonly gameNumber: number;
  readonly endedAt: number;
  /** The tag of the browser that posted it (`game-store.ts`'s `PLAYER_TAG`,
   * the client's `playerTag.ts`): which games came from one browser, and
   * nothing of whose. Only on a game a browser played alone, put there by
   * its page; a room on the server and a table have none. */
  readonly tag?: string;
  readonly seats: readonly RecordedSeat[];
  readonly end: {
    /** `"over"`: the game was played out. `"left"`: its room went first.
     * `"so-far"`: the game is still going (a browser hands its record over as
     * it goes, since a tab can close without a word: `GameRecorder.finish`).
     * `"closed"`: a table's, which doesn't know which. */
    readonly reason: "over" | "left" | "so-far" | "closed";
    readonly winner: PlayerId | null;
    readonly turn: number | null;
    /** How many events the game had made, and its state's fingerprint
     * (`stateDigest`): what a replay must arrive at. `null` in a table's
     * record. */
    readonly events: number | null;
    readonly digest: string | null;
  };
}

/**
 * A record as it is handed over: all of it (`from` 0, with the `config`), or
 * only the inputs from `from` on, for a keeper that already holds the ones
 * before (`GameStore.take` appends them). A browser's game goes this way, a
 * few inputs at a time, so that a tab closed without a word has lost almost
 * nothing; `seed` names the game where there is no `config` to read it from.
 */
export interface GameRecordPart extends Omit<GameRecord, "config"> {
  readonly from: number;
  readonly seed: number | null;
  readonly config?: DealtConfig;
}

/** A game with fewer inputs than this was left before it began: not kept. */
export const MIN_RECORDED_INPUTS = 12;

/** How many more inputs a browser's game has before the new ones are handed
 * over (`GameRecordSink.asItGoes`, `Room.act`): about every twenty seconds of
 * a bots' game, a few kilobytes each. The page also asks for it whenever its
 * tab is hidden or closing (`LocalRoomHost.handOverRecords`). */
export const HAND_OVER_EVERY = 50;

/** Past this many inputs a record stops growing (a game the fuzzer's turn cap
 * would have stopped long before): it is then no record, and isn't kept. */
export const MAX_RECORDED_INPUTS = 60_000;

/** Keeps one game's record as its room plays it. */
export class GameRecorder {
  private readonly config: DealtConfig;
  private readonly startedAt: number;
  private readonly inputs: RecordedInput[];
  /** The record no longer holds the whole game (it overflowed): never sent. */
  private broken = false;
  /** How many inputs the keeper is known to hold (`acked`). */
  private handed = 0;
  /** How many the record held when a part was last sent: nothing is sent
   * again until there is more, or the keeper says it holds less. */
  private sent = 0;

  constructor(start: DealtConfig | RecordSoFar, now: number = Date.now()) {
    if ("inputs" in start) {
      this.config = start.config;
      this.startedAt = start.startedAt;
      this.inputs = [...start.inputs];
      this.handed = Math.min(Math.max(0, start.handed ?? 0), this.inputs.length);
    } else {
      this.config = start;
      this.startedAt = now;
      this.inputs = [];
    }
  }

  /** An input the game took. */
  note(input: RoomInput, by: RecordedInput["by"], audit: DecisionAudit | null = null): void {
    if (this.broken) return;
    if (this.inputs.length >= MAX_RECORDED_INPUTS) {
      this.broken = true;
      return;
    }
    this.inputs.push({
      input,
      by,
      ...(by === "bot" && audit !== null ? { via: audit.via, ...(audit.expired ? { expired: true as const } : {}) } : {}),
    });
  }

  /** What a saved game carries, or `null` once the record is no good. */
  soFar(): RecordSoFar | null {
    return this.broken
      ? null
      : { config: this.config, startedAt: this.startedAt, inputs: this.inputs, handed: this.handed };
  }

  /** How many inputs have been made since a part was last sent. */
  get unsent(): number {
    return this.broken ? 0 : this.inputs.length - Math.max(this.handed, this.sent);
  }

  /**
   * What to hand over now: the inputs the keeper doesn't hold yet (all of
   * them, with the deal, when it holds none), and how the game stands.
   * `null` if nothing has been added since the last part was sent, the
   * record is broken, or the game hardly began. Tell the keeper's answer to
   * `acked`.
   */
  part(
    game: Game,
    reason: "over" | "left" | "so-far",
    about: Pick<GameRecord, "build" | "where" | "roomId" | "gameNumber" | "seats">,
    now: number = Date.now(),
  ): GameRecordPart | null {
    if (this.broken || this.inputs.length < MIN_RECORDED_INPUTS) return null;
    if (this.inputs.length <= Math.max(this.handed, this.sent)) return null;
    const from = this.handed;
    this.sent = this.inputs.length;
    const state = game.state;
    return {
      version: GAME_RECORD_VERSION,
      ...about,
      seed: typeof this.config.seed === "number" ? this.config.seed : null,
      from,
      ...(from === 0 ? { config: this.config } : {}),
      startedAt: this.startedAt,
      endedAt: now,
      // A copy: the game goes on, and a part handed over must not.
      inputs: this.inputs.slice(from),
      end: {
        reason,
        winner: state.result.over ? (state.result.winner ?? null) : null,
        turn: state.turn.number,
        events: game.events.length,
        digest: stateDigest(state),
      },
    };
  }

  /**
   * The inputs the keeper isn't known to hold, as a part, with nothing
   * counted as sent: what a browser's page keeps by it to send as its tab
   * closes, when its worker is past sending anything (`Room.recordTail`).
   * Made about once a second, so without the state's fingerprint, which
   * costs a pass over the whole state: `end`'s `events` and `digest` are
   * `null`, as a table's are. `null` if the keeper holds it all, the record
   * is broken, or the game hardly began.
   */
  tail(
    game: Game,
    about: Pick<GameRecord, "build" | "where" | "roomId" | "gameNumber" | "seats">,
    now: number = Date.now(),
  ): GameRecordPart | null {
    if (this.broken || this.inputs.length < MIN_RECORDED_INPUTS || this.inputs.length <= this.handed) return null;
    const from = this.handed;
    const state = game.state;
    return {
      version: GAME_RECORD_VERSION,
      ...about,
      seed: typeof this.config.seed === "number" ? this.config.seed : null,
      from,
      ...(from === 0 ? { config: this.config } : {}),
      startedAt: this.startedAt,
      endedAt: now,
      inputs: this.inputs.slice(from),
      end: {
        reason: state.result.over ? "over" : "so-far",
        winner: state.result.over ? (state.result.winner ?? null) : null,
        turn: state.turn.number,
        events: null,
        digest: null,
      },
    };
  }

  /**
   * The keeper's answer to a part that ran to `through` inputs: how many of
   * the game's inputs it now holds, or `null` when it didn't say (the post
   * failed, or records are off there). Returns whether to send again at
   * once: it holds less than the part began from (its copy went: fetched
   * away, or dropped for room), so the next part starts from what it has.
   * Asked for at most once until an answer agrees, so a keeper that never
   * takes anything is not sent the game over and over.
   */
  acked(have: number | null, through: number): boolean {
    if (have === null) {
      // Unknown: as if never sent, so the next part carries these too.
      this.sent = this.handed;
      return false;
    }
    const held = Math.min(Math.max(0, have), this.inputs.length);
    const behind = held < Math.min(through, this.inputs.length);
    this.handed = held;
    if (!behind) {
      this.resent = false;
      return false;
    }
    this.sent = held;
    if (this.resent) return false;
    this.resent = true;
    return true;
  }

  /** A part was sent again for a keeper that had fallen behind (`acked`). */
  private resent = false;
}

/** How many decisions a conceding player's stand-in answers first: `Room`'s. */
export const CONCEDE_DECISION_LIMIT = 100;

/**
 * `player` concedes `game` (rule 104.3a), any decision they owe answered
 * first — by v1, which reads no clock, so every copy of a game gives the same
 * answers wherever the concession lands. The engine doesn't model another
 * player making a departed player's choice (800.4f–h). Returns whether they
 * conceded: not during the opening hands, not twice, not a game that is over,
 * and not while they still owe a decision past the limit.
 */
export function concession(game: Game, player: PlayerId, registry: CardRegistry): boolean {
  const owes = (): boolean => {
    const awaiting = game.state.awaiting;
    return awaiting !== null && awaiting.kind !== "mulligan" && awaiting.player === player;
  };
  if (!owes() && game.whyCannotConcede(player) !== null) return false;
  const stand = new HeuristicBotController(player, registry);
  for (let i = 0; i < CONCEDE_DECISION_LIMIT && owes(); i += 1) {
    game.dispatch(stand.act(game.controllerView(player)));
  }
  if (game.whyCannotConcede(player) !== null) return false;
  game.concede(player);
  return true;
}

/** How a replay ended against what its record says the game came to. */
export interface ReplayResult {
  readonly game: Game;
  /** Inputs applied. */
  readonly applied: number;
  /** The whole record was played and the game stands as it did then: the
   * same events, the same state. `null` when only part was asked for. */
  readonly matches: boolean | null;
  /** The input the game refused, and why: the build has changed since. */
  readonly refused: { readonly at: number; readonly why: string } | null;
  /** A table's inputs the game refused and every copy dropped (one made out
   * of turn that landed where the game no longer took it). */
  readonly dropped: number;
}

/**
 * Plays a record again: the game dealt as it was, each input applied as its
 * room applied it (`Room.applyInput`) and the game taken on to its next
 * decision after each. `upTo` stops after that many inputs; `stop` after the
 * first input that leaves the game where it says. An input the game refuses
 * ends the replay there (`refused`), the game left as it stood.
 */
export function replayRecord(
  record: RecordSoFar & Partial<Pick<GameRecord, "end" | "where">>,
  registry: CardRegistry,
  options: {
    readonly upTo?: number;
    readonly stop?: (game: Game, applied: number) => boolean;
    /** The game as dealt, before the first input (`scripts/record-to-replay.mjs`'s first board). */
    readonly start?: (game: Game) => void;
  } = {},
): ReplayResult {
  let game = Game.create({ ...record.config, registry });
  game.advanceUntil(isSettled);
  options.start?.(game);
  const limit = Math.min(options.upTo ?? record.inputs.length, record.inputs.length);
  let applied = 0;
  let dropped = 0;
  let refused: ReplayResult["refused"] = null;
  for (; applied < limit; applied += 1) {
    const { input } = record.inputs[applied];
    const eventsBefore = game.events.length;
    const seqBefore = game.state.eventSeq;
    try {
      game.markTurnStart();
      switch (input.kind) {
        case "action":
          game.dispatch(input.action);
          break;
        case "concede":
          concession(game, input.player, registry);
          break;
        case "orders-own-triggers":
          game.setOrdersOwnTriggers(input.player, input.on);
          break;
        case "take-back":
          game = Game.fromSnapshot(takeBackState(game.state, input.player, input.turn), { registry });
          break;
      }
      game.advanceUntil(isSettled);
    } catch (error) {
      // A table's log holds every input in its place, taken or not: one the
      // game refuses, nothing changed, each copy dropped (`Room.receive`).
      if (record.where === "table" && game.events.length === eventsBefore && game.state.eventSeq === seqBefore) {
        dropped += 1;
        continue;
      }
      refused = { at: applied, why: error instanceof Error ? error.message : String(error) };
      break;
    }
    if (options.stop?.(game, applied + 1) === true) {
      applied += 1;
      break;
    }
  }
  const end = record.end;
  const checkable =
    refused === null && applied === record.inputs.length && end !== undefined && end.events !== null && end.digest !== null;
  return {
    game,
    applied,
    matches: checkable
      ? game.events.length === end.events && stateDigest(game.state) === end.digest
      : refused !== null
        ? false
        : null,
    refused,
    dropped,
  };
}

/** Where finished records go on this thread, and what each says of the build
 * and the place it was played. */
export interface GameRecordSink {
  readonly build: string | null;
  readonly where: "browser" | "server";
  /** Hand a game over as it goes too, each time it has this many more inputs
   * (`HAND_OVER_EVERY`): a browser's, whose tab can close without the room
   * ever hearing. */
  readonly asItGoes?: number;
  /** Takes a part, and may answer how many of the game's inputs the keeper
   * now holds (`GameRecorder.acked`); answering nothing is "all of them". */
  readonly deliver: (part: GameRecordPart) => void | Promise<number | null>;
}

/**
 * A tutorial room: one lesson (`tutorials/`) played against its scripted
 * opponents, with the coach card to show riding on every frame
 * (`room.tutorial`, a `TutorialInfo`). A production-safe sibling of the
 * scenario builder (`builder.ts`): a client names a lesson by id and nothing
 * more — the boards are the server's own — and what it's told is the
 * lesson's progress, never the board's spec, so no hidden card leaks. Why
 * it's shaped this way: `docs/plans/tutorials.md`.
 *
 * Like a `BuilderSession`, it serves its game through a `Room` it replaces
 * when the lesson needs a new one (a chapter's fresh board, a retry), under
 * the same code, carrying the player's seat and the frame count across.
 * Goals are checked in the room's `onPublish` hook, so every frame carries
 * where the lesson stands as of that frame.
 */

import { Game } from "engine/local";
import type { GameState, PlayerId } from "engine/local";
import type { TutorialCoachStep, TutorialInfo } from "protocol";
import { buildScenario } from "./builder.js";
import type { CaptureFactory } from "./capture.js";
import type { HostRole } from "./host.js";
import { Room } from "./room.js";
import type { RoomOptions } from "./room.js";
import { ScriptedBot } from "./scripted-bot.js";
import { cardRegistry } from "./card-registry.js";
import { metAt } from "./tutorials/conditions.js";
import { humanSeat } from "./tutorials/lesson.js";
import type { Lesson, LessonBoard, LessonStep } from "./tutorials/lesson.js";

/** What a tutorial session needs from the manager that owns its code. */
export interface TutorialHost {
  /** Puts `room` under the session's code, in place of the one before. */
  readonly install: (room: Room) => void;
  readonly onUpdate: (room: Room) => void;
  readonly capture?: CaptureFactory;
  readonly pacing?: RoomOptions["pacing"];
}

/** A chapter's start, to rewind to. */
interface Checkpoint {
  readonly chapter: number;
  readonly board: LessonBoard;
  readonly state: GameState;
}

/** How many steps one check may take: a backstop, never reached by a lesson. */
const ADVANCE_LIMIT = 200;

export class TutorialSession {
  readonly id: string;
  readonly lesson: Lesson;
  /** The seat kept for the player. */
  readonly seat: PlayerId;
  private readonly host: HostRole;
  private readonly env: TutorialHost;
  private current: Room;
  /** The board in force: whose opponents the room seats. */
  private board: LessonBoard;
  private chapter = 0;
  /** The card showing, by index in its chapter; `null` while the chapter
   * waits for its `opensOn`. */
  private step: number | null = 0;
  /** The event-log index the card (or the wait) started from. */
  private from = 0;
  /** Where each of the card's goals was met, by goal; absent while unmet. */
  private met: (number | undefined)[] = [];
  private complete = false;
  private checkpoint: Checkpoint;

  constructor(id: string, lesson: Lesson, host: HostRole, env: TutorialHost) {
    this.id = id;
    this.lesson = lesson;
    this.host = host;
    this.env = env;
    const board = lesson.chapters[0].board;
    if (board === undefined) throw new Error(`lesson ${lesson.id} has no board to start on`);
    this.seat = humanSeat(board);
    this.board = board;
    const game = buildScenario(board.spec, cardRegistry()).game;
    this.checkpoint = this.open(0, game, game.events.length);
    this.current = this.makeRoom(game, 0);
    this.env.install(this.current);
    this.seatOpponents(this.current);
    this.current.start();
  }

  get room(): Room {
    return this.current;
  }

  /** The player pressed Next on card `stepId`. */
  next(stepId: string): void {
    const step = this.currentStep();
    if (step === null) throw new Error("there's no card to go on from");
    if (step.id !== stepId) throw new Error("that card has already gone");
    if ((step.goals?.length ?? 0) > 0) throw new Error("this card moves on once its goals are done");
    const chapters = this.lesson.chapters;
    const following = chapters[this.chapter + 1];
    const last = this.step === chapters[this.chapter].steps.length - 1;
    if (last && following?.board !== undefined) {
      const board = following.board;
      const game = buildScenario(board.spec, cardRegistry()).game;
      this.board = board;
      this.checkpoint = this.open(this.chapter + 1, game, game.events.length);
      this.swap(game);
      return;
    }
    // What happened while the card was up counts toward what comes next.
    this.finishStep(this.from, this.current.game);
    this.current.publish();
  }

  /** Back to the start of the chapter under way (or the last one opened):
   * its board as it stood then, its goals undone. */
  retry(): void {
    const { chapter, board, state } = this.checkpoint;
    const game = Game.fromSnapshot(state, { registry: cardRegistry() });
    this.board = board;
    this.complete = false;
    this.checkpoint = this.open(chapter, game, game.events.length);
    this.swap(game);
  }

  /** Where the lesson stands, for every frame. */
  info(): TutorialInfo {
    const chapter = this.lesson.chapters[this.chapter];
    const step = this.currentStep();
    const goals = step?.goals ?? [];
    return {
      lesson: this.lesson.id,
      title: this.lesson.title,
      chapter: chapter.id,
      chapterTitle: chapter.title,
      chapterIndex: this.chapter,
      chapterCount: this.lesson.chapters.length,
      step: step === null ? null : coachCard(step),
      goals: goals.map((goal, i) => ({ id: goal.id, label: goal.label, done: this.met[i] !== undefined })),
      canRetry: !this.complete,
      complete: this.complete,
    };
  }

  private currentStep(): LessonStep | null {
    if (this.complete || this.step === null) return null;
    return this.lesson.chapters[this.chapter].steps[this.step] ?? null;
  }

  /** Opens chapter `index` at log index `at`: its first card up, and the
   * game as it stands (on the board in force) kept to rewind to. */
  private open(index: number, game: Game, at: number): Checkpoint {
    this.chapter = index;
    this.step = 0;
    this.from = at;
    this.met = [];
    return { chapter: index, board: this.board, state: game.snapshot() };
  }

  /** The card showing is done, at log index `at`: on to the next card, the
   * next chapter (or the wait for it), or the end. */
  private finishStep(at: number, game: Game): void {
    if (this.step === null) return;
    const chapters = this.lesson.chapters;
    this.met = [];
    this.from = at;
    if (this.step + 1 < chapters[this.chapter].steps.length) {
      this.step += 1;
      return;
    }
    const following = chapters[this.chapter + 1];
    if (following === undefined) {
      this.complete = true;
      return;
    }
    // A chapter with a board of its own is reached only by Next (`next`),
    // which `validateLesson` makes sure of.
    if (following.opensOn !== undefined) {
      this.chapter += 1;
      this.step = null;
      return;
    }
    this.checkpoint = this.open(this.chapter + 1, game, at);
  }

  /** Moves the lesson on as far as the game has gone: chapters opening,
   * goals met. Runs on every frame of the current room. */
  private advance(game: Game): void {
    const state = game.state;
    for (let i = 0; i < ADVANCE_LIMIT && !this.complete; i += 1) {
      const chapter = this.lesson.chapters[this.chapter];
      if (this.step === null) {
        const at = chapter.opensOn === undefined ? this.from : metAt(state, this.from, chapter.opensOn);
        if (at === null) return;
        this.checkpoint = this.open(this.chapter, game, at);
        continue;
      }
      const goals = chapter.steps[this.step].goals ?? [];
      if (goals.length === 0) return; // a Next card
      goals.forEach((goal, g) => {
        this.met[g] ??= metAt(state, this.from, goal.when) ?? undefined;
      });
      const met = goals.map((_, g) => this.met[g]);
      if (met.some((at) => at === undefined)) return;
      this.finishStep(Math.max(...(met as number[])), game);
    }
  }

  private onPublish(room: Room): void {
    if (room !== this.current) return;
    this.advance(room.game);
    room.tutorial = this.info();
  }

  /** Whether the card up keeps the player's empty windows for them
   * (`LessonStep.holdPriority`). Asked mid-settle, so the lesson is first
   * brought up to date with the game: the card that asks for the pass may
   * have come up since the last frame. */
  private holdsPriority(room: Room, player: PlayerId): boolean {
    if (room !== this.current || player !== this.seat) return false;
    this.advance(room.game);
    return this.currentStep()?.holdPriority === true;
  }

  private makeRoom(game: Game, startSeq: number): Room {
    const board = this.board;
    return new Room(this.id, game, {
      startSeq,
      host: this.host,
      onUpdate: this.env.onUpdate,
      onPublish: (room) => this.onPublish(room),
      holdsPriority: (room, player) => this.holdsPriority(room, player),
      botSpeed: "normal",
      botController: (player) => {
        const opponent = board.opponents[player];
        return new ScriptedBot(player, opponent?.script ?? { moves: [] }, cardRegistry());
      },
      ...(this.env.capture !== undefined ? { capture: this.env.capture } : {}),
      ...(this.env.pacing !== undefined ? { pacing: this.env.pacing } : {}),
    });
  }

  private seatOpponents(room: Room): void {
    for (const seat of this.board.spec.seats) {
      if (seat.bot) room.addBot(seat.player, undefined, this.board.opponents[seat.player]?.name);
    }
  }

  /** Serves `game` from a new room under the same code, the player carried
   * across into their seat. */
  private swap(game: Game): void {
    const old = this.current;
    const claims = old.humanClaims();
    old.dispose();
    const room = this.makeRoom(game, old.frameSeq);
    for (const claim of claims) {
      if (claim.player !== this.seat) continue;
      if (claim.connection !== null) {
        room.claimSeat(claim.player, claim.clientToken, claim.connection, claim.displayName ?? undefined);
      } else {
        room.reserveSeat(claim.player, claim.clientToken, claim.displayName);
      }
    }
    this.current = room;
    this.env.install(room);
    this.seatOpponents(room);
    room.start();
  }
}

/** A lesson card as the client shows it. */
function coachCard(step: LessonStep): TutorialCoachStep {
  return {
    id: step.id,
    title: step.title,
    body: step.body,
    ...(step.anchor !== undefined ? { anchor: step.anchor } : {}),
    ...(step.placement !== undefined ? { placement: step.placement } : {}),
    advance: (step.goals?.length ?? 0) > 0 ? "goal" : "next",
  };
}

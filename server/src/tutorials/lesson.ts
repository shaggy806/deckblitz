/**
 * A lesson, as data: boards to play on, the scripted opponents across them,
 * and chapters of coach cards with goals. `TutorialSession`
 * (`tutorial-session.ts`) runs one; `index.ts` keys them by id. Why it's
 * shaped this way: `docs/plans/tutorials.md`.
 *
 * ## How a lesson runs
 *
 * Chapters run in order, and each chapter's cards in order. A card with
 * `goals` waits until every goal has been met since the card came up, then
 * moves on by itself; a card without waits for the player's Next. A chapter
 * is done when its last card is.
 *
 * The next chapter then opens at once, or — with `opensOn` — when that
 * happens in the game; until then there is no card and the game plays on.
 * A chapter with a `board` is a fresh game: the room is rebuilt on it, so
 * it can only be reached by Next (the chapter before must end on a card
 * without goals), and it opens at once. The first chapter always has one.
 *
 * Events count generously: what happened while a Next card was up counts
 * toward the card after it, and what came after a goal was met in the same
 * frame counts toward what follows — so a game that runs on by itself (the
 * opponent's whole turn in one frame) can't slip past a chapter's opening.
 */

import type { PlayerId } from "engine";
import type { ScenarioSpec, TutorialAnchor, TutorialCoachStep } from "protocol";
import { buildScenario } from "../builder.js";
import type { OpponentScript } from "../scripted-bot.js";
import { scriptRegistry } from "../scripted-bot.js";
import { conditionCards } from "./conditions.js";
import type { TutorialCondition } from "./conditions.js";

export interface LessonGoal {
  /** Unique within the lesson. */
  readonly id: string;
  /** The checklist line the client shows. */
  readonly label: string;
  readonly when: TutorialCondition;
}

/** One coach card. Without `goals` it's a Next card. */
export interface LessonStep {
  /** Unique within the lesson. */
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly anchor?: TutorialAnchor;
  readonly placement?: TutorialCoachStep["placement"];
  readonly goals?: readonly LessonGoal[];
  /**
   * While this card is up, the player's windows with an empty stack wait for
   * them even when there's nothing to do in them (`RoomOptions.holdsPriority`)
   * — for a card that asks them to pass, which they couldn't if the room
   * passed it for them. Every other window passes itself as usual.
   */
  readonly holdPriority?: boolean;
}

/** A fresh game for a lesson: the board, and who plays each bot seat. */
export interface LessonBoard {
  /** Exactly one seat without `bot` (the player's), and it's that seat's
   * turn: nothing happens before the player is there to see it. */
  readonly spec: ScenarioSpec;
  /** One per `bot` seat: its name at the table and its script. */
  readonly opponents: Readonly<Record<string, { readonly name: string; readonly script: OpponentScript }>>;
}

export interface LessonChapter {
  /** Unique within the lesson. */
  readonly id: string;
  readonly title: string;
  readonly board?: LessonBoard;
  readonly opensOn?: TutorialCondition;
  readonly steps: readonly LessonStep[];
}

export interface Lesson {
  readonly id: string;
  readonly title: string;
  readonly chapters: readonly LessonChapter[];
}

/** The seat a board keeps for the player. */
export function humanSeat(board: LessonBoard): PlayerId {
  const humans = board.spec.seats.filter((s) => !s.bot);
  if (humans.length !== 1) throw new Error(`a lesson board has exactly one player's seat, not ${humans.length}`);
  return humans[0].player;
}

/** Throws, naming the first thing wrong, unless `lesson` can be run. */
export function validateLesson(lesson: Lesson): void {
  const where = (what: string): string => `lesson ${lesson.id}: ${what}`;
  const registry = scriptRegistry();
  // Chapters, cards and goals each have ids of their own.
  const ids = new Map<string, Set<string>>();
  const unique = (id: string, what: string): void => {
    const taken = ids.get(what) ?? new Set<string>();
    ids.set(what, taken);
    if (id === "" || taken.has(id)) throw new Error(where(`${what} id "${id}" is empty or used twice`));
    taken.add(id);
  };
  const known = (name: string, what: string): void => {
    if (!registry.has(name)) throw new Error(where(`${what} names "${name}", which isn't a card`));
  };
  if (lesson.chapters.length === 0) throw new Error(where("no chapters"));
  if (lesson.chapters[0].board === undefined) throw new Error(where("the first chapter needs a board"));
  let seat: PlayerId | null = null;
  lesson.chapters.forEach((chapter, i) => {
    unique(chapter.id, "chapter");
    if (chapter.steps.length === 0) throw new Error(where(`chapter ${chapter.id} has no cards`));
    if (chapter.opensOn !== undefined) for (const name of conditionCards(chapter.opensOn)) known(name, chapter.id);
    for (const step of chapter.steps) {
      unique(step.id, "card");
      for (const goal of step.goals ?? []) {
        unique(goal.id, "goal");
        for (const name of conditionCards(goal.when)) known(name, goal.id);
      }
    }
    const board = chapter.board;
    if (board === undefined) return;
    if (chapter.opensOn !== undefined) throw new Error(where(`chapter ${chapter.id} has a board, so it opens at once`));
    const before = lesson.chapters[i - 1]?.steps.at(-1);
    if (before !== undefined && (before.goals?.length ?? 0) > 0) {
      throw new Error(where(`chapter ${chapter.id} has a board, so the card before it must be a Next card`));
    }
    buildScenario(board.spec, registry);
    const human = humanSeat(board);
    if (seat !== null && human !== seat) throw new Error(where("every board keeps the same seat for the player"));
    seat = human;
    if (board.spec.active !== human) throw new Error(where(`chapter ${chapter.id}'s board must start on the player's turn`));
    for (const s of board.spec.seats) {
      const opponent = board.opponents[s.player];
      if (s.bot && opponent === undefined) throw new Error(where(`no opponent for ${s.player}`));
      for (const move of opponent?.script.moves ?? []) {
        for (const name of move.card === undefined ? [] : [move.card].flat()) known(name, `${s.player}'s script`);
      }
    }
  });
}

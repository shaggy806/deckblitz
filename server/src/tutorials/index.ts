/**
 * Every lesson a tutorial room can run, by id. A client names one
 * (`tutorial-create`) and nothing more: an id that isn't here is refused.
 */

import { BASICS_PROOF } from "./basics-proof.js";
import { BOARD_TOUR } from "./board-tour.js";
import type { Lesson } from "./lesson.js";

export const LESSONS: ReadonlyMap<string, Lesson> = new Map([BASICS_PROOF, BOARD_TOUR].map((lesson) => [lesson.id, lesson]));

/** The lesson `id` names, or a refusal. Takes anything off the wire. */
export function lessonById(id: unknown): Lesson {
  const lesson = typeof id === "string" ? LESSONS.get(id) : undefined;
  if (lesson === undefined) throw new Error(`no lesson "${String(id).slice(0, 40)}"`);
  return lesson;
}

export type { Lesson, LessonBoard, LessonChapter, LessonGoal, LessonStep } from "./lesson.js";
export { humanSeat, validateLesson } from "./lesson.js";
export type { TutorialCondition } from "./conditions.js";
export { metAt } from "./conditions.js";

/**
 * A game's state as text and back, to the letter: what one device sends
 * another to start a copy of the game from (`docs/plans/replicated-rooms.md`).
 *
 * Plain `JSON.stringify` is not that. It writes an `undefined` in an array as
 * `null`, and the state has exactly such a thing: a blank target slot
 * (`ResolvedTargets`: a declined "up to one") is `undefined` by design and
 * read with `=== undefined` throughout, so a state through plain JSON reads a
 * blank slot as a chosen one, and a spell resolving with it throws or targets
 * nothing (`BACKLOG.md`, "Blank target slots don't survive JSON"; the
 * fuzzer's `MTG_REPLICA=1` met it in about one four-player game in forty).
 * Here a blank is written as a marker and read back as `undefined`,
 * a real element of the array and not a hole in it (`map` and `every` skip a
 * hole).
 *
 * Everything else in a state is plain data that JSON keeps: no class
 * instances, `Map`/`Set`, functions or non-finite numbers (`engine/CLAUDE.md`;
 * the situation fuzzer checks it). A property whose value is `undefined` is
 * dropped, which nothing can tell from the property being there.
 */

import type { GameState } from "./state.js";

/** What stands for an `undefined` array element in the text. No state object
 * has this key. */
const BLANK_KEY = "~blank";

function isBlank(value: unknown): boolean {
  return typeof value === "object" && value !== null && (value as Record<string, unknown>)[BLANK_KEY] === true;
}

/** `state` as JSON text that `stateFromJson` reads back exactly. */
export function stateToJson(state: GameState): string {
  return JSON.stringify(state, function (this: unknown, _key: string, value: unknown) {
    return value === undefined && Array.isArray(this) ? { [BLANK_KEY]: true } : value;
  });
}

function revive(value: unknown): void {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      if (isBlank(value[i])) value[i] = undefined;
      else revive(value[i]);
    }
  } else if (typeof value === "object" && value !== null) {
    for (const key of Object.keys(value)) revive((value as Record<string, unknown>)[key]);
  }
}

/** The state `stateToJson` wrote. */
export function stateFromJson(text: string): GameState {
  const state = JSON.parse(text) as GameState;
  revive(state);
  return state;
}

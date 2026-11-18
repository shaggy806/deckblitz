/**
 * A short fingerprint of a game's state, the same for the same content
 * however the state was built and wherever it is computed: what the devices
 * holding copies of one game compare to find out that they still agree
 * (`docs/plans/replicated-rooms.md`), without sending the state itself.
 *
 * "The same content" is what `scripts/replica-check.mjs` compares whole states
 * by, and the fuzzer's `MTG_REPLICA=1` holds the two to each other:
 *
 * - an object's keys in any order (a state restored from text has them in
 *   another order than the game it was taken from, as soon as a property that
 *   had been `undefined` is set);
 * - a property whose value is `undefined` as if it weren't there;
 * - an `undefined` in an array as itself, apart from a `null`: a blank target
 *   slot is one (`state-wire.ts`).
 *
 * Nothing here depends on the machine: keys are ordered by code unit, numbers
 * read as the text every engine writes for them, strings by code unit, and
 * the mixing is 32-bit integer arithmetic (`Math.imul`). 64 bits of it, which
 * is for catching copies that drifted, not for anyone trying to forge one.
 */

import type { GameState } from "./state.js";

export interface StateDigestOptions {
  /**
   * The event log's contents too. Off, the log counts by its length alone:
   * it only grows, a late game's is most of the state (tens of thousands of
   * events), and a copy that agrees on everything else and on how many
   * events there were has all but certainly emitted the same ones. On, for a
   * check that wants every byte (the fuzzer's).
   */
  readonly events?: boolean;
}

/** Two 32-bit lanes, mixed a character at a time (the shape of cyrb53). */
class Mixer {
  private h1 = 0xdeadbeef;
  private h2 = 0x41c6ce57;

  char(code: number): void {
    this.h1 = Math.imul(this.h1 ^ code, 2654435761);
    this.h2 = Math.imul(this.h2 ^ code, 1597334677);
  }

  text(value: string): void {
    for (let i = 0; i < value.length; i += 1) this.char(value.charCodeAt(i));
  }

  /** A string with its length first, so "ab","c" and "a","bc" differ. */
  measured(value: string): void {
    this.text(String(value.length));
    this.char(58);
    this.text(value);
  }

  hex(): string {
    let h1 = this.h1;
    let h2 = this.h2;
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const word = (n: number): string => (n >>> 0).toString(16).padStart(8, "0");
    return word(h2) + word(h1);
  }
}

// One character says what kind of value follows, so no two kinds read alike.
const NULL = 110; // n
const BLANK = 117; // u
const TRUE = 116; // t
const FALSE = 102; // f
const NUMBER = 35; // #
const STRING = 34; // "
const ARRAY = 91; // [
const OBJECT = 123; // {
const END = 59; // ;

function mix(mixer: Mixer, value: unknown): void {
  if (value === null) return mixer.char(NULL);
  if (value === undefined) return mixer.char(BLANK);
  switch (typeof value) {
    case "boolean":
      return mixer.char(value ? TRUE : FALSE);
    case "number":
      mixer.char(NUMBER);
      mixer.text(String(value));
      return mixer.char(END);
    case "string":
      mixer.char(STRING);
      return mixer.measured(value);
    case "object": {
      if (Array.isArray(value)) {
        mixer.char(ARRAY);
        mixer.text(String(value.length));
        mixer.char(58);
        for (let i = 0; i < value.length; i += 1) mix(mixer, value[i]);
        return mixer.char(END);
      }
      const record = value as Record<string, unknown>;
      mixer.char(OBJECT);
      for (const key of Object.keys(record).sort()) {
        const held = record[key];
        if (held === undefined) continue;
        mixer.measured(key);
        mix(mixer, held);
      }
      return mixer.char(END);
    }
    default:
      // A state holds nothing else (no functions, symbols or bigints).
      throw new Error(`stateDigest: a ${typeof value} in the state`);
  }
}

/** `state`'s fingerprint: 16 hex characters. */
export function stateDigest(state: GameState, options: StateDigestOptions = {}): string {
  const mixer = new Mixer();
  if (options.events === true) {
    mix(mixer, state);
  } else {
    const { eventLog, ...rest } = state;
    mix(mixer, rest);
    mixer.text(`events:${eventLog.length}`);
  }
  return mixer.hex();
}

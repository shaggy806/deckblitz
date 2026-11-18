/**
 * Low-level primitives shared across the engine: branded identifiers and a
 * deterministic PRNG so that a game replays identically from its seed.
 */

/** Opaque identifier for a player. Create with {@link asPlayerId}. */
export type PlayerId = string & { readonly __brand: "PlayerId" };

/** Opaque identifier for a game object (a card, token, or copy on the stack). */
export type ObjectId = string & { readonly __brand: "ObjectId" };

export const asPlayerId = (raw: string): PlayerId => raw as PlayerId;
export const asObjectId = (raw: string): ObjectId => raw as ObjectId;

/**
 * A seeded pseudo-random number generator. The current {@link Rng.seed} fully
 * describes its position in the stream, so persisting it and rebuilding with
 * {@link createRng} resumes the exact same sequence.
 */
export interface Rng {
  /** Current internal state; feed back into {@link createRng} to resume. */
  readonly seed: number;
  /** Next float in `[0, 1)`. */
  next(): number;
  /** Next integer in `[0, maxExclusive)`. */
  int(maxExclusive: number): number;
}

/** Deterministic 32-bit PRNG (mulberry32). */
export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  const next = (): number => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    get seed() {
      return state >>> 0;
    },
    next,
    int(maxExclusive: number): number {
      if (maxExclusive <= 0) return 0;
      return Math.floor(next() * maxExclusive);
    },
  };
}

/** A 32-bit hash of `text`, different for each `seed` (MurmurHash3's mixing). */
function hashText(text: string, seed: number): number {
  let h = seed >>> 0;
  for (let i = 0; i < text.length; i += 1) {
    h = Math.imul(h ^ text.charCodeAt(i), 0x9e3779b1);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}

/**
 * `0..count-1` in an order drawn from `salt` alone — the order a deck's cards
 * take their object ids in (`Game.setup`). Not the game's {@link Rng}: that
 * one has 32 bits of state, so an order drawn from it could be searched for
 * from the ids a player sees on their own cards, and would give away the
 * seed with it. This is sfc32 (128 bits of state) seeded from four hashes of
 * the salt, which a room server makes long and random.
 */
export function saltedOrder(count: number, salt: string): number[] {
  let a = hashText(salt, 1);
  let b = hashText(salt, 2);
  let c = hashText(salt, 3);
  let d = hashText(salt, 4);
  const next = (): number => {
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
  for (let i = 0; i < 16; i += 1) next();
  const out = Array.from({ length: count }, (_, index) => index);
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

/** Fisher–Yates shuffle. Returns a new array; does not mutate `items`. */
export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = rng.int(i + 1);
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

/** A name with its case and accents folded away: what `compareNames` orders by. */
function foldedName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/**
 * Orders two names alphabetically, the same way on every machine: by their
 * letters with case and accents folded away, then as written. Use it wherever
 * an order ends up in the game's state (the choices a decision offers): a
 * `localeCompare` reads the machine's language and its collation data, so two
 * devices holding the same game could list them differently
 * (`docs/plans/replicated-rooms.md`).
 */
export function compareNames(a: string, b: string): number {
  const x = foldedName(a);
  const y = foldedName(b);
  return x < y ? -1 : x > y ? 1 : a < b ? -1 : a > b ? 1 : 0;
}

/** `names` in `compareNames`' order, each folded once: for a long list. */
export function sortedNames(names: Iterable<string>): string[] {
  return [...names]
    .map((name) => ({ name, key: foldedName(name) }))
    .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .map(({ name }) => name);
}

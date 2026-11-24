/**
 * Digging for a card: a tutor that pays in library instead of mana.
 *
 * Two shapes, read off a card's effect:
 *
 * - **Named** (Demonic Consultation, Divining Witch, Spoils of the Vault):
 *   choose a card name, then reveal from the top until that card and put it
 *   into the hand. The name is the tutor's pick, so it is chosen as one
 *   (`hand-worth.ts`'s quality, the card the hand most wants: a land when
 *   short, else the best spell within reach), among the names the dig is
 *   safe for.
 * - **Until taken** (Tainted Pact): exile from the top one at a time, and
 *   stop at the card we take. The bot takes the first card near the best the
 *   library still holds.
 *
 * Both used to be answered with no aim. Consultation named the card the
 * library held most copies of (a Swamp), which the search scored a wash and
 * never cast; Tainted Pact took whatever came first (a player's report,
 * 2026-11-23, `docs/bot-misplays.md`).
 *
 * **What a dig risks**, read from how many copies the library holds and
 * never from where they lie (a player knows their list, not its order):
 *
 * - The cards exiled first can hold every copy (Consultation's top six): the
 *   whole library is exiled, and the next draw loses the game. One copy in a
 *   library of N is there 6 times in N.
 * - Each card exiled can cost a life (Spoils of the Vault), and the card can
 *   lie deeper than our life total.
 * - What is left has to last the game.
 *
 * A name is **safe** while the first two chances are each at most
 * {@link RISK_MAX} and the library is expected to keep {@link LEFT_MIN}
 * cards (Tainted Pact, which sees each card, takes any once the library is
 * down to {@link TAKE_ANY_AT}). So with a library of sixty or more,
 * Consultation finds any card in a singleton deck; under that it finds only
 * a card with copies to spare.
 *
 * Pure over the state and the card definitions, like `hand-worth.ts`.
 */

import type { CardDefinition } from "../cards/define.js";
import { CHOSEN_CARD_NAME } from "../effects.js";
import type { EffectSpec } from "../effects.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { GameState } from "../state.js";

/** The most a dig may risk of losing the game outright. A commander deck's
 * one copy sits in Consultation's top six 6 times in N: 7% at eighty-eight
 * cards, 10% at sixty. */
export const RISK_MAX = 0.1;
/** The cards a named dig must expect to leave in the library: past where a
 * library starts to be a clock (`features.ts`'s `LIBRARY_DANGER_AT`, 15).
 * One copy is expected halfway down, so this asks for a library of
 * forty-seven; the chance of a miss asks for sixty. */
export const LEFT_MIN = 20;
/** Where Tainted Pact stops turning cards down: twice that clock. */
export const TAKE_ANY_AT = 30;
/** Tainted Pact takes the first card worth this share of the best card the
 * library holds: a land the board wants (1.25) beside a library whose best
 * is at the cap (1.5), not an average card. */
const TAKE_SHARE = 0.8;
/** Of our life, the most a dig is expected to cost (Spoils of the Vault). */
const LIFE_SHARE = 0.25;

/** A dig, as a card's effect spells it. */
export type Dig =
  | {
      readonly kind: "named";
      /** Exiled off the top before the reveal starts (Consultation's six). */
      readonly exiledFirst: number;
      /** A life lost for each card exiled on the way (Spoils of the Vault). */
      readonly lifeEach: boolean;
    }
  | { readonly kind: "until-taken" };

const stepsOf = (effect: EffectSpec): readonly EffectSpec[] => (effect.kind === "sequence" ? effect.effects : [effect]);

/** "You may put that card into your hand", however it's wrapped. */
function offersExiledCard(effect: EffectSpec): boolean {
  switch (effect.kind) {
    case "may":
      return effect.effect.kind === "move-exiled-this-way" && effect.effect.to === "hand";
    case "conditional":
      return offersExiledCard(effect.then);
    case "sequence":
      return effect.effects.some(offersExiledCard);
    default:
      return false;
  }
}

/** The dig the steps after a name is chosen are, if they are one. */
export function namedDigIn(then: EffectSpec | undefined): Dig | null {
  if (then === undefined) return null;
  const steps = stepsOf(then);
  let exiledFirst = 0;
  for (const [index, step] of steps.entries()) {
    if (step.kind === "exile-from-library" && step.whose === undefined && step.fromBottom !== true) {
      if (typeof step.amount !== "number") return null;
      exiledFirst += step.amount;
      continue;
    }
    if (step.kind !== "reveal-until") continue;
    if (step.whose !== undefined || step.put !== "hand" || step.filter.hasName !== CHOSEN_CARD_NAME) return null;
    const lifeEach = steps.slice(index + 1).some((later) => {
      if (later.kind !== "lose-life") return false;
      const amount: unknown = later.amount;
      return typeof amount === "object" && amount !== null && "thisWay" in amount && amount.thisWay === "exiled";
    });
    return { kind: "named", exiledFirst, lifeEach };
  }
  return null;
}

/** The dig `effect` is, if it is one. */
export function digOf(effect: EffectSpec | null | undefined): Dig | null {
  if (effect === null || effect === undefined) return null;
  if (effect.kind === "choose-card-name") return effect.chooser === undefined ? namedDigIn(effect.then) : null;
  if (effect.kind === "repeat") {
    const steps = stepsOf(effect.effect);
    const exiles = steps.some((step) => step.kind === "exile-from-library" && step.whose === undefined);
    return exiles && steps.some(offersExiledCard) ? { kind: "until-taken" } : null;
  }
  return null;
}

/** The dig `def`'s spell is, or one of its activated abilities (Divining
 * Witch). */
export function digOfCard(def: CardDefinition): Dig | null {
  const spell = digOf(def.effect);
  if (spell !== null) return spell;
  for (const ability of def.activated) {
    const found = digOf(ability.effect);
    if (found !== null) return found;
  }
  return null;
}

/** The chance that all `copies` of a card lie in the top `top` cards of a
 * library of `size`. */
function allWithin(copies: number, top: number, size: number): number {
  if (copies > top) return 0;
  let chance = 1;
  for (let i = 0; i < copies; i += 1) chance *= (top - i) / (size - i);
  return chance;
}

/** What `quality` says of each library card: how much the hand wants it. */
export type Quality = (id: ObjectId) => number;

/** One name a library holds. */
interface Named {
  readonly name: string;
  readonly copies: number;
  readonly quality: number;
}

function namesIn(state: GameState, library: readonly ObjectId[], quality: Quality): Named[] {
  const byName = new Map<string, { copies: number; quality: number }>();
  for (const id of library) {
    const name = state.objects[id]?.cardName;
    if (name === undefined) continue;
    const seen = byName.get(name);
    if (seen === undefined) byName.set(name, { copies: 1, quality: quality(id) });
    else seen.copies += 1;
  }
  return [...byName.entries()].map(([name, each]) => ({ name, ...each }));
}

/** A name to dig for, and what finding it is worth. */
export interface DigPick {
  readonly name: string;
  /** The card's quality in hand (`hand-worth.ts`). */
  readonly quality: number;
  /** Whether the dig is safe for it — see the module comment. With none
   * safe, the pick is the name the library holds most copies of. */
  readonly safe: boolean;
}

/**
 * The name a named dig should choose from `player`'s library: the card the
 * hand most wants among the safe ones, more copies first on a tie; with none
 * safe, the name it holds most of, which is the least likely to be missed.
 * `null` with an empty library.
 */
export function nameToDigFor(
  state: GameState,
  player: PlayerId,
  dig: Extract<Dig, { kind: "named" }>,
  quality: Quality,
): DigPick | null {
  const library = state.zones.perPlayer[player]?.library ?? [];
  const size = library.length;
  const life = state.players[player]?.life ?? 0;
  const names = namesIn(state, library, quality);
  if (names.length === 0) return null;
  const first = Math.min(dig.exiledFirst, size);
  const safe = (named: Named): boolean => {
    if (allWithin(named.copies, first, size) > RISK_MAX) return false;
    // The copies spread evenly through what the first exile leaves: the
    // first of them a (k+1)th of the way down.
    const before = (size - first - named.copies) / (named.copies + 1);
    if (size - first - before - 1 < LEFT_MIN) return false;
    if (dig.lifeEach) {
      // Dead when no copy is among as many cards as we have life.
      const deep = size - life;
      const dead = deep < named.copies ? 0 : allWithin(named.copies, deep, size);
      if (dead > RISK_MAX || before > LIFE_SHARE * life) return false;
    }
    return true;
  };
  const byName = (a: Named, b: Named): number => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  const wanted = names.filter(safe).sort((a, b) => b.quality - a.quality || b.copies - a.copies || byName(a, b));
  if (wanted[0] !== undefined) return { name: wanted[0].name, quality: wanted[0].quality, safe: true };
  const most = [...names].sort((a, b) => b.copies - a.copies || byName(a, b))[0];
  return { name: most.name, quality: most.quality, safe: false };
}

/** The best card `player`'s library holds, by `quality`; 0 for an empty one. */
function bestIn(state: GameState, player: PlayerId, quality: Quality): number {
  let best = 0;
  for (const id of state.zones.perPlayer[player]?.library ?? []) best = Math.max(best, quality(id));
  return best;
}

/**
 * What an until-taken dig expects to find: {@link TAKE_SHARE} of the best
 * card in the library, or an average card once the library is down to
 * {@link TAKE_ANY_AT} (it takes the first card offered there).
 */
export function untilTakenQuality(state: GameState, player: PlayerId, quality: Quality): number {
  const size = state.zones.perPlayer[player]?.library.length ?? 0;
  if (size === 0) return 0;
  return size <= TAKE_ANY_AT ? 1 : Math.max(1, TAKE_SHARE * bestIn(state, player, quality));
}

/**
 * Whether an until-taken dig should take `offered`, the card it just exiled
 * (Tainted Pact's "you may put that card into your hand").
 *
 * Yes at {@link TAKE_SHARE} of the best card still in the library, less the
 * chance the next card ends the dig with nothing (it shares a name with one
 * already exiled this way: `exiled`, `offered` among them). Yes to anything
 * once the library is down to {@link TAKE_ANY_AT}, or is empty.
 */
export function takesOffered(
  state: GameState,
  player: PlayerId,
  offered: ObjectId,
  exiled: readonly ObjectId[],
  quality: Quality,
): boolean {
  const library = state.zones.perPlayer[player]?.library ?? [];
  if (library.length <= TAKE_ANY_AT) return true;
  const gone = new Set(exiled.map((id) => state.objects[id]?.cardName));
  const ends = library.filter((id) => gone.has(state.objects[id]?.cardName)).length / library.length;
  return quality(offered) >= TAKE_SHARE * bestIn(state, player, quality) * (1 - ends);
}

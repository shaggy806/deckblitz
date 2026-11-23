/**
 * Naming a creature type — Crippling Fear's "choose a creature type", Urza's
 * Incubator's on-enter choice, and anything else that asks for one word out
 * of rule 205.3m's catalogue.
 *
 * Two shapes behind one kind, told apart by `awaiting.catalog`. A short fixed
 * list (a card that offers three types) is a row of buttons; a `catalog`
 * choice is all ~300 types, which is a search box — and unusable without a
 * head start, which is what {@link suggestedCreatureTypes} is for.
 */

import type { Action, LegalAction } from "../actions.js";
import type { CardRegistry } from "../cards.js";
import { computeCharacteristics } from "../characteristics.js";
import { CREATURE_TYPES } from "../creature-types.js";
import { compareNames } from "../primitives.js";
import type { PlayerId } from "../primitives.js";
import { printedCardName } from "../state.js";
import { isPlaneswalkerType } from "../subtypes.js";
import type { AwaitingDecision, GameState } from "../state.js";
import { defineDecision } from "./define.js";
import { subsetOf } from "./shared/picks.js";

const CREATURE_TYPE_SET: ReadonlySet<string> = new Set(CREATURE_TYPES);

/** How many types a catalog choice suggests up front. */
const SUGGESTED_CREATURE_TYPES = 8;

/**
 * The creature types most represented among `player`'s own cards and the
 * whole battlefield, most common first (ties alphabetical). What a catalog
 * choice suggests up front — see `LegalAction`'s `suggested`.
 *
 * Counts each card once per creature type it has. Off the battlefield that's
 * its printed types; on it, the computed ones, so an animated or type-changed
 * permanent counts as what it currently is.
 *
 * Computed here rather than stored on the `AwaitingDecision` because it reads
 * the chooser's own library, which only the engine may look at — putting it
 * in state would put it in everyone's view.
 */
export function suggestedCreatureTypes(
  state: Readonly<GameState>,
  registry: CardRegistry,
  player: PlayerId,
): string[] {
  const counts = new Map<string, number>();
  const tally = (types: readonly string[]): void => {
    for (const t of types) {
      if (CREATURE_TYPE_SET.has(t)) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  };
  const own = state.zones.perPlayer[player];
  for (const id of [...own.hand, ...own.library, ...own.graveyard]) {
    const def = registry.get(printedCardName(state.objects[id]));
    if (def.types.includes("creature")) tally(def.subtypes);
  }
  for (const id of state.zones.shared.command) {
    const object = state.objects[id];
    if (object.owner !== player) continue;
    const def = registry.get(printedCardName(object));
    if (def.types.includes("creature")) tally(def.subtypes);
  }
  for (const id of state.zones.shared.battlefield) {
    const c = computeCharacteristics(state, registry, id);
    if (c.types.includes("creature")) tally(c.subtypes);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || compareNames(a[0], b[0]))
    .slice(0, SUGGESTED_CREATURE_TYPES)
    .map(([t]) => t);
}

/**
 * The planeswalker types (rule 205.3j) of `player`'s own planeswalkers — on
 * the battlefield under their control first, then their cards in hand,
 * library, graveyard and the command zone — most common first (ties
 * alphabetical). What a "choose a planeswalker type" menu suggests, and a
 * bot names. Computed into the offer, as {@link suggestedCreatureTypes} is,
 * since it reads the chooser's library.
 */
export function suggestedPlaneswalkerTypes(
  state: Readonly<GameState>,
  registry: CardRegistry,
  player: PlayerId,
): string[] {
  const counts = new Map<string, number>();
  const tally = (types: readonly string[], weight: number): void => {
    for (const t of types) if (isPlaneswalkerType(t)) counts.set(t, (counts.get(t) ?? 0) + weight);
  };
  for (const id of state.zones.shared.battlefield) {
    const object = state.objects[id];
    if (object.controller !== player) continue;
    const c = computeCharacteristics(state, registry, id);
    // One already in play counts for more than one still in the library.
    if (c.types.includes("planeswalker")) tally(c.subtypes, 100);
  }
  const own = state.zones.perPlayer[player];
  const cards = [
    ...own.hand,
    ...own.library,
    ...own.graveyard,
    ...state.zones.shared.command.filter((id) => state.objects[id].owner === player),
  ];
  for (const id of cards) {
    const def = registry.get(printedCardName(state.objects[id]));
    if (def.types.includes("planeswalker")) tally(def.subtypes, 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || compareNames(a[0], b[0]))
    .slice(0, SUGGESTED_CREATURE_TYPES)
    .map(([t]) => t);
}

/** The longest word menu of a permanent's own a bot searches as it enters
 * (`entersWith: "word"`): two words, a Siege's, a colour's five. Past that
 * (a card type among nine, a number up to ten) each answer is a rollout
 * and the suggestions or v1's answer do. */
const SEARCHED_ENTER_WORDS = 5;

/**
 * Whether `awaiting` is a permanent's own word menu, asked as it is about to
 * enter (`CardDefinition.chooseOnEnter`: "choose odd or even", a colour, a
 * Siege's "Khans or Dragons"; or the coin of two it keeps): a short fixed
 * list with nothing to resume and none of the marks every other menu of this
 * kind is raised with. Not one answered from a hand it looked at (Arachne,
 * Psionic Weaver): what that word taxes is cast on later turns, where no
 * rollout goes, and v1 reads the hand.
 */
function isEnterWordMenu(awaiting: Extract<AwaitingDecision, { kind: "choose-creature-type" }>): boolean {
  return (
    !awaiting.catalog &&
    awaiting.then === undefined &&
    awaiting.value === undefined &&
    awaiting.looked === undefined &&
    awaiting.riot !== true &&
    awaiting.unleash !== true &&
    awaiting.enterTapped !== true &&
    awaiting.asEntersCounter !== true &&
    awaiting.protector !== true &&
    awaiting.sector !== true &&
    awaiting.tribute === undefined &&
    awaiting.lookAt !== true &&
    awaiting.enterChooser !== true &&
    awaiting.choosePlayer !== true &&
    awaiting.turnSkip === undefined &&
    awaiting.forCost === undefined &&
    awaiting.targetChooserFor !== true
  );
}

export const chooseCreatureType = defineDecision({
  kind: "choose-creature-type",

  hasSource: true,

  legal: (ctx, awaiting, player): LegalAction[] => [
    {
      kind: "choose-creature-type",
      source: awaiting.source,
      options: [...awaiting.options],
      catalog: awaiting.catalog,
      ...(awaiting.prompt !== undefined ? { prompt: awaiting.prompt } : {}),
      ...(awaiting.looked !== undefined ? { looked: [...awaiting.looked] } : {}),
      ...(awaiting.then !== undefined && !awaiting.catalog ? { resolving: true as const } : {}),
      ...(awaiting.riot === true
        ? { entersWith: "riot" as const }
        : awaiting.unleash === true
          ? { entersWith: "unleash" as const }
          : isEnterWordMenu(awaiting)
            ? { entersWith: "word" as const }
            : {}),
      // Only a catalog choice needs suggestions; a short fixed list is
      // already its own menu. Never one it leaves out ("other than Wall" —
      // Imagecrafter): a bot answers with a suggestion.
      // A menu of planeswalker types (Deification) is a long one too: the
      // chooser's own planeswalkers' types lead it.
      // A text change's target's own types lead (`suggestFirst`).
      suggested: awaiting.catalog
        ? [
            ...new Set([
              ...(awaiting.suggestFirst ?? []),
              ...suggestedCreatureTypes(ctx.state, ctx.registry, player).filter((t) => awaiting.options.includes(t)),
            ]),
          ]
        : awaiting.options.length > 0 && awaiting.options.every(isPlaneswalkerType)
          ? suggestedPlaneswalkerTypes(ctx.state, ctx.registry, player)
          : [],
    },
  ],

  whyCannot: (ctx, action, player): string | null => {
    if (action.type !== "choose-creature-type") {
      return `${player} is not being asked to choose a creature type`;
    }
    const awaiting = ctx.state.awaiting;
    if (
      awaiting === null ||
      awaiting.kind !== "choose-creature-type" ||
      awaiting.player !== player
    ) {
      return `${player} is not being asked to choose a creature type`;
    }
    return subsetOf(
      [action.creatureType],
      awaiting.options,
      (type) => `${type} is not one of the offered creature types`,
    );
  },

  apply: (host, action): void => {
    if (action.type !== "choose-creature-type") return;
    host.applyCreatureTypeChoice(action.player, action.creatureType);
  },

  ask: (controller, view, awaiting, player): Action => {
    // The suggestions were computed into the offer, so read them back off it
    // rather than recomputing — a controller can only see its own view, and
    // the engine already did the library scan that produced them.
    const offered = view
      .legalActions()
      .find(
        (a): a is Extract<LegalAction, { kind: "choose-creature-type" }> =>
          a.kind === "choose-creature-type",
      );
    return {
      type: "choose-creature-type",
      player,
      creatureType: controller.chooseCreatureType(
        view,
        awaiting.source,
        awaiting.options,
        offered?.suggested ?? [],
      ),
    };
  },

  // No candidates for a catalog choice, or for a player, a protector or a
  // counter kind named as a permanent enters — no rollout sees the
  // difference between one named creature type and another, so every
  // candidate scores the same and searching only costs time. A resolving
  // effect's short menu is different: Sudden Demise's colour is which
  // creatures take the damage. So is riot's or unleash's (`entersWith`):
  // haste is the attack this turn, the counter is size, and an unleashed
  // creature can't block — the board says which, and a rollout sees it. And
  // so is a permanent's own short word menu (`entersWith: "word"`): Ashling's
  // Prerogative's "odd or even" is which creatures have haste and which
  // enter tapped, a Siege's word is what it does every turn. Where the
  // rollouts tell no two words apart (a Thriving land's colour, on the turn
  // it enters tapped) v1's answer stands, as for any tie. Not a menu of
  // every planeswalker type (Leori, Sparktouched Hunter's, as it resolves):
  // eighty rollouts for one answer, which the suggestions already give — the
  // type of the planeswalkers in play. Nor an entering menu past
  // `SEARCHED_ENTER_WORDS`.
  candidates: (legal, player): Action[] => {
    if (legal.kind !== "choose-creature-type" || (legal.resolving !== true && legal.entersWith === undefined)) return [];
    if (legal.options.length > SUGGESTED_CREATURE_TYPES && legal.options.every(isPlaneswalkerType)) return [];
    if (legal.entersWith === "word" && legal.options.length > SEARCHED_ENTER_WORDS) return [];
    return legal.options.map((creatureType) => ({ type: "choose-creature-type", player, creatureType }));
  },

  randomAnswer: (legal, player, rng): Action => {
    // Mostly a suggested type, so a choice keyed to it (Urza's Incubator's
    // cost reduction, Distant Melody's draw) actually gets exercised — out of
    // 350 types a uniform pick almost never names one that matters. Still
    // sometimes anything at all, to keep that path fuzzed. As in
    // `choose-copy`, the `&&` short-circuits and no suggestions means no
    // random draw here; that call count is load-bearing.
    const pool =
      legal.suggested.length > 0 && rng.random() < 0.8 ? legal.suggested : legal.options;
    const creatureType = pool[rng.pickIndex(pool.length)];
    return { type: "choose-creature-type", player, creatureType };
  },
});

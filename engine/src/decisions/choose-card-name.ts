/**
 * Naming a card (rule 201.4) — Pithing Needle's and Meddling Mage's "as this
 * enters, choose a card name", Memoricide's and Wood Sage's as they resolve.
 *
 * The catalogue is every card the registry has that the choice's filter
 * allows (`nameableCardNames`) — a search box over thousands, unusable without
 * a head start, which is what `suggested` is: the names the choice is aimed
 * at (`suggestedCardNames`). A choice limited to a few names (Alhammarret,
 * High Arbiter's revealed cards) offers just those.
 */

import type { Action, LegalAction } from "../actions.js";
import { cardNameLabel, isNameableAs, nameableCardNames, namesOf, suggestedCardNames } from "../card-names.js";
import { defineDecision } from "./define.js";

export const chooseCardName = defineDecision({
  kind: "choose-card-name",

  hasSource: true,

  legal: (ctx, awaiting, player): LegalAction[] => {
    const looked = (awaiting.looked ?? []).flatMap((id) => {
      const object = ctx.state.objects[id];
      return object === undefined ? [] : namesOf(ctx.registry, object);
    });
    return [
      {
        kind: "choose-card-name",
        source: awaiting.source,
        options: awaiting.options ?? nameableCardNames(ctx.registry, awaiting.filter),
        label: cardNameLabel(awaiting.filter),
        suggested:
          awaiting.options !== undefined
            ? [...awaiting.options]
            : suggestedCardNames(ctx.state, ctx.registry, player, awaiting.aim, awaiting.filter, looked),
        ...(awaiting.looked !== undefined ? { looked: [...awaiting.looked] } : {}),
      },
    ];
  },

  whyCannot: (ctx, action, player): string | null => {
    if (action.type !== "choose-card-name") return `${player} is not being asked to choose a card name`;
    const awaiting = ctx.state.awaiting;
    if (awaiting === null || awaiting.kind !== "choose-card-name" || awaiting.player !== player) {
      return `${player} is not being asked to choose a card name`;
    }
    if (awaiting.options !== undefined) {
      return awaiting.options.includes(action.name) ? null : `${action.name} is not one of the names offered`;
    }
    return isNameableAs(ctx.registry, action.name, awaiting.filter)
      ? null
      : `${action.name} is not ${cardNameLabel(awaiting.filter)}`;
  },

  apply: (host, action): void => {
    if (action.type !== "choose-card-name") return;
    host.applyCardNameChoice(action.player, action.name);
  },

  ask: (controller, view, awaiting, player): Action => {
    // The suggestions were worked out into the offer — only the engine could
    // read the chooser's library — so read them back off it.
    const offered = view
      .legalActions()
      .find(
        (a): a is Extract<LegalAction, { kind: "choose-card-name" }> => a.kind === "choose-card-name",
      );
    return {
      type: "choose-card-name",
      player,
      name: controller.chooseCardName(
        view,
        awaiting.source,
        offered?.options ?? awaiting.options ?? [],
        offered?.suggested ?? [],
      ),
    };
  },

  // candidates: deliberately absent, as for a creature type — a rollout
  // can't tell one name from another before the cards are seen, and thousands
  // of candidates would only cost time.

  randomAnswer: (legal, player, rng): Action => {
    // Mostly a suggested name, so a choice that matters (an opponent's
    // commander, a card in the deck) actually gets exercised; sometimes
    // anything at all. With no suggestions, no draw is spent choosing which.
    const pool = legal.suggested.length > 0 && rng.random() < 0.8 ? legal.suggested : legal.options;
    return { type: "choose-card-name", player, name: pool[rng.pickIndex(pool.length)] };
  },
});

/**
 * The definition the monarch's ability object is read through (rule 725 —
 * `GameState.monarchAbility`, made by `Game.setMonarch` the first time anyone
 * becomes the monarch): no colours, no types, and the two inherent triggered
 * abilities of being the monarch. Registered beside the pool, as speed's and
 * rad counters' are; not a card a deck can hold.
 *
 * Rule 725.2: "At the beginning of the monarch's end step, that player draws
 * a card" and "Whenever a creature deals combat damage to the monarch, its
 * controller becomes the monarch" — triggered abilities with no source,
 * controlled by the player who was the monarch as they triggered (an
 * exception to rule 113.8). One object carries both all game; `setMonarch`
 * keeps its controller the current monarch, so "you" is the monarch as
 * either triggers, and both use the stack like any triggered ability.
 */
import { defineCard } from "./define.js";
import type { CardDefinition } from "./define.js";

/** The registry name of the monarch's ability object. */
export const MONARCH_CARD = "The Monarch";

const DRAW_TEXT = "At the beginning of the monarch's end step, that player draws a card.";
const STEAL_TEXT = "Whenever a creature deals combat damage to the monarch, its controller becomes the monarch.";

export const MONARCH_DEFINITIONS: readonly CardDefinition[] = [
  defineCard({
    name: MONARCH_CARD,
    colors: [],
    types: [],
    text: `${DRAW_TEXT}\n${STEAL_TEXT}`,
    triggered: [
      {
        trigger: { on: "step-begins", step: "end", who: "you" },
        targets: [],
        effect: { kind: "draw", amount: 1 },
        resolve: null,
        text: DRAW_TEXT,
      },
      {
        // One trigger per creature (Teysa, Envoy of Ghosts' shape); "its
        // controller" is the creature's, as it last existed if it has left.
        trigger: { on: "deals-damage", who: "any", filter: { type: "creature" }, to: "you", combat: true },
        targets: [],
        effect: { kind: "become-monarch", who: "trigger-controller", via: "combat-damage" },
        resolve: null,
        text: STEAL_TEXT,
      },
    ],
  }),
];

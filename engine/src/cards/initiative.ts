/**
 * The definition the initiative's ability object is read through (rule 726 —
 * `GameState.initiativeAbility`, made by `Game.takeInitiative` the first time
 * anyone takes it): no colours, no types, and the three inherent triggered
 * abilities of having the initiative. Registered beside the pool, as the
 * monarch's is; not a card a deck can hold.
 *
 * Rule 726.2: "At the beginning of the upkeep of the player who has the
 * initiative, that player ventures into Undercity", "Whenever one or more
 * creatures a player controls deal combat damage to the player who has the
 * initiative, the controller of those creatures takes the initiative", and
 * "Whenever a player takes the initiative, that player ventures into
 * Undercity" — sourceless, controlled by the player who had the initiative
 * as they triggered. The object's controller is always that player, so
 * "you" is them; the take-the-initiative trigger fires after the
 * designation has moved, so its "you" is the player who took it (and a
 * player retaking it triggers it again, 726.5).
 *
 * "The controller of those creatures": only the active player's creatures
 * attack (rule 506.2), and only attacking creatures deal combat damage to a
 * player, so it is the active player.
 */
import { defineCard } from "./define.js";
import type { CardDefinition } from "./define.js";

/** The registry name of the initiative's ability object. */
export const INITIATIVE_CARD = "The Initiative";

const STEAL_TEXT = "Whenever one or more creatures a player controls deal combat damage to you, that player takes the initiative.";
const VENTURE_TEXT = "Whenever you take the initiative and at the beginning of your upkeep, venture into Undercity.";

export const INITIATIVE_DEFINITIONS: readonly CardDefinition[] = [
  defineCard({
    name: INITIATIVE_CARD,
    colors: [],
    types: [],
    text: `${STEAL_TEXT}\n${VENTURE_TEXT}`,
    triggered: [
      {
        trigger: { on: "deals-damage-batch", who: "any", filter: { type: "creature" }, to: "you", combat: true },
        targets: [],
        effect: { kind: "take-initiative", who: "active-player", via: "combat-damage" },
        resolve: null,
        text: STEAL_TEXT,
      },
      {
        trigger: { on: "takes-initiative", who: "you" },
        targets: [],
        effect: { kind: "venture", into: "undercity" },
        resolve: null,
        text: VENTURE_TEXT,
      },
      {
        trigger: { on: "step-begins", step: "upkeep", who: "you" },
        targets: [],
        effect: { kind: "venture", into: "undercity" },
        resolve: null,
        text: VENTURE_TEXT,
      },
    ],
  }),
];

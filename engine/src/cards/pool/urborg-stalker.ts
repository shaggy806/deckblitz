import { defineCard } from "../define.js";

// Weatherlight (WTH). EDHREC rank 29382.
//
// Rulings:
//   [2008-04-01] Urborg Stalker's ability will trigger at the beginning of your upkeep as well.
//   [2008-04-01] This ability checks whether the player controls any nonblack, nonland permanents
//     twice: once when it would trigger, and once when it resolves.
//
// Spiritual Sanctuary's intervening-if (rule 603.4): the active player
// controls a matching permanent, whether that's you or an opponent.

const TEXT =
  "At the beginning of each player's upkeep, if that player controls a nonblack, nonland permanent, this creature deals 1 damage to that player.";

const NONBLACK_NONLAND = { notTypes: ["land"], notColors: ["B"], controlledBy: "active-player" } as const;

export default defineCard({
  name: "Urborg Stalker",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      condition: {
        kind: "any",
        of: [
          { kind: "controls", filter: NONBLACK_NONLAND, atLeast: 1 },
          { kind: "opponent-controls", filter: NONBLACK_NONLAND, atLeast: 1 },
        ],
      },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "active-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});

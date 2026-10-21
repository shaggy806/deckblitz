import { defineCard } from "../define.js";

// EDHREC rank 30845.
//
// "If that player controls a Plains" is an intervening-if (rule 603.4) about
// the player whose upkeep it is: either that's you and you control a Plains
// controlled by the active player, or it's an opponent and some opponent
// controls one — together, exactly "the active player controls a Plains".

const TEXT = "At the beginning of each player's upkeep, if that player controls a Plains, they gain 1 life.";

const PLAINS_OF_ACTIVE = { subtype: "Plains", controlledBy: "active-player" } as const;

export default defineCard({
  name: "Spiritual Sanctuary",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      condition: {
        kind: "any",
        of: [
          { kind: "controls", filter: PLAINS_OF_ACTIVE, atLeast: 1 },
          { kind: "opponent-controls", filter: PLAINS_OF_ACTIVE, atLeast: 1 },
        ],
      },
      targets: [],
      effect: { kind: "gain-life", amount: 1, who: "active-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});

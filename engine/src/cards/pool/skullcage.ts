import { defineCard } from "../define.js";

// Rulings:
//   Skullcage's ability deals damage if the player has zero, one, two, five, or more than five
//     cards in hand when its ability resolves.
//   Skullcage doesn't check hand size when it triggers, only when it resolves.

const TEXT =
  "At the beginning of each opponent's upkeep, this artifact deals 2 damage to that player unless they have exactly three or exactly four cards in hand.";

export default defineCard({
  name: "Skullcage",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "not",
          of: { kind: "of-player", player: "active-player", condition: { kind: "hand-size", atLeast: 3, atMost: 4 } },
        },
        then: { kind: "damage", amount: 2, who: "active-player" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// Conspiracy (CNS). EDHREC rank 8902.
//
// "Carnage gets more votes" needs strictly more; a tie draws (the rulings).

const TEXT =
  "Will of the council — At the beginning of your upkeep, starting with you, each player votes for carnage or homage. If carnage gets more votes, sacrifice this artifact and destroy all nonland permanents. If homage gets more votes or the vote is tied, draw a card.";

export default defineCard({
  name: "Coercive Portal",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "vote", for: { options: ["carnage", "homage"] } },
          {
            kind: "conditional",
            condition: { kind: "vote-won", option: 0 },
            then: {
              kind: "sequence",
              effects: [
                { kind: "sacrifice-source" },
                { kind: "destroy-all", filter: { notTypes: ["land"] } },
              ],
            },
            else: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

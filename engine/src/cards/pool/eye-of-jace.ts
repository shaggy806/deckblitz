import { defineCard } from "../define.js";

// Reality Fracture (FRA). EDHREC rank 18990.
//
// Nothing after the sacrifice hangs on it ("sacrifice …, it deals 2 damage
// …, and you gain 2 life" — no "if you do"), so a gone artifact still deals
// the damage, as it last existed (rule 608.2h), and you still gain the life.

const TEXT =
  "At the beginning of your upkeep, surveil 1. Then if there are seven or more cards in your graveyard, sacrifice this artifact, it deals 2 damage to each opponent, and you gain 2 life.";

export default defineCard({
  name: "Eye of Jace",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${TEXT} (To surveil 1, look at the top card of your library. You may put it into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "surveil", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "threshold" },
            then: {
              kind: "sequence",
              effects: [
                { kind: "sacrifice-source" },
                { kind: "damage", amount: 2, who: "each-opponent" },
                { kind: "gain-life", amount: 2 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

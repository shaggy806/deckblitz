import { defineCard } from "../define.js";

// Ruling [2004-10-04]: an intervening-if — checked as the upkeep begins and
// again on resolution.

export default defineCard({
  name: "Thumbscrews",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "At the beginning of your upkeep, if you have five or more cards in hand, this artifact deals 1 damage to target opponent or planeswalker.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "hand-size", atLeast: 5 },
      targets: ["opponent-or-planeswalker"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "At the beginning of your upkeep, if you have five or more cards in hand, this artifact deals 1 damage to target opponent or planeswalker.",
    },
  ],
});

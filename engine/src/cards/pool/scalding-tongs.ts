import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 30512. An intervening-if (rule 603.4): checked
// as the upkeep begins and again on resolution (the 2004-10-04 ruling).

const TEXT =
  "At the beginning of your upkeep, if you have three or fewer cards in hand, this artifact deals 1 damage to target opponent or planeswalker.";

export default defineCard({
  name: "Scalding Tongs",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "hand-size", atMost: 3 },
      targets: ["opponent-or-planeswalker"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});

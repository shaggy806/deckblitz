import { defineCard } from "../define.js";

// EDHREC rank 24582. Thumbscrews' hand-size intervening if.
const TEXT = "At the beginning of your upkeep, if you have seven or more cards in hand, you gain 4 life.";

export default defineCard({
  name: "Ivory Crane Netsuke",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "hand-size", atLeast: 7 },
      targets: [],
      effect: { kind: "gain-life", amount: 4 },
      resolve: null,
      text: TEXT,
    },
  ],
});

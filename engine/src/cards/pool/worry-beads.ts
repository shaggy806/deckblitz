import { defineCard } from "../define.js";

// EDHREC rank 23659.

const TEXT = "At the beginning of each player's upkeep, that player mills a card.";

export default defineCard({
  name: "Worry Beads",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "mill", target: "active-player", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});

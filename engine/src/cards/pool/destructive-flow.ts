import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 20415.

const TEXT = "At the beginning of each player's upkeep, that player sacrifices a nonbasic land of their choice.";

export default defineCard({
  name: "Destructive Flow",
  manaCost: "{B}{R}{G}",
  colors: ["B", "R", "G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "sacrifice", who: "active-player", filter: { type: "land", notSupertype: "basic" }, count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});

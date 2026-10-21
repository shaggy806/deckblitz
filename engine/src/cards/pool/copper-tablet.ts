import { defineCard } from "../define.js";

// EDHREC rank 15801. Sulfuric Vortex's shape, for 1.

const TEXT = "At the beginning of each player's upkeep, this artifact deals 1 damage to that player.";

export default defineCard({
  name: "Copper Tablet",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "active-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});

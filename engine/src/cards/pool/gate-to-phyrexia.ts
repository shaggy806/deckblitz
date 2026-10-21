import { defineCard } from "../define.js";

// EDHREC rank 16066.

const TEXT = "Sacrifice a creature: Destroy target artifact. Activate only during your upkeep and only once each turn.";

export default defineCard({
  name: "Gate to Phyrexia",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "creature-you-control" },
      targets: ["artifact"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      oncePerTurn: true,
      text: TEXT,
    },
  ],
});

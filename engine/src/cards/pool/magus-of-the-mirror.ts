import { defineCard } from "../define.js";

// EDHREC rank 12391.

export default defineCard({
  name: "Magus of the Mirror",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 4,
  toughness: 2,
  text: "{T}, Sacrifice this creature: Exchange life totals with target opponent. Activate only during your upkeep.",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: ["opponent"],
      effect: { kind: "exchange-life-totals", second: { target: 0 } },
      resolve: null,
      text: "{T}, Sacrifice this creature: Exchange life totals with target opponent. Activate only during your upkeep.",
      condition: {
        kind: "all",
        of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }],
      },
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 18340. Future Sight.

export default defineCard({
  name: "Augur of Skulls",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton", "Wizard"],
  power: 1,
  toughness: 1,
  text: "{1}{B}: Regenerate this creature.\nSacrifice this creature: Target player discards two cards. Activate only during your upkeep.",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{1}{B}: Regenerate this creature.",
    },
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      targets: ["player"],
      effect: { kind: "discard", target: 0, amount: 2 },
      resolve: null,
      text: "Sacrifice this creature: Target player discards two cards. Activate only during your upkeep.",
    },
  ],
});

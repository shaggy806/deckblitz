import { defineCard } from "../define.js";

// EDHREC rank 1550.

export default defineCard({
  name: "Creeping Bloodsucker",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 1,
  toughness: 2,
  text: "At the beginning of your upkeep, this creature deals 1 damage to each opponent. You gain life equal to the damage dealt this way.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, who: "each-opponent" },
          // The damage actually dealt: none for a prevented hit (rule 615.1).
          { kind: "gain-life", amount: { damageDealtThisWay: true } },
        ],
      },
      resolve: null,
      text: "At the beginning of your upkeep, this creature deals 1 damage to each opponent. You gain life equal to the damage dealt this way.",
    },
  ],
});

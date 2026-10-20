import { defineCard } from "../define.js";

// EDHREC rank 16617.

export default defineCard({
  name: "Moonfolk Puzzlemaker",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Moonfolk", "Wizard"],
  power: 1,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature becomes tapped, scry 1.",
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: "Whenever this creature becomes tapped, scry 1.",
    },
  ],
});

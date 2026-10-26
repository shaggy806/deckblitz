import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 23701.

export default defineCard({
  name: "Karplusan Wolverine",
  manaCost: "{R}",
  colors: ["R"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Wolverine", "Beast"],
  power: 1,
  toughness: 1,
  text: "Whenever this creature becomes blocked, you may have it deal 1 damage to any target.",
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: ["any-target"],
      effect: {
        kind: "may",
        prompt: "Have Karplusan Wolverine deal 1 damage to the target?",
        effect: { kind: "damage", amount: 1, target: 0 },
      },
      resolve: null,
      text: "Whenever this creature becomes blocked, you may have it deal 1 damage to any target.",
    },
  ],
});

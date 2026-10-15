import { defineCard } from "../define.js";

// EDHREC rank 24733.

export default defineCard({
  name: "Screeching Soulbreaker",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Siren", "Bard"],
  power: 1,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature attacks, it deals 1 damage to each opponent and you gain 1 life.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: "Whenever this creature attacks, it deals 1 damage to each opponent and you gain 1 life.",
    },
  ],
});

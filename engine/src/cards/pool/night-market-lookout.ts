import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 13126.
const TEXT = "Whenever this creature becomes tapped, each opponent loses 1 life and you gain 1 life.";

export default defineCard({
  name: "Night Market Lookout",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

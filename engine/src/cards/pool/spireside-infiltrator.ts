import { defineCard } from "../define.js";

// EDHREC rank 23062.

const TEXT = "Whenever this creature becomes tapped, it deals 1 damage to each opponent.";

export default defineCard({
  name: "Spireside Infiltrator",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "each-opponent" },
      resolve: null,
      text: TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 23062. City of Brass's trigger, aimed at each
// opponent; it fires only on a real untapped-to-tapped change (the ruling).
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

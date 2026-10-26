import { defineCard } from "../define.js";

// EDHREC rank 28935.

export default defineCard({
  name: "Grollub",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 3,
  text: "Whenever this creature is dealt damage, each opponent gains that much life.",
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { triggerValue: true }, who: "each-opponent" },
      resolve: null,
      text: "Whenever this creature is dealt damage, each opponent gains that much life.",
    },
  ],
});

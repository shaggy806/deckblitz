import { defineCard } from "../define.js";

// Mirage. EDHREC rank 23890.

export default defineCard({
  name: "Zebra Unicorn",
  manaCost: "{2}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Unicorn"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature deals damage, you gain that much life.",
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { triggerValue: true } },
      resolve: null,
      text: "Whenever this creature deals damage, you gain that much life.",
    },
  ],
});

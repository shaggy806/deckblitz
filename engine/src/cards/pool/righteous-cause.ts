import { defineCard } from "../define.js";

export default defineCard({
  name: "Righteous Cause",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Whenever a creature attacks, you gain 1 life.",
  triggered: [
    {
      trigger: { on: "attacks", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: "Whenever a creature attacks, you gain 1 life.",
    },
  ],
});

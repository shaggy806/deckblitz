import { defineCard } from "../define.js";

const TEXT = "Whenever a creature attacks you or a planeswalker you control, that creature's controller loses 1 life.";

export default defineCard({
  name: "Blood Reckoning",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "any", attackingYou: true },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});

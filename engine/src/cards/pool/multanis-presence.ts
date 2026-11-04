import { defineCard } from "../define.js";

const TEXT = "Whenever a spell you've cast is countered, draw a card.";

export default defineCard({
  name: "Multani's Presence",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "spell-countered", who: "you" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});

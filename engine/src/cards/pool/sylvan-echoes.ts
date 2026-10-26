import { defineCard } from "../define.js";

// EDHREC rank 30259.

export default defineCard({
  name: "Sylvan Echoes",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "Whenever you clash and win, you may draw a card. (This ability triggers after the clash ends.)",
  triggered: [
    {
      trigger: { on: "clashes", who: "you", won: true },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: "Whenever you clash and win, you may draw a card.",
    },
  ],
});

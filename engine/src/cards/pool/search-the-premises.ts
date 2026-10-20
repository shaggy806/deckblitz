import { defineCard } from "../define.js";

const TEXT =
  "Whenever a creature attacks you or a planeswalker you control, investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";

export default defineCard({
  name: "Search the Premises",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "any", attackingYou: true },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

const ENTER_TEXT = "When this enchantment enters, draw three cards.";
const FREE_TEXT = "As long as you have seven or more cards in hand, you may pay {0} rather than pay cycling costs.";

export default defineCard({
  name: "New Perspectives",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${FREE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "hand-size", atLeast: 7 },
      alternativeCyclingCost: { mana: "{0}" },
      text: FREE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 3 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});

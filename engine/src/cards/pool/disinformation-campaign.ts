import { defineCard } from "../define.js";

const ENTER_TEXT = "When this enchantment enters, you draw a card and each opponent discards a card.";
const SURVEIL_TEXT = "Whenever you surveil, return this enchantment to its owner's hand.";

export default defineCard({
  name: "Disinformation Campaign",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${SURVEIL_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "each-opponent", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "surveils", who: "you" },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: SURVEIL_TEXT,
    },
  ],
});

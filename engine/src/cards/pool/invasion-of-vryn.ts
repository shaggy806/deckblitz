import { defineCard } from "../define.js";
import { SIEGE_REMINDER, siege } from "../helpers.js";

// EDHREC rank 15024.

const ENTER_TEXT = "When this Siege enters, draw three cards, then discard a card.";

export default defineCard({
  name: "Invasion of Vryn",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 4,
  text: `${SIEGE_REMINDER}\n${ENTER_TEXT}`,
  triggered: [
    siege(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of Vryn", "Overloaded Mage-Ring"],
  transform: true,
});

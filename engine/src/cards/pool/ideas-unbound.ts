import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 9907.
//
// Rulings:
//   [2005-06-01] If you don't have three or more cards in hand at the end of turn, you discard
//     what cards you have.
const DISCARD_TEXT = "Discard three cards at the beginning of the next end step.";

export default defineCard({
  name: "Ideas Unbound",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  subtypes: ["Arcane"],
  text: `Draw three cards. ${DISCARD_TEXT}`,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3 },
      {
        kind: "delayed-trigger",
        at: "next-end-step",
        effect: { kind: "discard", target: "you", amount: 3 },
        text: DISCARD_TEXT,
      },
    ],
  },
});

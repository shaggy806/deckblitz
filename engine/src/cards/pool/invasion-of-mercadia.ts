import { defineCard } from "../define.js";
import { SIEGE_REMINDER, siege } from "../helpers.js";

// EDHREC rank 12301.

const ENTER_TEXT = "When this Siege enters, you may discard a card. If you do, draw two cards.";

export default defineCard({
  name: "Invasion of Mercadia",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 4,
  text: `${SIEGE_REMINDER}\n${ENTER_TEXT}`,
  triggered: [
    siege(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // Artist's Talent's "you may discard a card. If you do, draw a card."
      effect: {
        kind: "may",
        prompt: "Discard a card to draw two cards?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: { kind: "draw", amount: 2 } },
          ],
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of Mercadia", "Kyren Flamewright"],
  transform: true,
});

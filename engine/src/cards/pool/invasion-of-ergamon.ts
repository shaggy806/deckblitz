import { defineCard } from "../define.js";
import { SIEGE_REMINDER, siege } from "../helpers.js";

// EDHREC rank 12589.

const ENTER_TEXT =
  "When this Siege enters, create a Treasure token. Then you may discard a card. If you do, draw a card.";

export default defineCard({
  name: "Invasion of Ergamon",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 5,
  text: `${SIEGE_REMINDER}\n${ENTER_TEXT}`,
  triggered: [
    siege(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Treasure Token", count: 1 },
          {
            kind: "may",
            prompt: "Discard a card to draw a card?",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "discard", target: "you", amount: 1 },
                { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: { kind: "draw", amount: 1 } },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of Ergamon", "Truga Cliffcharger"],
  transform: true,
});

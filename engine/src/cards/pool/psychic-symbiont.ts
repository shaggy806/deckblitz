import { defineCard } from "../define.js";

// EDHREC rank 24658.
//
// Rulings:
//   It can target an opponent with no cards in hand; you still draw.

const ETB_TEXT = "When this creature enters, target opponent discards a card and you draw a card.";

export default defineCard({
  name: "Psychic Symbiont",
  manaCost: "{4}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Nightmare", "Horror"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: 0, amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});

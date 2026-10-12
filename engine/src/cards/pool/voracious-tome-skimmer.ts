import { defineCard } from "../define.js";

// EDHREC rank 7406.
//
// "During an opponent's turn" is Katara, Waterbending Master's `not
// your-turn`; "you may pay 1 life. If you do, draw" is Crossway
// Troublemakers' `costLife`.
const TEXT = "Whenever you cast a spell during an opponent's turn, you may pay 1 life. If you do, draw a card.";

export default defineCard({
  name: "Voracious Tome-Skimmer",
  manaCost: "{U/B}{U/B}{U/B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      condition: { kind: "not", of: { kind: "your-turn" } },
      targets: [],
      effect: { kind: "may", prompt: "Pay 1 life to draw a card?", costLife: 1, effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: TEXT,
    },
  ],
});

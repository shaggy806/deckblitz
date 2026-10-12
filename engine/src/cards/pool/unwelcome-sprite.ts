import { defineCard } from "../define.js";

// EDHREC rank 12923.
//
// "During an opponent's turn" is Katara, Waterbending Master's `not
// your-turn`: every other player is an opponent.
const TEXT = "Whenever you cast a spell during an opponent's turn, surveil 2.";

export default defineCard({
  name: "Unwelcome Sprite",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhenever you cast a spell during an opponent's turn, surveil 2. (Look at the top two cards of your library. You may put any number of them into your graveyard and the rest on top of your library in any order.)",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      condition: { kind: "not", of: { kind: "your-turn" } },
      targets: [],
      effect: { kind: "surveil", amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});

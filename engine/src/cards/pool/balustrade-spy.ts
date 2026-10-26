import { defineCard } from "../define.js";

// EDHREC rank 12893.
//
// Rulings:
//   [2017-11-17] If the target player has no land cards in their library, all cards from that
//     library will be revealed and put into their graveyard.
//   [2024-01-12] The land card they reveal, if any, is included in the cards put into their
//     graveyard.

const ENTER_TEXT =
  "When this creature enters, target player reveals cards from the top of their library until they reveal a land card, then puts those cards into their graveyard.";

export default defineCard({
  name: "Balustrade Spy",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Rogue"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      // The land found stays with the rest (no `put`), so it goes to the
      // graveyard with them — the second ruling.
      effect: { kind: "reveal-until", whose: 0, filter: { type: "land" }, rest: "graveyard" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});

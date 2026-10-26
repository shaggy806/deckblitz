import { defineCard } from "../define.js";

// EDHREC rank 15373.
//
// Clash (rule 701.30): the `clash` effect; a win returns the card from the
// graveyard it died to, and only from there (rule 400.7).
//
// Rulings:
//   [2007-10-01] If Ringskipper is removed from the graveyard before the ability resolves, you
//     still clash, but nothing will happen if you win.

export default defineCard({
  name: "Ringskipper",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Wizard"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhen this creature dies, clash with an opponent. If you win, return this card to its owner's hand. (Each clashing player reveals the top card of their library, then puts that card on their choice of the top or bottom. A player wins if their card had a greater mana value.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "clash",
        won: { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
      },
      resolve: null,
      text: "When this creature dies, clash with an opponent. If you win, return this card to its owner's hand.",
    },
  ],
});

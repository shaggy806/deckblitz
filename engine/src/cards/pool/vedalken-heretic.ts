import { defineCard } from "../define.js";

// EDHREC rank 22343.
//
// Rulings:
//   [2009-05-01] Vedalken Heretic's ability triggers when it deals any damage to an opponent, not
//     just combat damage.
export default defineCard({
  name: "Vedalken Heretic",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Vedalken", "Rogue"],
  power: 1,
  toughness: 1,
  text: "Whenever this creature deals damage to an opponent, you may draw a card.",
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "opponent" },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: "Whenever this creature deals damage to an opponent, you may draw a card.",
    },
  ],
});

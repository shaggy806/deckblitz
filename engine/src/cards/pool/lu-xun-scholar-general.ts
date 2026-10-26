import { defineCard } from "../define.js";

// EDHREC rank 17016.
//
// Rulings:
//   [2009-10-01] Despite the similarities between horsemanship and flying, horsemanship doesn't
//     interact with flying or reach.
//   [2009-10-01] Lu Xun's second ability triggers whenever it deals damage to an opponent for any
//     reason. It's not limited to combat damage.

export default defineCard({
  name: "Lu Xun, Scholar General",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 3,
  keywords: ["horsemanship"],
  text: "Horsemanship (This creature can't be blocked except by creatures with horsemanship.)\nWhenever Lu Xun deals damage to an opponent, you may draw a card.",
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "opponent" },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: "Whenever Lu Xun deals damage to an opponent, you may draw a card.",
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 25838.
//
// Rulings:
//   [2009-10-01] Despite the similarities between horsemanship and flying, horsemanship doesn’t
//     interact with flying or reach.
//   [2009-10-01] Wei Night Raiders’s second ability triggers whenever it deals damage to an
//     opponent for any reason. It’s not limited to combat damage.

export default defineCard({
  name: "Wei Night Raiders",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["horsemanship"],
  text: "Horsemanship (This creature can't be blocked except by creatures with horsemanship.)\nWhenever this creature deals damage to an opponent, that player discards a card.",
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "opponent" },
      targets: [],
      effect: { kind: "discard", target: "trigger-player", amount: 1 },
      resolve: null,
      text: "Whenever this creature deals damage to an opponent, that player discards a card.",
    },
  ],
});

import { defineCard } from "../define.js";

// Rulings:
//   [2021-03-19] If a spell or ability's cost includes returning a creature to your hand and paying
//     mana, you can't activate Simian Spirit Guide's mana ability after returning it to your hand.
//     This is because mana abilities must be activated before you begin paying costs.
//
// A mana ability from the hand (rule 605.1a), activated by hand before the cast it pays for: the
// auto-payer never reaches into a hand (`Game.manaSources`).
export default defineCard({
  name: "Simian Spirit Guide",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ape", "Spirit"],
  power: 2,
  toughness: 2,
  text: "Exile this card from your hand: Add {R}.",
  activated: [
    {
      cost: { mana: null, tap: false },
      zone: "hand",
      exilesFromHand: true,
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1 },
      resolve: null,
      text: "Exile this card from your hand: Add {R}.",
    },
  ],
});

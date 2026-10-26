import { defineCard } from "../define.js";

// EDHREC rank 18471.
//
// Rulings:
//   You may tap multiples of these in response to each other because the requirement for 7 cards is checked only at the time the ability is announced and not again when it resolves.

export default defineCard({
  name: "Magus of the Library",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: "{T}: Add {C}.\n{T}: Draw a card. Activate only if you have exactly seven cards in hand.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true },
      condition: { kind: "hand-size", atLeast: 7, atMost: 7 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{T}: Draw a card. Activate only if you have exactly seven cards in hand.",
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 12035.
//
// Rulings:
//   [2017-09-29] The triggered ability of Shapers' Sanctuary resolves before the spell or ability
//     that caused it to trigger.

const TEXT =
  "Whenever a creature you control becomes the target of a spell or ability an opponent controls, you may draw a card.";

export default defineCard({
  name: "Shapers' Sanctuary",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "you-control", filter: { type: "creature" }, byOpponentOnly: true },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: TEXT,
    },
  ],
});

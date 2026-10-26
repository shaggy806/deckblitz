import { defineCard } from "../define.js";

// EDHREC rank 14687.
//
// Rulings:
//   [2008-05-01] An object that's both of the listed colors will cause both abilities to trigger.
//     You can put them on the stack in either order.
const DRAW_TEXT = "Whenever a blue creature you control enters, you may have target player draw a card.";
const DISCARD_TEXT = "Whenever a black creature you control enters, you may have target player discard a card.";

export default defineCard({
  name: "Dire Undercurrents",
  manaCost: "{3}{U/B}{U/B}",
  colors: ["U", "B"],
  types: ["enchantment"],
  text: `${DRAW_TEXT}\n${DISCARD_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature", colors: ["U"] } },
      targets: ["player"],
      effect: {
        kind: "may",
        prompt: "Have the target player draw a card?",
        effect: { kind: "draw", amount: 1, target: 0 },
      },
      resolve: null,
      text: DRAW_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature", colors: ["B"] } },
      targets: ["player"],
      effect: {
        kind: "may",
        prompt: "Have the target player discard a card?",
        effect: { kind: "discard", target: 0, amount: 1 },
      },
      resolve: null,
      text: DISCARD_TEXT,
    },
  ],
});

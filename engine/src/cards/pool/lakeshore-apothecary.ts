import { defineCard } from "../define.js";

// EDHREC rank 20657.
//
// Rulings:
//   [2026-06-29] The triggered ability can trigger only once each turn. It doesn't matter whether
//     Lakeshore Apothecary was on the battlefield when the first card was drawn. If it's not on
//     the battlefield when the second card is drawn, the ability can't trigger at all that turn.
//     It won't trigger when the third or fourth card is drawn.

export default defineCard({
  name: "Lakeshore Apothecary",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 2,
  keywords: ["vigilance"],
  text: "Vigilance\nWhenever you draw your second card each turn, put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever you draw your second card each turn, put a +1/+1 counter on this creature.",
    },
  ],
});

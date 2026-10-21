import { defineCard } from "../define.js";

// Rulings:
//   [2020-06-23] The triggered ability can trigger only once each turn. It doesn't matter if
//     Mystic Skyfish was on the battlefield when the first card was drawn.

export default defineCard({
  name: "Mystic Skyfish",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Fish"],
  power: 3,
  toughness: 1,
  text: "Whenever you draw your second card each turn, this creature gains flying until end of turn.",
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "Whenever you draw your second card each turn, this creature gains flying until end of turn.",
    },
  ],
});

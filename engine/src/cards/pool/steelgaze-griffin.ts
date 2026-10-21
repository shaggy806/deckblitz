import { defineCard } from "../define.js";

// EDHREC rank 29781.
//
// Rulings:
//   [2019-10-04] The triggered ability can trigger only once each turn. It doesn't matter whether
//     the permanent with that ability was on the battlefield when the first card was drawn.

const TEXT = "Whenever you draw your second card each turn, this creature gets +2/+0 until end of turn.";

export default defineCard({
  name: "Steelgaze Griffin",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Griffin"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});

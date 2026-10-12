import { defineCard } from "../define.js";

// EDHREC rank 10656.
//
// Rulings:
//   [2025-11-17] Lands are normally colorless permanents, even if they tap for mana of a certain
//     color.
//   [2025-11-17] The colors are white, blue, black, red, and green. Colorless is not a color.

export default defineCard({
  name: "Shinestriker",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nVivid — When this creature enters, draw cards equal to the number of colors among permanents you control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: { colorsAmong: { controlledBy: "you" } } },
      resolve: null,
      text: "Vivid — When this creature enters, draw cards equal to the number of colors among permanents you control.",
    },
  ],
});

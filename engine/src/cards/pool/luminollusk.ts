import { defineCard } from "../define.js";

// EDHREC rank 22513.
//
// Rulings:
//   [2025-11-17] The colors are white, blue, black, red, and green. Colorless is not a color.
//   [2025-11-17] Lands are normally colorless permanents, even if they tap for mana of a certain
//     color.

const TEXT =
  "Vivid — When this creature enters, you gain life equal to the number of colors among permanents you control.";

export default defineCard({
  name: "Luminollusk",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 4,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { colorsAmong: { controlledBy: "you" } } },
      resolve: null,
      text: TEXT,
    },
  ],
});

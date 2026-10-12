import { defineCard } from "../define.js";

// EDHREC rank 9772.
//
// Rulings:
//   [2025-11-17] Lands are normally colorless permanents, even if they tap for mana of a certain
//     color.
//   [2025-11-17] The value of X is calculated only once, as Shimmercreep's last ability resolves.
//   [2025-11-17] The colors are white, blue, black, red, and green. Colorless is not a color.

export default defineCard({
  name: "Shimmercreep",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 5,
  keywords: ["menace"],
  text: "Menace (This creature can't be blocked except by two or more creatures.)\nVivid — When this creature enters, each opponent loses X life and you gain X life, where X is the number of colors among permanents you control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // X read as it resolves (the ruling); you gain X once, however many
      // opponents lost it (Eriette's shape).
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: { colorsAmong: { controlledBy: "you" } }, who: "each-opponent" },
          { kind: "gain-life", amount: { colorsAmong: { controlledBy: "you" } } },
        ],
      },
      resolve: null,
      text: "Vivid — When this creature enters, each opponent loses X life and you gain X life, where X is the number of colors among permanents you control.",
    },
  ],
});

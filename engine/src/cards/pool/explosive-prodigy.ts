import { defineCard } from "../define.js";

// EDHREC rank 21420.
//
// Rulings:
//   [2025-11-17] The value of X is calculated only once, as Explosive Prodigy's ability resolves.
//   [2025-11-17] Lands are normally colorless permanents, even if they tap for mana of a certain
//     color.
//   [2025-11-17] The colors are white, blue, black, red, and green. Colorless is not a color.

const TEXT =
  "Vivid — When this creature enters, it deals X damage to target creature an opponent controls, where X is the number of colors among permanents you control.";

export default defineCard({
  name: "Explosive Prodigy",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Sorcerer"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      // X read as it resolves (the ruling); the creature is the source.
      effect: { kind: "damage", target: 0, amount: { colorsAmong: { controlledBy: "you" } } },
      resolve: null,
      text: TEXT,
    },
  ],
});

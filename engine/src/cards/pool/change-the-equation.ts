import { defineCard } from "../define.js";

// EDHREC rank 14277. March of the Machine.
//
// Rulings:
//   [2023-04-14] If a spell has {X} in its mana cost, use the value chosen for X when calculating
//     that spell’s mana value.

export default defineCard({
  name: "Change the Equation",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Choose one —\n• Counter target spell with mana value 2 or less.\n• Counter target red or green spell with mana value 6 or less.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Counter target spell with mana value 2 or less.",
        targets: [{ kind: "spell", filter: { manaValue: { op: "lte", n: 2 } } }],
        effect: { kind: "counter", target: 0 },
      },
      {
        text: "Counter target red or green spell with mana value 6 or less.",
        targets: [
          {
            kind: "spell",
            filter: { anyOf: [{ colors: ["R"] }, { colors: ["G"] }], manaValue: { op: "lte", n: 6 } },
          },
        ],
        effect: { kind: "counter", target: 0 },
      },
    ],
  },
});

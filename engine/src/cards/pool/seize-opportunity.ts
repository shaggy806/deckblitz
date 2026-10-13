import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 11518.
//
// Rulings:
//   [2025-04-04] You pay all costs and follow all timing rules for cards played this way. For
//     example, if one of the exiled cards is a land card, you may play it only during your main
//     phase while the stack is empty.

export default defineCard({
  name: "Seize Opportunity",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Choose one —\n• Exile the top two cards of your library. Until the end of your next turn, you may play those cards.\n• Up to two target creatures each get +2/+1 until end of turn.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Exile the top two cards of your library. Until the end of your next turn, you may play those cards.",
        targets: [],
        effect: { kind: "impulse-exile", amount: 2, duration: "your-next-turn" },
      },
      {
        text: "Up to two target creatures each get +2/+1 until end of turn.",
        targets: distinctTargets(2, "creature", { optional: true }),
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: 2, toughness: 1, duration: "end-of-turn" },
            { kind: "modify-pt", target: 1, power: 2, toughness: 1, duration: "end-of-turn" },
          ],
        },
      },
    ],
  },
});

import { defineCard } from "../define.js";

// EDHREC rank 20903.
//
// "The number of cards drawn this way" counts the draws that happened — fewer
// than the greatest power if the library ran short.

const DRAW_TEXT =
  "Draw cards equal to the greatest power among creatures you control. You lose life equal to the number of cards drawn this way.";
const SHRINK_TEXT = "All creatures get -3/-3 until end of turn.";

export default defineCard({
  name: "Rise of the Deathbringer",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["instant"],
  text: `Choose one —\n• ${DRAW_TEXT}\n• ${SHRINK_TEXT}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: DRAW_TEXT,
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "draw",
              amount: { aggregate: "max", of: "power", filter: { type: "creature", controlledBy: "you" } },
            },
            { kind: "lose-life", amount: { thisWay: "drawn" } },
          ],
        },
      },
      {
        text: SHRINK_TEXT,
        effect: { kind: "modify-pt-all", filter: { type: "creature" }, power: -3, toughness: -3, duration: "end-of-turn" },
      },
    ],
  },
});

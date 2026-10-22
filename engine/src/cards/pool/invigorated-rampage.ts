import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 10178.
//
// Rulings:
//   [2017-02-09] If you choose Invigorated Rampage's second mode and one target becomes an illegal
//     target, the remaining target gets +2/+0 and gains trample. It doesn't get +4/+0.

const MODE_1 = "Target creature gets +4/+0 and gains trample until end of turn.";
const MODE_2 = "Two target creatures each get +2/+0 and gain trample until end of turn.";

export default defineCard({
  name: "Invigorated Rampage",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Choose one —\n• ${MODE_1}\n• ${MODE_2}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: MODE_1,
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: 4, toughness: 0, duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
          ],
        },
      },
      {
        text: MODE_2,
        targets: distinctTargets(2, "creature"),
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
            { kind: "modify-pt", target: 1, power: 2, toughness: 0, duration: "end-of-turn" },
            { kind: "grant-keyword", target: 1, keyword: "trample", duration: "end-of-turn" },
          ],
        },
      },
    ],
  },
});

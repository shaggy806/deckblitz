import { defineCard } from "../define.js";

// Playtest card (Mystery Booster). Its rulings: the chosen modes destroy in
// the order printed, each reading sizes as it is then (a lord destroyed as
// small no longer pumps what the medium mode reads), and a negative power or
// toughness counts as it is.

const SMALL = "Destroy all small creatures.";
const MEDIUM = "Destroy all medium creatures.";
const LARGE = "Destroy all large creatures.";

export default defineCard({
  name: "Scaled Destruction",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: `Choose one or more —\n• ${SMALL}\n• ${MEDIUM}\n• ${LARGE}\n(A small creature has total power and toughness 4 or less, medium is 5—8, and large is 9 or more.)`,
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 3,
    modes: [
      {
        text: SMALL,
        effect: { kind: "destroy-all", filter: { type: "creature", totalPowerToughness: { op: "lte", n: 4 } } },
      },
      {
        text: MEDIUM,
        effect: {
          kind: "destroy-all",
          filter: {
            type: "creature",
            totalPowerToughness: { op: "gte", n: 5 },
            not: { totalPowerToughness: { op: "gte", n: 9 } },
          },
        },
      },
      {
        text: LARGE,
        effect: { kind: "destroy-all", filter: { type: "creature", totalPowerToughness: { op: "gte", n: 9 } } },
      },
    ],
  },
});

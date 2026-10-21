import { defineCard } from "../define.js";

// EDHREC rank 26736.
//
// Rulings:
//   In multi-player games it counts artifacts of all opponents.

const TEXT =
  "Gaea's Avenger's power and toughness are each equal to 1 plus the number of artifacts your opponents control.";

export default defineCard({
  name: "Gaea's Avenger",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 0,
  toughness: 0,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "artifact", controlledBy: "opponent" } },
        plusPower: 1,
        plusToughness: 1,
      },
      text: TEXT,
    },
  ],
});

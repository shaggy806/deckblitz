import { defineCard } from "../define.js";

// EDHREC rank 30553.
//
// A toughness-only CDA (People of the Woods' shape): 1 plus every green
// creature on the battlefield, whoever controls it — itself included.

const TEXT = "An-Havva Constable's toughness is equal to 1 plus the number of green creatures on the battlefield.";

export default defineCard({
  name: "An-Havva Constable",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 0,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "creature", colors: ["G"] } },
        plusPower: 0,
        plusToughness: 1,
        only: "toughness",
      },
      text: TEXT,
    },
  ],
});

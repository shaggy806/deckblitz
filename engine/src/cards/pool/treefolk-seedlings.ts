import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 20378. Printed 2/*: a CDA for toughness only
// (People of the Woods' shape), continuously calculated (the ruling).

const TEXT = "Treefolk Seedlings's toughness is equal to the number of Forests you control.";

export default defineCard({
  name: "Treefolk Seedlings",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 2,
  toughness: 0,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { subtype: "Forest", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "toughness",
      },
      text: TEXT,
    },
  ],
});

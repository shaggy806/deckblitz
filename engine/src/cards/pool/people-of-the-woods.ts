import { defineCard } from "../define.js";

// The Dark (DRK). EDHREC rank 30379. Printed 1/*: a CDA for toughness only
// (Wintermoor Commander's shape).

const TEXT = "People of the Woods's toughness is equal to the number of Forests you control.";

export default defineCard({
  name: "People of the Woods",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
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

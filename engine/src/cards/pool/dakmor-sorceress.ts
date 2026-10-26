import { defineCard } from "../define.js";

// Portal Second Age (P02). EDHREC rank 24301. Nightmare's count, for power
// only.

const PT_TEXT = "Dakmor Sorceress's power is equal to the number of Swamps you control.";

export default defineCard({
  name: "Dakmor Sorceress",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard", "Sorcerer"],
  power: 0,
  toughness: 4,
  text: PT_TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { subtype: "Swamp", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: PT_TEXT,
    },
  ],
});

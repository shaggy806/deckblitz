import { defineCard } from "../define.js";

const PT_TEXT = "Sima Yi's power is equal to the number of Swamps you control.";

export default defineCard({
  name: "Sima Yi, Wei Field Marshal",
  manaCost: "{5}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
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

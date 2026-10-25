import { defineCard } from "../define.js";

const PT_TEXT = "Squelching Leeches's power and toughness are each equal to the number of Swamps you control.";

export default defineCard({
  name: "Squelching Leeches",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Leech"],
  power: 0,
  toughness: 0,
  text: PT_TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { subtype: "Swamp", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
});

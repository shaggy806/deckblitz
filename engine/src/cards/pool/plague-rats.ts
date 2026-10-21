import { defineCard } from "../define.js";

// EDHREC rank 26634. Every player's Plague Rats count, this one included.

const PT_TEXT =
  "Plague Rats's power and toughness are each equal to the number of creatures named Plague Rats on the battlefield.";

export default defineCard({
  name: "Plague Rats",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 0,
  toughness: 0,
  text: PT_TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "creature", name: "Plague Rats" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
});

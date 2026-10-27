import { defineCard } from "../define.js";

// EDHREC rank 12048.

const PT_TEXT = "Molimo's power and toughness are each equal to the number of lands you control.";

export default defineCard({
  name: "Molimo, Maro-Sorcerer",
  manaCost: "{4}{G}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "Sorcerer"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: `Trample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)\n${PT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "land", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
});

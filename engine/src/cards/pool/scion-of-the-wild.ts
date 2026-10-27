import { defineCard } from "../define.js";

const PT_TEXT = "Scion of the Wild's power and toughness are each equal to the number of creatures you control.";

export default defineCard({
  name: "Scion of the Wild",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 0,
  toughness: 0,
  text: PT_TEXT,
  static: [
    {
      // A characteristic-defining ability (rule 604.3), counting itself.
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "creature", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
});

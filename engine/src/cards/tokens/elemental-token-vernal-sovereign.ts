import { defineCard } from "../define.js";

// Vernal Sovereign's Elemental token: a characteristic-defining ability
// (rule 604.3), counting itself.
const PT_TEXT = "This token's power and toughness are each equal to the number of creatures you control.";

export default defineCard({
  name: "Elemental Token (Vernal Sovereign)",
  art: "7ec88cb2-7a77-45ae-b2c8-f8d09452d619",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 0,
  text: PT_TEXT,
  static: [
    {
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

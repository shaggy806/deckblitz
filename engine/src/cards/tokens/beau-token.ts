import { defineCard } from "../define.js";

// Bonny Pall, Clearcutter's Beau token.

const TEXT = "Beau's power and toughness are each equal to the number of lands you control.";

export default defineCard({
  name: "Beau Token",
  tokenName: "Beau",
  art: "f1751016-9461-4250-ac07-afe4f5b41095",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Ox"],
  power: 0,
  toughness: 0,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { countOf: { type: "land", controlledBy: "you" } }, plusPower: 0, plusToughness: 0 },
      text: TEXT,
    },
  ],
});

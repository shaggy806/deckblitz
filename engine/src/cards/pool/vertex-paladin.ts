import { defineCard } from "../define.js";

// Winnowing Forces's characteristic-defining P/T (rule 604.3), counting
// itself among the creatures.
const PT_TEXT = "Vertex Paladin's power and toughness are each equal to the number of creatures you control.";

export default defineCard({
  name: "Vertex Paladin",
  art: "https://cards.scryfall.io/art_crop/back/6/c/6c8c9c33-569c-4b67-a18d-4cd0f18d01f4.jpg",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Angel", "Knight"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: `Flying\n${PT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { countOf: { type: "creature", controlledBy: "you" } }, plusPower: 0, plusToughness: 0 },
      text: PT_TEXT,
    },
  ],
  faces: ["Invasion of Xerex", "Vertex Paladin"],
  transform: true,
});

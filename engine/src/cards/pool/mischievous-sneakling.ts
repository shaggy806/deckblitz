import { defineCard } from "../define.js";

export default defineCard({
  name: "Mischievous Sneakling",
  manaCost: "{1}{U/B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 2,
  toughness: 2,
  keywords: ["changeling", "flash"],
  text: "Changeling (This card is every creature type.)\nFlash",
});

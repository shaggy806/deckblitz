import { defineCard } from "../define.js";

export default defineCard({
  name: "Avian Changeling",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 2,
  toughness: 2,
  keywords: ["changeling", "flying"],
  text: "Changeling (This card is every creature type.)\nFlying",
});

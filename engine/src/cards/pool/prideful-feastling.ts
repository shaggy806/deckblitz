import { defineCard } from "../define.js";

export default defineCard({
  name: "Prideful Feastling",
  manaCost: "{2}{W/B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 2,
  toughness: 3,
  keywords: ["changeling", "lifelink"],
  text: "Changeling (This card is every creature type.)\nLifelink",
});

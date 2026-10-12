import { defineCard } from "../define.js";

export default defineCard({
  name: "Woodland Changeling",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 2,
  toughness: 2,
  keywords: ["changeling"],
  text: "Changeling (This card is every creature type.)",
});

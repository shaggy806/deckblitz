import { defineCard } from "../define.js";

export default defineCard({
  name: "Chitinous Graspling",
  manaCost: "{3}{G/U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 3,
  toughness: 4,
  keywords: ["changeling", "reach"],
  text: "Changeling (This card is every creature type.)\nReach",
});

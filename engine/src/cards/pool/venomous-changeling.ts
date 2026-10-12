import { defineCard } from "../define.js";

export default defineCard({
  name: "Venomous Changeling",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 1,
  toughness: 3,
  keywords: ["changeling", "deathtouch"],
  text: "Changeling (This card is every creature type.)\nDeathtouch",
});

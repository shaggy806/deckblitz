import { defineCard } from "../define.js";

// EDHREC rank 25845.

export default defineCard({
  name: "Shu Cavalry",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["horsemanship"],
  text: "Horsemanship (This creature can't be blocked except by creatures with horsemanship.)",
});

import { defineCard } from "../define.js";

// EDHREC rank 25036.

export default defineCard({
  name: "Wei Scout",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Scout"],
  power: 1,
  toughness: 1,
  keywords: ["horsemanship"],
  text: "Horsemanship (This creature can't be blocked except by creatures with horsemanship.)",
});

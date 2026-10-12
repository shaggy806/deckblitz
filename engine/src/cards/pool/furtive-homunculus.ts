import { defineCard } from "../define.js";

export default defineCard({
  name: "Furtive Homunculus",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Homunculus"],
  power: 2,
  toughness: 1,
  keywords: ["skulk"],
  text: "Skulk (This creature can't be blocked by creatures with greater power.)",
});

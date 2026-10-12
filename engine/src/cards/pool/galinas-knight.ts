import { defineCard } from "../define.js";

export default defineCard({
  name: "Galina's Knight",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Knight"],
  power: 2,
  toughness: 2,
  text: "Protection from red",
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
});

import { defineCard } from "../define.js";

export default defineCard({
  name: "Vedalken Outlander",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["artifact", "creature"],
  subtypes: ["Vedalken", "Scout"],
  power: 2,
  toughness: 2,
  text: "Protection from red",
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
});

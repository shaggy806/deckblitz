import { defineCard } from "../define.js";

export default defineCard({
  name: "Nacatl Outlander",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Cat", "Scout"],
  power: 2,
  toughness: 2,
  text: "Protection from blue",
  static: [{ affects: { scope: "self" }, protection: { colors: ["U"] }, text: "Protection from blue" }],
});

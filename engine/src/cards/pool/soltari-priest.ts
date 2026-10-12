import { defineCard } from "../define.js";

export default defineCard({
  name: "Soltari Priest",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Soltari", "Cleric"],
  power: 2,
  toughness: 1,
  keywords: ["shadow"],
  text: "Protection from red\nShadow (This creature can block or be blocked by only creatures with shadow.)",
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
});

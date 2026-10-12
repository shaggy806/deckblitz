import { defineCard } from "../define.js";

export default defineCard({
  name: "Guma",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 2,
  toughness: 2,
  text: "Protection from blue",
  static: [{ affects: { scope: "self" }, protection: { colors: ["U"] }, text: "Protection from blue" }],
});

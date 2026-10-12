import { defineCard } from "../define.js";

export default defineCard({
  name: "Scragnoth",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 4,
  cantBeCountered: true,
  text: "This spell can't be countered.\nProtection from blue",
  static: [{ affects: { scope: "self" }, protection: { colors: ["U"] }, text: "Protection from blue" }],
});

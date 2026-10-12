import { defineCard } from "../define.js";

export default defineCard({
  name: "Thermal Glider",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Rebel"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying, protection from red",
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
});

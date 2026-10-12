import { defineCard } from "../define.js";

export default defineCard({
  name: "Weatherseed Faeries",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying, protection from red",
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
});

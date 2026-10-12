import { defineCard } from "../define.js";

export default defineCard({
  name: "Sea Sprite",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying, protection from red",
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
});

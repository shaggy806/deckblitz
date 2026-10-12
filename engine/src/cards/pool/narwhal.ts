import { defineCard } from "../define.js";

export default defineCard({
  name: "Narwhal",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Whale"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: "First strike, protection from red",
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
});

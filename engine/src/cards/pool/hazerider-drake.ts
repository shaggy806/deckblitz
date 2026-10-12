import { defineCard } from "../define.js";

export default defineCard({
  name: "Hazerider Drake",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying, protection from red",
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
});

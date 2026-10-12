import { defineCard } from "../define.js";

export default defineCard({
  name: "Aven Smokeweaver",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying, protection from red",
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
});

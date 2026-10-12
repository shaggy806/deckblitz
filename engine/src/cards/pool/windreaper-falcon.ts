import { defineCard } from "../define.js";

export default defineCard({
  name: "Windreaper Falcon",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying, protection from blue",
  static: [{ affects: { scope: "self" }, protection: { colors: ["U"] }, text: "Protection from blue" }],
});

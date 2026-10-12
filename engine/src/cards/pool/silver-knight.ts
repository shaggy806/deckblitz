import { defineCard } from "../define.js";

export default defineCard({
  name: "Silver Knight",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: "First strike, protection from red",
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
});

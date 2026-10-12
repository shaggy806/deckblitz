import { defineCard } from "../define.js";

export default defineCard({
  name: "Repentant Blacksmith",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 2,
  text: "Protection from red",
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
});

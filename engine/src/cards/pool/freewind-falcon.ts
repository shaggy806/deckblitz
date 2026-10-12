import { defineCard } from "../define.js";

export default defineCard({
  name: "Freewind Falcon",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying, protection from red",
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
});

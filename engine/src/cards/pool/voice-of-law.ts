import { defineCard } from "../define.js";

export default defineCard({
  name: "Voice of Law",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying, protection from red",
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
});

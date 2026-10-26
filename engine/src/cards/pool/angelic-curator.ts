import { defineCard } from "../define.js";

// EDHREC rank 15430.

export default defineCard({
  name: "Angelic Curator",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Spirit"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying, protection from artifacts",
  static: [{ affects: { scope: "self" }, protection: { types: ["artifact"] }, text: "Protection from artifacts" }],
});

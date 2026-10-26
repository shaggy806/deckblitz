import { defineCard } from "../define.js";

// EDHREC rank 27669.

export default defineCard({
  name: "Nacatl Savage",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat", "Warrior"],
  power: 2,
  toughness: 1,
  text: "Protection from artifacts",
  static: [{ affects: { scope: "self" }, protection: { types: ["artifact"] }, text: "Protection from artifacts" }],
});

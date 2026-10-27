import { defineCard } from "../define.js";

// EDHREC rank 31484.

export default defineCard({
  name: "Tel-Jilad Outrider",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 3,
  toughness: 1,
  text: "Protection from artifacts",
  static: [{ affects: { scope: "self" }, protection: { types: ["artifact"] }, text: "Protection from artifacts" }],
});

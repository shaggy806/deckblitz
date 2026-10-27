import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 28990.

export default defineCard({
  name: "Tel-Jilad Archers",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Archer"],
  power: 2,
  toughness: 4,
  keywords: ["reach"],
  text: "Reach (This creature can block creatures with flying.)\nProtection from artifacts",
  static: [{ affects: { scope: "self" }, protection: { types: ["artifact"] }, text: "Protection from artifacts" }],
});

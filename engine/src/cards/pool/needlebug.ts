import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 29494.

export default defineCard({
  name: "Needlebug",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Insect"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: "Flash\nProtection from artifacts",
  static: [{ affects: { scope: "self" }, protection: { types: ["artifact"] }, text: "Protection from artifacts" }],
});

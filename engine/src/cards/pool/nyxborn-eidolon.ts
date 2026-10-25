import { defineCard } from "../define.js";

// EDHREC rank 26622.

export default defineCard({
  name: "Nyxborn Eidolon",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment", "creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 1,
  bestow: "{4}{B}",
  text: "Bestow {4}{B} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nEnchanted creature gets +2/+1.",
  static: [{ affects: { scope: "attached" }, grantPt: [2, 1], text: "Enchanted creature gets +2/+1." }],
});

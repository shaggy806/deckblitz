import { defineCard } from "../define.js";

// EDHREC rank 26138.

export default defineCard({
  name: "Nyxborn Triton",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment", "creature"],
  subtypes: ["Merfolk"],
  power: 2,
  toughness: 3,
  bestow: "{4}{U}",
  text: "Bestow {4}{U} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nEnchanted creature gets +2/+3.",
  static: [{ affects: { scope: "attached" }, grantPt: [2, 3], text: "Enchanted creature gets +2/+3." }],
});

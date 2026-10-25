import { defineCard } from "../define.js";

// EDHREC rank 20802.

export default defineCard({
  name: "Nyxborn Rollicker",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment", "creature"],
  subtypes: ["Satyr"],
  power: 1,
  toughness: 1,
  bestow: "{1}{R}",
  text: "Bestow {1}{R} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nEnchanted creature gets +1/+1.",
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Enchanted creature gets +1/+1." }],
});

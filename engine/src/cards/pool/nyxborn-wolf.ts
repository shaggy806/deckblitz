import { defineCard } from "../define.js";

// EDHREC rank 23213.

export default defineCard({
  name: "Nyxborn Wolf",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment", "creature"],
  subtypes: ["Wolf"],
  power: 3,
  toughness: 1,
  bestow: "{4}{G}",
  text: "Bestow {4}{G} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nEnchanted creature gets +3/+1.",
  static: [{ affects: { scope: "attached" }, grantPt: [3, 1], text: "Enchanted creature gets +3/+1." }],
});

import { defineCard } from "../define.js";

// EDHREC rank 21556.

export default defineCard({
  name: "Nyxborn Shieldmate",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 2,
  bestow: "{2}{W}",
  text: "Bestow {2}{W} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nEnchanted creature gets +1/+2.",
  static: [{ affects: { scope: "attached" }, grantPt: [1, 2], text: "Enchanted creature gets +1/+2." }],
});

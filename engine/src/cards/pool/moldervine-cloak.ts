import { defineCard } from "../define.js";

export default defineCard({
  name: "Moldervine Cloak",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  dredge: 2,
  text: "Enchant creature\nEnchanted creature gets +3/+3.\nDredge 2 (If you would draw a card, you may mill two cards instead. If you do, return this card from your graveyard to your hand.)",
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [3, 3], text: "Enchanted creature gets +3/+3." }],
});

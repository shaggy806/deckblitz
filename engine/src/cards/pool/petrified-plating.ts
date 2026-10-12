import { defineCard } from "../define.js";

export default defineCard({
  name: "Petrified Plating",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  suspend: { n: 2, cost: "{G}" },
  text: "Enchant creature\nEnchanted creature gets +2/+2.\nSuspend 2—{G} (Rather than cast this card from your hand, you may pay {G} and exile it with two time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost.)",
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], text: "Enchanted creature gets +2/+2." }],
});

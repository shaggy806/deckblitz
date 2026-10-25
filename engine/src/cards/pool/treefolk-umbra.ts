import { defineCard } from "../define.js";

const TEXT =
  "Enchanted creature gets +0/+2 and assigns combat damage equal to its toughness rather than its power.";

// Ruling: only the combat damage it assigns changes — its power doesn't.
export default defineCard({
  name: "Treefolk Umbra",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["umbra-armor"],
  text: `Enchant creature\n${TEXT}\nUmbra armor (If enchanted creature would be destroyed, instead remove all damage from it and destroy this Aura.)`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [0, 2], combatDamageByToughness: "always", text: TEXT }],
});

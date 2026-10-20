import { defineCard } from "../define.js";

// EDHREC rank 19267. Control Magic's shape (`controlEnchanted`, layer 2) with
// a creature sacrificed as an additional cost to cast it.

export default defineCard({
  name: "Grafted Identity",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "As an additional cost to cast this spell, sacrifice a creature.\nEnchant creature\nYou control enchanted creature.\nEnchanted creature gets +1/+1.",
  targets: ["creature"],
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  controlEnchanted: true,
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Enchanted creature gets +1/+1." }],
});

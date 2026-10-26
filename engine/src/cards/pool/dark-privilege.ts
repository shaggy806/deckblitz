import { defineCard } from "../define.js";

// Visions (VIS). EDHREC rank 11651. Any creature its controller controls pays
// the sacrifice — the enchanted creature itself included.

export default defineCard({
  name: "Dark Privilege",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +1/+1.\nSacrifice a creature: Regenerate enchanted creature.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "regenerate", target: "attached" },
      resolve: null,
      text: "Sacrifice a creature: Regenerate enchanted creature.",
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Enchanted creature gets +1/+1." }],
});

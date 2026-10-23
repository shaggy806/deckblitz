import { defineCard } from "../define.js";

export default defineCard({
  name: "Choking Restraints",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature can't attack or block.\n{3}{W}{W}, Sacrifice this Aura: Exile enchanted creature.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{3}{W}{W}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "exile", target: "attached" },
      resolve: null,
      text: "{3}{W}{W}, Sacrifice this Aura: Exile enchanted creature.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      text: "Enchanted creature can't attack or block.",
    },
  ],
});

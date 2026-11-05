import { defineCard } from "../define.js";

// EDHREC rank 29045.

export default defineCard({
  name: "Crown of Suspicion",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +2/-1.\nSacrifice this Aura: Enchanted creature and other creatures that share a creature type with it get +2/-1 until end of turn.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", sharesCreatureTypeWith: "attached" },
        power: 2,
        toughness: -1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Sacrifice this Aura: Enchanted creature and other creatures that share a creature type with it get +2/-1 until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, -1],
      text: "Enchanted creature gets +2/-1.",
    },
  ],
});

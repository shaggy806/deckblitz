import { defineCard } from "../define.js";

// Sacrificed to pay for its ability, the Aura is gone as it
// resolves: "enchanted creature" is the creature it was attached to (rule
// 608.2h), and the creatures blocking it are read now.
const SAC_TEXT = "Sacrifice this Aura: Destroy all non-Wall creatures blocking enchanted creature.";

export default defineCard({
  name: "Coils of the Medusa",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +1/-1.\n${SAC_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [1, -1], text: "Enchanted creature gets +1/-1." }],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "destroy-all",
        filter: {
          type: "creature",
          notSubtypes: ["Wall"],
          blockingRelation: { relation: "blocking", of: "host" },
        },
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 19628. A granted ability, so it's the enchanted creature's
// controller's upkeep, and they choose the creature (the rulings).

export default defineCard({
  name: "Inevitable End",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature has \"At the beginning of your upkeep, sacrifice a creature.\"",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: [],
          effect: { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
          resolve: null,
          text: "At the beginning of your upkeep, sacrifice a creature.",
        },
      ],
      text: "Enchanted creature has \"At the beginning of your upkeep, sacrifice a creature.\"",
    },
  ],
});

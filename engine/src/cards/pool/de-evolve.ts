import { defineCard } from "../define.js";

export default defineCard({
  name: "De-evolve",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets -4/-0, can't block, and is a Salamander. (It loses all other creature types.)\nThreshold — At the beginning of each upkeep, if there are seven or more cards in your graveyard, exile enchanted creature.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [-4, 0],
      restrictions: ["cant-block"],
      // Every creature type goes; its other subtypes stay (rule 205.1a).
      setSubtypes: ["Salamander"],
      text: "Enchanted creature gets -4/-0, can't block, and is a Salamander.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      // Intervening-if (rule 603.4): this Aura's controller's graveyard.
      condition: { kind: "threshold" },
      targets: [],
      effect: { kind: "exile", target: "attached" },
      resolve: null,
      text: "Threshold — At the beginning of each upkeep, if there are seven or more cards in your graveyard, exile enchanted creature.",
    },
  ],
});

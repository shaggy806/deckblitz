import { defineCard } from "../define.js";

// EDHREC rank 26956. "Is a Demon Spirit" replaces the creature's creature types (rule 205.1a).

export default defineCard({
  name: "Oni Possession",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nAt the beginning of your upkeep, sacrifice a creature.\nEnchanted creature gets +3/+3 and has trample.\nEnchanted creature is a Demon Spirit.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, sacrifice a creature.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 3],
      grantKeywords: ["trample"],
      text: "Enchanted creature gets +3/+3 and has trample.",
    },
    {
      affects: { scope: "attached" },
      setSubtypes: ["Demon", "Spirit"],
      text: "Enchanted creature is a Demon Spirit.",
    },
  ],
});

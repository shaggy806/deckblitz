import { defineCard } from "../define.js";

export default defineCard({
  name: "Demonic Appetite",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature you control\nEnchanted creature gets +3/+3.\nAt the beginning of your upkeep, sacrifice a creature.",
  // "Enchant creature you control": the Aura goes at the state-based check
  // if either it or the creature changes hands (rule 303.4c — the rulings).
  targets: ["creature-you-control"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      // Any creature — the enchanted one included (the rulings).
      effect: { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, sacrifice a creature.",
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [3, 3], text: "Enchanted creature gets +3/+3." }],
});

import { defineCard } from "../define.js";

// EDHREC rank 30706. Primal Cocoon's two triggers, each setting up Thawing
// Glaciers' "at the beginning of the next cleanup step" delayed trigger.
const SAC_TEXT = "When enchanted creature attacks or blocks, sacrifice this Aura at the beginning of the next cleanup step.";
const SAC_LATER = {
  kind: "delayed-trigger",
  at: "next-cleanup",
  effect: { kind: "sacrifice-source" },
  text: "Sacrifice this Aura.",
} as const;

export default defineCard({
  name: "Cunning",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +3/+3.\n${SAC_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [3, 3], text: "Enchanted creature gets +3/+3." }],
  triggered: [
    { trigger: { on: "attacks", who: "attached" }, targets: [], effect: SAC_LATER, resolve: null, text: SAC_TEXT },
    { trigger: { on: "blocks", who: "attached" }, targets: [], effect: SAC_LATER, resolve: null, text: SAC_TEXT },
  ],
});

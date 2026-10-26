import { defineCard } from "../define.js";

// EDHREC rank 29973.
const SAC_TEXT = "When enchanted creature becomes the target of a spell, sacrifice this Aura.";

export default defineCard({
  name: "Spectral Prison",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature doesn't untap during its controller's untap step.\n${SAC_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: "Enchanted creature doesn't untap during its controller's untap step.",
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-target", who: "attached", spellOnly: true },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});

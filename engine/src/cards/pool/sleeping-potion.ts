import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 29894.

export default defineCard({
  name: "Sleeping Potion",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nWhen this Aura enters, tap enchanted creature.\nEnchanted creature doesn't untap during its controller's untap step.\nWhen enchanted creature becomes the target of a spell or ability, sacrifice this Aura.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap", target: "attached" },
      resolve: null,
      text: "When this Aura enters, tap enchanted creature.",
    },
    {
      trigger: { on: "becomes-target", who: "attached", targeterNotTarget: true },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "When enchanted creature becomes the target of a spell or ability, sacrifice this Aura.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: "Enchanted creature doesn't untap during its controller's untap step.",
    },
  ],
});

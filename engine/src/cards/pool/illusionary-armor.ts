import { defineCard } from "../define.js";

const SACRIFICE_TEXT = "When enchanted creature becomes the target of a spell or ability, sacrifice this Aura.";

export default defineCard({
  name: "Illusionary Armor",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +4/+4.\n${SACRIFICE_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [4, 4], text: "Enchanted creature gets +4/+4." }],
  triggered: [
    {
      trigger: { on: "becomes-target", who: "attached", targeterNotTarget: true },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: SACRIFICE_TEXT,
    },
  ],
});

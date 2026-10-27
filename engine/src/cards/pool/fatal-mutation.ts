import { defineCard } from "../define.js";

const TEXT = "When enchanted creature is turned face up, destroy it. It can't be regenerated.";

export default defineCard({
  name: "Fatal Mutation",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "attached" },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object", cantBeRegenerated: true },
      resolve: null,
      text: TEXT,
    },
  ],
});

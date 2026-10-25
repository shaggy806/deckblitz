import { defineCard } from "../define.js";

// Cracked Skull's trigger: the creature enchanted as it triggered is the one
// destroyed, wherever the Aura is by then (its ruling).

const TEXT = "When enchanted creature is dealt damage, destroy it.";

export default defineCard({
  name: "Mire Blight",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "attached" },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object" },
      resolve: null,
      text: TEXT,
    },
  ],
});

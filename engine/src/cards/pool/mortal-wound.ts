import { defineCard } from "../define.js";

// Visions (VIS). EDHREC rank 26595. Cracked Skull's damage trigger.
const DAMAGE_TEXT = "When enchanted creature is dealt damage, destroy it.";

export default defineCard({
  name: "Mortal Wound",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${DAMAGE_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "attached" },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object" },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});

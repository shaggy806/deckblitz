import { defineCard } from "../define.js";

// EDHREC rank 18269.
//
// Spiteful Shadows' trigger: "its controller" is the trigger player — the
// enchanted creature's controller — who loses the damage dealt as life.

const TEXT = "Whenever enchanted creature is dealt damage, its controller loses that much life.";

export default defineCard({
  name: "Ragged Veins",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "attached" },
      targets: [],
      effect: { kind: "lose-life", amount: { triggerValue: true }, who: "trigger-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});

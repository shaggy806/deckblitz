import { defineCard } from "../define.js";

// "Destroy enchanted permanent" reads "attached": with the Aura gone, the
// permanent it last enchanted (the first ruling); moved, its new host (the
// second).
export default defineCard({
  name: "Quiet Disrepair",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant artifact or enchantment\nAt the beginning of your upkeep, choose one —\n• Destroy enchanted permanent.\n• You gain 2 life.",
  targets: ["artifact-or-enchantment"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Destroy enchanted permanent.",
            effect: { kind: "destroy", target: "attached" },
          },
          { text: "You gain 2 life.", effect: { kind: "gain-life", amount: 2 } },
        ],
      },
      resolve: null,
      text: "At the beginning of your upkeep, choose one —",
    },
  ],
});

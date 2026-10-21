import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 24324.
//
// "Destroy it" is the land that became tapped — the trigger object
// (Cryoshatter's shape).

const TEXT = "When enchanted land becomes tapped, destroy it.";

export default defineCard({
  name: "Blight",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${TEXT}`,
  targets: ["land"],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "attached" },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object" },
      resolve: null,
      text: TEXT,
    },
  ],
});

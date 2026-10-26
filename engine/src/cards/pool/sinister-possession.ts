import { defineCard } from "../define.js";

// EDHREC rank 18579.
//
// The trigger object is the enchanted creature, so `trigger-controller` is
// its controller; a blocker triggers once however many creatures it blocks.

const TEXT = "Whenever enchanted creature attacks or blocks, its controller loses 2 life.";

export default defineCard({
  name: "Sinister Possession",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: { kind: "lose-life", amount: 2, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocks", who: "attached" },
      targets: [],
      effect: { kind: "lose-life", amount: 2, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});

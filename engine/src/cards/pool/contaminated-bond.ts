import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 19947. Nettling Curse's trigger pair.

const TEXT = "Whenever enchanted creature attacks or blocks, its controller loses 3 life.";

export default defineCard({
  name: "Contaminated Bond",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature (Target a creature as you cast this. This card enters attached to that creature.)\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: { kind: "lose-life", amount: 3, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocks", who: "attached" },
      targets: [],
      effect: { kind: "lose-life", amount: 3, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});

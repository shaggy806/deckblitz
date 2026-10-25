import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 29099. "Its controller" is the enchanted
// creature's controller as it left (`trigger-controller`, last known).

const TEXT = "When enchanted creature leaves the battlefield, its controller sacrifices a creature of their choice.";

export default defineCard({
  name: "Funeral March",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "attached" },
      targets: [],
      effect: { kind: "sacrifice", who: "trigger-controller", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});

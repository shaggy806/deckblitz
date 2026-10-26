import { defineCard } from "../define.js";

// Visions (VIS). EDHREC rank 21401. Decomposition's dies trigger: "its
// controller" is the creature's as it died, and its power and toughness are
// read as it last existed on the battlefield (rule 603.10a); "you" is the
// Aura's controller.

const TEXT = "When enchanted creature dies, its controller loses life equal to its power and you gain life equal to its toughness.";

export default defineCard({
  name: "Death Watch",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: { powerOf: "trigger-object" }, who: "trigger-controller" },
          { kind: "gain-life", amount: { toughnessOf: "trigger-object" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

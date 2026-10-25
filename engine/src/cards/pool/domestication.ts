import { defineCard } from "../define.js";

// EDHREC rank 23184. Control Magic's control, and an intervening-if end-step
// sacrifice: the power is checked as the step begins and again as it
// resolves (the rulings).

const SAC_TEXT =
  "At the beginning of your end step, if enchanted creature's power is 4 or greater, sacrifice this Aura.";

export default defineCard({
  name: "Domestication",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nYou control enchanted creature.\n${SAC_TEXT}`,
  targets: ["creature"],
  controlEnchanted: true,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "source", filter: { attachedTo: { power: { op: "gte", n: 4 } } } },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});

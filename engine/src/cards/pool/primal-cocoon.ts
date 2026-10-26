import { defineCard } from "../define.js";

// Its upkeep trigger is its controller's upkeep, whoever controls the creature;
// the counters stay on the creature after the Aura goes (its rulings).
const SAC_TEXT = "When enchanted creature attacks or blocks, sacrifice this Aura.";

export default defineCard({
  name: "Primal Cocoon",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nAt the beginning of your upkeep, put a +1/+1 counter on enchanted creature.\n${SAC_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "attached", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, put a +1/+1 counter on enchanted creature.",
    },
    { trigger: { on: "attacks", who: "attached" }, targets: [], effect: { kind: "sacrifice-source" }, resolve: null, text: SAC_TEXT },
    { trigger: { on: "blocks", who: "attached" }, targets: [], effect: { kind: "sacrifice-source" }, resolve: null, text: SAC_TEXT },
  ],
});

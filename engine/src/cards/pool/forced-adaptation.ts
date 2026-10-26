import { defineCard } from "../define.js";

// EDHREC rank 8456. Primal Cocoon's upkeep trigger.
//
// Rulings:
//   [2013-01-24] The creature that gets the +1/+1 counter is the creature enchanted by Forced
//     Adaptation when the ability resolves.
//   [2013-01-24] If Forced Adaptation’s ability triggers but Forced Adaptation isn’t on the
//     battlefield when the ability resolves, put a +1/+1 counter on the creature it was enchanting
//     when it left the battlefield.

export default defineCard({
  name: "Forced Adaptation",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nAt the beginning of your upkeep, put a +1/+1 counter on enchanted creature.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "attached", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, put a +1/+1 counter on enchanted creature.",
    },
  ],
});

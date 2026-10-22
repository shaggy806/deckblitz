import { defineCard } from "../define.js";

// Ice Age. Mind Control's `controlEnchanted`, with Breeding Pit's upkeep
// punisher on the Aura's own controller.

const UPKEEP_TEXT = "At the beginning of your upkeep, sacrifice this Aura unless you pay {1}{U}.";

export default defineCard({
  name: "Binding Grasp",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${UPKEEP_TEXT}\nYou control enchanted creature.\nEnchanted creature gets +0/+1.`,
  targets: ["creature"],
  controlEnchanted: true,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{1}{U}", text: "Pay {1}{U}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [0, 1], text: "Enchanted creature gets +0/+1." }],
});

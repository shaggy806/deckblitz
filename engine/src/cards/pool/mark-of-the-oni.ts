import { defineCard } from "../define.js";

const END_TEXT = "At the beginning of the end step, if you control no Demons, sacrifice this Aura.";

export default defineCard({
  name: "Mark of the Oni",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nYou control enchanted creature.\n${END_TEXT}`,
  targets: ["creature"],
  controlEnchanted: true,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "not", of: { kind: "controls", filter: { subtype: "Demon" }, atLeast: 1 } },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: END_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

const TEXT = "Whenever a source deals damage to this creature, that source's controller mills that many cards.";

export default defineCard({
  name: "Belltower Sphinx",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 2,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "any", to: "self" },
      targets: [],
      effect: { kind: "mill", target: "trigger-controller", amount: { triggerValue: true } },
      resolve: null,
      text: TEXT,
    },
  ],
});

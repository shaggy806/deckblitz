import { defineCard } from "../define.js";

// "Whenever this creature deals damage" names no recipient, so it fires once
// per simultaneous damage event for the total (rule 603.2c — Doubtless One's
// shape).
const TEXT = "Whenever this creature deals damage, you gain that much life.";

export default defineCard({
  name: "El-Hajjâj",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { triggerValue: true } },
      resolve: null,
      text: TEXT,
    },
  ],
});

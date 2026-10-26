import { defineCard } from "../define.js";

const TEXT = "When enchanted creature dies, return that card to the battlefield under your control.";

export default defineCard({
  name: "Unhallowed Pact",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "trigger-object", underYourControl: true },
      resolve: null,
      text: TEXT,
    },
  ],
});

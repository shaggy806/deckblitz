import { defineCard } from "../define.js";

const TEXT = "Whenever an opponent taps a Mountain for mana, you may gain 1 life.";

export default defineCard({
  name: "Sanctimony",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "opponent", filter: { subtype: "Mountain" } },
      targets: [],
      effect: { kind: "may", prompt: "Gain 1 life?", effect: { kind: "gain-life", amount: 1 } },
      resolve: null,
      text: TEXT,
    },
  ],
});

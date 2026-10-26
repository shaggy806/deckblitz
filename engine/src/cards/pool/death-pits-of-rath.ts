import { defineCard } from "../define.js";

// EDHREC rank 19310.

export default defineCard({
  name: "Death Pits of Rath",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "Whenever a creature is dealt damage, destroy it. It can't be regenerated.",
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object", cantBeRegenerated: true },
      resolve: null,
      text: "Whenever a creature is dealt damage, destroy it. It can't be regenerated.",
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 24092.

export default defineCard({
  name: "Mark of Eviction",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nAt the beginning of your upkeep, return enchanted creature and all Auras attached to that creature to their owners' hands.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand-all", filter: { subtype: "Aura", attachedToObject: "attached" } },
          { kind: "return-to-hand", target: "attached" },
        ],
      },
      resolve: null,
      text: "At the beginning of your upkeep, return enchanted creature and all Auras attached to that creature to their owners' hands.",
    },
  ],
});

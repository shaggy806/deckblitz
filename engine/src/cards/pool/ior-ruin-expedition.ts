import { defineCard } from "../define.js";

// Zendikar (ZEN). EDHREC rank 15115. Khalni Heart Expedition's shape.

export default defineCard({
  name: "Ior Ruin Expedition",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "Landfall — Whenever a land you control enters, you may put a quest counter on this enchantment.\nRemove three quest counters from this enchantment and sacrifice it: Draw two cards.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a quest counter on Ior Ruin Expedition?",
        effect: { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
      },
      resolve: null,
      text: "Landfall — Whenever a land you control enters, you may put a quest counter on this enchantment.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "quest", count: 3 }, sacrifice: "self" },
      targets: [],
      effect: { kind: "draw", amount: 2 },
      resolve: null,
      text: "Remove three quest counters from this enchantment and sacrifice it: Draw two cards.",
    },
  ],
});

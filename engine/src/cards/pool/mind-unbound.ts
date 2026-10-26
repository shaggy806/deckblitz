import { defineCard } from "../define.js";

// EDHREC rank 14064.
//
// The draw is mandatory and counts the lore counters as it resolves, the one
// just put on included (the ruling).
const TEXT =
  "At the beginning of your upkeep, put a lore counter on this enchantment, then draw a card for each lore counter on this enchantment.";

export default defineCard({
  name: "Mind Unbound",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "lore", amount: 1 },
          { kind: "draw", amount: { countersOn: "source", counter: "lore" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

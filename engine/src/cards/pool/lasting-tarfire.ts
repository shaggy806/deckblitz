import { defineCard } from "../define.js";

// EDHREC rank 6251.

export default defineCard({
  name: "Lasting Tarfire",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "At the beginning of each end step, if you put a counter on a creature this turn, this enchantment deals 2 damage to each opponent.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "each-opponent" },
      resolve: null,
      text: "At the beginning of each end step, if you put a counter on a creature this turn, this enchantment deals 2 damage to each opponent.",
      condition: { kind: "counters-put-this-turn", onType: "creature" },
    },
  ],
});

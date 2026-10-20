import { defineCard } from "../define.js";

export default defineCard({
  name: "Feast of Sanity",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "Whenever you discard a card, this enchantment deals 1 damage to any target and you gain 1 life.",
  triggered: [
    {
      trigger: { on: "discards", who: "you", perCard: true },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: "Whenever you discard a card, this enchantment deals 1 damage to any target and you gain 1 life.",
    },
  ],
});

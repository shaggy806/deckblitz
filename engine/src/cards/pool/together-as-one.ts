import { defineCard } from "../define.js";

// EDHREC rank 16126. Converge: the colours of mana actually spent on this
// spell, cost increases included; a copy or a free cast spent none (the
// rulings) — Painful Truths' amount.
const X = { colorsSpentOf: "source" } as const;

export default defineCard({
  name: "Together as One",
  manaCost: "{6}",
  colors: [],
  types: ["sorcery"],
  text: "Converge — Target player draws X cards, Together as One deals X damage to any target, and you gain X life, where X is the number of colors of mana spent to cast this spell.",
  targets: ["player", "any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: X, target: 0 },
      { kind: "damage", amount: X, target: 1 },
      { kind: "gain-life", amount: X },
    ],
  },
});

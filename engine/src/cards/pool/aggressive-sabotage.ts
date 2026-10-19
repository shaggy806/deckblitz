import { defineCard } from "../define.js";

// EDHREC rank 25378.
//
// Rulings:
//   [2022-09-09] If you kick Aggressive Sabotage, it deals 3 damage to that player in addition to
//     making them discard two cards, not instead of making them discard two cards.

export default defineCard({
  name: "Aggressive Sabotage",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Kicker {R} (You may pay an additional {R} as you cast this spell.)\nTarget player discards two cards. If this spell was kicked, it deals 3 damage to that player.",
  targets: ["player"],
  effect: { kind: "discard", target: 0, amount: 2 },
  kicker: {
    cost: "{R}",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "discard", target: 0, amount: 2 },
        { kind: "damage", amount: 3, target: 0 },
      ],
    },
  },
});

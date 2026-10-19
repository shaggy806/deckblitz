import { defineCard } from "../define.js";

// EDHREC rank 23516.

export default defineCard({
  name: "Phyrexian Espionage",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Kicker {1}{B} (You may pay an additional {1}{B} as you cast this spell.)\nDraw two cards. If this spell was kicked, each opponent discards a card.",
  targets: [],
  effect: { kind: "draw", amount: 2 },
  kicker: {
    cost: "{1}{B}",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "draw", amount: 2 },
        { kind: "discard", target: "each-opponent", amount: 1 },
      ],
    },
  },
});

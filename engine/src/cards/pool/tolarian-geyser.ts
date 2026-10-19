import { defineCard } from "../define.js";

// EDHREC rank 25454.

export default defineCard({
  name: "Tolarian Geyser",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Kicker {W} (You may pay an additional {W} as you cast this spell.)\nReturn target creature to its owner's hand. Draw a card. If this spell was kicked, you gain 3 life.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
  kicker: {
    cost: "{W}",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "return-to-hand", target: 0 },
        { kind: "draw", amount: 1 },
        { kind: "gain-life", amount: 3 },
      ],
    },
  },
});

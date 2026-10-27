import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 30548.
//
// Rulings:
//   [2004-10-04] The player gets the option to pay when this spell resolves.

const TEXT =
  "Target player discards a card at random. Then that player discards another card at random unless they pay {1}.";

export default defineCard({
  name: "Flay",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: 0, amount: 1, random: true },
      {
        kind: "unless",
        chooser: 0,
        options: [{ pay: "{1}", text: "Pay {1}" }],
        otherwise: { kind: "discard", target: 0, amount: 1, random: true },
      },
    ],
  },
});

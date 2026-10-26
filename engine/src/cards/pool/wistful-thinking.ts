import { defineCard } from "../define.js";

// EDHREC rank 24790.

export default defineCard({
  name: "Wistful Thinking",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Target player draws two cards, then discards four cards.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2, target: 0 },
      { kind: "discard", target: 0, amount: 4 },
    ],
  },
});

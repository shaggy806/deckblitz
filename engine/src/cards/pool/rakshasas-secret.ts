import { defineCard } from "../define.js";

// EDHREC rank 25853. Khans of Tarkir.

export default defineCard({
  name: "Rakshasa's Secret",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent discards two cards. You mill two cards.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: 0, amount: 2 },
      { kind: "mill", target: "you", amount: 2 },
    ],
  },
});

import { defineCard } from "../define.js";

export default defineCard({
  name: "Urza's Guilt",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: "Each player draws two cards, then discards three cards, then loses 4 life.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2, who: "each-player" },
      { kind: "discard", target: "each-player", amount: 3 },
      { kind: "lose-life", amount: 4, who: "each-player" },
    ],
  },
});

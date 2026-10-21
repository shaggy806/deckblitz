import { defineCard } from "../define.js";

export default defineCard({
  name: "Davriel's Shadowfugue",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player discards two cards and loses 2 life.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: 0, amount: 2 },
      { kind: "lose-life", amount: 2, target: 0 },
    ],
  },
});

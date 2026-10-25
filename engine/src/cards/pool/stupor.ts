import { defineCard } from "../define.js";

export default defineCard({
  name: "Stupor",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent discards a card at random, then discards a card.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: 0, amount: 1, random: true },
      { kind: "discard", target: 0, amount: 1 },
    ],
  },
});

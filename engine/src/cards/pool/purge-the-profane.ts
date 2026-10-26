import { defineCard } from "../define.js";

export default defineCard({
  name: "Purge the Profane",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: "Target opponent discards two cards and you gain 2 life.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: 0, amount: 2 },
      { kind: "gain-life", amount: 2 },
    ],
  },
});

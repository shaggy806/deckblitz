import { defineCard } from "../define.js";

export default defineCard({
  name: "Essence Feed",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player loses 3 life. You gain 3 life and create three 0/1 colorless Eldrazi Spawn creature tokens. They have \"Sacrifice this token: Add {C}.\"",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "lose-life", target: 0, amount: 3 },
      { kind: "gain-life", amount: 3 },
      { kind: "create-token", token: "Eldrazi Spawn Token", count: 3 },
    ],
  },
});

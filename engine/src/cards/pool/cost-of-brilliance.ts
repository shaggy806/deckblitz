import { defineCard } from "../define.js";

// EDHREC rank 12489. Combat Tutorial's shape, with Blood Pact's life loss.
export default defineCard({
  name: "Cost of Brilliance",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player draws two cards and loses 2 life. Put a +1/+1 counter on up to one target creature.",
  targets: ["player", { kind: "optional", of: "creature" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2, target: 0 },
      { kind: "lose-life", amount: 2, target: 0 },
      { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
    ],
  },
});

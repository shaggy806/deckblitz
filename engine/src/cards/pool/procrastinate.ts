import { defineCard } from "../define.js";

// EDHREC rank 12807. "Twice X" is Primo, the Unbounded's `product` amount.
export default defineCard({
  name: "Procrastinate",
  manaCost: "{X}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Tap target creature. Put twice X stun counters on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "add-counter", target: 0, counter: "stun", amount: { product: ["x", 2] } },
    ],
  },
});

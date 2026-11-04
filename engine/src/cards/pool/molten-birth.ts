import { defineCard } from "../define.js";

// Won, it goes directly from the stack to its owner's hand (the ruling).
export default defineCard({
  name: "Molten Birth",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Create two 1/1 red Elemental creature tokens, then flip a coin. If you win the flip, return Molten Birth to its owner's hand.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Elemental Token (Molten Birth)", count: 2 },
      { kind: "flip-coin", won: { kind: "return-to-hand", target: "source", from: "stack" } },
    ],
  },
});

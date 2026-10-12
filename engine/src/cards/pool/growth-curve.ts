import { defineCard } from "../define.js";

// EDHREC rank 9726.
//
// Rulings:
//   [2026-03-20] To double the number of +1/+1 counters on a creature, put a number of +1/+1
//     counters on it equal to the number it already has. Other effects that interact with putting
//     counters on it will interact with this effect accordingly.

export default defineCard({
  name: "Growth Curve",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  types: ["sorcery"],
  text: "Put a +1/+1 counter on target creature you control, then double the number of +1/+1 counters on that creature.",
  // Invigorating Surge's shape: the doubling puts that many more (the ruling).
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "double-counters", target: 0, counter: "+1/+1" },
    ],
  },
});

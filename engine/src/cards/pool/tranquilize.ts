import { defineCard } from "../define.js";

// EDHREC rank 13202.
//
// Rulings:
//   [2024-07-05] You may target a creature that is already tapped with Tranquilize. If the target
//     creature is already tapped as Tranquilize resolves, you will still put three stun counters on
//     it.

export default defineCard({
  name: "Tranquilize",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Tap target creature an opponent controls and put three stun counters on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)",
  targets: ["creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "add-counter", target: 0, counter: "stun", amount: 3 },
    ],
  },
});

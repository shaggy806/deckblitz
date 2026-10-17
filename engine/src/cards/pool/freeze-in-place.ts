import { defineCard } from "../define.js";

// Rulings:
//   [2023-09-01] If the target is not legal as Freeze in Place tries to resolve, Freeze in Place
//     will be removed from the stack. You won't scry.
//   [2023-09-01] You may target a creature that is already tapped with Freeze in Place. If the
//     target creature is already tapped as Freeze in Place resolves, you will still put three stun
//     counters on it.

export default defineCard({
  name: "Freeze in Place",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Tap target creature an opponent controls and put three stun counters on it. Scry 2. (If a permanent with a stun counter would become untapped, remove one from it instead.)",
  targets: ["creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "add-counter", target: 0, counter: "stun", amount: 3 },
      { kind: "scry", amount: 2 },
    ],
  },
});

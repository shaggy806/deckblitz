import { defineCard } from "../define.js";

// EDHREC rank 12465.
//
// Rulings:
//   Stun counters replace untapping for any reason, including players untapping tapped
//     permanents during their untap steps.
//   You may target a creature that is already tapped with Impede Momentum. If the target creature
//     is tapped as it resolves, you will still put three stun counters on it.
//   If a permanent has more than one stun counter on it, only one will be removed each time it
//     would become untapped.
const TEXT =
  "Tap target creature and put three stun counters on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)\nScry 1. (Look at the top card of your library. You may put that card on the bottom.)";

export default defineCard({
  name: "Impede Momentum",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "add-counter", target: 0, counter: "stun", amount: 3 },
      { kind: "scry", amount: 1 },
    ],
  },
});

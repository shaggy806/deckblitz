import { defineCard } from "../define.js";

// EDHREC rank 10683.
//
// Rulings:
//   [2023-09-01] You may target creatures that are already tapped with Succumb to the Cold. If a
//     target creature is already tapped as it resolves, you will still put a stun counter on it.

export default defineCard({
  name: "Succumb to the Cold",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Tap one or two target creatures an opponent controls. Put a stun counter on each of them. (If a permanent with a stun counter would become untapped, remove one from it instead.)",
  targets: [
    "creature-an-opponent-controls",
    { kind: "optional", of: { kind: "other", of: "creature-an-opponent-controls", than: { slot: 0 } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "tap", target: 1 },
      { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
      { kind: "add-counter", target: 1, counter: "stun", amount: 1 },
    ],
  },
});

import { defineCard } from "../define.js";

// EDHREC rank 11188.
//
// Rulings:
//   [2024-11-08] As Felling Blow tries to resolve, if either creature is an illegal target, the
//     creature you control won't deal damage. If the creature you control is a legal target but
//     the other creature isn't, your creature will still get a +1/+1 counter.

export default defineCard({
  name: "Felling Blow",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Put a +1/+1 counter on target creature you control. Then that creature deals damage equal to its power to target creature an opponent controls.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "fight", a: 0, b: 1, oneSided: true },
    ],
  },
});

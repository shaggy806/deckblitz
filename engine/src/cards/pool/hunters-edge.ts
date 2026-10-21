import { defineCard } from "../define.js";

// Rulings:
//   [2020-06-23] You can't cast Hunter's Edge unless you choose both a creature you control and a
//     creature you don't control as targets.
//   [2020-06-23] If either creature is an illegal target as Hunter's Edge tries to resolve, the
//     creature you control won't deal damage.
//   [2020-06-23] If the creature you don't control is an illegal target as Hunter's Edge tries to
//     resolve but the creature you control is a legal target, you just put a +1/+1 counter on the
//     creature you control.

export default defineCard({
  name: "Hunter's Edge",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Put a +1/+1 counter on target creature you control. Then that creature deals damage equal to its power to target creature you don't control.",
  // "You don't control" is an opponent's in a game without teammates (Rabid Bite's shape).
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "fight", a: 0, b: 1, oneSided: true },
    ],
  },
});

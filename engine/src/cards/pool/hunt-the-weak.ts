import { defineCard } from "../define.js";

// EDHREC rank 17571.
//
// Rulings:
//   [2018-01-19] You can't cast Hunt the Weak unless you choose both a creature you control and a
//     creature you don't control as targets.
//   [2018-01-19] If either target is an illegal target as Hunt the Weak resolves, neither creature
//     will deal or be dealt damage.
//   [2018-01-19] If the creature you control is an illegal target as Hunt the Weak tries to
//     resolve, you won't put a +1/+1 counter on it. If that creature is a legal target but the
//     other creature isn't, you'll still put the counter on the creature you control.
// "A creature you don't control" is one an opponent controls: every other player is an opponent.

export default defineCard({
  name: "Hunt the Weak",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Put a +1/+1 counter on target creature you control. Then that creature fights target creature you don't control. (Each deals damage equal to its power to the other.)",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "fight", a: 0, b: 1 },
    ],
  },
});

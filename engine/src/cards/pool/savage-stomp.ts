import { defineCard } from "../define.js";

// EDHREC rank 6199. Hunt the Weak with a Dinosaur discount.
//
// Rulings:
//   [2017-09-29] If the creature you control is an illegal target as Savage Stomp tries to
//     resolve, you won't put a +1/+1 counter on it. If that creature is a legal target but the
//     other creature isn't, you'll still put the counter on the creature you control.
//   [2017-09-29] You can't cast Savage Stomp unless you choose both a creature you control and a
//     creature you don't control as targets.
//   [2017-09-29] If either target is an illegal target as Savage Stomp resolves, neither creature
//     will deal or be dealt damage.

export default defineCard({
  name: "Savage Stomp",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "This spell costs {2} less to cast if it targets a Dinosaur you control.\nPut a +1/+1 counter on target creature you control. Then that creature fights target creature you don't control. (Each deals damage equal to its power to the other.)",
  targetCostReduction: { filter: { type: "creature", subtype: "Dinosaur", controlledBy: "you" }, reduceGeneric: 2 },
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "fight", a: 0, b: 1 },
    ],
  },
});

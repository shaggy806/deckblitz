import { defineCard } from "../define.js";

// EDHREC rank 12431.
//
// Rulings:
//   [2013-04-15] If one of the targets is illegal when Mutant's Prey tries to resolve (for
//     example, if the first target creature no longer has a +1/+1 counter on it), neither creature
//     will deal or be dealt damage.
//   [2013-04-15] Only a creature with a +1/+1 counter on it can be chosen as the first target of
//     Mutant's Prey.

export default defineCard({
  name: "Mutant's Prey",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature you control with a +1/+1 counter on it fights target creature an opponent controls. (Each deals damage equal to its power to the other.)",
  targets: [
    {
      kind: "permanent",
      filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
    },
    "creature-an-opponent-controls",
  ],
  effect: { kind: "fight", a: 0, b: 1 },
});

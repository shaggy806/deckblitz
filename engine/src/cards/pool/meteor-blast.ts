import { defineCard } from "../define.js";

// Rulings:
//   [2015-11-04] Meteor Blast can't target the same permanent or player more than once.
//   [2015-11-04] If some but not all of Meteor Blast's targets have become illegal by the time it
//     tries to resolve, it will deal damage to the remaining legal targets.

export default defineCard({
  name: "Meteor Blast",
  manaCost: "{X}{R}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Meteor Blast deals 4 damage to each of X targets.",
  targets: [{ kind: "any-number", of: "any-target", min: "x", max: "x" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: { kind: "damage", amount: 4, target: 0 },
    simultaneous: true,
  },
});

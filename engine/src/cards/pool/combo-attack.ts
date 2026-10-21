import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// Battlebond. EDHREC rank 27703.
//
// Rulings:
//   [2018-06-08] You can't cast Combo Attack without targeting two creatures your team controls.
//     If one of those creatures is an illegal target as Combo Attack resolves, the other will
//     still deal damage equal to its power.
//
// Band Together's shape with both of yours required. The last target is a
// separate "target" word, so it may be one of the first two (rule 115.3).

export default defineCard({
  name: "Combo Attack",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Two target creatures your team controls each deal damage equal to their power to target creature.",
  targets: [...distinctTargets(2, "creature-you-control"), "creature"],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "fight", a: 0, b: 2, oneSided: true },
      { kind: "fight", a: 1, b: 2, oneSided: true },
    ],
  },
});

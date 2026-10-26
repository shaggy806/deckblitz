import { defineCard } from "../define.js";

// EDHREC rank 24494.
//
// Rulings:
//   [2004-10-04] You must target two different lands. You can’t choose to target just one.

export default defineCard({
  name: "Rain of Salt",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy two target lands.",
  targets: [{ kind: "any-number", of: "land", min: 2, max: 2 }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: { kind: "destroy", target: 0 },
    simultaneous: true,
  },
});

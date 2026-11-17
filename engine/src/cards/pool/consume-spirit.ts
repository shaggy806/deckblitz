import { defineCard } from "../define.js";

// EDHREC rank 13471.
//
// Rulings:
//   - The life gained is the number chosen for X, not the damage dealt (some
//     of it may be prevented).
//   - If the target is illegal as it would resolve, it doesn't resolve: no life.
//
// - "Spend only black mana on X" is the spell's `xSpendOnly` (Crypt Rats' on an
//   ability): the X part of the total cost is paid as that many {B}, so X goes
//   only as high as the black mana does (rule 107.4a).
// - Death Grasp's damage and gain, both X (not "the damage dealt").
export default defineCard({
  name: "Consume Spirit",
  manaCost: "{X}{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  xSpendOnly: "B",
  text: "Spend only black mana on X.\nConsume Spirit deals X damage to any target and you gain X life.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: "x", target: 0 },
      { kind: "gain-life", amount: "x" },
    ],
  },
});

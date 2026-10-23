import { defineCard } from "../define.js";

// EDHREC rank 10259.
//
// Rulings:
//   [2016-04-08] You can't target the same creature twice to have Dual Shot deal 2 damage to it.
// Cast into the Fire's shape: the second slot excludes the first's creature.

export default defineCard({
  name: "Dual Shot",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Dual Shot deals 1 damage to each of up to two target creatures.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: 1, target: 0 },
      { kind: "damage", amount: 1, target: 1 },
    ],
  },
});

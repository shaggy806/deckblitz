import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 31576.
//
// Rulings:
//   [2004-10-04] You choose a second target only if you choose to pay the Kicker cost.
//   [2004-10-04] The second target must be different from the first one.
//
// Dwarven Landslide's shape with a kicker that is only a sacrifice: kicked,
// the spell has a second target slot, another target than the first.

export default defineCard({
  name: "Magma Burst",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Kicker—Sacrifice two lands. (You may sacrifice two lands in addition to any other costs as you cast this spell.)\nMagma Burst deals 3 damage to any target. If this spell was kicked, it deals 3 damage to another target.",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 3, target: 0 },
  kicker: {
    cost: "",
    also: { text: "Sacrifice two lands", sacrifice: { filter: { type: "land" }, count: 2 } },
    targets: ["any-target", { kind: "other", of: "any-target", than: { slots: [0] } }],
    effect: {
      kind: "sequence",
      effects: [
        { kind: "damage", amount: 3, target: 0 },
        { kind: "damage", amount: 3, target: 1 },
      ],
    },
  },
});

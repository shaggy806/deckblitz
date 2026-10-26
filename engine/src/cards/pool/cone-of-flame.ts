import { defineCard } from "../define.js";

// Weatherlight (WTH). EDHREC rank 24307.
//
// Three different targets (its ruling: without three, it can't be cast). The
// amounts belong to the slots, so a target that's become illegal changes
// nothing about the others' damage (its other ruling). One instruction, so
// the damage is dealt at once (`simultaneous`).

const TEXT = "Cone of Flame deals 1 damage to any target, 2 damage to another target, and 3 damage to a third target.";

export default defineCard({
  name: "Cone of Flame",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: [
    "any-target",
    { kind: "other", of: "any-target", than: { slot: 0 } },
    { kind: "other", of: "any-target", than: { slots: [0, 1] } },
  ],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: 1, target: 0 },
      { kind: "damage", amount: 2, target: 1 },
      { kind: "damage", amount: 3, target: 2 },
    ],
  },
});

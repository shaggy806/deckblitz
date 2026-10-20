import { defineCard } from "../define.js";

// EDHREC rank 25641.

export default defineCard({
  name: "Parasitic Grasp",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Cleave {1}{B}{B} (You may cast this spell for its cleave cost. If you do, remove the words in square brackets.)\nParasitic Grasp deals 3 damage to target [Human] creature. You gain 3 life.",
  targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Human" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", target: 0, amount: 3 },
      { kind: "gain-life", amount: 3 },
    ],
  },
  cleave: {
    cost: "{1}{B}{B}",
    targets: ["creature"],
    effect: {
      kind: "sequence",
      effects: [
        { kind: "damage", target: 0, amount: 3 },
        { kind: "gain-life", amount: 3 },
      ],
    },
  },
});

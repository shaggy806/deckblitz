import { defineCard } from "../define.js";

// EDHREC rank 16460.

export default defineCard({
  name: "Chandra's Fury",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Chandra's Fury deals 4 damage to target player or planeswalker and 1 damage to each creature that player or that planeswalker's controller controls.",
  targets: ["player-or-planeswalker"],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: 4, target: 0 },
      { kind: "damage-all", filter: { type: "creature" }, amount: 1, controlledByTarget: 0 },
    ],
  },
});

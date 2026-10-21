import { defineCard } from "../define.js";

// EDHREC rank 19359. Dominaria.
//
// Rulings:
//   [2018-04-27] Radiating Lightning targets only the player. Creatures that player controls with
//     hexproof will be dealt damage.
//
// One "deals", so the damage to the player and to each creature is dealt at
// once (Chandra, Flame's Fury's −8).

export default defineCard({
  name: "Radiating Lightning",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Radiating Lightning deals 3 damage to target player and 1 damage to each creature that player controls.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      { kind: "damage-all", filter: { type: "creature" }, amount: 1, controlledByTarget: 0 },
    ],
  },
});

import { defineCard } from "../define.js";

// EDHREC rank 15257.
//
// Rulings:
//   [2004-10-04] If the creature leaves the battlefield before this resolves, it still damages the
//     player.

export default defineCard({
  name: "Shower of Sparks",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Shower of Sparks deals 1 damage to target creature and 1 damage to target player or planeswalker.",
  targets: ["creature", "player-or-planeswalker"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 1, target: 0 },
      { kind: "damage", amount: 1, target: 1 },
    ],
  },
});

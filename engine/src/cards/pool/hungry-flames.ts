import { defineCard } from "../define.js";

// EDHREC rank 22268.
//
// Rulings:
//   [2017-02-09] You can't cast Hungry Flames unless you target both a creature and a player. If
//     one target is illegal as Hungry Flames resolves, the spell deals damage to the remaining
//     legal target.

export default defineCard({
  name: "Hungry Flames",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Hungry Flames deals 3 damage to target creature and 2 damage to target player or planeswalker.",
  targets: ["creature", "player-or-planeswalker"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      { kind: "damage", amount: 2, target: 1 },
    ],
  },
});

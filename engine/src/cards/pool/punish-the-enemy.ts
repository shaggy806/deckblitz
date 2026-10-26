import { defineCard } from "../define.js";

// Rulings: with one target illegal on resolution, the other is still dealt its
// 3 damage; both targets are needed to cast it.

export default defineCard({
  name: "Punish the Enemy",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Punish the Enemy deals 3 damage to target player or planeswalker and 3 damage to target creature.",
  targets: ["player-or-planeswalker", "creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      { kind: "damage", amount: 3, target: 1 },
    ],
  },
});

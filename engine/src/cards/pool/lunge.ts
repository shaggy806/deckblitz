import { defineCard } from "../define.js";

export default defineCard({
  name: "Lunge",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Lunge deals 2 damage to target creature and 2 damage to target player or planeswalker.",
  targets: ["creature", "player-or-planeswalker"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 2, target: 0 },
      { kind: "damage", amount: 2, target: 1 },
    ],
  },
});

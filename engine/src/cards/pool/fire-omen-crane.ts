import { defineCard } from "../define.js";

export default defineCard({
  name: "Fire-Omen Crane",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Bird", "Spirit"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying (This creature can't be blocked except by creatures with flying or reach.)\nWhenever this creature attacks, it deals 1 damage to target creature an opponent controls.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "Whenever this creature attacks, it deals 1 damage to target creature an opponent controls.",
    },
  ],
});

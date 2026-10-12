import { defineCard } from "../define.js";

export default defineCard({
  name: "Viashino Pyromancer",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Wizard"],
  power: 2,
  toughness: 1,
  text: "When this creature enters, it deals 2 damage to target player or planeswalker.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player-or-planeswalker"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "When this creature enters, it deals 2 damage to target player or planeswalker.",
    },
  ],
});

import { defineCard } from "../define.js";

export default defineCard({
  name: "Goretusk Firebeast",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Boar", "Beast"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, it deals 4 damage to target player or planeswalker.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player-or-planeswalker"],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: "When this creature enters, it deals 4 damage to target player or planeswalker.",
    },
  ],
});

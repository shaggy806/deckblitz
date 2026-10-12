import { defineCard } from "../define.js";

export default defineCard({
  name: "Goblin Commando",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, it deals 2 damage to target creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "When this creature enters, it deals 2 damage to target creature.",
    },
  ],
});

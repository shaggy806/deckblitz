import { defineCard } from "../define.js";

export default defineCard({
  name: "Frostling",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  text: "Sacrifice this creature: It deals 1 damage to target creature.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "damage", target: 0, amount: 1 },
      resolve: null,
      text: "Sacrifice this creature: It deals 1 damage to target creature.",
    },
  ],
});

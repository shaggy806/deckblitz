import { defineCard } from "../define.js";

export default defineCard({
  name: "Careless Celebrant",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Satyr", "Shaman"],
  power: 2,
  toughness: 1,
  text: "When this creature dies, it deals 2 damage to target creature or planeswalker an opponent controls.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: { typesAnyOf: ["creature", "planeswalker"] },
        },
      ],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "When this creature dies, it deals 2 damage to target creature or planeswalker an opponent controls.",
    },
  ],
});

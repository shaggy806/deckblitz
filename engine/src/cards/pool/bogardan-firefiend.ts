import { defineCard } from "../define.js";

export default defineCard({
  name: "Bogardan Firefiend",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Spirit"],
  power: 2,
  toughness: 1,
  text: "When this creature dies, it deals 2 damage to target creature.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["creature"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "When this creature dies, it deals 2 damage to target creature.",
    },
  ],
});

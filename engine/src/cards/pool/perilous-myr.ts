import { defineCard } from "../define.js";

export default defineCard({
  name: "Perilous Myr",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Myr"],
  power: 1,
  toughness: 1,
  text: "When this creature dies, it deals 2 damage to any target.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "When this creature dies, it deals 2 damage to any target.",
    },
  ],
});

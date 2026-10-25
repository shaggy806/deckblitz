import { defineCard } from "../define.js";

export default defineCard({
  name: "Smoldering Efreet",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Efreet", "Monk"],
  power: 2,
  toughness: 2,
  text: "When this creature dies, it deals 2 damage to you.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "you" },
      resolve: null,
      text: "When this creature dies, it deals 2 damage to you.",
    },
  ],
});

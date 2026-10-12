import { defineCard } from "../define.js";

export default defineCard({
  name: "Cinder Hellion",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Hellion"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: "Trample\nWhen this creature enters, it deals 2 damage to target opponent or planeswalker.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent-or-planeswalker"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "When this creature enters, it deals 2 damage to target opponent or planeswalker.",
    },
  ],
});

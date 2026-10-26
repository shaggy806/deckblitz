import { defineCard } from "../define.js";

export default defineCard({
  name: "Lava Hounds",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 4,
  toughness: 4,
  keywords: ["haste"],
  text: "Haste\nWhen this creature enters, it deals 4 damage to you.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: 4, who: "you" },
      resolve: null,
      text: "When this creature enters, it deals 4 damage to you.",
    },
  ],
});

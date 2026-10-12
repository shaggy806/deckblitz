import { defineCard } from "../define.js";

export default defineCard({
  name: "Foul Imp",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Imp"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, you lose 2 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: 2 },
      resolve: null,
      text: "When this creature enters, you lose 2 life.",
    },
  ],
});

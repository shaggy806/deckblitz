import { defineCard } from "../define.js";

export default defineCard({
  name: "Vampiric Spirit",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, you lose 4 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: 4 },
      resolve: null,
      text: "When this creature enters, you lose 4 life.",
    },
  ],
});

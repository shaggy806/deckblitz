import { defineCard } from "../define.js";

export default defineCard({
  name: "Dread Reaper",
  manaCost: "{3}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 6,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, you lose 5 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: 5 },
      resolve: null,
      text: "When this creature enters, you lose 5 life.",
    },
  ],
});

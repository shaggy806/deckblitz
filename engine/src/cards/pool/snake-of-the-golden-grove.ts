import { defineCard } from "../define.js";

// EDHREC rank 24911.

export default defineCard({
  name: "Snake of the Golden Grove",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 4,
  toughness: 4,
  tribute: 3,
  text: "Tribute 3 (As this creature enters, an opponent of your choice may put three +1/+1 counters on it.)\nWhen this creature enters, if tribute wasn't paid, you gain 4 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 4 },
      resolve: null,
      text: "When this creature enters, if tribute wasn't paid, you gain 4 life.",
      condition: { kind: "tribute-not-paid" },
    },
  ],
});

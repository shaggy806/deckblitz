import { defineCard } from "../define.js";

export default defineCard({
  name: "Rabid Bloodsucker",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying (This creature can't be blocked except by creatures with flying or reach.)\nWhen this creature enters, each player loses 2 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: 2, who: "each-player" },
      resolve: null,
      text: "When this creature enters, each player loses 2 life.",
    },
  ],
});

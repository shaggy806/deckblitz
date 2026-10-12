import { defineCard } from "../define.js";

export default defineCard({
  name: "Blood-Toll Harpy",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Harpy"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, each player loses 1 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "each-player" },
      resolve: null,
      text: "When this creature enters, each player loses 1 life.",
    },
  ],
});

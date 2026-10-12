import { defineCard } from "../define.js";

export default defineCard({
  name: "Howling Banshee",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, each player loses 3 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: 3, who: "each-player" },
      resolve: null,
      text: "When this creature enters, each player loses 3 life.",
    },
  ],
});

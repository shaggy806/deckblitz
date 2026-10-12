import { defineCard } from "../define.js";

export default defineCard({
  name: "Caustic Hound",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Dog"],
  power: 4,
  toughness: 4,
  text: "When this creature dies, each player loses 4 life.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: 4, who: "each-player" },
      resolve: null,
      text: "When this creature dies, each player loses 4 life.",
    },
  ],
});

import { defineCard } from "../define.js";

export default defineCard({
  name: "Soulcage Fiend",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 3,
  toughness: 2,
  text: "When this creature dies, each player loses 3 life.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: 3, who: "each-player" },
      resolve: null,
      text: "When this creature dies, each player loses 3 life.",
    },
  ],
});

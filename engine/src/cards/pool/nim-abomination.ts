import { defineCard } from "../define.js";

// EDHREC rank 32064.

export default defineCard({
  name: "Nim Abomination",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 4,
  text: "At the beginning of your end step, if this creature is untapped, you lose 3 life.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "source", filter: { tapped: false } },
      targets: [],
      effect: { kind: "lose-life", amount: 3 },
      resolve: null,
      text: "At the beginning of your end step, if this creature is untapped, you lose 3 life.",
    },
  ],
});

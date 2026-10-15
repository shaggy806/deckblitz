import { defineCard } from "../define.js";

// EDHREC rank 14292.

export default defineCard({
  name: "Moonglove Extractor",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elf", "Warlock"],
  power: 2,
  toughness: 1,
  text: "Whenever this creature attacks, you draw a card and lose 1 life.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1 },
        ],
      },
      resolve: null,
      text: "Whenever this creature attacks, you draw a card and lose 1 life.",
    },
  ],
});

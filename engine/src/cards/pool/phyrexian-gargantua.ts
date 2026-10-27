import { defineCard } from "../define.js";

// EDHREC rank 15918.

const ETB = "When this creature enters, you draw two cards and you lose 2 life.";

export default defineCard({
  name: "Phyrexian Gargantua",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 4,
  toughness: 4,
  text: ETB,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "lose-life", amount: 2 },
        ],
      },
      resolve: null,
      text: ETB,
    },
  ],
});

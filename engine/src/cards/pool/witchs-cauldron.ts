import { defineCard } from "../define.js";

const TEXT = "{1}{B}, {T}, Sacrifice a creature: You gain 1 life and draw a card.";

export default defineCard({
  name: "Witch's Cauldron",
  manaCost: "{B}",
  colors: ["B"],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: true, sacrifice: "creature-you-control" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

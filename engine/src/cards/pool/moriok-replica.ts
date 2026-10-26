import { defineCard } from "../define.js";

// EDHREC rank 22584.
const TEXT = "{1}{B}, Sacrifice this creature: You draw two cards and you lose 2 life.";

export default defineCard({
  name: "Moriok Replica",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Warrior"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "lose-life", amount: 2 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

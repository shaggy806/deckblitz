import { defineCard } from "../define.js";

// EDHREC rank 17318.

export default defineCard({
  name: "Redrock Sentinel",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 2,
  toughness: 4,
  keywords: ["defender"],
  text: "Defender\n{2}, {T}, Sacrifice a land: Draw a card and create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")",
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: { filter: { type: "land" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "create-token", token: "Treasure Token", count: 1 },
        ],
      },
      resolve: null,
      text: "{2}, {T}, Sacrifice a land: Draw a card and create a Treasure token.",
    },
  ],
});

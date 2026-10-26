import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 20066.
//
// The artifact card is chosen as the ability resolves, and choosing none is
// allowed (the rulings) — Master Transmuter's shape.

const TEXT = "{4}, Sacrifice this creature: You may put an artifact card from your hand onto the battlefield.";

export default defineCard({
  name: "Copper Gnomes",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Gnome"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{4}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "artifact" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

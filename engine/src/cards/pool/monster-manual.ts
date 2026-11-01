import { defineCard } from "../define.js";

// Commander Legends: Battle for Baldur's Gate (CLB). Its Adventure is
// Zoological Study.

const TEXT = "{1}{G}, {T}: You may put a creature card from your hand onto the battlefield.";

export default defineCard({
  name: "Monster Manual",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Book"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        filter: { type: "creature" },
        destination: "battlefield",
        leftover: "stay",
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Monster Manual", "Zoological Study"],
  adventure: true,
});

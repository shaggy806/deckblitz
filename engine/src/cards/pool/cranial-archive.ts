import { defineCard } from "../define.js";

// EDHREC rank 14492. An empty graveyard still shuffles the library, and the
// draw still happens (the ruling).

const TEXT = "{2}, Exile this artifact: Target player shuffles their graveyard into their library. Draw a card.";

export default defineCard({
  name: "Cranial Archive",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false, exileSelf: true },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "shuffle-graveyard-into-library", target: 0 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

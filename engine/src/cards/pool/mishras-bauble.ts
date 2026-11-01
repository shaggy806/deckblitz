import { defineCard } from "../define.js";

// EDHREC rank 1105.

const TEXT =
  "{T}, Sacrifice this artifact: Look at the top card of target player's library. Draw a card at the beginning of the next turn's upkeep.";

export default defineCard({
  name: "Mishra's Bauble",
  manaCost: "{0}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "look-at-library-top", target: 0 },
          { kind: "delayed-trigger", at: "next-upkeep", effect: { kind: "draw", amount: 1 }, text: "Draw a card." },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

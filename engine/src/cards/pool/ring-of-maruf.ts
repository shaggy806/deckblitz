import { defineCard } from "../define.js";

// EDHREC rank 29568.
//
// It replaces the next draw this turn, not a search of its own: with no draw
// the rest of the turn it does nothing (the ruling).

const TEXT =
  "{5}, {T}, Exile this artifact: The next time you would draw a card this turn, instead put a card you own from outside the game into your hand.";

export default defineCard({
  name: "Ring of Ma'rûf",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{5}", tap: true, exileSelf: true },
      targets: [],
      effect: {
        kind: "player-effect",
        duration: "end-of-turn",
        nextDrawInstead: {
          effect: { kind: "search-library", filter: {}, destination: "hand", min: 0, max: 1, outside: "only" },
          text: "Instead, put a card you own from outside the game into your hand.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

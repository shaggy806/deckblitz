import { defineCard } from "../define.js";

// EDHREC rank 12979.

const TEXT =
  "{U}, Discard an artifact card: Search your library for an artifact card with mana value 1 or less, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Artificer's Intuition",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{U}", tap: false, discard: { count: 1, filter: { type: "artifact" } } },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { type: "artifact", manaValue: { op: "lte", n: 1 } },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

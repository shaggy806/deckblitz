import { defineCard } from "../define.js";

// Urza's Destiny. EDHREC rank 27647. Flamecache Gecko's ability.

export default defineCard({
  name: "Mental Discipline",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "{1}{U}, Discard a card: Draw a card.",
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{1}{U}, Discard a card: Draw a card.",
    },
  ],
});

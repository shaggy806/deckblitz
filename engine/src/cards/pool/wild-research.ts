import { defineCard } from "../define.js";

// Apocalypse (APC). The search may find nothing (its ruling); the random
// discard happens either way. The search's own shuffle stands for "Then
// shuffle" — a random discard from the hand and a library shuffle don't
// interact, so their order is moot.
const ENCHANTMENT =
  "{1}{W}: Search your library for an enchantment card and reveal that card. Put it into your hand, then discard a card at random. Then shuffle.";
const INSTANT =
  "{1}{U}: Search your library for an instant card and reveal that card. Put it into your hand, then discard a card at random. Then shuffle.";

export default defineCard({
  name: "Wild Research",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${ENCHANTMENT}\n${INSTANT}`,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "search-library", filter: { type: "enchantment" }, destination: "hand", min: 0, max: 1, reveal: true },
          { kind: "discard", target: "you", amount: 1, random: true },
        ],
      },
      resolve: null,
      text: ENCHANTMENT,
    },
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "search-library", filter: { type: "instant" }, destination: "hand", min: 0, max: 1, reveal: true },
          { kind: "discard", target: "you", amount: 1, random: true },
        ],
      },
      resolve: null,
      text: INSTANT,
    },
  ],
});

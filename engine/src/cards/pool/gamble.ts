import { defineCard } from "../define.js";

// EDHREC rank 241.
//
// Rulings: "You might end up discarding the card you searched for." The
// search's own shuffle comes before the random discard here, the card's
// "then shuffle" after it; nothing can see the difference — the discard
// touches only the hand, and anything it triggers waits for Gamble to finish.

export default defineCard({
  name: "Gamble",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Search your library for a card, put that card into your hand, discard a card at random, then shuffle.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "search-library", filter: {}, destination: "hand", min: 1, max: 1 },
      { kind: "discard", target: "you", amount: 1, random: true },
    ],
  },
});

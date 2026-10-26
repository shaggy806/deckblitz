import { defineCard } from "../define.js";

// EDHREC rank 12672. Return to Ravnica.
//
// Rulings:
//   You don't have to find any instant cards in your library, even if they are there.
//   If a card in your library has {X} in its mana cost, X is 0.
//
// Three searches, mana value 3, then 2, then 1, each "up to one" (min 0), each
// revealing what it finds. `search-library` shuffles after each one; with the
// order of a hidden library unobservable between them, that's the card's one
// shuffle at the end.

const search = (n: number) =>
  ({
    kind: "search-library",
    filter: { type: "instant", manaValue: { op: "eq", n } },
    destination: "hand",
    reveal: true,
    min: 0,
    max: 1,
  }) as const;

export default defineCard({
  name: "Firemind's Foresight",
  manaCost: "{5}{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Search your library for an instant card with mana value 3, reveal it, and put it into your hand. Then repeat this process for instant cards with mana values 2 and 1. Then shuffle.",
  targets: [],
  effect: { kind: "sequence", effects: [search(3), search(2), search(1)] },
});

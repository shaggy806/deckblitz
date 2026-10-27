import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 28286.
//
// Rulings:
//   [2018-12-07] If a card in a player's library has {X} in its mana cost, X is considered to be
//     0.
//
// The chosen card is the `then`'s target 0 (Twilight Prophet's shape), so the
// life gained reads its mana value.
export default defineCard({
  name: "Reviving Vapors",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: "Reveal the top three cards of your library and put one of them into your hand. You gain life equal to that card's mana value. Put all other cards revealed this way into your graveyard.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 3,
    reveal: true,
    min: 1,
    max: 1,
    destination: "hand",
    leftover: "graveyard",
    then: { kind: "gain-life", amount: { manaValueOf: 0 } },
  },
});

import { defineCard } from "../define.js";

// EDHREC rank 5907.
//
// Rulings:
//   [2022-06-10] Since you are using an alternative cost to cast the spells, you can't pay any
//     other alternative costs. You can, however, pay additional costs.
//   [2022-06-10] If a card in a library has {X} in its mana cost, X is 0 for the purpose of
//     determining its mana value.
//
// Each opponent's exile stops at their own total of 5 (Tasha's Hideous
// Laughter's shape); the permission is over every card exiled this way, to
// cast and not to play as a land, and only without paying.

export default defineCard({
  name: "Dream Harvest",
  manaCost: "{5}{U/B}{U/B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: "Each opponent exiles cards from the top of their library until they have exiled cards with total mana value 5 or greater this way. Until end of turn, you may cast cards exiled this way without paying their mana costs.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-player",
        who: "each-opponent",
        effect: {
          kind: "reveal-until-count",
          whose: "that-player",
          filter: {},
          count: 5,
          measure: "mana-value",
          exile: true,
          put: "with-rest",
          rest: "stay",
        },
      },
      { kind: "grant-play", cards: { thisWay: "exiled" }, duration: "end-of-turn", free: true },
    ],
  },
});

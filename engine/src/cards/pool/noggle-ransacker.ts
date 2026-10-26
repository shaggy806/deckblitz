import { defineCard } from "../define.js";

// EDHREC rank 17721.
//
// Rulings:
//   [2008-08-01] First the player whose turn it is draws two cards, then each other player in turn
//     order does so. Then the player whose turn it is randomly selects a card from their hand,
//     then each other player in turn order does so. Finally, all cards selected this way are
//     discarded at the same time.
//
// The random discards ask nobody, so a simultaneous `for-each-player` makes
// them one event, as the ruling has it.

export default defineCard({
  name: "Noggle Ransacker",
  manaCost: "{2}{U/R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Noggle", "Rogue"],
  power: 2,
  toughness: 1,
  text: "When this creature enters, each player draws two cards, then discards a card at random.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2, who: "each-player" },
          {
            kind: "for-each-player",
            who: "each-player",
            simultaneous: true,
            effect: { kind: "discard", target: "that-player", amount: 1, random: true },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, each player draws two cards, then discards a card at random.",
    },
  ],
});

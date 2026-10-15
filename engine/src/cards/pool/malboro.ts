import { defineCard } from "../define.js";

// EDHREC rank 8954.
//
// Rulings:
//   [2025-06-06] As Malboro's first ability resolves, the next opponent in turn order (or, if
//     it's an opponent's turn, that opponent) chooses a card in hand without revealing it, then
//     each other opponent in turn order does the same. Then the chosen cards are discarded at the
//     same time. Next, each opponent loses 2 life at the same time. Finally, each opponent exiles
//     the top three cards of their library simultaneously.
//
// Hopeless Nightmare's discard and life loss, then `exile-from-library` over
// each opponent's library (face up, with no permission to play them).

const ETB_TEXT =
  "Bad Breath — When this creature enters, each opponent discards a card, loses 2 life, and exiles the top three cards of their library.";

export default defineCard({
  name: "Malboro",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Plant", "Horror"],
  power: 4,
  toughness: 4,
  cycling: { cost: "{2}", search: { subtype: "Swamp" } },
  text: `${ETB_TEXT}\nSwampcycling {2} ({2}, Discard this card: Search your library for a Swamp card, reveal it, put it into your hand, then shuffle.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "each-opponent", amount: 1 },
          { kind: "lose-life", amount: 2, who: "each-opponent" },
          { kind: "exile-from-library", whose: "each-opponent", amount: 3 },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});

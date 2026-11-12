import { defineCard } from "../define.js";

// EDHREC rank 2441. The look is a choose-from-zone with nothing to pick (Petals of Insight's
// shape). "As many times as you choose, you may pay 1 life, …" is a `may` costing 1 life around
// a `repeat` whose `mayAgain` costs 1 life a pass (Dance with Calamity's "as many times as you
// choose", paid): each pass puts the five looked at on the bottom in any order, then looks at the
// new top five. Then, per the ruling, the rest of the library is shuffled under those five
// (`exceptTop`) and they are put back on top in any order.
//
// Rulings:
//   If you pay no life, you shuffle the rest of your library and then put the top five cards back
//     on top in any order.
//   If you have five or fewer cards in your library, you can pay 1 life as many times as you
//     like, but you'll keep seeing the same cards.

const LOOK = { kind: "look-and-choose", zone: "library", count: 5, min: 0, max: 0, destination: "hand" } as const;

export default defineCard({
  name: "Lim-Dûl's Vault",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["instant"],
  text: "Look at the top five cards of your library. As many times as you choose, you may pay 1 life, put those cards on the bottom of your library in any order, then look at the top five cards of your library. Then shuffle and put the last cards you looked at this way on top in any order.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { ...LOOK, leftover: "stay" },
      {
        kind: "may",
        prompt: "Pay 1 life to put those cards on the bottom and look at the next five?",
        costLife: 1,
        effect: {
          kind: "repeat",
          mayAgain: { costLife: 1 },
          effect: {
            kind: "sequence",
            effects: [
              { ...LOOK, leftover: "bottom-any-order" },
              { ...LOOK, leftover: "stay" },
            ],
          },
        },
      },
      { kind: "shuffle-library", exceptTop: 5 },
      { ...LOOK, leftover: "top-any-order" },
    ],
  },
});

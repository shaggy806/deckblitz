import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 7283.
//
// Rulings:
//   [2024-07-26] You may cast Hazel's Nocturne with no targets just to have each opponent lose 2
//     life and you gain 2 life. However, if you do choose any targets, and all those targets are
//     illegal as Hazel's Nocturne tries to resolve, it won't resolve and none of its effects will
//     happen. No player will lose or gain life.

// Zero, one or two targets (Pull from the Grave's shape): with none chosen it
// still resolves; with targets chosen and all illegal it doesn't (rule 608.2b).
export default defineCard({
  name: "Hazel's Nocturne",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Return up to two target creature cards from your graveyard to your hand. Each opponent loses 2 life and you gain 2 life.",
  targets: distinctTargets(2, { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }, { optional: true }),
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0, from: "graveyard" },
          { kind: "return-to-hand", target: 1, from: "graveyard" },
        ],
      },
      { kind: "lose-life", amount: 2, who: "each-opponent" },
      { kind: "gain-life", amount: 2 },
    ],
  },
});

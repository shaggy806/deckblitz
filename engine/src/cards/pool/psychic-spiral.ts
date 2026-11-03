import { defineCard } from "../define.js";

// Rulings:
//   [2012-10-01] Psychic Spiral won't be shuffled into your library, and it won't be counted when
//     determining how many cards the target player puts into their graveyard. It will be put into
//     your graveyard after you follow its instructions.
//   [2012-10-01] If you cast Psychic Spiral when there are no cards in your graveyard, you'll still
//     shuffle your library.
export default defineCard({
  name: "Psychic Spiral",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Shuffle all cards from your graveyard into your library. Target player mills that many cards.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "shuffle-graveyard-into-library", target: "you" },
      { kind: "mill", target: 0, amount: { thisWay: "shuffled-into-library" } },
    ],
  },
});

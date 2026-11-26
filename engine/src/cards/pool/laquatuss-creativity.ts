import { defineCard } from "../define.js";

// EDHREC rank 22056.
//
// "Discards that many" is the number counted for the draw, read once as the
// spell resolves (`with-x`), not what was drawn: a draw replaced, or one from
// a library too small, still leaves that many to discard.

export default defineCard({
  name: "Laquatus's Creativity",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Target player draws cards equal to the number of cards in their hand, then discards that many cards.",
  targets: ["player"],
  effect: {
    kind: "with-x",
    x: { cardsInHand: { target: 0 } },
    effect: {
      kind: "sequence",
      effects: [
        { kind: "draw", amount: "x", target: 0 },
        { kind: "discard", amount: "x", target: 0 },
      ],
    },
  },
});

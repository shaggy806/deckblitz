import { defineCard } from "../define.js";

// EDHREC rank 8855.
//
// Castle Locthwain's draw-then-count, with life gained instead of lost: the
// hand is counted after the draw.

const TEXT = "Draw a card, then you gain life equal to the number of cards in your hand.";

export default defineCard({
  name: "Union of the Third Path",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 1 },
      { kind: "gain-life", amount: { cardsInHand: "you" } },
    ],
  },
});

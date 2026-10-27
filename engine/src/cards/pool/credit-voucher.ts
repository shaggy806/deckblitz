import { defineCard } from "../define.js";

// Mercadian Masques. EDHREC rank 16992. The chosen cards go under the library
// and it's shuffled — the same as shuffling them in — then that many are drawn.
const TEXT =
  "{2}, {T}, Sacrifice this artifact: Shuffle any number of cards from your hand into your library, then draw that many cards.";

export default defineCard({
  name: "Credit Voucher",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: { cardsInHand: "you" },
            destination: "library-bottom",
            leftover: "stay",
          },
          { kind: "shuffle-library" },
          { kind: "draw", amount: { thisWay: "put-on-bottom", who: "you" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

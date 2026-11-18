import { defineCard } from "../define.js";

const ENTERS_TEXT = "This artifact enters tapped.";
const MASK_TEXT =
  "{1}, {T}, Sacrifice this artifact: Target opponent puts the cards from their hand on top of their library. Search that player's library for that many cards. That player puts those cards into their hand, then shuffles.";

// EDHREC rank 20037. Head Games on an artifact: "that many" is the cards put
// on their library this way, and the search for a quantity must find that
// many while the library has them (rule 701.23d).
export default defineCard({
  name: "Jester's Mask",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: `${ENTERS_TEXT}\n${MASK_TEXT}`,
  static: [
    { affects: { scope: "self" }, replacement: { event: "enters-battlefield", tapped: true }, text: ENTERS_TEXT },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-player",
            who: { target: 0 },
            effect: {
              kind: "look-and-choose",
              zone: "hand",
              player: "that-player",
              min: { cardsInHand: { target: 0 } },
              max: { cardsInHand: { target: 0 } },
              destination: "library-top",
              leftover: "stay",
            },
          },
          {
            kind: "search-library",
            whose: { target: 0 },
            filter: {},
            destination: "hand",
            min: { thisWay: "put-into-library" },
            max: { thisWay: "put-into-library" },
          },
        ],
      },
      resolve: null,
      text: MASK_TEXT,
    },
  ],
});

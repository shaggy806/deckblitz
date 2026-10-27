import { defineCard } from "../define.js";

// Apocalypse (APC). Every card in the hand goes into the library (Teferi's
// Puzzle Box's forced all-cards pick — the order is moot, as the library is
// shuffled at once), then that many are drawn: the cards that left the hand
// this way, so none when the hand was empty.
const TEXT =
  "When this creature enters, shuffle the cards from your hand into your library, then draw that many cards.";

export default defineCard({
  name: "Whirlpool Rider",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "hand",
            min: { cardsInHand: "you" },
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

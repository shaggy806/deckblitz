import { defineCard } from "../define.js";

const TEXT =
  "Whenever you cast a spell, put the cards in your hand on the bottom of your library in any order, then draw that many cards.";

export default defineCard({
  name: "Mindmoil",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
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
          { kind: "draw", amount: { thisWay: "put-on-bottom", who: "you" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

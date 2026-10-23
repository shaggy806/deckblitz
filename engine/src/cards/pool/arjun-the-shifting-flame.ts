import { defineCard } from "../define.js";

// EDHREC rank 13699.
//
// The whole hand goes to the bottom in the order its owner picks (rule
// 401.4), then they draw as many as went — Teferi's Puzzle Box's shape.
const TEXT =
  "Whenever you cast a spell, put the cards in your hand on the bottom of your library in any order, then draw that many cards.";

export default defineCard({
  name: "Arjun, the Shifting Flame",
  manaCost: "{4}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Sphinx", "Wizard"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
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

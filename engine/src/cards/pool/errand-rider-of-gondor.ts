import { defineCard } from "../define.js";

// EDHREC rank 17579.
//
// "Then if you don't control a legendary creature" is asked after the draw,
// as the ability resolves (a `conditional`); the card put on the bottom is
// the player's pick from their whole hand, the one just drawn included.

const ENTER_TEXT =
  "When this creature enters, draw a card. Then if you don't control a legendary creature, put a card from your hand on the bottom of your library.";

export default defineCard({
  name: "Errand-Rider of Gondor",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 2,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "conditional",
            condition: {
              kind: "not",
              of: { kind: "controls", filter: { type: "creature", supertype: "legendary" }, atLeast: 1 },
            },
            then: {
              kind: "look-and-choose",
              zone: "hand",
              min: 1,
              max: 1,
              destination: "library-bottom",
              leftover: "stay",
            },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 3865.
//
// Rulings:
//   This is a mana ability. It does not go on the stack and can't be
//   responded to.
//   You can reveal zero cards to gain zero mana.
//
// The reveal is the mana ability's first instruction (`add-mana`'s `first`),
// asked as it's activated (`Game.manaRevealFirst`), and the mana is read
// after it. Its output is a choice, so the auto-payer leaves it alone: it's
// activated by hand, and the floating mana pays what it can.
const TAP_TEXT = "{T}: Reveal any number of artifact cards in your hand. Add {C}{C} for each card revealed this way.";

export default defineCard({
  name: "Metalworker",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 1,
  toughness: 2,
  text: TAP_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: { product: [2, { thisWay: "revealed", who: "you" }] },
        first: {
          kind: "look-and-choose",
          zone: "hand",
          min: 0,
          max: { cardsInHand: "you" },
          filter: { type: "artifact" },
          destination: "reveal",
          leftover: "stay",
        },
      },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});

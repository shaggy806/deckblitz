import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 8363.
//
// Rulings:
//   [2006-07-15] If the card isn't snow, you can't reveal it. If the card is snow, you don't have
//     to reveal it. An unrevealed card stays on top of your library.
//
// Frost Augur's shape: look at one, take it only if it's snow (min 0), the
// rest stays on top.

const LOOK_TEXT =
  "{1}{S}, {T}: Look at the top card of your library. If that card is snow, you may reveal it and put it into your hand.";

export default defineCard({
  name: "Scrying Sheets",
  colors: [],
  supertypes: ["snow"],
  types: ["land"],
  text: `{T}: Add {C}.\n${LOOK_TEXT} ({S} can be paid with one mana from a snow source.)`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{1}{S}", tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { supertype: "snow" },
        destination: "hand",
        leftover: "stay",
      },
      resolve: null,
      text: LOOK_TEXT,
    },
  ],
});

import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

// Banned in Commander; in the pool for casual play.
//
// Rulings:
//   [2004-10-04] You may tap multiples of these in response to each other because the requirement
//     for 7 cards is checked only at the time the ability is announced and not again when it
//     resolves.
//
// "Exactly seven" is a `hand-size` condition with both bounds at 7, checked
// as the ability is activated (rule 602.5b), never again.

const DRAW_TEXT = "{T}: Draw a card. Activate only if you have exactly seven cards in hand.";

export default defineCard({
  name: "Library of Alexandria",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${DRAW_TEXT}`,
  activated: [
    addManaAbility({ mana: "C", text: "{T}: Add {C}." }),
    {
      cost: { mana: null, tap: true },
      condition: { kind: "hand-size", atLeast: 7, atMost: 7 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});

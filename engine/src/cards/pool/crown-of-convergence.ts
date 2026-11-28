import { defineCard } from "../define.js";

// EDHREC rank 28814. Mul Daya Channelers' revealed top card and `library-top`
// condition, with a scope of the creatures you control sharing a color with
// that card (`sharesColorWith: { libraryTop: "you" }`, read live). Its
// rulings: a colorless creature on top gives no bonus, and a colorless
// creature never gets one. The last ability is `bottom-of-library`'s `top`.

const REVEAL = "Play with the top card of your library revealed.";
const ANTHEM =
  "As long as the top card of your library is a creature card, creatures you control that share a color with that card get +1/+1.";
const CYCLE = "{G}{W}: Put the top card of your library on the bottom of your library.";

export default defineCard({
  name: "Crown of Convergence",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${REVEAL}\n${ANTHEM}\n${CYCLE}`,
  static: [
    { affects: { scope: "self" }, visibility: { libraryTopRevealed: "you" }, text: REVEAL },
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", sharesColorWith: { libraryTop: "you" } },
      },
      condition: { kind: "library-top", filter: { type: "creature" } },
      grantPt: [1, 1],
      text: ANTHEM,
    },
  ],
  activated: [
    {
      cost: { mana: "{G}{W}", tap: false },
      targets: [],
      effect: { kind: "bottom-of-library", top: true, then: { kind: "put-on-library", target: 0, position: "bottom" } },
      resolve: null,
      text: CYCLE,
    },
  ],
});

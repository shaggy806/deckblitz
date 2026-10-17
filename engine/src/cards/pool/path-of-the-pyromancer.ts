import { defineCard } from "../define.js";

// EDHREC rank 6920.
//
// Rulings:
//   [2023-04-14] If your hand is empty as Path of the Pyromancer resolves, you won’t add any mana,
//     but you will draw a card.
//
// Will of the Planeswalkers is a vote (rule 701.38), Selvala's Stampede's
// shape. Only the planar controller of a Planechase game can planeswalk (rule
// 701.31a), and "chaos ensues" triggers only a plane's chaos ability (311.7),
// so outside Planechase — every game this engine runs — neither result does
// anything; the vote itself still happens.

export default defineCard({
  name: "Path of the Pyromancer",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Discard all the cards in your hand. Add {R} for each card discarded this way, then draw that many cards plus one.\nWill of the Planeswalkers — Starting with you, each player votes for planeswalk or chaos. If planeswalk gets more votes, planeswalk. If chaos gets more votes or the vote is tied, chaos ensues.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-hand", who: "you" },
      { kind: "add-mana", mana: "R", amount: { thisWay: "discarded", who: "you" } },
      { kind: "draw", amount: { sum: [{ thisWay: "discarded", who: "you" }, 1] } },
      { kind: "vote", for: { options: ["planeswalk", "chaos"] } },
    ],
  },
});

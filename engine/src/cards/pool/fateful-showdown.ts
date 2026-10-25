import { defineCard } from "../define.js";

// EDHREC rank 8811. The hand is counted as it resolves, with this spell on
// the stack; with its target gone illegal nothing happens (the rulings).

export default defineCard({
  name: "Fateful Showdown",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Fateful Showdown deals damage to any target equal to the number of cards in your hand. Discard all the cards in your hand, then draw that many cards.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: { cardsInHand: "you" }, target: 0 },
      { kind: "discard-hand", who: "you" },
      { kind: "draw", amount: { thisWay: "discarded" } },
    ],
  },
});

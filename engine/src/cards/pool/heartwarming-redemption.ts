import { defineCard } from "../define.js";

export default defineCard({
  name: "Heartwarming Redemption",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  types: ["instant"],
  text: "Discard all the cards in your hand, then draw that many cards plus one. You gain life equal to the number of cards in your hand.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-hand", who: "you" },
      { kind: "draw", amount: { sum: [{ thisWay: "discarded" }, 1] } },
      // Counted after the draw, as it resolves (the ruling).
      { kind: "gain-life", amount: { cardsInHand: "you" } },
    ],
  },
});

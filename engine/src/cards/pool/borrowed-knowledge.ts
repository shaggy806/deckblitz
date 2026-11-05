import { defineCard } from "../define.js";

export default defineCard({
  name: "Borrowed Knowledge",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  types: ["sorcery"],
  text: "Choose one —\n• Discard your hand, then draw cards equal to the number of cards in target opponent's hand.\n• Discard your hand, then draw cards equal to the number of cards discarded this way.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Discard your hand, then draw cards equal to the number of cards in target opponent's hand.",
        targets: ["opponent"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard-hand", who: "you" },
            { kind: "draw", amount: { cardsInHand: { target: 0 } } },
          ],
        },
      },
      {
        text: "Discard your hand, then draw cards equal to the number of cards discarded this way.",
        targets: [],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard-hand", who: "you" },
            { kind: "draw", amount: { thisWay: "discarded" } },
          ],
        },
      },
    ],
  },
});

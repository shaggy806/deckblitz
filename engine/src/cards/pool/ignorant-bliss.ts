import { defineCard } from "../define.js";

export default defineCard({
  name: "Ignorant Bliss",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Exile all cards from your hand face down. At the beginning of the next end step, return those cards to your hand, then draw a card.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-graveyard", target: "you", fromHand: "only", faceDown: true },
      {
        kind: "delayed-trigger",
        at: { step: "end" },
        about: "exiled",
        // An empty hand still draws at the end step.
        orNone: true,
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "for-each-target",
              from: 0,
              simultaneous: true,
              effect: { kind: "return-to-hand", target: 0, from: "exile" },
            },
            { kind: "draw", amount: 1 },
          ],
        },
        text: "Return those cards to your hand, then draw a card.",
      },
    ],
  },
});

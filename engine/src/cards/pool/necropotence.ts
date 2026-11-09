import { defineCard } from "../define.js";

// Rulings: the delayed trigger fires even with Necropotence gone; a
// discarded card that never reached the graveyard (or left it) isn't
// exiled; nobody may look at the face-down cards (`faceDown: true`).

const DISCARD_TEXT = "Whenever you discard a card, exile that card from your graveyard.";
const PAY_TEXT =
  "Pay 1 life: Exile the top card of your library face down. Put that card into your hand at the beginning of your next end step.";

export default defineCard({
  name: "Necropotence",
  manaCost: "{B}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `Skip your draw step.\n${DISCARD_TEXT}\n${PAY_TEXT}`,
  static: [{ affects: { scope: "self" }, skipsSteps: { who: "you", steps: ["draw"] }, text: "Skip your draw step." }],
  triggered: [
    {
      trigger: { on: "discards", who: "you", perCard: true },
      targets: [],
      effect: { kind: "exile", target: "trigger-object" },
      resolve: null,
      text: DISCARD_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", amount: 1, faceDown: true },
          {
            kind: "delayed-trigger",
            at: { step: "end", whose: "you" },
            about: "exiled",
            effect: {
              kind: "for-each-target",
              from: 0,
              simultaneous: true,
              effect: { kind: "return-to-hand", target: 0, from: "exile" },
            },
            text: "Put that card into your hand.",
          },
        ],
      },
      resolve: null,
      text: PAY_TEXT,
    },
  ],
});

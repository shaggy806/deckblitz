import { defineCard } from "../define.js";

const THIS_TURN =
  "Whenever a spell or ability an opponent controls causes you to discard cards this turn, return those cards from your graveyard to your hand.";
const DISCARDED =
  "When a spell or ability an opponent controls causes you to discard this card, return this card from your graveyard to your hand at the beginning of the next end step.";

export default defineCard({
  name: "Pure Intentions",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: `${THIS_TURN}\n${DISCARDED}`,
  // The spell's effect: a "this turn, whenever" watch. Each discarded card is
  // its own trigger object (`perCard`), returned only from the graveyard.
  effect: {
    kind: "delayed-trigger",
    at: { whenever: { on: "discards", who: "you", byOpponent: true, perCard: true } },
    effect: { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
    text: "Return that card from your graveyard to your hand.",
  },
  triggered: [
    {
      // Only this card, and only an opponent's spell or ability (the rulings).
      trigger: { on: "this-discarded", byOpponent: true },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { step: "end" },
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
        text: "Return Pure Intentions from your graveyard to your hand.",
      },
      resolve: null,
      text: DISCARDED,
    },
  ],
});

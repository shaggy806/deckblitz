import { defineCard } from "../define.js";

// EDHREC rank 14595.
//
// Rulings: if the target is illegal as it resolves, the whole spell doesn't
// resolve — no card is drawn.

const RETURN_TEXT = "When this creature dies, return it to its owner's hand.";

export default defineCard({
  name: "Verdant Rebirth",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: `Until end of turn, target creature gains "${RETURN_TEXT}"\nDraw a card.`,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "grant-triggered",
        target: 0,
        duration: "end-of-turn",
        ability: {
          trigger: { on: "dies", who: "self" },
          targets: [],
          effect: { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
          resolve: null,
          text: RETURN_TEXT,
        },
      },
      { kind: "draw", amount: 1 },
    ],
  },
});

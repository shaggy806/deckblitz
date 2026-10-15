import { defineCard } from "../define.js";

// EDHREC rank 22645.
//
// Rulings:
//   [2026-08-21] Proft's ability goes on the stack after you finish scrying or surveilling,
//     meaning that you've already looked at and moved those cards before choosing whether to pay
//     {2}.

export default defineCard({
  name: "Proft, Consulting Detective",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 2,
  toughness: 2,
  text: "Whenever you scry or surveil, you may pay {2}. If you do, put a +1/+1 counter on Proft and draw a card. (Draw after you scry or surveil.)",
  triggered: [
    {
      trigger: { on: "scries", who: "you", orSurveil: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2} to put a +1/+1 counter on Proft and draw a card?",
        cost: "{2}",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
            { kind: "draw", amount: 1 },
          ],
        },
      },
      resolve: null,
      text: "Whenever you scry or surveil, you may pay {2}. If you do, put a +1/+1 counter on Proft and draw a card.",
    },
  ],
});

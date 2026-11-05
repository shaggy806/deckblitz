import { defineCard } from "../define.js";

// EDHREC rank 29523.
//
// Rulings:
//   [2005-06-01] All +1/+1 counters on Descendant of Masumaro are removed, including those put on
//     it by other effects.
//   [2005-06-01] The counters are added and then removed without a pause for priority or
//     state-based actions being checked in between.

const TEXT =
  "At the beginning of your upkeep, put a +1/+1 counter on this creature for each card in your hand, then remove a +1/+1 counter from this creature for each card in target opponent's hand.";

export default defineCard({
  name: "Descendant of Masumaro",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: { cardsInHand: "you" } },
          { kind: "remove-counter", target: "source", counter: "+1/+1", amount: { cardsInHand: { target: 0 } } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

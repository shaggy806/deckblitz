import { defineCard } from "../define.js";

// EDHREC rank 19290.
//
// The hand size applies in timestamp order with any "no maximum" (the ruling):
// `maxHandSize` and `noMaxHandSize` are read so (rule 613.11).

export default defineCard({
  name: "Null Profusion",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "Skip your draw step.\nWhenever you play a card, draw a card.\nYour maximum hand size is two.",
  static: [
    {
      affects: { scope: "self" },
      skipsSteps: { who: "you", steps: ["draw"] },
      text: "Skip your draw step.",
    },
    {
      affects: { scope: "self" },
      maxHandSize: { who: "you", set: 2 },
      text: "Your maximum hand size is two.",
    },
  ],
  triggered: [
    {
      trigger: { on: "plays-card", who: "you" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever you play a card, draw a card.",
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 31226.
//
// Nezahal, Primal Tide's shape, untapped: the two cards are discarded as the
// cost, and the delayed return brings back a new object (rule 400.7) under its
// owner's control — no counters, Auras or combat.

const TEXT =
  "Discard two cards: Exile this creature. Return it to the battlefield under its owner's control at the beginning of the next end step.";

export default defineCard({
  name: "Anurid Brushhopper",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Frog", "Beast"],
  power: 3,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 2 } },
      targets: [],
      effect: {
        kind: "flicker",
        target: "source",
        returnAt: "next-end-step",
        returnText: "Return Anurid Brushhopper to the battlefield under its owner's control.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

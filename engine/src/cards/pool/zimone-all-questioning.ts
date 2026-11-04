import { defineCard } from "../define.js";

// EDHREC rank 11687.
// Makes Primo, the Indivisible → new token "Primo, the Indivisible Token" (scaffolded).
//
// Rulings:
//   [2024-09-20] There are a few more prime numbers, but we couldn't fit them all on the card.
//     (Some of them would take up more room than we have in the text box by themselves, but you
//     probably won't control that many lands.)
//   [2024-09-20] If you don't control a prime number of lands as Zimone's ability tries to
//     resolve, it won't resolve.
//   [2024-09-20] In case you do end up with more than 31 lands, the remaining prime numbers below
//     100 are 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, and 97.
//   [2024-09-20] If a land hasn't entered the battlefield under your control during your turn by
//     the time your end step begins, Zimone's ability won't trigger at all. You won't be able to
//     put a land onto the battlefield under your control during your end step in time to have the
//     ability trigger.

export default defineCard({
  name: "Zimone, All-Questioning",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: "At the beginning of your end step, if a land entered the battlefield under your control this turn and you control a prime number of lands, create Primo, the Indivisible, a legendary 0/0 green and blue Fractal creature token, then put that many +1/+1 counters on it. (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, and 31 are prime numbers.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: {
        kind: "all",
        of: [
          { kind: "turn-history", what: "entered", filter: { type: "land" } },
          { kind: "aggregate", value: { aggregate: "count", filter: { type: "land", controlledBy: "you" } }, compare: "prime" },
        ],
      },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Primo, the Indivisible Token",
        count: 1,
        thenCounters: { kind: "+1/+1", amount: { countOf: { type: "land", controlledBy: "you" } } },
      },
      resolve: null,
      text: "At the beginning of your end step, if a land entered the battlefield under your control this turn and you control a prime number of lands, create Primo, the Indivisible, a legendary 0/0 green and blue Fractal creature token, then put that many +1/+1 counters on it.",
    },
  ],
});

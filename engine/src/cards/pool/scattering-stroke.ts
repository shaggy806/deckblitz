import { defineCard } from "../define.js";

// EDHREC rank 13004.
//
// Rulings:
//   [2007-10-01] You can't add just some of the mana. You either add all the mana or none of it.
//   [2007-10-01] You decide whether or not to add that much {C} as the delayed triggered ability
//     resolves at the beginning of your next main phase. You don't decide before then.
// "That spell's mana value" is read as the spell last existed on the stack,
// its X included (rule 202.3e) — Mana Drain's delayed `manaValueOf: 0` — and
// the delayed ability is set up only if you won the clash; "you may" is asked
// as it resolves, all of the mana or none.
const ADD_TEXT = "You may add an amount of {C} equal to that spell's mana value.";

export default defineCard({
  name: "Scattering Stroke",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell. Clash with an opponent. If you win, at the beginning of your next main phase, you may add an amount of {C} equal to that spell's mana value. (Each clashing player reveals the top card of their library, then puts that card on their choice of the top or bottom. A player wins if their card had a greater mana value.)",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      {
        kind: "clash",
        won: {
          kind: "delayed-trigger",
          at: { step: "main", whose: "you" },
          effect: {
            kind: "may",
            prompt: "Add {C} equal to the countered spell's mana value?",
            effect: { kind: "add-mana", mana: "C", amount: { manaValueOf: 0 } },
          },
          text: ADD_TEXT,
        },
      },
    ],
  },
});

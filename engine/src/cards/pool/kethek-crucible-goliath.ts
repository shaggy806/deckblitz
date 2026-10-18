import { defineCard } from "../define.js";

// EDHREC rank 9698.
//
// Rulings:
//   [2023-02-04] If a creature on the battlefield has an {X} in its mana cost, X is 0.

const END_TEXT =
  "At the beginning of your end step, you may sacrifice another creature. If you do, reveal cards from the top of your library until you reveal a nonlegendary creature card with lesser mana value, put it onto the battlefield, then put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Kethek, Crucible Goliath",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Beast"],
  power: 4,
  toughness: 4,
  text: END_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, exceptSource: true, text: "Sacrifice another creature" }],
        // "Lesser mana value" than the sacrificed creature, as it last existed
        // on the battlefield ({X} as 0 — the ruling); bound as the reveal applies.
        ifDid: {
          kind: "reveal-until",
          filter: {
            type: "creature",
            notSupertype: "legendary",
            manaValue: { op: "lt", n: { amount: { manaValueOf: "sacrificed" } } },
          },
          put: "battlefield",
          rest: "bottom-random",
        },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});

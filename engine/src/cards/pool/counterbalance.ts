import { defineCard } from "../define.js";

// EDHREC rank 3390.
//
// Rulings:
//   [2006-07-15] If an opponent casts a spell with X in its mana cost, the mana value of that
//     spell takes the value of X into account. If you reveal a card with X in its mana cost, X is
//     0.
//
// The revealed card is slot 0 of `reveal-top`'s `then`; the spell's mana value is read from the
// stack as the comparison applies (a filter's `{ amount }` operand).

const TEXT =
  "Whenever an opponent casts a spell, you may reveal the top card of your library. If you do, counter that spell if it has the same mana value as the revealed card.";

export default defineCard({
  name: "Counterbalance",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Reveal the top card of your library?",
        effect: {
          kind: "reveal-top",
          then: {
            kind: "conditional",
            condition: {
              kind: "target",
              index: 0,
              filter: { manaValue: { op: "eq", n: { amount: { manaValueOf: "trigger-object" } } } },
            },
            then: { kind: "counter", target: "trigger-object" },
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

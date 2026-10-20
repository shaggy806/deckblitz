import { defineCard } from "../define.js";

// EDHREC rank 8014. Kaldheim.
//
// Kellan, the Kid's free cast from the hand, with "if you don't" as its
// `else`. The mana value is read as the trigger resolves (the ruling): 1 plus
// the greatest mana value among the other permanents you control — 1 when
// those are only lands, or there are none (an empty `max` is 0). A permanent
// spell includes a battle under today's rules.
//
// Rulings:
//   [2021-02-05] If the spell you cast has {X} in its mana cost, you must choose 0 as the value of
//     X.
//   [2021-02-05] If a permanent has {X} in its mana cost, X is considered to be 0.

const TEXT =
  "At the beginning of your upkeep, you may cast a permanent spell from your hand with mana value equal to 1 plus the greatest mana value among other permanents you control without paying its mana cost. If you don't, scry 1.";

export default defineCard({
  name: "In Search of Greatness",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "cast-now",
        from: "hand",
        free: true,
        spell: {
          typesAnyOf: ["artifact", "battle", "creature", "enchantment", "planeswalker"],
          manaValue: {
            op: "eq",
            n: {
              amount: {
                sum: [
                  1,
                  { aggregate: "max", of: "mana-value", filter: { controlledBy: "you" }, excludeSelf: true },
                ],
              },
            },
          },
        },
        else: { kind: "scry", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 8252.
//
// "If you've cast another spell this turn" is asked as it resolves (the
// ruling), and any spell counts — one countered, or one cast in response and
// still on the stack. Cast, this spell is one of the turn's spells, so
// another makes two; a copy was never cast, so any one cast is "another"
// (Burrog Barrage's shape).
const TEXT = "Slick Sequence deals 2 damage to any target. If you've cast another spell this turn, draw a card.";

export default defineCard({
  name: "Slick Sequence",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: TEXT,
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 2, target: 0 },
      {
        kind: "conditional",
        condition: {
          kind: "any",
          of: [
            {
              kind: "all",
              of: [
                { kind: "source", filter: { cast: true } },
                { kind: "cast-this-turn", atLeast: 2 },
              ],
            },
            {
              kind: "all",
              of: [
                { kind: "not", of: { kind: "source", filter: { cast: true } } },
                { kind: "cast-this-turn", atLeast: 1 },
              ],
            },
          ],
        },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});

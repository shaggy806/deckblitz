import { defineCard } from "../define.js";
import { flipUntilLose } from "../helpers.js";

const TEXT =
  "Flip a coin until you lose a flip or choose to stop flipping. If you lose a flip, Fiery Gambit has no effect. If " +
  "you win one or more flips, Fiery Gambit deals 3 damage to target creature. If you win two or more flips, Fiery " +
  "Gambit deals 6 damage to each opponent. If you win three or more flips, draw nine cards and untap all lands you control.";

export default defineCard({
  name: "Fiery Gambit",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      flipUntilLose({ mayStop: true }),
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "flips-lost", atMost: 0 },
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "flips-won", atLeast: 1 },
              then: { kind: "damage", target: 0, amount: 3 },
            },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "flips-won", atLeast: 2 },
              then: { kind: "damage", amount: 6, who: "each-opponent" },
            },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "flips-won", atLeast: 3 },
              then: {
                kind: "sequence",
                effects: [
                  { kind: "draw", amount: 9 },
                  { kind: "untap-all", filter: { type: "land", controlledBy: "you" } },
                ],
              },
            },
          ],
        },
      },
    ],
  },
});

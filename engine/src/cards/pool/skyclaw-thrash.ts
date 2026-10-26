import { defineCard } from "../define.js";

// EDHREC rank 19502.
//
// Rulings:
//   [2009-05-01] If you lose the flip, nothing happens. Skyclaw Thrash continues to attack as
//     normal.
const ATTACK_TEXT =
  "Whenever this creature attacks, flip a coin. If you win the flip, this creature gets +1/+1 and gains flying until end of turn.";

export default defineCard({
  name: "Skyclaw Thrash",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  types: ["artifact", "creature"],
  subtypes: ["Lizard", "Warrior"],
  power: 4,
  toughness: 4,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "flip-coin",
        won: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
            { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
          ],
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});

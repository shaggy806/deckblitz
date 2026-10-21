import { defineCard } from "../define.js";

// EDHREC rank 21340.
//
// Rulings:
//   [2004-10-04] The coin flip is done as a triggered ability on declaring the Djinn as an
//     attacker. If you lose the toss it is still considered to have attacked.

const TEXT =
  "Whenever this creature attacks, flip a coin. If you lose the flip, remove this creature from combat and tap it.";

export default defineCard({
  name: "Mijae Djinn",
  manaCost: "{R}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 6,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "flip-coin",
        lost: {
          kind: "sequence",
          effects: [
            { kind: "remove-from-combat", target: "source" },
            { kind: "tap", target: "source" },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});

import { defineCard } from "../define.js";

// EDHREC rank 11505. Modern Horizons 3 Commander.
//
// Rulings:
//   [2024-06-07] Use the number of creatures that were actually sacrificed this way, not the value
//     of X, to determine the number of +1/+1 counters with which Gluttonous Hellkite should enter
//     the battlefield.
//   [2024-06-07] Gluttonous Hellkite's triggered ability will resolve before Gluttonous Hellkite
//     does. If Gluttonous Hellkite is countered or otherwise leaves the stack in response to that
//     triggered ability, the triggered ability will still resolve as normal.
//
// The cast trigger's "X" is the spell's X (rule 107.3m). Its second sentence
// is Naya Soulbeast's shape: the `enters-with-counters` effect leaves the
// spell on the stack the counters to enter with, counted from the creatures
// actually sacrificed this way (the first ruling); nothing if the spell has
// left the stack by then (the second).
const CAST_TEXT =
  "When you cast this spell, each player sacrifices X creatures. This creature enters with two +1/+1 counters on it for each creature sacrificed this way.";

export default defineCard({
  name: "Gluttonous Hellkite",
  manaCost: "{X}{X}{B}{R}{G}",
  colors: ["B", "R", "G"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "trample"],
  text: `${CAST_TEXT}\nFlying, trample`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "each-player", filter: { type: "creature" }, count: "x" },
          {
            kind: "enters-with-counters",
            target: "source",
            counter: "+1/+1",
            amount: { product: [2, { thisWay: "sacrificed" }] },
          },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});

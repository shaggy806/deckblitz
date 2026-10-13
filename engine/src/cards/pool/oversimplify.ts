import { defineCard } from "../define.js";

// EDHREC rank 7024.
// Makes Fractal → use "Fractal Token".
//
// Rulings:
//   [2021-04-16] Oversimplify counts the total power of the creatures as they last existed on the
//     battlefield, not the power of those cards in exile.
//   [2021-04-16] If a commander is exiled this way, its power will be counted along with the other
//     creatures. Once Oversimplify finishes resolving, that commander's owner may move it to the
//     command zone.

export default defineCard({
  name: "Oversimplify",
  manaCost: "{3}{G}{U}",
  colors: ["U", "G"],
  types: ["sorcery"],
  text: "Exile all creatures. Each player creates a 0/0 green and blue Fractal creature token and puts a number of +1/+1 counters on it equal to the total power of creatures they controlled that were exiled this way.",
  // Deadly Tempest's shape: each player's own total of what this exiled, read
  // as the creatures last existed on the battlefield (the first ruling) — a
  // commander exiled this way counts too, before its owner may move it to
  // the command zone (rule 903.9a, the second ruling).
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-all", filter: { type: "creature" } },
      {
        kind: "create-token",
        token: "Fractal Token",
        count: 1,
        who: "each-player",
        thenCounters: { kind: "+1/+1", amount: { thisWay: "exiled", who: "each", sumOf: "power" } },
      },
    ],
  },
});

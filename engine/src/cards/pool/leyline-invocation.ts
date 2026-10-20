import { defineCard } from "../define.js";

// EDHREC rank 19610.
//
// Rulings:
//   [2021-04-16] The number of lands you control is counted as Leyline Invocation resolves.
export default defineCard({
  name: "Leyline Invocation",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it, where X is the number of lands you control.",
  targets: [],
  effect: {
    kind: "create-token",
    token: "Fractal Token",
    count: 1,
    thenCounters: { kind: "+1/+1", amount: { countOf: { type: "land", controlledBy: "you" } } },
  },
});

import { defineCard } from "../define.js";

// EDHREC rank 15933. Modern Horizons 2.
//
// The counters are every kind it had on the battlefield (its ruling) — read
// as it last existed there once it's exiled (rule 608.2h).
export default defineCard({
  name: "Flay Essence",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Exile target creature or planeswalker. You gain life equal to the number of counters on it.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "gain-life", amount: { countersOn: 0 } },
    ],
  },
});

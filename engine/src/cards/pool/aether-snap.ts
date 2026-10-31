import { defineCard } from "../define.js";

// Every counter of every kind off every permanent (`remove-counter-all`
// with `counter: "any"`) — planeswalkers left with no loyalty die to the
// state-based action (rule 704.5i) once the spell has resolved — then every
// token is exiled.

const TEXT = "Remove all counters from all permanents and exile all tokens.";

export default defineCard({
  name: "Aether Snap",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "remove-counter-all", filter: {}, counter: "any", amount: "all" },
      { kind: "exile-all", filter: { token: true } },
    ],
  },
});

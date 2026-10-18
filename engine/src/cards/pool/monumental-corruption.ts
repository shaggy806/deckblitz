import { defineCard } from "../define.js";

// EDHREC rank 8984.
// X is counted as it resolves (Damnable Pact's shape, X the artifacts you
// control): the draw changes nothing on the battlefield, so both read the same.

const ARTIFACTS = { countOf: { type: "artifact", controlledBy: "you" } } as const;

export default defineCard({
  name: "Monumental Corruption",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player draws X cards and loses X life, where X is the number of artifacts you control.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: ARTIFACTS, target: 0 },
      { kind: "lose-life", amount: ARTIFACTS, target: 0 },
    ],
  },
});

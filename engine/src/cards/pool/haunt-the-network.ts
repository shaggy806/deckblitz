import { defineCard } from "../define.js";

// EDHREC rank 12986.
//
// X is counted as each half applies, after the two Thopters are made: the
// board doesn't change between the loss and the gain.

const ARTIFACTS = { countOf: { type: "artifact", controlledBy: "you" } } as const;

export default defineCard({
  name: "Haunt the Network",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: "Choose target opponent. Create two 1/1 colorless Thopter artifact creature tokens with flying. Then the chosen player loses X life and you gain X life, where X is the number of artifacts you control.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Thopter Token", count: 2 },
      { kind: "lose-life", amount: ARTIFACTS, target: 0 },
      { kind: "gain-life", amount: ARTIFACTS },
    ],
  },
});

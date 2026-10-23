import { defineCard } from "../define.js";

// Kaladesh. EDHREC rank 17027. The artifacts are counted as it resolves (the
// ruling): 3 with none.
export default defineCard({
  name: "Welding Sparks",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Welding Sparks deals X damage to target creature, where X is 3 plus the number of artifacts you control.",
  targets: ["creature"],
  effect: {
    kind: "damage",
    amount: { sum: [3, { countOf: { type: "artifact", controlledBy: "you" } }] },
    target: 0,
  },
});

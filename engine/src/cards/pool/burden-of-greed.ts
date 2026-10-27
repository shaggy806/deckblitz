import { defineCard } from "../define.js";

// EDHREC rank 28744.

export default defineCard({
  name: "Burden of Greed",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target player loses 1 life for each tapped artifact they control.",
  targets: ["player"],
  effect: {
    kind: "lose-life",
    target: 0,
    amount: { countOf: { type: "artifact", tapped: true, controlledBy: "you" }, forTarget: 0 },
  },
});

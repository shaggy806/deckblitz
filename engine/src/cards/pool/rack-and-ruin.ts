import { defineCard } from "../define.js";

// Rulings:
//   Must target two different artifacts.

export default defineCard({
  name: "Rack and Ruin",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Destroy two target artifacts.",
  targets: ["artifact", { kind: "other", of: "artifact", than: { slots: [0] } }],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "destroy", target: 1 },
    ],
  },
});

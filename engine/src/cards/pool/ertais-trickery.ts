import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 31446.
//
// Rulings:
//   [2009-10-01] You can target any spell, but that spell will be countered only if it was kicked.

export default defineCard({
  name: "Ertai's Trickery",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell if it was kicked.",
  targets: ["spell"],
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { kicked: true } },
    then: { kind: "counter", target: 0 },
  },
});

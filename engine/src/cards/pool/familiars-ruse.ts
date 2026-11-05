import { defineCard } from "../define.js";

// EDHREC rank 7074.

export default defineCard({
  name: "Familiar's Ruse",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["instant"],
  additionalCost: {
    also: {
      text: "Return a creature you control to its owner's hand",
      returnToHand: { filter: { type: "creature" }, count: 1 },
    },
  },
  text: "As an additional cost to cast this spell, return a creature you control to its owner's hand.\nCounter target spell.",
  targets: ["spell"],
  effect: { kind: "counter", target: 0 },
});

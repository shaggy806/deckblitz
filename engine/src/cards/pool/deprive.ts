import { defineCard } from "../define.js";

export default defineCard({
  name: "Deprive",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, return a land you control to its owner's hand.\nCounter target spell.",
  additionalCost: {
    also: { text: "Return a land you control to its owner's hand", returnToHand: { filter: { type: "land" }, count: 1 } },
  },
  targets: ["spell"],
  effect: { kind: "counter", target: 0 },
});

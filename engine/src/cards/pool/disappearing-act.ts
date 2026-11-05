import { defineCard } from "../define.js";

export default defineCard({
  name: "Disappearing Act",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, return a permanent you control to its owner's hand.\nCounter target spell.",
  additionalCost: {
    also: { text: "Return a permanent you control to its owner's hand", returnToHand: { filter: {}, count: 1 } },
  },
  targets: ["spell"],
  effect: { kind: "counter", target: 0 },
});

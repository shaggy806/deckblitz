import { defineCard } from "../define.js";

// Bloodline Recollector's prepare spell (rule 722): no card of its own, only
// ever cast as the copy a prepared Recollector makes in exile (722.3c).
// "Target player" — you may point it at yourself.
export default defineCard({
  name: "Ancestral Craving",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  prepareSpellOnly: true,
  text: "Target player draws three cards and loses 3 life.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3, target: 0 },
      { kind: "lose-life", amount: 3, target: 0 },
    ],
  },
});

import { defineCard } from "../define.js";

// EDHREC rank 18431.
//
// Counts the creatures attacking you as it resolves (the ruling) — you, not
// a planeswalker of yours.

export default defineCard({
  name: "Blessed Reversal",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "You gain 3 life for each creature attacking you.",
  targets: [],
  effect: { kind: "gain-life", amount: { countOf: { type: "creature", attackingYou: true }, times: 3 } },
});

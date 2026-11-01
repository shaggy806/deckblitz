import { defineCard } from "../define.js";

// Either side of a block this turn, the combat over or not. The other creature
// is read as it was at the block: legendary then, wherever it is now.

export default defineCard({
  name: "You Cannot Pass!",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target creature that blocked or was blocked by a legendary creature this turn.",
  targets: [
    {
      kind: "permanent",
      filter: { type: "creature", blockedThisTurn: { relation: "either", partner: { supertype: "legendary" } } },
    },
  ],
  effect: { kind: "destroy", target: 0 },
});

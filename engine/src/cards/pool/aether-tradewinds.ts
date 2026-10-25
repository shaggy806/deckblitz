import { defineCard } from "../define.js";

// EDHREC rank 19261.
//
// If one target is illegal as it resolves, the other is still returned (the
// ruling) — each return reads its own slot.

export default defineCard({
  name: "Aether Tradewinds",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target permanent you control and target permanent you don't control to their owners' hands.",
  targets: [
    { kind: "permanent", filter: { controlledBy: "you" } },
    { kind: "permanent", filter: { controlledBy: "opponent" } },
  ],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "return-to-hand", target: 1 },
    ],
  },
});

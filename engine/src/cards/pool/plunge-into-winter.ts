import { defineCard } from "../define.js";

// Rulings:
//   [2023-09-01] If the target is already tapped at the time Plunge into Winter resolves, you'll
//     still scry 1 and draw a card.
//   [2023-09-01] You can cast Plunge into Winter without a target just to scry 1 and draw a card.
//     However, if you do choose a target, and that target is illegal at the time Plunge into
//     Winter tries to resolve, the spell won't resolve and none of its effects will happen.

export default defineCard({
  name: "Plunge into Winter",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Tap up to one target creature. Scry 1, then draw a card.",
  targets: [{ kind: "optional", of: "creature" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "scry", amount: 1, then: { kind: "draw", amount: 1 } },
    ],
  },
});

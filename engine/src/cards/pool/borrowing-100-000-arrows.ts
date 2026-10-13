import { defineCard } from "../define.js";

// EDHREC rank 7065.
// Counted from the target opponent's side as it resolves (Will of the
// Mardu's `forTarget`).
export default defineCard({
  name: "Borrowing 100,000 Arrows",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Draw a card for each tapped creature target opponent controls.",
  targets: ["opponent"],
  effect: {
    kind: "draw",
    amount: { countOf: { type: "creature", tapped: true, controlledBy: "you" }, forTarget: 0 },
  },
});

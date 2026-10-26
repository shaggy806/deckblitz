import { defineCard } from "../define.js";

// EDHREC rank 11601.

export default defineCard({
  name: "Theft of Dreams",
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

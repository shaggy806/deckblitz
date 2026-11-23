import { defineCard } from "../define.js";

// Playtest card. It goes back to its owner's hand as it resolves, the way a
// Pulse does, instead of to the graveyard.

export default defineCard({
  name: "How to Keep an Izzet Mage Busy",
  manaCost: "{U/R}",
  colors: ["U", "R"],
  types: ["sorcery"],
  text: "Return How to Keep an Izzet Mage Busy to its owner's hand.",
  effect: { kind: "return-to-hand", target: "source", from: "stack" },
});

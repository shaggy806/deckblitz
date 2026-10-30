import { defineCard } from "../define.js";

// EDHREC rank 28480.

export default defineCard({
  name: "Fatigue",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Target player skips their next draw step.",
  targets: ["player"],
  effect: { kind: "skip-step", step: "draw", who: 0 },
});

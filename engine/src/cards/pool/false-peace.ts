import { defineCard } from "../define.js";

export default defineCard({
  name: "False Peace",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Target player skips all combat phases of their next turn.",
  targets: ["player"],
  effect: { kind: "skip-step", step: "combat", who: 0, allOfNextTurn: true },
});

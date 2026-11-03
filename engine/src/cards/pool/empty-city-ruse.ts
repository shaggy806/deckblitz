import { defineCard } from "../define.js";

export default defineCard({
  name: "Empty City Ruse",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Target opponent skips all combat phases of their next turn.",
  targets: ["opponent"],
  effect: { kind: "skip-step", step: "combat", who: 0, allOfNextTurn: true },
});

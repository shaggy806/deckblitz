import { defineCard } from "../define.js";

export default defineCard({
  name: "Moment of Silence",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target player skips their next combat phase this turn.",
  targets: ["player"],
  effect: { kind: "skip-step", step: "combat", who: 0, thisTurn: true },
});

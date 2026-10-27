import { defineCard } from "../define.js";

// EDHREC rank 30986.

export default defineCard({
  name: "Off Balance",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature can't attack or block this turn.",
  targets: ["creature"],
  effect: { kind: "restrict", target: 0, restrictions: ["cant-attack", "cant-block"] },
});

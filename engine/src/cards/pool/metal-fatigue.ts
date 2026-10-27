import { defineCard } from "../define.js";

// EDHREC rank 31305.

export default defineCard({
  name: "Metal Fatigue",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Tap all artifacts.",
  effect: { kind: "tap-all", filter: { type: "artifact" } },
});

import { defineCard } from "../define.js";

export default defineCard({
  name: "Death Ward",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Regenerate target creature.",
  targets: ["creature"],
  effect: { kind: "regenerate", target: 0 },
});

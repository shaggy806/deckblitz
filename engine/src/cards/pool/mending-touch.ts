import { defineCard } from "../define.js";

export default defineCard({
  name: "Mending Touch",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Regenerate target creature.",
  targets: ["creature"],
  effect: { kind: "regenerate", target: 0 },
});

import { defineCard } from "../define.js";

export default defineCard({
  name: "Reknit",
  manaCost: "{1}{G/W}",
  colors: ["W", "G"],
  types: ["instant"],
  text: "Regenerate target permanent.",
  targets: ["permanent"],
  effect: { kind: "regenerate", target: 0 },
});

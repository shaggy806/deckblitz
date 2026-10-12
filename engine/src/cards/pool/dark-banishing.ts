import { defineCard } from "../define.js";

export default defineCard({
  name: "Dark Banishing",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target nonblack creature. It can't be regenerated.",
  targets: ["nonblack-creature"],
  effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
});
